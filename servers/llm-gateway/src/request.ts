import type { IncomingMessage } from "node:http";
import { GatewayError } from "./errors.ts";

export type ChatLimits = Readonly<{ model: string; maxOutputTokens: number }>;

export type ChatRequest = Readonly<{ body: Readonly<Record<string, unknown>>; chars: number }>;

const ROLES = new Set(["system", "user", "assistant"]);

/** Читает тело с потолком в байтах; при превышении останавливает чтение. */
export async function readBody(req: IncomingMessage, maxBytes: number): Promise<string> {
  const chunks: Buffer[] = [];
  let total = 0;
  for await (const chunk of req) {
    const buffer = chunk as Buffer;
    total += buffer.length;
    if (total > maxBytes) {
      throw new GatewayError(413, "body_too_large", `Тело запроса превышает лимит ${maxBytes} байт.`);
    }
    chunks.push(buffer);
  }
  return Buffer.concat(chunks).toString("utf8");
}

export function parseJsonObject(text: string): Record<string, unknown> {
  let value: unknown;
  try {
    value = JSON.parse(text);
  } catch {
    throw new GatewayError(400, "invalid_json", "Тело запроса не является корректным JSON.");
  }
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    throw new GatewayError(400, "invalid_json", "Тело запроса должно быть JSON-объектом.");
  }
  return value as Record<string, unknown>;
}

function messageLength(message: unknown): number | null {
  if (typeof message !== "object" || message === null) return null;
  const { role, content } = message as Record<string, unknown>;
  if (typeof content !== "string" || typeof role !== "string" || !ROLES.has(role)) return null;
  return [...content].length;
}

function checkMaxTokens(value: unknown, limit: number): number {
  if (value === undefined) return limit;
  if (typeof value !== "number" || !Number.isInteger(value) || value < 1 || value > limit) {
    throw new GatewayError(400, "max_tokens_exceeded", `max_tokens: ожидается целое от 1 до ${limit}.`);
  }
  return value;
}

/** Проверяет поля запроса по контракту шлюза, подставляет `max_tokens` и считает символы `content` в кодовых точках. */
export function validateChatRequest(body: Readonly<Record<string, unknown>>, limits: ChatLimits): ChatRequest {
  const { messages } = body;
  if (!Array.isArray(messages) || messages.length === 0) {
    throw new GatewayError(400, "invalid_request", "messages: ожидается непустой массив сообщений.");
  }
  let chars = 0;
  for (const message of messages) {
    const length = messageLength(message);
    if (length === null) {
      throw new GatewayError(
        400,
        "invalid_request",
        "messages: у каждого сообщения нужны строковый content и role system, user или assistant.",
      );
    }
    chars += length;
  }
  if (body.model !== limits.model) {
    throw new GatewayError(400, "model_not_allowed", `model: доступна только модель ${limits.model}.`);
  }
  if (body.stream === true) {
    throw new GatewayError(400, "stream_not_supported", "stream: потоковый режим не поддерживается.");
  }
  const maxTokens = checkMaxTokens(body.max_tokens, limits.maxOutputTokens);
  if ("tools" in body) {
    throw new GatewayError(400, "tools_not_supported", "tools: вызов инструментов не поддерживается.");
  }
  return { body: { ...body, max_tokens: maxTokens }, chars };
}
