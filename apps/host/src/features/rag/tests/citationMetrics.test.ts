import { describe, expect, it } from "vitest";
import type { RagAnswer, StageTimings } from "../answer.ts";
import { type CitationResult, citationMetrics } from "../citationMetrics.ts";
import { renderCitationReport } from "../citationReport.ts";
import { parseCitedAnswer, retrievalRefusal } from "../citations.ts";
import { stageTotalMs } from "../evalMetrics.ts";
import type { ControlQuestion } from "../questions.ts";
import { fakeSearchIndex, searchHit } from "./support.ts";

const QUOTE = "Первый фрагмент подробно описывает порядок работы";
const HITS = [searchHit(1, "a.md", 0.9, `${QUOTE} с модулем.`)];
const REPLY = `## Ответ\n\nТак [1].\n\n## Источники\n\n- [1]\n\n## Цитаты\n\n- [1] «${QUOTE}»`;
const MODEL_REFUSAL = "## Не знаю\n\nНет.\n\n## Уточнение\n\nО чём?";

const positive: ControlQuestion = { id: "q01", question: "Вопрос?", expectation: "Ожидание.", sources: ["a.md"] };
const negative: ControlQuestion = { id: "q02", question: "Чего нет?", expectation: "Ответа нет.", sources: [] };

const timings = (rewriteMs: number, generateMs: number, searchMs = 10, selectMs = 0): StageTimings => ({
  rewriteMs,
  searchMs,
  selectMs,
  generateMs,
});

function answerRow(question: ControlQuestion, stages: StageTimings, raw = REPLY): CitationResult {
  const result: RagAnswer = {
    answer: parseCitedAnswer(raw, HITS),
    hits: HITS,
    contextChars: 100,
    query: question.question,
    candidates: HITS,
    timings: stages,
  };
  return { question, result };
}

function refusalRow(question: ControlQuestion, stages: StageTimings): CitationResult {
  const weak = searchHit(1, "c.md", 0.4);
  const selection = { hits: [], belowThreshold: [weak], overLimit: [] };
  const result: RagAnswer = {
    answer: retrievalRefusal(selection, 0.65),
    hits: [],
    contextChars: 0,
    query: question.question,
    candidates: [weak],
    timings: stages,
  };
  return { question, result };
}

const failureRow = (question: ControlQuestion): CitationResult => ({
  question,
  failure: { code: "MODEL_FAILURE", data: { status: 500 }, elapsedMs: 1200 },
});

describe("citationMetrics: время этапов", () => {
  it("медиана и максимум по этапам, нечётное число значений", () => {
    const rows = [
      answerRow(positive, timings(100, 1000)),
      answerRow(positive, timings(300, 3000)),
      answerRow(positive, timings(200, 2000)),
    ];
    const { timing } = citationMetrics(rows);
    expect(timing.generation).toEqual({ count: 3, medianMs: 2000, maxMs: 3000 });
    expect(timing.rewrite).toEqual({ count: 3, medianMs: 200, maxMs: 300 });
  });

  it("чётное число значений: медиана — среднее двух средних", () => {
    const rows = [1000, 4000, 2000, 3000].map((ms) => answerRow(positive, timings(0, ms)));
    expect(citationMetrics(rows).timing.generation).toEqual({ count: 4, medianMs: 2500, maxMs: 4000 });
  });

  it("отказ по пустому контексту не входит в генерацию, но входит в поиск и все этапы", () => {
    const { timing } = citationMetrics([answerRow(positive, timings(0, 2000)), refusalRow(negative, timings(0, 0))]);
    expect(timing.generation).toEqual({ count: 1, medianMs: 2000, maxMs: 2000 });
    expect(timing.search?.count).toBe(2);
    expect(timing.total?.count).toBe(2);
  });

  it("отказ моделью входит в генерацию", () => {
    const { timing } = citationMetrics([answerRow(positive, timings(0, 1500), MODEL_REFUSAL)]);
    expect(timing.generation).toEqual({ count: 1, medianMs: 1500, maxMs: 1500 });
  });

  it("все значения rewrite равны 0 — этап null; все строки с ошибкой — все этапы null", () => {
    expect(citationMetrics([answerRow(positive, timings(0, 1000))]).timing.rewrite).toBeNull();
    expect(citationMetrics([failureRow(positive), failureRow(negative)]).timing).toEqual({
      rewrite: null,
      search: null,
      generation: null,
      total: null,
    });
  });

  it("все этапы равны stageTotalMs строки", () => {
    const stages = timings(100, 2000, 30, 5);
    expect(citationMetrics([answerRow(positive, stages)]).timing.total).toEqual({
      count: 1,
      medianMs: stageTotalMs(stages),
      maxMs: 2135,
    });
  });
});

describe("citationMetrics: ошибки модели", () => {
  it("вопрос с ошибкой считается в failed и в знаменателях, но не в успешных показателях и не в этапах", () => {
    const metrics = citationMetrics([failureRow(positive), answerRow(positive, timings(100, 1000))]);
    expect(metrics).toMatchObject({ questions: 2, positives: 2, withSources: 1, clean: 1, failed: 1 });
    expect(metrics.timing.search?.count).toBe(1);
  });
});

describe("renderCitationReport: время и ошибки", () => {
  const { index } = fakeSearchIndex(() => []);
  const render = (results: readonly CitationResult[]) =>
    renderCitationReport({
      now: new Date("2026-10-01T12:00:00Z"),
      index,
      strategy: "structure",
      mode: "rewrite-filter",
      params: { candidateTopK: 4, topK: 3, threshold: 0.65 },
      questionsFile: "questions.md",
      llmModel: "model",
      wallMs: 1000,
      results,
      metrics: citationMetrics(results),
    });

  it("строка генерации округляет медиану и максимум до десятых секунды", () => {
    const rows = [1000, 3000, 2000].map((ms) => answerRow(positive, timings(0, ms)));
    expect(render(rows)).toContain("| Генерация ответа | 3 | 2.0 | 3.0 |");
  });

  it("без rewrite этап пуст: ноль вопросов и прочерки", () => {
    expect(render([answerRow(positive, timings(0, 1000))])).toContain("| Переписывание запроса | 0 | — | — |");
  });

  it("сводка показывает долю вопросов с ошибкой модели", () => {
    const rows = [failureRow(positive), ...[1, 2, 3].map(() => answerRow(negative, timings(0, 1000)))];
    expect(render(rows)).toContain("| Ошибки модели (вопрос без ответа) | 1 из 4 |");
  });
});
