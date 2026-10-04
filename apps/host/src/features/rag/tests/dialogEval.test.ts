import { mkdirSync, mkdtempSync, readdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import type { DialogTurn } from "../chat/dialog.ts";
import { type DialogEvalOptions, type DialogProgress, evaluateDialogs } from "../chat/dialogEval.ts";
import { scenarioMetrics } from "../chat/dialogMetrics.ts";
import type { Scenario } from "../chat/scenarios.ts";
import type { CitedAnswer } from "../citations.ts";
import { chatSetup, type FakeChatModelOptions, HITS, QUOTE, STATE } from "./chatSupport.ts";

const SCENARIOS = [
  "# Сценарии",
  "",
  "## s1. Первый",
  "Цель: перевести проект на FEOD",
  "Ключи цели: FEOD",
  "Память:",
  "- 2: TypeScript",
  "Реплики:",
  "1. Первая реплика",
  "2. Вторая реплика про TypeScript",
  "",
  "## s2. Второй",
  "Цель: спроектировать корзину",
  "Ключи цели: корзин",
  "Реплики:",
  "1. Единственная реплика",
].join("\n");

let root: string;
beforeEach(() => {
  root = mkdtempSync(join(tmpdir(), "rag-lab-dialog-"));
  writeFileSync(join(root, "scenarios.md"), SCENARIOS);
});
afterEach(() => {
  rmSync(root, { recursive: true, force: true });
});

function setup(overrides: Partial<DialogEvalOptions> = {}, modelOptions: FakeChatModelOptions = {}) {
  const { options: turn, ...rest } = chatSetup({}, modelOptions);
  const options: DialogEvalOptions = {
    scenariosFile: join(root, "scenarios.md"),
    reportFile: join(root, "out", "rag-dialog.md"),
    index: turn.index,
    strategy: "structure",
    mode: "rewrite-filter",
    candidateTopK: 4,
    topK: 3,
    threshold: 0.6,
    model: turn.model,
    systemPrompt: "Системная инструкция.",
    historyTurns: 6,
    meta: { scenariosFile: "experiments/feod-chat/scenarios.md", llmModel: "deepseek-flash" },
    now: () => new Date("2026-10-02T12:00:00Z"),
    ...overrides,
  };
  return { options, ...rest };
}

describe("evaluateDialogs: прогон", () => {
  it("три реплики по три вызова модели; каждый сценарий начинается с пустой истории", async () => {
    const { options, kinds, ofKind } = setup();
    const result = await evaluateDialogs(options);
    expect(kinds).toEqual(Array.from({ length: 3 }, () => ["state", "rewrite", "answer"]).flat());
    expect(result).toMatchObject({ path: options.reportFile, scenarios: 2, turns: 3 });
    expect(ofKind("answer").map((request) => request.messages.length)).toEqual([2, 4, 2]);
    expect(String(ofKind("state")[2]?.messages[1]?.content)).toContain("## Текущая память задачи\n\n### Цель\n\n—");
  });

  it("сообщает номер реплики перед её обработкой", async () => {
    const events: DialogProgress[] = [];
    const { options } = setup({ onProgress: (event) => events.push(event) });
    await evaluateDialogs(options);
    expect(events).toEqual([
      { id: "s1", turn: 1 },
      { id: "s1", turn: 2 },
      { id: "s2", turn: 1 },
    ]);
  });

  it("считает цель, ключи памяти и источники по сценариям", async () => {
    const { options } = setup();
    const { metrics } = await evaluateDialogs(options);
    expect(metrics[0]).toMatchObject({
      id: "s1",
      turns: 2,
      answers: 2,
      withSources: 2,
      withVerifiedQuote: 2,
      quotes: 2,
      verifiedQuotes: 2,
      goalKept: 2,
      memoryChecks: 1,
      memoryKept: 1,
      stateFormatFailures: 0,
      withProblems: 0,
    });
    expect(metrics[1]).toMatchObject({ id: "s2", turns: 1, goalKept: 0, memoryChecks: 0 });
  });
});

describe("evaluateDialogs: отчёт", () => {
  async function report(overrides: Partial<DialogEvalOptions> = {}, model: FakeChatModelOptions = {}) {
    const { options } = setup(overrides, model);
    return readFileSync((await evaluateDialogs(options)).path, "utf8");
  }

  it("шапка: дата, файл сценариев, индекс, модель, режим, K, порог, окно истории", async () => {
    const text = await report();
    expect(text).toContain("# RAG-чат: история, память задачи и источники");
    expect(text).toContain(
      "Прогон 2026-10-02T12:00:00.000Z. Сценарии: `experiments/feod-chat/scenarios.md` (2, реплик 3).",
    );
    expect(text).toContain("модель эмбеддингов `bge-m3:latest` (digest 790764642607)");
    expect(text).toContain(
      "стратегия structure, режим rewrite-filter, кандидатов 4, итоговый top-3, порог 0.6 (применяется)",
    );
    expect(text).toContain("Окно истории: 6 ходов.");
  });

  it("сводка и таблица ходов с метриками цели и памяти", async () => {
    const text = await report();
    expect(text).toContain(
      "| s1 | 2 | 2 из 2 | 2 из 2 | 2 из 2 | 2 из 2 | 1 из 1 | 0 (пустой контекст 0, моделью 0) | 0 | 0 |",
    );
    expect(text).toContain("| s2 | 1 | 1 из 1 | 1 из 1 | 1 из 1 | 0 из 1 | — |");
    expect(text).toContain("| 2 | ответ | 1 из 1 | 1 из 1 | да | 1 из 1 | запрос: Вторая реплика про TypeScript |");
    expect(text).toContain("| 1 | ответ | 1 из 1 | 1 из 1 | нет | — | запрос: Единственная реплика |");
  });

  it("детали хода: реплика, строка поиска, фрагменты с chunk_id, ответ и память после хода", async () => {
    const text = await report();
    expect(text).toContain("### s1 · ход 1");
    expect(text).toContain("**Реплика.** Первая реплика");
    expect(text).toContain("| 1 | 0.900 | `a.md` | Doc › a.md | `a.md#1` |");
    expect(text).toContain(`> - [1] «${QUOTE}» — найдена во фрагменте 1`);
    expect(text).toContain("> ## Цель\n>\n> перевести проект на FEOD");
    expect(text).toContain("Смысл ответов здесь не оценивается");
  });

  it("неразобранная память помечена в отчёте и в метриках", async () => {
    const { options } = setup({}, { state: () => "нет разделов" });
    const { metrics, path } = await evaluateDialogs(options);
    expect(metrics.map((item) => item.stateFormatFailures)).toEqual([2, 1]);
    expect(readFileSync(path, "utf8")).toContain("Не обновлена: ответ модели не разобран, оставлена прежняя.");
  });
});

describe("evaluateDialogs: сбои и проверки до внешних вызовов", () => {
  const OLD_REPORT = "# Прежний отчёт\n";

  it("ошибка модели во втором сценарии прерывает прогон, прежний отчёт цел", async () => {
    const { options } = setup();
    mkdirSync(join(root, "out"));
    writeFileSync(options.reportFile, OLD_REPORT);
    const failing = setup({}, { failOn: { kind: "answer", call: 3 } });
    await expect(evaluateDialogs(failing.options)).rejects.toThrow("сбой модели");
    expect(readFileSync(options.reportFile, "utf8")).toBe(OLD_REPORT);
    expect(readdirSync(join(root, "out"))).toEqual(["rag-dialog.md"]);
  });

  it("несогласованные K и неверное окно истории отклоняются до чтения файла и модели", async () => {
    const bad = setup({ candidateTopK: 2, topK: 3, scenariosFile: join(root, "нет.md") });
    await expect(evaluateDialogs(bad.options)).rejects.toMatchObject({ data: { reason: "order" } });
    const window = setup({ historyTurns: 0, scenariosFile: join(root, "нет.md") });
    await expect(evaluateDialogs(window.options)).rejects.toMatchObject({ data: { reason: "historyTurns" } });
    expect(bad.requests).toHaveLength(0);
    expect(window.requests).toHaveLength(0);
  });

  it("отсутствующий файл сценариев — SCENARIOS_NOT_FOUND без вызова модели", async () => {
    const { options, requests } = setup({ scenariosFile: join(root, "нет.md") });
    await expect(evaluateDialogs(options)).rejects.toMatchObject({ code: "SCENARIOS_NOT_FOUND" });
    expect(requests).toHaveLength(0);
  });
});

describe("scenarioMetrics: синтетические ходы", () => {
  const scenario: Scenario = {
    id: "s9",
    title: "Синтетика",
    goal: "цель",
    goalKeys: ["FSD", "FEOD"],
    memory: [{ fromTurn: 2, key: "deep imports" }],
    messages: ["a", "b", "c"],
  };
  const answer = (overrides: Partial<Extract<CitedAnswer, { kind: "answer" }>>): CitedAnswer => ({
    kind: "answer",
    text: "т",
    sources: [{ fragment: 1, hit: HITS[0] }],
    quotes: [{ fragment: 1, text: QUOTE, hit: HITS[0], verified: true }],
    problems: [],
    raw: "",
    ...overrides,
  });
  const turn = (state: Partial<typeof STATE>, answered: CitedAnswer, stateUpdated = true): DialogTurn => ({
    question: "q",
    query: "q",
    hits: [],
    answer: answered,
    state: { ...STATE, ...state },
    stateUpdated,
    timings: { stateMs: 1, rewriteMs: 0, searchMs: 1, generateMs: 1 },
  });

  it("считает исходы, источники, цитаты, цель и ключи памяти с нужного хода", () => {
    const turns = [
      turn({ goal: "миграция FSD на FEOD" }, answer({})),
      turn(
        { goal: "миграция FSD на FEOD", constraints: ["deep imports запрещены"] },
        answer({
          sources: [],
          quotes: [{ fragment: 1, text: "x", hit: HITS[0], verified: false }],
          problems: [{ code: "no-sources" }],
        }),
      ),
      turn(
        { goal: "только FEOD", constraints: [] },
        { kind: "unknown", by: "retrieval", threshold: 0.6, nearest: [] },
        false,
      ),
    ];
    expect(scenarioMetrics({ scenario, turns, wallMs: 5 })).toEqual({
      id: "s9",
      turns: 3,
      answers: 2,
      withSources: 1,
      withVerifiedQuote: 1,
      quotes: 2,
      verifiedQuotes: 1,
      unknownByRetrieval: 1,
      unknownByModel: 0,
      goalKept: 2,
      memoryChecks: 2,
      memoryKept: 1,
      stateFormatFailures: 1,
      withProblems: 1,
      wallMs: 5,
    });
  });

  it("отказ модели считается отдельно от отказа по отбору", () => {
    const refusal: CitedAnswer = { kind: "unknown", by: "model", text: "т", clarification: "у", problems: [], raw: "" };
    const metrics = scenarioMetrics({ scenario, turns: [turn({}, refusal)], wallMs: 0 });
    expect(metrics).toMatchObject({ unknownByModel: 1, unknownByRetrieval: 0, answers: 0 });
  });
});
