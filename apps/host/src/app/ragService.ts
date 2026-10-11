import type { IncomingMessage, ServerResponse } from "node:http";
import { describeError } from "../adapters/cli/index.ts";
import { HttpError, readJsonObject, sendJson } from "../adapters/http/index.ts";
import { AgentError } from "../core/index.ts";
import {
  chatTurn,
  type Dialog,
  type DialogTurn,
  RagError,
  type RagErrorCode,
  renderCitedAnswer,
  usesFilter,
} from "../features/rag/index.ts";
import { systemPrompt } from "./ask.ts";
import { prepareRag, type RagAnswerHandlerOptions } from "./ragAnswer.ts";
import type { SessionStore } from "./ragSessions.ts";
import type { Values } from "./settings.ts";

export const MAX_REQUEST_BYTES = 1_048_576;
/** Тот же шаблон в `servers/llm-gateway/src/ragRoute.ts`: host не импортирует серверы. */
export const SESSION_ID = /^[A-Za-z0-9_-]{1,64}$/;

const SESSION_PATH = /^\/v1\/rag\/sessions\/([^/]+)$/;
const EMBEDDING_FAILURES: readonly RagErrorCode[] = [
  "OLLAMA_UNAVAILABLE",
  "MODEL_NOT_FOUND",
  "EMBEDDING_HTTP_ERROR",
  "INVALID_EMBEDDINGS",
  "EMBEDDING_INPUT_TOO_LONG",
];

export type RagServiceOptions = RagAnswerHandlerOptions & Readonly<{ store: SessionStore }>;

/** `undefined` — ошибка не из таблицы контракта: сервер ответит 500 и запишет причину в лог. */
export function httpErrorOf(error: unknown): HttpError | undefined {
  if (error instanceof HttpError) return error;
  const message = describeError(error);
  if (error instanceof AgentError && error.code !== "EMPTY_INPUT") return new HttpError(502, "model_failed", message);
  if (!(error instanceof RagError)) return undefined;
  if (error.code === "REWRITE_INVALID") return new HttpError(502, "model_failed", message);
  if (error.code === "EMBEDDING_TIMEOUT") return new HttpError(504, "embeddings_timeout", message);
  if (EMBEDDING_FAILURES.includes(error.code)) return new HttpError(502, "embeddings_failed", message);
  return undefined;
}

function parseChatBody(body: Record<string, unknown>): { question: string; sessionId: string | undefined } {
  const { question, session_id: sessionId } = body;
  if (typeof question !== "string" || question.trim() === "") {
    throw new HttpError(400, "invalid_request", "question: ожидается непустая строка.");
  }
  if (sessionId !== undefined && (typeof sessionId !== "string" || !SESSION_ID.test(sessionId))) {
    throw new HttpError(
      400,
      "invalid_request",
      "session_id: ожидается строка из букв, цифр, «_» и «-», до 64 символов.",
    );
  }
  return { question, sessionId };
}

const sectionOf = ({ chunk }: DialogTurn["hits"][number]) => chunk.sections[0] ?? chunk.title;

function replyBody(id: string, dialog: Dialog, turn: DialogTurn, model: string) {
  const { answer } = turn;
  const cited = answer.kind === "answer";
  return {
    session_id: id,
    turn: dialog.turns.length,
    kind: answer.kind,
    answer: renderCitedAnswer(answer),
    sources: cited
      ? answer.sources.flatMap(({ fragment, hit }) =>
          hit
            ? [
                {
                  fragment,
                  file: hit.chunk.file,
                  section: sectionOf(hit),
                  chunk_id: hit.chunk.chunk_id,
                  score: hit.score,
                },
              ]
            : [],
        )
      : [],
    quotes: cited ? answer.quotes.map(({ fragment, text, verified }) => ({ fragment, text, verified })) : [],
    fragments: turn.hits.map((hit) => ({
      rank: hit.rank,
      file: hit.chunk.file,
      section: sectionOf(hit),
      score: hit.score,
    })),
    memory: {
      goal: turn.state.goal,
      clarifications: turn.state.clarifications,
      constraints: turn.state.constraints,
    },
    model,
    timings_ms: {
      state: turn.timings.stateMs,
      rewrite: turn.timings.rewriteMs,
      search: turn.timings.searchMs,
      generate: turn.timings.generateMs,
    },
  };
}

function requireMethod(req: IncomingMessage, allowed: string): void {
  if (req.method === allowed) return;
  throw new HttpError(405, "method_not_allowed", `Допустим только метод ${allowed}.`, { allow: allowed });
}

/** Строки стартового сообщения: модель, поиск и лимиты сессий. */
function describeService(values: Values, modelName: string): string[] {
  const mode = values["rag.retrievalMode"];
  const threshold = usesFilter(mode) ? `, порог ${values["rag.similarityThreshold"]}` : "";
  return [
    `Модель: ${modelName}`,
    `Поиск: стратегия ${values["rag.chunkStrategy"]}, режим ${mode}, кандидатов ${values["rag.candidateTopK"]}, top-${values["rag.topK"]}${threshold}`,
    `Сессии: не больше ${values["service.maxSessions"]}, простой до ${values["service.sessionIdleMs"]} мс, история ${values["rag.historyTurns"]} ходов`,
  ];
}

/** Индекс и модель готовятся один раз до первого запроса: ошибка индекса или ключа прерывает запуск, а не ход. */
export async function createRagService(options: RagServiceOptions) {
  const { store } = options;
  const { values, model, modelName, index, retrieval, answerPrompt } = await prepareRag(options);

  async function chat(req: IncomingMessage, res: ServerResponse): Promise<void> {
    const { question, sessionId } = parseChatBody(await readJsonObject(req, MAX_REQUEST_BYTES));
    const session = store.begin(sessionId);
    try {
      const result = await chatTurn({
        dialog: session.dialog,
        question,
        index,
        model,
        systemPrompt: systemPrompt(),
        answerPrompt,
        mode: values["rag.retrievalMode"],
        historyTurns: values["rag.historyTurns"],
        ...retrieval,
      });
      store.commit(session.id, result.dialog);
      sendJson(res, 200, replyBody(session.id, result.dialog, result.turn, modelName));
    } catch (error) {
      throw httpErrorOf(error) ?? error;
    } finally {
      store.release(session.id);
    }
  }

  return {
    async handle(req: IncomingMessage, res: ServerResponse): Promise<void> {
      const path = new URL(req.url ?? "/", "http://service").pathname;
      const sessionId = SESSION_PATH.exec(path)?.[1];
      if (path === "/health") {
        requireMethod(req, "GET");
        sendJson(res, 200, { status: "ok" });
      } else if (path === "/v1/rag/chat") {
        requireMethod(req, "POST");
        await chat(req, res);
      } else if (sessionId !== undefined) {
        requireMethod(req, "DELETE");
        if (!SESSION_ID.test(sessionId)) {
          throw new HttpError(
            400,
            "invalid_request",
            "id сессии: ожидается строка из букв, цифр, «_» и «-», до 64 символов.",
          );
        }
        if (!store.delete(sessionId)) throw new HttpError(404, "session_not_found", "Такой сессии нет.");
        sendJson(res, 204);
      } else {
        throw new HttpError(404, "not_found", `${path}: такого пути нет.`);
      }
    },

    describe: () => describeService(values, modelName),
  };
}
