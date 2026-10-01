import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { type EvalProgress, evaluateQuestions } from "../evaluation.ts";
import { evalRoot, REPORT_NAME, setupEval } from "./evalSetup.ts";

const root = evalRoot();
const QUESTION_TEXTS = ["Что в первом файле?", "Что в обоих файлах?", "Чего нет в документации?"];

describe("evaluateQuestions: порядок и число вызовов", () => {
  it("на вопрос — исходный поиск, два ответа, один rewrite, один поиск, два ответа", async () => {
    const { options, log } = setupEval(root.path);
    await evaluateQuestions(options);
    const perQuestion = (question: string) => [
      `search:${question}`,
      "answer",
      "answer",
      "rewrite",
      `search:запрос: ${question}`,
      "answer",
      "answer",
    ];
    expect(log).toEqual(QUESTION_TEXTS.flatMap(perQuestion));
  });

  it("15 вызовов модели и 6 поисков на три вопроса; поиск запрашивает candidateTopK кандидатов", async () => {
    const { options, search, kinds } = setupEval(root.path);
    await evaluateQuestions(options);
    expect(kinds.filter((kind) => kind === "rewrite")).toHaveLength(3);
    expect(kinds.filter((kind) => kind === "answer")).toHaveLength(12);
    expect(search).toHaveBeenCalledTimes(6);
    for (const call of search.mock.calls) expect(call.slice(1)).toEqual(["structure", 4]);
  });

  it("сообщает шаги прогресса в порядке выполнения", async () => {
    const events: EvalProgress[] = [];
    const { options } = setupEval(root.path, { onProgress: (event) => events.push(event) });
    await evaluateQuestions(options);
    expect(events.slice(0, 6)).toEqual(
      ["search", "baseline", "filter", "query-rewrite", "rewrite", "rewrite-filter"].map((step) => ({
        id: "q01",
        step,
      })),
    );
    expect(events).toHaveLength(18);
  });
});

describe("evaluateQuestions: контекст режимов", () => {
  it("исходный вопрос идёт во все четыре ответа, переписанная строка — только в поиск", async () => {
    const { options, requests } = setupEval(root.path);
    await evaluateQuestions(options);
    const answers = requests.filter((request) => !String(request.messages[0]?.content).includes("переписываешь"));
    expect(answers).toHaveLength(12);
    answers.forEach((request, position) => {
      const question = QUESTION_TEXTS[Math.floor(position / 4)] ?? "";
      const user = String(request.messages[1]?.content);
      expect(user.endsWith(`## Вопрос\n\n${question}`)).toBe(true);
      expect(user).not.toContain("запрос:");
    });
  });

  it("filter получает кандидатов baseline, rewrite-filter — кандидатов rewrite: чанки режимов различаются порогом", async () => {
    const { options, requests } = setupEval(root.path);
    await evaluateQuestions(options);
    const answers = requests.filter((request) => !String(request.messages[0]?.content).includes("переписываешь"));
    const fragments = answers
      .slice(0, 4)
      .map((request) => String(request.messages[1]?.content).match(/### Фрагмент/g)?.length);
    expect(fragments).toEqual([3, 2, 3, 2]);
    const files = (position: number) => String(answers[position]?.messages[1]?.content).match(/- Файл: `(.+)`/g);
    expect(files(0)).toEqual(["- Файл: `c.md`", "- Файл: `a.md`", "- Файл: `b.md`"]);
    expect(files(1)).toEqual(["- Файл: `c.md`", "- Файл: `a.md`"]);
    expect(files(2)).toEqual(["- Файл: `a.md`", "- Файл: `b.md`", "- Файл: `c.md`"]);
    expect(files(3)).toEqual(["- Файл: `a.md`", "- Файл: `b.md`"]);
  });

  it("пустой контекст не пропускает ответ: модель вызывается во всех режимах", async () => {
    const { options, requests, kinds } = setupEval(root.path, { threshold: 0.95 });
    await evaluateQuestions(options);
    expect(kinds.filter((kind) => kind === "answer")).toHaveLength(12);
    const empty = requests.filter(
      (request) => request.messages[1]?.content === "## Фрагменты документации\n\n## Вопрос\n\nЧто в первом файле?",
    );
    expect(empty).toHaveLength(2);
  });
});

describe("evaluateQuestions: результат", () => {
  it("считает метрики четырёх режимов по итоговым hits и возвращает фактическую длительность", async () => {
    const { options } = setupEval(root.path);
    const result = await evaluateQuestions(options);
    expect(result.path).toBe(join(root.path, "out", REPORT_NAME));
    expect(result.questions).toBe(3);
    expect(result.wallMs).toBeGreaterThanOrEqual(0);
    const { baseline, filter, rewrite } = result.metrics;
    expect([baseline.hitAtK, baseline.mrr, baseline.foundPairs, baseline.nonEmptyNegatives]).toEqual([1, 0.5, 3, 1]);
    expect([filter.hitAtK, filter.mrr, filter.foundPairs, filter.nonEmptyNegatives]).toEqual([1, 0.5, 2, 1]);
    expect([rewrite.hitAtK, rewrite.mrr, rewrite.foundPairs]).toEqual([1, 1, 3]);
    expect(result.metrics["rewrite-filter"].meanHits).toBe(2);
    expect(readFileSync(result.path, "utf8")).toContain("# Сравнение режимов поиска");
  });
});
