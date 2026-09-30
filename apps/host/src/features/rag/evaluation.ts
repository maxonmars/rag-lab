import type { RagAnswer } from "./answer.ts";
import { writeFileAtomic } from "./atomicWrite.ts";
import { RagError } from "./errors.ts";
import { type QuestionResult, renderEvalReport } from "./evalReport.ts";
import { type ControlQuestion, loadQuestions } from "./questions.ts";
import type { SearchIndex } from "./search.ts";
import type { Strategy } from "./types.ts";

export type EvalProgress = Readonly<{ id: string; mode: "plain" | "rag" }>;

export type EvalOptions = Readonly<{
  questionsFile: string;
  reportFile: string;
  index: SearchIndex;
  strategy: Strategy;
  topK: number;
  /** Значения только для шапки отчёта. */
  meta: Readonly<{ questionsFile: string; llmModel: string }>;
  askPlain: (question: string) => Promise<string>;
  askRag: (question: string) => Promise<RagAnswer>;
  onProgress?: (event: EvalProgress) => void;
  now?: () => Date;
}>;

export type EvalResult = Readonly<{
  path: string;
  questions: number;
  expectedSources: number;
  foundSources: number;
  plainMs: number;
  ragMs: number;
}>;

function requireKnownSources(questions: readonly ControlQuestion[], files: readonly string[]): void {
  for (const { id, sources } of questions) {
    const missing = sources.find((file) => !files.includes(file));
    if (missing !== undefined) throw new RagError("QUESTIONS_INVALID", { reason: "source", id, file: missing });
  }
}

async function timed<T>(run: () => Promise<T>): Promise<{ value: T; ms: number }> {
  const started = performance.now();
  const value = await run();
  return { value, ms: performance.now() - started };
}

async function evaluateOne(question: ControlQuestion, options: EvalOptions): Promise<QuestionResult> {
  options.onProgress?.({ id: question.id, mode: "plain" });
  const plain = await timed(() => options.askPlain(question.question));
  options.onProgress?.({ id: question.id, mode: "rag" });
  const rag = await timed(() => options.askRag(question.question));
  const { hits } = rag.value;
  const hitFiles = new Set(hits.map((hit) => hit.chunk.file));
  return {
    question,
    hits,
    found: question.sources.filter((file) => hitFiles.has(file)),
    firstRank: hits.find((hit) => question.sources.includes(hit.chunk.file))?.rank ?? null,
    contextChars: rag.value.contextChars,
    plainAnswer: plain.value,
    ragAnswer: rag.value.answer,
    plainMs: plain.ms,
    ragMs: rag.ms,
  };
}

const sum = (values: readonly number[]): number => values.reduce((total, value) => total + value, 0);

/** Вопросы идут последовательно; первая ошибка прерывает прогон, и отчёт не пишется. */
export async function evaluateQuestions(options: EvalOptions): Promise<EvalResult> {
  const questions = loadQuestions(options.questionsFile);
  requireKnownSources(questions, options.index.files);
  const now = (options.now ?? (() => new Date()))();
  const results: QuestionResult[] = [];
  for (const question of questions) results.push(await evaluateOne(question, options));
  await writeFileAtomic(
    options.reportFile,
    renderEvalReport({
      now,
      index: options.index,
      strategy: options.strategy,
      topK: options.topK,
      questionsFile: options.meta.questionsFile,
      llmModel: options.meta.llmModel,
      results,
    }),
  );
  return {
    path: options.reportFile,
    questions: results.length,
    expectedSources: sum(results.map((result) => result.question.sources.length)),
    foundSources: sum(results.map((result) => result.found.length)),
    plainMs: sum(results.map((result) => result.plainMs)),
    ragMs: sum(results.map((result) => result.ragMs)),
  };
}
