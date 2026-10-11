import { createServer, type IncomingMessage, type Server, type ServerResponse } from "node:http";
import { createKeyCheck } from "../auth.ts";
import { createLimiter } from "../concurrency.ts";
import { GatewayError, sendError, sendJson } from "../errors.ts";
import { forward } from "../proxy.ts";
import { isRagSessionPath, ragSessionId, validateRagChatRequest } from "../ragRoute.ts";
import { createRateLimiter } from "../rateLimit.ts";
import { parseJsonObject, readBody, validateChatRequest } from "../request.ts";
import type { GatewayConfig } from "./config.ts";

export const MAX_BODY_BYTES = 1_048_576;
export const BUSY_RETRY_AFTER_SECONDS = 10;
export const RATE_WINDOW_MS = 60_000;

const KNOWN_PATHS = ["/v1/models", "/v1/chat/completions", "/v1/rag/chat"];

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
  ragLimiter: ReturnType<typeof createLimiter>;
}>;

function checkInputChars(chars: number, limit: number): void {
  if (chars > limit) {
    throw new GatewayError(413, "context_length_exceeded", `Контекст запроса — ${chars} символов, лимит ${limit}.`);
  }
}

/** Занимает слот `limiter` на время `action`; очередь полна — 503 с `Retry-After`. */
async function withSlot<T>(
  ctx: Context,
  limiter: Context["limiter"],
  trace: Trace,
  action: () => Promise<T>,
): Promise<T> {
  const { config } = ctx.deps;
  const pending = limiter.acquire(trace.clientGone);
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
    return await action();
  } finally {
    release();
  }
}

async function chat(ctx: Context, req: IncomingMessage, res: ServerResponse, trace: Trace): Promise<void> {
  const { config } = ctx.deps;
  const parsed = parseJsonObject(await readBody(req, MAX_BODY_BYTES));
  const { body, chars } = validateChatRequest(parsed, { model: config.model, maxOutputTokens: config.maxOutputTokens });
  trace.chars = chars;
  checkInputChars(chars, config.maxInputChars);
  const upstream = await withSlot(ctx, ctx.limiter, trace, () =>
    forward({
      url: `${config.upstreamUrl}/chat/completions`,
      method: "POST",
      body,
      target: "ollama",
      timeoutMs: config.upstreamTimeoutMs,
      clientSignal: trace.clientGone,
      fetch: ctx.deps.fetch,
    }),
  );
  sendJson(res, upstream.status, upstream.body);
}

async function ragChat(ctx: Context, req: IncomingMessage, res: ServerResponse, trace: Trace): Promise<void> {
  const { config } = ctx.deps;
  const parsed = parseJsonObject(await readBody(req, MAX_BODY_BYTES));
  const { body, chars } = validateRagChatRequest(parsed);
  trace.chars = chars;
  checkInputChars(chars, config.maxInputChars);
  const upstream = await withSlot(ctx, ctx.ragLimiter, trace, () =>
    forward({
      url: `${config.ragUrl}/v1/rag/chat`,
      method: "POST",
      body,
      target: "rag",
      timeoutMs: config.ragTimeoutMs,
      clientSignal: trace.clientGone,
      fetch: ctx.deps.fetch,
    }),
  );
  sendJson(res, upstream.status, upstream.body);
}

async function ragDeleteSession(ctx: Context, res: ServerResponse, trace: Trace, id: string): Promise<void> {
  const { config } = ctx.deps;
  trace.upstream = true;
  const upstream = await forward({
    url: `${config.ragUrl}/v1/rag/sessions/${id}`,
    method: "DELETE",
    target: "rag",
    timeoutMs: config.ragTimeoutMs,
    clientSignal: trace.clientGone,
    fetch: ctx.deps.fetch,
  });
  sendJson(res, upstream.status, upstream.body);
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
  const sessionPath = isRagSessionPath(trace.path);
  if (!KNOWN_PATHS.includes(trace.path) && !sessionPath) {
    throw new GatewayError(404, "not_found", `${trace.path}: такого пути нет.`);
  }
  authorize(ctx, req, trace);
  if (trace.path === "/v1/models") {
    requireMethod(trace, "GET");
    const model = { id: ctx.deps.config.model, object: "model", owned_by: "local" };
    sendJson(res, 200, JSON.stringify({ object: "list", data: [model] }));
  } else if (sessionPath) {
    requireMethod(trace, "DELETE");
    await ragDeleteSession(ctx, res, trace, ragSessionId(trace.path));
  } else if (trace.path === "/v1/rag/chat") {
    requireMethod(trace, "POST");
    await ragChat(ctx, req, res, trace);
  } else {
    requireMethod(trace, "POST");
    await chat(ctx, req, res, trace);
  }
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
    ragLimiter: createLimiter({ maxConcurrent: config.maxConcurrent, maxQueue: config.maxQueue }),
  };
  return createServer((req, res) => {
    void handle(ctx, req, res);
  });
}
