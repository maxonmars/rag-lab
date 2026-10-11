import { createServer, type IncomingMessage, type Server, type ServerResponse } from "node:http";
import { createKeyCheck } from "../auth.ts";
import { createLimiter } from "../concurrency.ts";
import { GatewayError, sendError, sendJson } from "../errors.ts";
import { forwardChat } from "../proxy.ts";
import { createRateLimiter } from "../rateLimit.ts";
import { parseJsonObject, readBody, validateChatRequest } from "../request.ts";
import type { GatewayConfig } from "./config.ts";

export const MAX_BODY_BYTES = 1_048_576;
export const BUSY_RETRY_AFTER_SECONDS = 10;
export const RATE_WINDOW_MS = 60_000;

export type GatewayDeps = Readonly<{
  config: GatewayConfig;
  fetch: typeof globalThis.fetch;
  now: () => number;
  log: (line: string) => void;
}>;

type Trace = {
  method: string;
  path: string;
  keyId: string | null;
  chars?: number;
  upstream: boolean;
  clientGone: AbortSignal;
};

function requireMethod(trace: Trace, allowed: string): void {
  if (trace.method === allowed) return;
  throw new GatewayError(405, "method_not_allowed", `${trace.path}: допустим только метод ${allowed}.`, {
    allow: allowed,
  });
}

type Context = Readonly<{
  deps: GatewayDeps;
  checkKey: ReturnType<typeof createKeyCheck>;
  rate: ReturnType<typeof createRateLimiter>;
  limiter: ReturnType<typeof createLimiter>;
}>;

async function chat(ctx: Context, req: IncomingMessage, res: ServerResponse, trace: Trace): Promise<void> {
  const { config } = ctx.deps;
  const parsed = parseJsonObject(await readBody(req, MAX_BODY_BYTES));
  const { body, chars } = validateChatRequest(parsed, { model: config.model, maxOutputTokens: config.maxOutputTokens });
  trace.chars = chars;
  if (chars > config.maxInputChars) {
    throw new GatewayError(
      413,
      "context_length_exceeded",
      `Контекст запроса — ${chars} символов, лимит ${config.maxInputChars}.`,
    );
  }
  const pending = ctx.limiter.acquire(trace.clientGone);
  if (!pending) {
    throw new GatewayError(
      503,
      "server_busy",
      `Заняты все слоты (${config.maxConcurrent}), очередь из ${config.maxQueue} запросов полна.`,
      { "retry-after": String(BUSY_RETRY_AFTER_SECONDS) },
    );
  }
  const release = await pending;
  try {
    trace.upstream = true;
    const upstream = await forwardChat({
      url: `${config.upstreamUrl}/chat/completions`,
      body,
      timeoutMs: config.upstreamTimeoutMs,
      clientSignal: trace.clientGone,
      fetch: ctx.deps.fetch,
    });
    sendJson(res, upstream.status, upstream.body);
  } finally {
    release();
  }
}

function authorize(ctx: Context, req: IncomingMessage, trace: Trace): void {
  const keyId = ctx.checkKey(req.headers.authorization);
  if (!keyId) {
    throw new GatewayError(401, "invalid_api_key", "Нужен заголовок Authorization: Bearer с действующим ключом.");
  }
  trace.keyId = keyId;
  const decision = ctx.rate.take(keyId);
  if (!decision.allowed) {
    const { rateLimitPerMinute } = ctx.deps.config;
    throw new GatewayError(
      429,
      "rate_limit_exceeded",
      `Лимит ${rateLimitPerMinute} запросов в минуту исчерпан, повторите через ${decision.retryAfterSeconds} с.`,
      { "retry-after": String(decision.retryAfterSeconds) },
    );
  }
}

async function route(ctx: Context, req: IncomingMessage, res: ServerResponse, trace: Trace): Promise<void> {
  if (trace.path === "/health") {
    requireMethod(trace, "GET");
    sendJson(res, 200, JSON.stringify({ status: "ok" }));
    return;
  }
  if (trace.path !== "/v1/models" && trace.path !== "/v1/chat/completions") {
    throw new GatewayError(404, "not_found", `${trace.path}: такого пути нет.`);
  }
  authorize(ctx, req, trace);
  if (trace.path === "/v1/models") {
    requireMethod(trace, "GET");
    const model = { id: ctx.deps.config.model, object: "model", owned_by: "local" };
    sendJson(res, 200, JSON.stringify({ object: "list", data: [model] }));
    return;
  }
  requireMethod(trace, "POST");
  await chat(ctx, req, res, trace);
}

function fail(ctx: Context, res: ServerResponse, error: unknown): void {
  if (res.destroyed) return;
  if (error instanceof GatewayError) {
    sendError(res, error);
    return;
  }
  ctx.deps.log(`внутренняя ошибка: ${error instanceof Error ? error.message : String(error)}`);
  sendError(res, new GatewayError(500, "internal_error", "Внутренняя ошибка шлюза."));
}

function logRequest(ctx: Context, res: ServerResponse, trace: Trace, started: number): void {
  const status = res.headersSent ? String(res.statusCode) : "aborted";
  const fields = [
    new Date(started).toISOString(),
    trace.method,
    trace.path,
    `key=${trace.keyId ?? "-"}`,
    `status=${status}`,
    `ms=${ctx.deps.now() - started}`,
    ...(trace.chars === undefined ? [] : [`chars=${trace.chars}`]),
    `upstream=${trace.upstream ? "yes" : "no"}`,
  ];
  ctx.deps.log(fields.join(" "));
}

async function handle(ctx: Context, req: IncomingMessage, res: ServerResponse): Promise<void> {
  const started = ctx.deps.now();
  const path = new URL(req.url ?? "/", "http://gateway").pathname;
  const clientGone = new AbortController();
  res.on("close", () => {
    if (!res.writableFinished) clientGone.abort();
  });
  const trace: Trace = {
    method: req.method ?? "GET",
    path,
    keyId: null,
    upstream: false,
    clientGone: clientGone.signal,
  };
  try {
    await route(ctx, req, res, trace);
  } catch (error) {
    fail(ctx, res, error);
  } finally {
    logRequest(ctx, res, trace, started);
  }
}

/** Собирает HTTP-сервер шлюза; состояние лимитов живёт внутри возвращаемого сервера. */
export function createGateway(deps: GatewayDeps): Server {
  const { config, now } = deps;
  const ctx: Context = {
    deps,
    checkKey: createKeyCheck(config.apiKeys),
    rate: createRateLimiter({ limit: config.rateLimitPerMinute, windowMs: RATE_WINDOW_MS, now }),
    limiter: createLimiter({ maxConcurrent: config.maxConcurrent, maxQueue: config.maxQueue }),
  };
  return createServer((req, res) => {
    void handle(ctx, req, res);
  });
}
