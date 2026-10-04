import { Agent, AgentError, type ModelPort } from "../../../core/index.ts";
import { generateAnswer } from "../answer.ts";
import { readPrompt } from "../prompts.ts";
import {
  checkRetrievalParams,
  type RetrievalMode,
  type RetrievalParams,
  usesFilter,
  usesRewrite,
} from "../retrieval.ts";
import { rewriteQuery } from "../rewrite.ts";
import type { SearchIndex } from "../search.ts";
import { selectForMode } from "../select.ts";
import { timed } from "../timing.ts";
import type { Strategy } from "../types.ts";
import { checkHistoryTurns, type Dialog, type DialogTurn, historyMessages } from "./dialog.ts";
import { nestedTaskState, parseTaskState } from "./taskState.ts";

/** Сколько последних ходов видит rewrite: ему нужны только отсылки ближайших реплик. */
export const REWRITE_HISTORY_TURNS = 2;

export type ChatTurnOptions = RetrievalParams &
  Readonly<{
    dialog: Dialog;
    question: string;
    index: SearchIndex;
    strategy: Strategy;
    mode: RetrievalMode;
    model: ModelPort;
    systemPrompt: string;
    historyTurns: number;
  }>;

export type ChatTurnResult = Readonly<{ turn: DialogTurn; dialog: Dialog }>;

// Ответов ассистента здесь нет: с ними модель записывала в память утверждения документации как договорённости.
function stateMessage(dialog: Dialog, question: string): string {
  return [
    `## Текущая память задачи\n\n${nestedTaskState(dialog.state)}`,
    `## Новое сообщение пользователя\n\n${question}`,
  ].join("\n\n");
}

/** Ответ модели, который не разобран, оставляет прежнюю память: `updated` — `false`. */
async function updateState(options: ChatTurnOptions, question: string) {
  const raw = await new Agent(options.model, readPrompt("task-state.md")).respond(
    stateMessage(options.dialog, question),
  );
  const parsed = parseTaskState(raw);
  return { state: parsed ?? options.dialog.state, updated: parsed !== null };
}

/**
 * Ход чата без состояния: память задачи → rewrite (по режиму) → поиск → отбор → ответ с историей.
 * Входной `dialog` не меняется; ошибка любого шага отклоняет промис, нового диалога нет.
 */
export async function chatTurn(options: ChatTurnOptions): Promise<ChatTurnResult> {
  const question = options.question.trim();
  if (!question) throw new AgentError("EMPTY_INPUT");
  checkRetrievalParams(options);
  checkHistoryTurns(options.historyTurns);
  const { dialog, mode } = options;
  const history = historyMessages(dialog, options.historyTurns);
  const memory = await timed(() => updateState(options, question));
  const { state } = memory.value;
  const rewritten = usesRewrite(mode)
    ? await timed(() =>
        rewriteQuery(question, options.model, {
          memory: state,
          recent: historyMessages(dialog, REWRITE_HISTORY_TURNS),
        }),
      )
    : { value: question, ms: 0 };
  const search = await timed(() => options.index.search(rewritten.value, options.strategy, options.candidateTopK));
  const selection = selectForMode(mode, search.value, options);
  const generation = await timed(() =>
    generateAnswer({
      model: options.model,
      systemPrompt: options.systemPrompt,
      question,
      selection,
      threshold: usesFilter(mode) ? options.threshold : null,
      chat: { memory: state, history },
    }),
  );
  const turn: DialogTurn = {
    question,
    query: rewritten.value,
    hits: selection.hits,
    answer: generation.value.answer,
    state,
    stateUpdated: memory.value.updated,
    timings: { stateMs: memory.ms, rewriteMs: rewritten.ms, searchMs: search.ms, generateMs: generation.ms },
  };
  return { turn, dialog: { state, turns: [...dialog.turns, turn] } };
}
