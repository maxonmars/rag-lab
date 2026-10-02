import { describe, expect, it } from "vitest";
import { type ModeOutcome, modeMetrics, type QuestionResult } from "../evalMetrics.ts";
import type { ControlQuestion } from "../questions.ts";
import { forEachMode } from "../retrieval.ts";
import type { SearchHit } from "../search.ts";
import { searchHit } from "./support.ts";

const question = (id: string, sources: string[]): ControlQuestion => ({ id, question: id, expectation: "-", sources });
const hitsOf = (...files: string[]): SearchHit[] => files.map((file, position) => searchHit(position + 1, file, 0.9));

function outcome(hits: readonly SearchHit[], contextChars: number, generateMs = 0): ModeOutcome {
  return {
    query: "q",
    candidates: hits,
    selection: { hits, belowThreshold: [], overLimit: [] },
    answer: { kind: "unknown", by: "retrieval", threshold: null, nearest: [] },
    contextChars,
    timings: { rewriteMs: 1, searchMs: 2, selectMs: 3, generateMs },
  };
}

/** Во всех режимах одинаковые hits: проверяется только формула метрики. */
const result = (q: ControlQuestion, hits: readonly SearchHit[], contextChars = 100): QuestionResult => ({
  question: q,
  rewrittenQuery: "q",
  outcomes: forEachMode(() => outcome(hits, contextChars, 4)),
});

describe("modeMetrics", () => {
  const results = [
    result(question("q1", ["a.md", "b.md"]), hitsOf("a.md", "x.md", "b.md"), 100),
    result(question("q2", ["c.md"]), hitsOf("x.md", "y.md", "c.md", "c.md"), 200),
    result(question("q3", ["d.md"]), hitsOf("x.md"), 300),
    result(question("q4", []), hitsOf("x.md"), 400),
    result(question("q5", []), [], 500),
  ];

  it("hit@K, MRR и покрытие считаются только по положительным вопросам", () => {
    const metrics = modeMetrics(results, "baseline");
    expect(metrics).toMatchObject({ positives: 3, hitQuestions: 2, expectedPairs: 4, foundPairs: 3, negatives: 2 });
    expect(metrics.hitAtK).toBeCloseTo(2 / 3);
    expect(metrics.mrr).toBeCloseTo((1 + 1 / 3 + 0) / 3);
    expect(metrics.sourceCoverage).toBeCloseTo(3 / 4);
  });

  it("несколько чанков одного файла не увеличивают покрытие и не сдвигают позицию первого источника", () => {
    const only = result(question("q2", ["c.md"]), hitsOf("c.md", "c.md", "c.md"));
    const metrics = modeMetrics([only], "baseline");
    expect(metrics).toMatchObject({ foundPairs: 1, expectedPairs: 1, sourceCoverage: 1, mrr: 1 });
  });

  it("доля непустого контекста считается только по отрицательным вопросам", () => {
    const metrics = modeMetrics(results, "baseline");
    expect(metrics).toMatchObject({ nonEmptyNegatives: 1, nonEmptyShare: 0.5 });
  });

  it("среднее число чанков, средний размер сообщения и сумма времени этапов", () => {
    const metrics = modeMetrics(results, "baseline");
    expect(metrics.meanHits).toBeCloseTo((3 + 4 + 1 + 1 + 0) / 5);
    expect(metrics.meanContextChars).toBe(300);
    expect(metrics.totalMs).toBe(5 * (1 + 2 + 3 + 4));
  });

  it("без отрицательных вопросов доля непустого контекста отсутствует, а не равна нулю", () => {
    const metrics = modeMetrics(results.slice(0, 3), "baseline");
    expect(metrics).toMatchObject({ negatives: 0, nonEmptyNegatives: 0, nonEmptyShare: null });
    expect(metrics.hitAtK).not.toBeNull();
  });

  it("без положительных вопросов метрики источников отсутствуют, без NaN и Infinity", () => {
    const metrics = modeMetrics(results.slice(3), "baseline");
    expect(metrics).toMatchObject({ positives: 0, hitAtK: null, mrr: null, sourceCoverage: null });
    expect(metrics.nonEmptyShare).toBe(0.5);
    for (const value of Object.values(metrics))
      if (typeof value === "number") expect(Number.isFinite(value)).toBe(true);
  });

  it("режимы считаются по своим итоговым hits", () => {
    const q = question("q1", ["a.md"]);
    const mixed: QuestionResult = {
      question: q,
      rewrittenQuery: "q",
      outcomes: { ...forEachMode(() => outcome(hitsOf("x.md", "a.md"), 10)), filter: outcome([], 10) },
    };
    expect(modeMetrics([mixed], "baseline").mrr).toBe(0.5);
    expect(modeMetrics([mixed], "filter")).toMatchObject({ mrr: 0, hitAtK: 0, foundPairs: 0 });
  });
});
