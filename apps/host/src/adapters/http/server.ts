import { createServer, type IncomingMessage, type ServerResponse } from "node:http";
import type { AddressInfo } from "node:net";

/** Ошибка с HTTP-статусом и кодом для тела ответа; `message` показывается клиенту. */
export class HttpError extends Error {
  readonly status: number;
  readonly code: string;
  readonly headers: Readonly<Record<string, string>>;

  constructor(status: number, code: string, message: string, headers: Readonly<Record<string, string>> = {}) {
    super(message);
    this.name = "HttpError";
    this.status = status;
    this.code = code;
    this.headers = headers;
  }
}

export type Handler = (req: IncomingMessage, res: ServerResponse) => Promise<void>;

export type ListenOptions = Readonly<{
  host: string;
  port: number;
  handle: Handler;
  /** Поле `type` в теле ответа с ошибкой. */
  errorType: string;
  log: (line: string) => void;
}>;

export type RunningServer = Readonly<{ url: string; close: () => Promise<void> }>;

/** Читает тело с потолком в байтах и разбирает его как JSON-объект. */
export async function readJsonObject(req: IncomingMessage, maxBytes: number): Promise<Record<string, unknown>> {
  const chunks: Buffer[] = [];
  let total = 0;
  for await (const chunk of req) {
    const buffer = chunk as Buffer;
    total += buffer.length;
    if (total > maxBytes) {
      throw new HttpError(413, "body_too_large", `Тело запроса превышает лимит ${maxBytes} байт.`);
    }
    chunks.push(buffer);
  }
  let value: unknown;
  try {
    value = JSON.parse(Buffer.concat(chunks).toString("utf8"));
  } catch {
    throw new HttpError(400, "invalid_json", "Тело запроса не является корректным JSON.");
  }
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    throw new HttpError(400, "invalid_json", "Тело запроса должно быть JSON-объектом.");
  }
  return value as Record<string, unknown>;
}

/** Без `body` тело не отправляется (например, для 204). */
export function sendJson(res: ServerResponse, status: number, body?: unknown, headers: Record<string, string> = {}) {
  if (body === undefined) {
    res.writeHead(status, headers);
    res.end();
    return;
  }
  res.writeHead(status, { "content-type": "application/json", ...headers });
  res.end(JSON.stringify(body));
}

/** Формат тела совместим с OpenAI SDK: `error.message`, `error.type`, `error.code`. */
export function sendError(res: ServerResponse, error: HttpError, type: string): void {
  sendJson(res, error.status, { error: { message: error.message, type, code: error.code } }, { ...error.headers });
}

async function serve(options: ListenOptions, req: IncomingMessage, res: ServerResponse): Promise<void> {
  const started = Date.now();
  const path = new URL(req.url ?? "/", "http://service").pathname;
  try {
    await options.handle(req, res);
  } catch (error) {
    if (!res.headersSent) {
      if (error instanceof HttpError) sendError(res, error, options.errorType);
      else {
        options.log(`внутренняя ошибка: ${error instanceof Error ? error.message : String(error)}`);
        sendError(res, new HttpError(500, "internal_error", "Внутренняя ошибка сервиса."), options.errorType);
      }
    }
  } finally {
    const status = res.headersSent ? String(res.statusCode) : "aborted";
    options.log(
      `${new Date(started).toISOString()} ${req.method ?? "GET"} ${path} status=${status} ms=${Date.now() - started}`,
    );
  }
}

/** Запускает сервер; в лог идёт одна строка на запрос без тела. `close` ждёт завершения текущих запросов. */
export function listen(options: ListenOptions): Promise<RunningServer> {
  const server = createServer((req, res) => {
    void serve(options, req, res);
  });
  return new Promise((resolve, reject) => {
    server.once("error", reject);
    server.listen(options.port, options.host, () => {
      server.off("error", reject);
      const { port } = server.address() as AddressInfo;
      resolve({
        url: `http://${options.host}:${port}`,
        close: () =>
          new Promise<void>((done) => {
            server.close(() => done());
            server.closeIdleConnections();
          }),
      });
    });
  });
}
