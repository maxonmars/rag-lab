import { writeFileAtomic } from "./atomicWrite.ts";
import { type CalibrationQuestion, renderCalibrationReport, type ThresholdRow } from "./calibrationReport.ts";
import { type ControlQuestion, foundSources, loadQuestions, requireIndexedSources } from "./questions.ts";
import { checkRetrievalParams, type RetrievalParams } from "./retrieval.ts";
import type { SearchIndex } from "./search.ts";
import { selectForMode } from "./select.ts";
import type { Strategy } from "./types.ts";

/** Сетка порогов; общие кандидаты проверяются на каждом значении. */
export const THRESHOLD_GRID = [0.5, 0.55, 0.6, 0.65] as const;

export type CalibrationOptions = RetrievalParams &
  Readonly<{
    questionsFile: string;
    reportFile: string;
    index: SearchIndex;
    strategy: Strategy;
    meta: Readonly<{ questionsFile: string }>;
    onProgress?: (event: Readonly<{ id: string }>) => void;
    now?: () => Date;
  }>;

export type CalibrationResult = Readonly<{
  path: string;
  questions: number;
  expectedPairs: number;
  baselinePairs: number;
  rows: readonly ThresholdRow[];
  recommended: number;
}>;

const sum = (values: readonly number[]): number => values.reduce((total, value) => total + value, 0);

/** Лексикографически: сохранённые пары, пустые контексты отрицательных вопросов, затем порог. */
const byPreference = (left: ThresholdRow, right: ThresholdRow): number =>
  left.keptPairs - right.keptPairs || left.emptyNegatives - right.emptyNegatives || left.threshold - right.threshold;

function thresholdRow(
  threshold: number,
  items: readonly CalibrationQuestion[],
  options: CalibrationOptions,
): ThresholdRow {
  const rule = { candidateTopK: options.candidateTopK, topK: options.topK, threshold };
  const evaluated = items.map(({ question, candidates }) => {
    const baseline = foundSources(question, selectForMode("baseline", candidates, options).hits);
    const { hits } = selectForMode("filter", candidates, rule);
    const kept = foundSources(question, hits);
    const lost = baseline.filter((file) => !kept.includes(file)).map((file) => ({ id: question.id, file }));
    return { question, hits: hits.length, kept: kept.length, lost };
  });
  return {
    threshold,
    keptPairs: sum(evaluated.map(({ kept }) => kept)),
    lost: evaluated.flatMap(({ lost }) => lost),
    emptyNegatives: evaluated.filter(({ question, hits }) => question.sources.length === 0 && hits === 0).length,
    meanHits: sum(evaluated.map(({ hits }) => hits)) / Math.max(evaluated.length, 1),
  };
}

async function searchQuestion(question: ControlQuestion, options: CalibrationOptions): Promise<CalibrationQuestion> {
  options.onProgress?.({ id: question.id });
  const candidates = await options.index.search(question.question, options.strategy, options.candidateTopK);
  return { question, candidates };
}

/** Один поиск исходной формулировкой на вопрос; модель генерации не нужна. Отчёт пишется после успеха, конфигурация не меняется. */
export async function calibrateThreshold(options: CalibrationOptions): Promise<CalibrationResult> {
  checkRetrievalParams(options);
  const questions = loadQuestions(options.questionsFile);
  requireIndexedSources(questions, options.index.files);
  const now = (options.now ?? (() => new Date()))();
  const items: CalibrationQuestion[] = [];
  for (const question of questions) items.push(await searchQuestion(question, options));
  const baselinePairs = sum(
    items.map(
      ({ question, candidates }) => foundSources(question, selectForMode("baseline", candidates, options).hits).length,
    ),
  );
  const rows = THRESHOLD_GRID.map((threshold) => thresholdRow(threshold, items, options));
  const recommended = rows.reduce((best, row) => (byPreference(row, best) > 0 ? row : best)).threshold;
  const expectedPairs = sum(questions.map((question) => question.sources.length));
  await writeFileAtomic(
    options.reportFile,
    renderCalibrationReport({
      now,
      index: options.index,
      strategy: options.strategy,
      params: options,
      questionsFile: options.meta.questionsFile,
      items,
      rows,
      baselinePairs,
      expectedPairs,
      recommended,
    }),
  );
  return { path: options.reportFile, questions: questions.length, expectedPairs, baselinePairs, rows, recommended };
}
