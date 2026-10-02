import type { ModelPort } from "../../core/index.ts";
import { answerWithRag } from "./answer.ts";
import { writeFileAtomic } from "./atomicWrite.ts";
import { type CitationMetrics, type CitationResult, citationMetrics } from "./citationMetrics.ts";
import { renderCitationReport } from "./citationReport.ts";
import { loadQuestions, requireIndexedSources } from "./questions.ts";
import { checkRetrievalParams, type RetrievalMode, type RetrievalParams } from "./retrieval.ts";
import type { SearchIndex } from "./search.ts";
import type { Strategy } from "./types.ts";

export type CitationProgress = Readonly<{ id: string }>;

export type CitationEvalOptions = RetrievalParams &
  Readonly<{
    questionsFile: string;
    reportFile: string;
    index: SearchIndex;
    strategy: Strategy;
    mode: RetrievalMode;
    model: ModelPort;
    systemPrompt: string;
    /** Значения только для шапки отчёта. */
    meta: Readonly<{ questionsFile: string; llmModel: string }>;
    onProgress?: (event: CitationProgress) => void;
    now?: () => Date;
  }>;

export type CitationEvalResult = Readonly<{
  path: string;
  questions: number;
  /** Фактическая длительность прогона вопросов, мс. */
  wallMs: number;
  metrics: CitationMetrics;
}>;

/** Вопросы идут последовательно; первая ошибка прерывает прогон, и отчёт не пишется. */
export async function evaluateCitations(options: CitationEvalOptions): Promise<CitationEvalResult> {
  checkRetrievalParams(options);
  const questions = loadQuestions(options.questionsFile);
  requireIndexedSources(questions, options.index.files);
  const now = (options.now ?? (() => new Date()))();
  const started = performance.now();
  const results: CitationResult[] = [];
  for (const question of questions) {
    options.onProgress?.({ id: question.id });
    const result = await answerWithRag({
      question: question.question,
      index: options.index,
      strategy: options.strategy,
      mode: options.mode,
      candidateTopK: options.candidateTopK,
      topK: options.topK,
      threshold: options.threshold,
      model: options.model,
      systemPrompt: options.systemPrompt,
    });
    results.push({ question, result });
  }
  const wallMs = performance.now() - started;
  const metrics = citationMetrics(results);
  await writeFileAtomic(
    options.reportFile,
    renderCitationReport({
      now,
      index: options.index,
      strategy: options.strategy,
      mode: options.mode,
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
