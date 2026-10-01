import type { StageTimings } from "./answer.ts";
import { type ControlQuestion, foundSources } from "./questions.ts";
import { forEachMode, type RetrievalMode } from "./retrieval.ts";
import type { SearchHit } from "./search.ts";
import type { Selection } from "./select.ts";

export type ModeOutcome = Readonly<{
  query: string;
  candidates: readonly SearchHit[];
  selection: Selection;
  answer: string;
  contextChars: number;
  /** Этапы этого режима, включая общие с парным режимом поиск и rewrite. */
  timings: StageTimings;
}>;

export type QuestionResult = Readonly<{
  question: ControlQuestion;
  rewrittenQuery: string;
  outcomes: Readonly<Record<RetrievalMode, ModeOutcome>>;
}>;

/** Метрики по итоговым hits; `null` — знаменатель равен нулю (нет положительных или отрицательных вопросов). */
export type ModeMetrics = Readonly<{
  positives: number;
  hitQuestions: number;
  hitAtK: number | null;
  mrr: number | null;
  expectedPairs: number;
  foundPairs: number;
  sourceCoverage: number | null;
  negatives: number;
  nonEmptyNegatives: number;
  nonEmptyShare: number | null;
  meanHits: number;
  meanContextChars: number;
  totalMs: number;
}>;

const sum = (values: readonly number[]): number => values.reduce((total, value) => total + value, 0);
const mean = (values: readonly number[]): number => (values.length === 0 ? 0 : sum(values) / values.length);
const ratio = (part: number, whole: number): number | null => (whole === 0 ? null : part / whole);

export const stageTotalMs = (timings: StageTimings): number =>
  timings.rewriteMs + timings.searchMs + timings.selectMs + timings.generateMs;

/** Позиция первого ожидаемого файла среди итоговых hits, с 1; `null`, если его нет. */
function firstPosition(question: ControlQuestion, hits: readonly SearchHit[]): number | null {
  const position = hits.findIndex((hit) => question.sources.includes(hit.chunk.file));
  return position < 0 ? null : position + 1;
}

export function modeMetrics(results: readonly QuestionResult[], mode: RetrievalMode): ModeMetrics {
  const rows = results.map(({ question, outcomes }) => ({ question, outcome: outcomes[mode] }));
  const positive = rows.filter(({ question }) => question.sources.length > 0);
  const negative = rows.filter(({ question }) => question.sources.length === 0);
  const positions = positive.map(({ question, outcome }) => firstPosition(question, outcome.selection.hits));
  const reciprocal = positions.map((position) => (position === null ? 0 : 1 / position));
  const expectedPairs = sum(positive.map(({ question }) => question.sources.length));
  const foundPairs = sum(
    positive.map(({ question, outcome }) => foundSources(question, outcome.selection.hits).length),
  );
  const hitQuestions = positions.filter((position) => position !== null).length;
  const nonEmptyNegatives = negative.filter(({ outcome }) => outcome.selection.hits.length > 0).length;
  return {
    positives: positive.length,
    hitQuestions,
    hitAtK: ratio(hitQuestions, positive.length),
    mrr: positive.length === 0 ? null : mean(reciprocal),
    expectedPairs,
    foundPairs,
    sourceCoverage: ratio(foundPairs, expectedPairs),
    negatives: negative.length,
    nonEmptyNegatives,
    nonEmptyShare: ratio(nonEmptyNegatives, negative.length),
    meanHits: mean(rows.map(({ outcome }) => outcome.selection.hits.length)),
    meanContextChars: mean(rows.map(({ outcome }) => outcome.contextChars)),
    totalMs: sum(rows.map(({ outcome }) => stageTotalMs(outcome.timings))),
  };
}

export const allModeMetrics = (results: readonly QuestionResult[]) => forEachMode((mode) => modeMetrics(results, mode));
