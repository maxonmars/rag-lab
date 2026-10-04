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

const SECTION_START = /^## /m;
const EMPTY_LINES = "—";
const REFUSAL_BY_RETRIEVAL = "## Не знаю\n\nВ документации не найдено фрагментов по этому вопросу.";

type Answered = Extract<CitedAnswer, { kind: "answer" }>;

function sourceLine({ fragment, hit }: Answered["sources"][number]): string {
  return hit === undefined
    ? `- [${fragment}]`
    : `- [${fragment}] \`${hit.chunk.file}\` › ${hit.chunk.sections[0] ?? hit.chunk.title}`;
}

function answeredText(answer: Answered): string {
  // У ответа с нарушением формата `text` — весь сырой ответ: в историю идёт только текст до первого раздела.
  const [body = ""] = answer.text.split(SECTION_START);
  const sections = [`## Ответ\n\n${body.trim()}`];
  if (answer.sources.length > 0) sections.push(`## Источники\n\n${answer.sources.map(sourceLine).join("\n")}`);
  if (answer.quotes.length > 0) {
    sections.push(`## Цитаты\n\n${answer.quotes.map((quote) => `- [${quote.fragment}] «${quote.text}»`).join("\n")}`);
  }
  return sections.join("\n\n");
}

/**
 * Ответ для истории в формате ответа модели; источник дополнен файлом и разделом, потому что `[N]` относится к фрагментам
 * своего хода. Реплики истории модель копирует охотнее инструкции, поэтому формат у них полный.
 */
export function assistantHistoryText(answer: CitedAnswer): string {
  if (answer.kind === "answer") return answeredText(answer);
  if (answer.by === "retrieval") return REFUSAL_BY_RETRIEVAL;
  const refusal = `## Не знаю\n\n${answer.text}`;
  return answer.clarification === "" ? refusal : `${refusal}\n\n## Уточнение\n\n${answer.clarification}`;
}

/** Последние `historyTurns` ходов парами «вопрос — ответ» в хронологическом порядке. */
export function historyMessages(dialog: Dialog, historyTurns: number): DialogMessage[] {
  if (historyTurns <= 0) return [];
  return dialog.turns.slice(-historyTurns).flatMap((turn) => [
    { role: "user", content: turn.question },
    { role: "assistant", content: assistantHistoryText(turn.answer) },
  ]);
}

/** Реплики строками `- Пользователь: …` / `- Ассистент: …` в одну строку каждая, заголовок `## X` — `X:`; пустой список — «—». */
export function recentLines(messages: readonly DialogMessage[]): string {
  if (messages.length === 0) return EMPTY_LINES;
  return messages
    .map(
      (message) =>
        `- ${message.role === "user" ? "Пользователь" : "Ассистент"}: ${message.content.replace(/^## (.+)$/gm, "$1:").replace(/\s+/g, " ")}`,
    )
    .join("\n");
}
