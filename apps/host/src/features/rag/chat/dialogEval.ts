import type { ModelPort } from "../../../core/index.ts";
import type { AnswerPrompt } from "../answer.ts";
import { writeFileAtomic } from "../atomicWrite.ts";
import { checkRetrievalParams, type RetrievalMode, type RetrievalParams } from "../retrieval.ts";
import type { SearchIndex } from "../search.ts";
import type { Strategy } from "../types.ts";
import { checkHistoryTurns, type Dialog, type DialogTurn, EMPTY_DIALOG } from "./dialog.ts";
import { type ScenarioMetrics, type ScenarioRun, scenarioMetrics } from "./dialogMetrics.ts";
import { renderDialogReport } from "./dialogReport.ts";
import { loadScenarios, type Scenario } from "./scenarios.ts";
import { chatTurn } from "./turn.ts";

export type DialogProgress = Readonly<{ id: string; turn: number }>;

export type DialogEvalOptions = RetrievalParams &
  Readonly<{
    scenariosFile: string;
    reportFile: string;
    index: SearchIndex;
    strategy: Strategy;
    mode: RetrievalMode;
    model: ModelPort;
    systemPrompt: string;
    answerPrompt: AnswerPrompt;
    historyTurns: number;
    /** Значения только для шапки отчёта. */
    meta: Readonly<{ scenariosFile: string; llmModel: string }>;
    onProgress?: (event: DialogProgress) => void;
    now?: () => Date;
  }>;

export type DialogEvalResult = Readonly<{
  path: string;
  scenarios: number;
  turns: number;
  /** Фактическая длительность прогона сценариев, мс. */
  wallMs: number;
  metrics: readonly ScenarioMetrics[];
}>;

async function runScenario(options: DialogEvalOptions, scenario: Scenario): Promise<ScenarioRun> {
  const started = performance.now();
  let dialog: Dialog = EMPTY_DIALOG;
  const turns: DialogTurn[] = [];
  for (const [index, question] of scenario.messages.entries()) {
    options.onProgress?.({ id: scenario.id, turn: index + 1 });
    const result = await chatTurn({ ...options, dialog, question });
    dialog = result.dialog;
    turns.push(result.turn);
  }
  return { scenario, turns, wallMs: performance.now() - started };
}

/** Сценарии идут последовательно, каждый в новом диалоге; первая ошибка прерывает прогон, и отчёт не пишется. */
export async function evaluateDialogs(options: DialogEvalOptions): Promise<DialogEvalResult> {
  checkRetrievalParams(options);
  checkHistoryTurns(options.historyTurns);
  const scenarios = loadScenarios(options.scenariosFile);
  const now = (options.now ?? (() => new Date()))();
  const started = performance.now();
  const runs: ScenarioRun[] = [];
  for (const scenario of scenarios) runs.push(await runScenario(options, scenario));
  const wallMs = performance.now() - started;
  const metrics = runs.map(scenarioMetrics);
  await writeFileAtomic(
    options.reportFile,
    renderDialogReport({
      now,
      index: options.index,
      strategy: options.strategy,
      mode: options.mode,
      params: options,
      historyTurns: options.historyTurns,
      scenariosFile: options.meta.scenariosFile,
      llmModel: options.meta.llmModel,
      answerPrompt: options.answerPrompt,
      wallMs,
      runs,
      metrics,
    }),
  );
  const turns = runs.reduce((sum, run) => sum + run.turns.length, 0);
  return { path: options.reportFile, scenarios: runs.length, turns, wallMs, metrics };
}
