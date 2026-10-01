import type { ModelPort } from "../../core/index.ts";
import { generateAnswer } from "./answer.ts";
import { writeFileAtomic } from "./atomicWrite.ts";
import { allModeMetrics, type ModeMetrics, type ModeOutcome, type QuestionResult } from "./evalMetrics.ts";
import { renderEvalReport } from "./evalReport.ts";
import { type ControlQuestion, loadQuestions, requireIndexedSources } from "./questions.ts";
import { checkRetrievalParams, type RetrievalMode, type RetrievalParams } from "./retrieval.ts";
import { rewriteQuery } from "./rewrite.ts";
import type { SearchHit, SearchIndex } from "./search.ts";
import { selectForMode } from "./select.ts";
import { timed, timedSync } from "./timing.ts";
import type { Strategy } from "./types.ts";

export type EvalStep = "search" | "query-rewrite" | RetrievalMode;
export type EvalProgress = Readonly<{ id: string; step: EvalStep }>;

export type EvalOptions = RetrievalParams &
  Readonly<{
    questionsFile: string;
    reportFile: string;
    index: SearchIndex;
    strategy: Strategy;
    model: ModelPort;
    systemPrompt: string;
    /** Значения только для шапки отчёта. */
    meta: Readonly<{ questionsFile: string; llmModel: string }>;
    onProgress?: (event: EvalProgress) => void;
    now?: () => Date;
  }>;

export type EvalResult = Readonly<{
  path: string;
  questions: number;
  /** Фактическая длительность прогона вопросов, мс; не равна сумме времён режимов. */
  wallMs: number;
  metrics: Readonly<Record<RetrievalMode, ModeMetrics>>;
}>;

type Retrieved = Readonly<{ query: string; candidates: readonly SearchHit[]; rewriteMs: number; searchMs: number }>;

async function retrieve(options: EvalOptions, query: string, rewriteMs: number): Promise<Retrieved> {
  const search = await timed(() => options.index.search(query, options.strategy, options.candidateTopK));
  return { query, candidates: search.value, rewriteMs, searchMs: search.ms };
}

async function answerMode(
  options: EvalOptions,
  question: ControlQuestion,
  mode: RetrievalMode,
  retrieved: Retrieved,
): Promise<ModeOutcome> {
  options.onProgress?.({ id: question.id, step: mode });
  const selection = timedSync(() => selectForMode(mode, retrieved.candidates, options));
  const { hits } = selection.value;
  const generation = await timed(() =>
    generateAnswer({ model: options.model, systemPrompt: options.systemPrompt, question: question.question, hits }),
  );
  return {
    query: retrieved.query,
    candidates: retrieved.candidates,
    selection: selection.value,
    answer: generation.value.answer,
    contextChars: generation.value.contextChars,
    timings: {
      rewriteMs: retrieved.rewriteMs,
      searchMs: retrieved.searchMs,
      selectMs: selection.ms,
      generateMs: generation.ms,
    },
  };
}

/** Исходный поиск → baseline, filter; один rewrite и один поиск → rewrite, rewrite-filter. Исходный вопрос идёт во все четыре ответа. */
async function evaluateOne(question: ControlQuestion, options: EvalOptions): Promise<QuestionResult> {
  options.onProgress?.({ id: question.id, step: "search" });
  const original = await retrieve(options, question.question, 0);
  const baseline = await answerMode(options, question, "baseline", original);
  const filter = await answerMode(options, question, "filter", original);
  options.onProgress?.({ id: question.id, step: "query-rewrite" });
  const rewritten = await timed(() => rewriteQuery(question.question, options.model));
  const retrieved = await retrieve(options, rewritten.value, rewritten.ms);
  const rewrite = await answerMode(options, question, "rewrite", retrieved);
  const rewriteFilter = await answerMode(options, question, "rewrite-filter", retrieved);
  return {
    question,
    rewrittenQuery: rewritten.value,
    outcomes: { baseline, filter, rewrite, "rewrite-filter": rewriteFilter },
  };
}

/** Вопросы идут последовательно; первая ошибка прерывает прогон, и отчёт не пишется. */
export async function evaluateQuestions(options: EvalOptions): Promise<EvalResult> {
  checkRetrievalParams(options);
  const questions = loadQuestions(options.questionsFile);
  requireIndexedSources(questions, options.index.files);
  const now = (options.now ?? (() => new Date()))();
  const started = performance.now();
  const results: QuestionResult[] = [];
  for (const question of questions) results.push(await evaluateOne(question, options));
  const wallMs = performance.now() - started;
  const metrics = allModeMetrics(results);
  await writeFileAtomic(
    options.reportFile,
    renderEvalReport({
      now,
      index: options.index,
      strategy: options.strategy,
      params: options,
      questionsFile: options.meta.questionsFile,
      llmModel: options.meta.llmModel,
      wallMs,
      results,
      metrics,
    }),
  );
  return { path: options.reportFile, questions: results.length, wallMs, metrics };
}
