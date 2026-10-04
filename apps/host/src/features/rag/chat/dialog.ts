import type { DialogMessage } from "../../../core/index.ts";
import type { CitedAnswer } from "../citations.ts";
import { RagError } from "../errors.ts";
import type { SearchHit } from "../search.ts";
import { EMPTY_TASK_STATE, type TaskState } from "./taskState.ts";

/** Длительности этапов хода, мс; для режимов без rewrite `rewriteMs` равен 0. */
export type TurnTimings = Readonly<{ stateMs: number; rewriteMs: number; searchMs: number; generateMs: number }>;

export type DialogTurn = Readonly<{
  question: string;
  /** Строка, по которой выполнен поиск: вопрос как есть или результат rewrite. */
  query: string;
  hits: readonly SearchHit[];
  answer: CitedAnswer;
  /** Память задачи после хода. */
  state: TaskState;
  /** `false` — ответ модели не разобран, память осталась прежней. */
  stateUpdated: boolean;
  timings: TurnTimings;
}>;

/** Неизменяемый снимок диалога: ход возвращает новый, прежний не меняется. */
export type Dialog = Readonly<{ state: TaskState; turns: readonly DialogTurn[] }>;

export const EMPTY_DIALOG: Dialog = { state: EMPTY_TASK_STATE, turns: [] };

/** Предел `rag.historyTurns`. */
export const MAX_HISTORY_TURNS = 20;

/** Единственная проверка окна истории: вызывается до любых внешних обращений. */
export function checkHistoryTurns(historyTurns: number): void {
  if (!Number.isInteger(historyTurns) || historyTurns < 1 || historyTurns > MAX_HISTORY_TURNS) {
    throw new RagError("INVALID_RETRIEVAL_PARAMS", { reason: "historyTurns" });
  }
}

const CITATION_MARK = /[ \t]*\[\d+\]/g;
const EMPTY_LINES = "—";
const REFUSAL_BY_RETRIEVAL = "Не знаю: в документации не найдено фрагментов по этому вопросу.";

function sourceLabels(answer: Extract<CitedAnswer, { kind: "answer" }>): string[] {
  const labels = answer.sources.flatMap(({ hit }) =>
    hit === undefined ? [] : [`\`${hit.chunk.file}\` › ${hit.chunk.sections[0] ?? hit.chunk.title}`],
  );
  return [...new Set(labels)];
}

/** Ответ для истории без `[N]` и без UI-статусов: номера фрагментов прошлых ходов не совпадают с номерами текущего сообщения. */
export function assistantHistoryText(answer: CitedAnswer): string {
  if (answer.kind === "unknown") {
    if (answer.by === "retrieval") return REFUSAL_BY_RETRIEVAL;
    return answer.clarification === ""
      ? `Не знаю. ${answer.text}`
      : `Не знаю. ${answer.text}\n\nУточнение: ${answer.clarification}`;
  }
  const labels = sourceLabels(answer);
  return `${answer.text.replace(CITATION_MARK, "").trim()}\n\nИсточники: ${labels.length > 0 ? labels.join("; ") : "нет"}`;
}

/** Последние `historyTurns` ходов парами «вопрос — ответ» в хронологическом порядке. */
export function historyMessages(dialog: Dialog, historyTurns: number): DialogMessage[] {
  if (historyTurns <= 0) return [];
  return dialog.turns.slice(-historyTurns).flatMap((turn) => [
    { role: "user", content: turn.question },
    { role: "assistant", content: assistantHistoryText(turn.answer) },
  ]);
}

/** Реплики строками `- Пользователь: …` / `- Ассистент: …` в одну строку каждая; пустой список — «—». */
export function recentLines(messages: readonly DialogMessage[]): string {
  if (messages.length === 0) return EMPTY_LINES;
  return messages
    .map(
      (message) =>
        `- ${message.role === "user" ? "Пользователь" : "Ассистент"}: ${message.content.replace(/\s+/g, " ")}`,
    )
    .join("\n");
}
