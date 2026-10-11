import type { ServerResponse } from "node:http";

/** Ошибка с HTTP-статусом и кодом для тела ответа; `message` показывается клиенту. */
export class GatewayError extends Error {
  readonly status: number;
  readonly code: string;
  readonly headers: Readonly<Record<string, string>>;

  constructor(status: number, code: string, message: string, headers: Readonly<Record<string, string>> = {}) {
    super(message);
    this.name = "GatewayError";
    this.status = status;
    this.code = code;
    this.headers = headers;
  }
}

export function sendJson(
  res: ServerResponse,
  status: number,
  body: string,
  headers: Readonly<Record<string, string>> = {},
): void {
  res.writeHead(status, { "content-type": "application/json", ...headers });
  res.end(body);
}

/** Формат тела совместим с OpenAI SDK: `error.message`, `error.type`, `error.code`. */
export function sendError(res: ServerResponse, error: GatewayError): void {
  const body = { error: { message: error.message, type: "gateway_error", code: error.code } };
  sendJson(res, error.status, JSON.stringify(body), error.headers);
}
