import type { RagAnswer } from "./answer.ts";
import { type CitedAnswer, citationProblems } from "./citations.ts";
import type { ControlQuestion } from "./questions.ts";

export type CitationResult = Readonly<{ question: ControlQuestion; result: RagAnswer }>;

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
}>;

type Answered = Extract<CitedAnswer, { kind: "answer" }>;

const count = <T>(items: readonly T[], test: (item: T) => boolean): number => items.filter(test).length;

const answered = ({ result }: CitationResult): Answered | undefined =>
  result.answer.kind === "answer" ? result.answer : undefined;

const isUnknownBy = ({ result }: CitationResult, by: "model" | "retrieval"): boolean =>
  result.answer.kind === "unknown" && result.answer.by === by;

/** Источник засчитывается, если номер раскрыт в переданный фрагмент (и, при `accept`, файл подходит). */
const hasSource = (row: CitationResult, accept: (file: string) => boolean = () => true): boolean =>
  answered(row)?.sources.some((source) => source.hit !== undefined && accept(source.hit.chunk.file)) ?? false;

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
    positiveUnknown: count(positive, (row) => row.result.answer.kind === "unknown"),
    negatives: negative.length,
    unknownByRetrieval: count(negative, (row) => isUnknownBy(row, "retrieval")),
    unknownByModel: count(negative, (row) => isUnknownBy(row, "model")),
    quotes: quotes.length,
    verifiedQuotes: count(quotes, (quote) => quote.verified),
    clean: count(results, (row) => citationProblems(row.result.answer).length === 0),
  };
}
