import { GatewayError } from "./errors.ts";
import type { ChatRequest } from "./request.ts";

/** Тот же шаблон в `apps/host/src/app/ragService.ts`: серверы не импортируют host. */
export const SESSION_ID = /^[A-Za-z0-9_-]{1,64}$/;

const SESSION_PATH = /^\/v1\/rag\/sessions\/([^/]+)$/;

const invalidSessionId = (name: string) =>
  new GatewayError(400, "invalid_request", `${name}: ожидается строка из букв, цифр, «_» и «-», до 64 символов.`);

/** Проверяет `question` и `session_id`, считает символы вопроса в кодовых точках; тело пересылается без изменений. */
export function validateRagChatRequest(body: Readonly<Record<string, unknown>>): ChatRequest {
  const { question, session_id: sessionId } = body;
  if (typeof question !== "string" || question.trim() === "") {
    throw new GatewayError(400, "invalid_request", "question: ожидается непустая строка.");
  }
  if (sessionId !== undefined && (typeof sessionId !== "string" || !SESSION_ID.test(sessionId))) {
    throw invalidSessionId("session_id");
  }
  const chars = [...question].length;
  return { body, chars };
}

export const isRagSessionPath = (path: string): boolean => SESSION_PATH.test(path);

/** Id из пути, для которого `isRagSessionPath` истинно; id вне шаблона — 400. */
export function ragSessionId(path: string): string {
  const id = SESSION_PATH.exec(path)?.[1] ?? "";
  if (!SESSION_ID.test(id)) throw invalidSessionId("id сессии");
  return id;
}
