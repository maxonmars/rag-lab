import type { AgentErrorCode } from "../../core/index.ts";
import type { RagAnswer } from "./answer.ts";
import { type CitedAnswer, citationProblems } from "./citations.ts";
import { stageTotalMs } from "./evalMetrics.ts";
import type { ControlQuestion } from "./questions.ts";

export type CitationFailure = Readonly<{
  code: AgentErrorCode;
  data: Readonly<Record<string, string | number>>;
  elapsedMs: number;
}>;

export type CitationResult =
  | Readonly<{ question: ControlQuestion; result: RagAnswer }>
  | Readonly<{ question: ControlQuestion; failure: CitationFailure }>;

export type StageStats = Readonly<{ count: number; medianMs: number; maxMs: number }>;

/** `null` — у этапа нет ни одного значения. */
export type CitationTiming = Readonly<{
  rewrite: StageStats | null;
  search: StageStats | null;
  generation: StageStats | null;
  total: StageStats | null;
}>;

/** Положительные вопросы — с ожидаемыми источниками, отрицательные — без них; смысл ответов не оценивается. */
export type CitationMetrics = Readonly<{
  questions: number;
  positives: number;
  withSources: number;
  withQuotes: number;
  expectedCited: number;
  positiveUnknown: number;
  negatives: number;
  unknownByRetrieval: number;
  unknownByModel: number;
  quotes: number;
  verifiedQuotes: number;
  clean: number;
  failed: number;
  timing: CitationTiming;
}>;

type Answered = Extract<CitedAnswer, { kind: "answer" }>;
type Succeeded = Extract<CitationResult, { result: RagAnswer }>;

const count = <T>(items: readonly T[], test: (item: T) => boolean): number => items.filter(test).length;

const succeeded = (row: CitationResult): row is Succeeded => "result" in row;

const answered = (row: CitationResult): Answered | undefined =>
  succeeded(row) && row.result.answer.kind === "answer" ? row.result.answer : undefined;

const isUnknownBy = (row: CitationResult, by: "model" | "retrieval"): boolean =>
  succeeded(row) && row.result.answer.kind === "unknown" && row.result.answer.by === by;

/** Источник засчитывается, если номер раскрыт в переданный фрагмент (и, при `accept`, файл подходит). */
const hasSource = (row: CitationResult, accept: (file: string) => boolean = () => true): boolean =>
  answered(row)?.sources.some((source) => source.hit !== undefined && accept(source.hit.chunk.file)) ?? false;

function median(values: readonly number[]): number {
  const sorted = [...values].sort((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);
  const upper = sorted[middle] ?? 0;
  return sorted.length % 2 === 1 ? upper : ((sorted[middle - 1] ?? 0) + upper) / 2;
}

function stageStats(values: readonly number[]): StageStats | null {
  return values.length === 0 ? null : { count: values.length, medianMs: median(values), maxMs: Math.max(...values) };
}

/** Учитываются только вопросы с ответом; генерация — только там, где модель вызывалась. */
export function citationTiming(results: readonly CitationResult[]): CitationTiming {
  const rows = results.filter(succeeded);
  return {
    rewrite: stageStats(rows.map(({ result }) => result.timings.rewriteMs).filter((ms) => ms > 0)),
    search: stageStats(rows.map(({ result }) => result.timings.searchMs)),
    generation: stageStats(
      rows.filter((row) => !isUnknownBy(row, "retrieval")).map(({ result }) => result.timings.generateMs),
    ),
    total: stageStats(rows.map(({ result }) => stageTotalMs(result.timings))),
  };
}

export function citationMetrics(results: readonly CitationResult[]): CitationMetrics {
  const positive = results.filter(({ question }) => question.sources.length > 0);
  const negative = results.filter(({ question }) => question.sources.length === 0);
  const quotes = results.flatMap((row) => answered(row)?.quotes ?? []);
  return {
    questions: results.length,
    positives: positive.length,
    withSources: count(positive, (row) => hasSource(row)),
    withQuotes: count(positive, (row) => answered(row)?.quotes.some((quote) => quote.verified) ?? false),
    expectedCited: count(positive, (row) => hasSource(row, (file) => row.question.sources.includes(file))),
    positiveUnknown: count(positive, (row) => succeeded(row) && row.result.answer.kind === "unknown"),
    negatives: negative.length,
    unknownByRetrieval: count(negative, (row) => isUnknownBy(row, "retrieval")),
    unknownByModel: count(negative, (row) => isUnknownBy(row, "model")),
    quotes: quotes.length,
    verifiedQuotes: count(quotes, (quote) => quote.verified),
    clean: count(results, (row) => succeeded(row) && citationProblems(row.result.answer).length === 0),
    failed: count(results, (row) => "failure" in row),
    timing: citationTiming(results),
  };
}
