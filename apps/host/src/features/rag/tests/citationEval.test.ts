import { readdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { AgentError } from "../../../core/index.ts";
import { type CitationEvalOptions, type CitationProgress, evaluateCitations } from "../citationEval.ts";
import { RagError } from "../errors.ts";
import { evalRoot } from "./evalSetup.ts";
import { type FakeModelOptions, fakeModel, fakeSearchIndex, searchHit } from "./support.ts";

const QUOTE = "Первый фрагмент подробно описывает порядок работы";
const GOOD = [searchHit(1, "a.md", 0.9, `${QUOTE} с модулем.`), searchHit(2, "b.md", 0.7, "Второй фрагмент о другом.")];
const WEAK = [searchHit(1, "c.md", 0.4, "Слабый фрагмент без ответа."), searchHit(2, "c.md", 0.3, "Ещё слабее.")];
const REPLY = `## Ответ\n\nТак [1].\n\n## Источники\n\n- [1]\n\n## Цитаты\n\n- [1] «${QUOTE}»`;
const REFUSAL = "## Не знаю\n\nНет сведений.\n\n## Уточнение\n\nО чём речь?";
const REPORT_NAME = "rag-citations.md";

const root = evalRoot();

function setup(overrides: Partial<CitationEvalOptions> = {}, modelOptions: FakeModelOptions = {}) {
  const { index, search } = fakeSearchIndex((query) => (query.includes("Чего нет") ? WEAK : GOOD));
  const fake = fakeModel({ answer: () => REPLY, ...modelOptions });
  const options: CitationEvalOptions = {
    questionsFile: join(root.path, "questions.md"),
    reportFile: join(root.path, "out", REPORT_NAME),
    index,
    strategy: "structure",
    mode: "rewrite-filter",
    candidateTopK: 4,
    topK: 3,
    threshold: 0.65,
    model: fake.model,
    systemPrompt: "Системная инструкция.",
    meta: { questionsFile: "experiments/feod-citations/questions.md", llmModel: "deepseek-flash" },
    now: () => new Date("2026-10-01T12:00:00Z"),
    ...overrides,
  };
  return { options, search, requests: fake.requests, kinds: fake.kinds };
}

const count = (kinds: readonly string[], kind: string) => kinds.filter((item) => item === kind).length;

describe("evaluateCitations: вызовы", () => {
  it("rewrite-filter: rewrite на каждый вопрос, генерация только там, где контекст не пуст", async () => {
    const { options, search, kinds } = setup();
    await evaluateCitations(options);
    expect(count(kinds, "rewrite")).toBe(3);
    expect(count(kinds, "answer")).toBe(2);
    expect(search).toHaveBeenCalledTimes(3);
    for (const call of search.mock.calls) expect(call.slice(1)).toEqual(["structure", 4]);
  });

  it("baseline: rewrite не вызывается, порог не применяется — модель отвечает и на отрицательный вопрос", async () => {
    const { options, search, kinds } = setup({ mode: "baseline" });
    await evaluateCitations(options);
    expect(count(kinds, "rewrite")).toBe(0);
    expect(count(kinds, "answer")).toBe(3);
    expect(search.mock.calls.map(([query]) => query)).toEqual([
      "Что в первом файле?",
      "Что в обоих файлах?",
      "Чего нет в документации?",
    ]);
  });

  it("сообщает вопрос перед его обработкой", async () => {
    const events: CitationProgress[] = [];
    const { options } = setup({ onProgress: (event) => events.push(event) });
    await evaluateCitations(options);
    expect(events).toEqual([{ id: "q01" }, { id: "q02" }, { id: "q03" }]);
  });

  it("ошибку модели сообщает после начала вопроса, прогон продолжается", async () => {
    const events: CitationProgress[] = [];
    const error = new AgentError("MODEL_FAILURE", { status: 500 });
    const { options } = setup(
      { onProgress: (event) => events.push(event) },
      { failOn: { kind: "answer", call: 1, error } },
    );
    await evaluateCitations(options);
    expect(events).toEqual([{ id: "q01" }, { id: "q01", failed: "MODEL_FAILURE" }, { id: "q02" }, { id: "q03" }]);
  });
});

describe("evaluateCitations: метрики", () => {
  it("считает источники, цитаты и отказы по группам вопросов", async () => {
    const { options } = setup();
    const result = await evaluateCitations(options);
    expect(result.path).toBe(join(root.path, "out", REPORT_NAME));
    expect(result.questions).toBe(3);
    expect(result.wallMs).toBeGreaterThanOrEqual(0);
    expect(result.metrics).toEqual({
      questions: 3,
      positives: 2,
      withSources: 2,
      withQuotes: 2,
      expectedCited: 2,
      positiveUnknown: 0,
      negatives: 1,
      unknownByRetrieval: 1,
      unknownByModel: 0,
      quotes: 2,
      verifiedQuotes: 2,
      clean: 3,
      failed: 0,
      timing: expect.any(Object),
    });
  });

  it("отказ модели на положительном вопросе — positiveUnknown, а не отказ по пустому контексту", async () => {
    const answer = (user: string) => (user.includes("первом файле") ? REFUSAL : REPLY);
    const { options } = setup({}, { answer });
    const { metrics } = await evaluateCitations(options);
    expect(metrics).toMatchObject({ positiveUnknown: 1, withSources: 1, withQuotes: 1, unknownByModel: 0 });
    expect(metrics.unknownByRetrieval).toBe(1);
  });

  it("отказ модели на отрицательном вопросе в режиме baseline — unknownByModel", async () => {
    const answer = (user: string) => (user.includes("Чего нет") ? REFUSAL : REPLY);
    const { options } = setup({ mode: "baseline" }, { answer });
    const { metrics } = await evaluateCitations(options);
    expect(metrics).toMatchObject({ unknownByModel: 1, unknownByRetrieval: 0, clean: 3 });
  });

  it("цитата, которой нет в фрагменте, не засчитывается и портит «без замечаний»", async () => {
    const { options } = setup({}, { answer: () => REPLY.replace(QUOTE, "Выдуманная цитата, которой нет в тексте") });
    const { metrics } = await evaluateCitations(options);
    expect(metrics).toMatchObject({ withQuotes: 0, withSources: 2, quotes: 2, verifiedQuotes: 0, clean: 1 });
  });
});

describe("evaluateCitations: отчёт", () => {
  async function report(overrides: Partial<CitationEvalOptions> = {}): Promise<string> {
    const { options } = setup(overrides);
    const result = await evaluateCitations(options);
    return readFileSync(result.path, "utf8");
  }

  it("шапка содержит дату, файл вопросов, индекс, модели, режим, K и порог", async () => {
    const text = await report();
    expect(text).toContain("# Источники, цитаты и режим «не знаю»");
    expect(text).toContain("Прогон 2026-10-01T12:00:00.000Z. Вопросы: `experiments/feod-citations/questions.md` (3).");
    expect(text).toContain("модель эмбеддингов `bge-m3:latest` (digest 790764642607)");
    expect(text).toContain("Модель ответов и переписывания запроса: `deepseek-flash`.");
    expect(text).toContain(
      "стратегия structure, режим rewrite-filter, кандидатов 4, итоговый top-3, порог 0.65 (применяется)",
    );
    expect(await report({ mode: "baseline" })).toContain(
      "режим baseline, кандидатов 4, итоговый top-3, порог 0.65 (в этом режиме не применяется)",
    );
  });

  it("сводка показывает отказ по пустому контексту отдельно от отказа моделью", async () => {
    const text = await report();
    expect(text).toContain("| Отрицательные: «не знаю» | 1 из 1 (пустой контекст 1, моделью 0) |");
    expect(text).toContain("| Положительные: ответ с дословной цитатой | 2 из 2 |");
    expect(text).toContain("| Цитаты, найденные дословно | 2 из 2 |");
    expect(text).toContain("| Ответы без замечаний | 3 из 3 |");
    expect(text).toContain("Совпадение смысла ответа с цитатами здесь не оценивается");
  });

  it("таблица вопросов и разделы вопросов: исход, фрагменты с chunk_id, цитаты и пустой контекст", async () => {
    const text = await report();
    expect(text).toMatch(/\| q01 \| `a\.md` \| ответ \| 0\.900 \| 1 из 1 \| 1 из 1 \| \d+\.\d \| \d+\.\d \| — \|/);
    expect(text).toMatch(/\| q03 \| — \| не знаю \(пустой контекст\) \| 0\.400 \| — \| — \| \d+\.\d \| — \| — \|/);
    expect(text).toMatch(/Сообщение: \d+ символов · rewrite \d+\.\d с · поиск \d+\.\d с · генерация \d+\.\d с/);
    expect(text).toContain("| 1 | 0.900 | `a.md` | Doc › a.md | `a.md#1` |");
    expect(text).toContain("> - [1] «Первый фрагмент подробно описывает порядок работы» — найдена во фрагменте 1");
    expect(text).toContain("Контекст пуст: модель не вызывалась.");
    expect(text).toContain("> Не знаю: ни один фрагмент не достиг порога сходства 0.65 (лучшее 0.400).");
  });

  it("нарушение формата видно в таблице вопросов и снижает долю ответов без замечаний", async () => {
    const { options } = setup({}, { answer: () => "Свободный текст." });
    await evaluateCitations(options);
    const text = readFileSync(options.reportFile, "utf8");
    expect(text).toMatch(
      /\| q01 \| `a\.md` \| ответ \| 0\.900 \| — \| — \| \d+\.\d \| \d+\.\d \| ответ не разбит на разделы/,
    );
    expect(text).toContain("| Ответы без замечаний | 1 из 3 |");
  });

  it("отчёт содержит раздел времени этапов", async () => {
    const text = await report();
    expect(text).toContain("## Время этапов");
    expect(text).toContain("| Этап | Вопросов | Медиана, с | Максимум, с |");
    expect(text).toMatch(/\| Переписывание запроса \| 3 \| \d+\.\d \| \d+\.\d \|/);
    expect(text).toMatch(/\| Поиск \| 3 \| \d+\.\d \| \d+\.\d \|/);
    expect(text).toMatch(/\| Генерация ответа \| 2 \| \d+\.\d \| \d+\.\d \|/);
    expect(text).toMatch(/\| Все этапы \| 3 \| \d+\.\d \| \d+\.\d \|/);
    expect(await report({ mode: "baseline" })).toContain("| Переписывание запроса | 0 | — | — |");
  });

  it("пустые знаменатели — «—», без NaN", async () => {
    writeFileSync(join(root.path, "questions.md"), "## q01. Вопрос\nОжидание: x\nИсточники: a.md");
    const text = await report();
    expect(text).toContain("| Отрицательные: «не знаю» | — (пустой контекст 0, моделью 0) |");
    expect(text).not.toMatch(/NaN|Infinity|undefined/);
  });
});

describe("evaluateCitations: сбои и проверки до внешних вызовов", () => {
  const OLD_REPORT = "# Прежний отчёт\n";

  it("сбой, не являющийся AgentError, прерывает прогон, прежний отчёт остаётся целым", async () => {
    const { options } = setup();
    await evaluateCitations(options);
    writeFileSync(options.reportFile, OLD_REPORT);
    const failing = setup({}, { failOn: { kind: "answer", call: 1 } });
    await expect(evaluateCitations(failing.options)).rejects.toThrow("сбой модели");
    expect(readFileSync(options.reportFile, "utf8")).toBe(OLD_REPORT);
    expect(readdirSync(join(root.path, "out"))).toEqual([REPORT_NAME]);
  });

  it("AgentError на ответе — исход вопроса, прогон доходит до конца и пишет отчёт", async () => {
    const error = new AgentError("MODEL_FAILURE", { status: 500 });
    const { options } = setup({}, { failOn: { kind: "answer", call: 1, error } });
    const result = await evaluateCitations(options);
    expect(result.questions).toBe(3);
    expect(result.metrics).toMatchObject({
      failed: 1,
      withSources: 1,
      positives: 2,
      clean: 2,
      unknownByRetrieval: 1,
    });
    const text = readFileSync(options.reportFile, "utf8");
    expect(text).toContain("| Ошибки модели (вопрос без ответа) | 1 из 3 |");
    expect(text).toContain("| q01 | `a.md` | ошибка `MODEL_FAILURE` | — | — | — | — | — | — |");
    expect(text).toContain("**Ошибка модели:** `MODEL_FAILURE` (status 500) через");
    const section = text.slice(text.indexOf("## q01."), text.indexOf("## q02."));
    expect(section).not.toContain("**Запрос поиска:**");
  });

  it("AgentError на rewrite — исход вопроса", async () => {
    const error = new AgentError("INCOMPLETE_RESPONSE", { reason: "length" });
    const { options } = setup({}, { failOn: { kind: "rewrite", call: 3, error } });
    const { metrics } = await evaluateCitations(options);
    expect(metrics).toMatchObject({ failed: 1, unknownByRetrieval: 0 });
    expect(readFileSync(options.reportFile, "utf8")).toContain("`INCOMPLETE_RESPONSE` (reason length) через");
  });

  it("несогласованные K отклоняются до поиска и модели", async () => {
    const { options, search, requests } = setup({ candidateTopK: 2, topK: 3 });
    await expect(evaluateCitations(options)).rejects.toMatchObject({
      code: "INVALID_RETRIEVAL_PARAMS",
      data: { reason: "order" },
    });
    expect(search).not.toHaveBeenCalled();
    expect(requests).toHaveLength(0);
  });

  it("неизвестный источник отклоняется до первого поиска и вызова модели", async () => {
    writeFileSync(join(root.path, "questions.md"), "## q01. Вопрос\nОжидание: x\nИсточники: a.md, нет.md");
    const { options, search, requests } = setup();
    const error = await evaluateCitations(options).catch((caught: unknown) => caught);
    expect(error).toBeInstanceOf(RagError);
    expect(error).toMatchObject({ code: "QUESTIONS_INVALID", data: { reason: "source", id: "q01", file: "нет.md" } });
    expect(search).not.toHaveBeenCalled();
    expect(requests).toHaveLength(0);
  });
});
