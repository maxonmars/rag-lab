import {
  chatTurn,
  type Dialog,
  type DialogEvalResult,
  evaluateDialogs,
  type RetrievalMode,
  renderCitedAnswer,
  renderTaskState,
  type TaskState,
} from "../features/rag/index.ts";
import { systemPrompt } from "./ask.ts";
import type { RagOutcome } from "./rag.ts";
import { fragmentLines, prepareRag, type RagAnswerHandlerOptions, type RagReply } from "./ragAnswer.ts";

/** Ответ чата: `goal` — цель из памяти задачи после хода, пусто — не зафиксирована; `remembered` — пункты памяти, появившиеся в этом ходу. */
export type ChatReply = RagReply & Readonly<{ goal: string; remembered: readonly string[] }>;

const share = (part: number, whole: number): string => (whole === 0 ? "—" : `${part} из ${whole}`);

export function stateLines(dialog: Dialog): string[] {
  if (dialog.turns.length === 0) return ["Память задачи пуста."];
  return [`Ходов: ${dialog.turns.length}`, "", ...renderTaskState(dialog.state).split("\n")];
}

/** Пункты, которых не было в памяти до хода; переформулированный пункт тоже считается новым. */
export function rememberedLines(before: TaskState, after: TaskState): string[] {
  const added = (label: string, was: readonly string[], now: readonly string[]) =>
    now.filter((item) => !was.includes(item)).map((item) => `${label}: ${item}`);
  return [
    ...(after.goal !== before.goal && after.goal !== "" ? [`цель: ${after.goal}`] : []),
    ...added("уточнение", before.clarifications, after.clarifications),
    ...added("ограничение или термин", before.constraints, after.constraints),
  ];
}

function dialogLines(result: DialogEvalResult, mode: RetrievalMode, historyTurns: number): string[] {
  const scenarios = result.metrics.map((m) => {
    const refused = m.unknownByRetrieval + m.unknownByModel;
    return `${m.id}: ходов ${m.turns}, ответов с источниками ${share(m.withSources, m.turns)}, цель сохранена ${share(m.goalKept, m.turns)}, ключи памяти ${share(m.memoryKept, m.memoryChecks)}, «не знаю» ${refused}, ${(m.wallMs / 1000).toFixed(1)} с`;
  });
  return [
    `Сценариев: ${result.scenarios}, реплик ${result.turns}, режим ${mode}, окно истории ${historyTurns}`,
    ...scenarios,
    `Длительность прогона: ${(result.wallMs / 1000).toFixed(1)} с`,
  ];
}

export function createRagChatHandlers(options: RagAnswerHandlerOptions) {
  return {
    /** Диалог меняется только в возвращённом значении: ошибка хода оставляет прежний диалог вызывающему. */
    async chat(dialog: Dialog, text: string): Promise<Readonly<{ reply: ChatReply; dialog: Dialog }>> {
      const { values, model, index, retrieval, answerPrompt } = await prepareRag(options);
      const result = await chatTurn({
        dialog,
        question: text,
        index,
        model,
        systemPrompt: systemPrompt(),
        answerPrompt,
        mode: values["rag.retrievalMode"],
        historyTurns: values["rag.historyTurns"],
        ...retrieval,
      });
      const { turn } = result;
      const reply = {
        answer: renderCitedAnswer(turn.answer),
        fragments: fragmentLines(turn.hits),
        goal: turn.state.goal,
        remembered: rememberedLines(dialog.state, turn.state),
      };
      return { reply, dialog: result.dialog };
    },

    async dialogs(): Promise<RagOutcome> {
      const { values, paths, model, modelName, index, retrieval, answerPrompt } = await prepareRag(options);
      const mode = values["rag.retrievalMode"];
      const historyTurns = values["rag.historyTurns"];
      const result = await evaluateDialogs({
        scenariosFile: paths.dialogFile,
        reportFile: paths.dialogReportFile,
        index,
        model,
        systemPrompt: systemPrompt(),
        answerPrompt,
        mode,
        historyTurns,
        ...retrieval,
        meta: { scenariosFile: values["rag.dialogFile"], llmModel: modelName },
        onProgress: (event) => options.view.progress(`${event.id}: ход ${event.turn}`),
      });
      return { lines: dialogLines(result, mode, historyTurns), path: result.path };
    },
  };
}
