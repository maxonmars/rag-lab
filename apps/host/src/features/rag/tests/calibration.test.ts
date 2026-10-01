import { mkdtempSync, readdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { rename } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { type CalibrationOptions, calibrateThreshold, THRESHOLD_GRID } from "../calibration.ts";
import type { SearchHit } from "../search.ts";
import { fakeSearchIndex, searchHit } from "./support.ts";

vi.mock("node:fs/promises", async (importOriginal) => {
  const actual = await importOriginal<typeof import("node:fs/promises")>();
  return { ...actual, rename: vi.fn(actual.rename) };
});

const question = (id: string, sources: string, text = `Вопрос ${id}`) =>
  `## ${id}. ${text}\nОжидание: x\nИсточники: ${sources}\n`;

let root: string;
beforeEach(() => {
  root = mkdtempSync(join(tmpdir(), "rag-lab-calibrate-"));
  vi.mocked(rename).mockClear();
});
afterEach(() => {
  rmSync(root, { recursive: true, force: true });
});

function setup(
  questions: string,
  byQuestion: Record<string, SearchHit[]>,
  overrides: Partial<CalibrationOptions> = {},
) {
  writeFileSync(join(root, "questions.md"), questions);
  const { index, search } = fakeSearchIndex((query) => byQuestion[query] ?? [], ["a.md", "b.md", "c.md"]);
  const options: CalibrationOptions = {
    questionsFile: join(root, "questions.md"),
    reportFile: join(root, "out", "rag-calibration.md"),
    index,
    strategy: "structure",
    candidateTopK: 5,
    topK: 3,
    threshold: 0.55,
    meta: { questionsFile: "experiments/feod-retrieval/questions.md" },
    now: () => new Date("2026-09-30T10:00:00Z"),
    ...overrides,
  };
  return { options, search };
}

describe("calibrateThreshold: выбор порога", () => {
  it("сетка порогов — 0.50, 0.55, 0.60, 0.65", () => {
    expect(THRESHOLD_GRID).toEqual([0.5, 0.55, 0.6, 0.65]);
  });

  it("первый критерий — сохранённые пары: потеря источника не компенсируется отсечением отрицательного вопроса", async () => {
    const { options } = setup(question("q01", "a.md") + question("q02", "—"), {
      "Вопрос q01": [searchHit(1, "b.md", 0.9), searchHit(2, "a.md", 0.58)],
      "Вопрос q02": [searchHit(1, "c.md", 0.62)],
    });
    const result = await calibrateThreshold(options);
    expect(result.baselinePairs).toBe(1);
    expect(result.rows.map((row) => [row.threshold, row.keptPairs, row.emptyNegatives])).toEqual([
      [0.5, 1, 0],
      [0.55, 1, 0],
      [0.6, 0, 0],
      [0.65, 0, 1],
    ]);
    expect(result.recommended).toBe(0.55);
  });

  it("второй критерий — пустые контексты отрицательных вопросов при равных парах", async () => {
    const { options } = setup(question("q01", "a.md") + question("q02", "—"), {
      "Вопрос q01": [searchHit(1, "a.md", 0.9)],
      "Вопрос q02": [searchHit(1, "c.md", 0.57)],
    });
    const result = await calibrateThreshold(options);
    expect(result.rows.map((row) => row.emptyNegatives)).toEqual([0, 0, 1, 1]);
    expect(result.recommended).toBe(0.65);
  });

  it("третий критерий — больший порог при полном равенстве", async () => {
    const { options } = setup(question("q01", "a.md"), { "Вопрос q01": [searchHit(1, "a.md", 0.9)] });
    const result = await calibrateThreshold(options);
    expect(result.rows.every((row) => row.keptPairs === 1 && row.emptyNegatives === 0)).toBe(true);
    expect(result.recommended).toBe(0.65);
  });

  it("выбирает по точным значениям сходства, а не по округлённым в отчёте", async () => {
    const { options } = setup(question("q01", "a.md"), { "Вопрос q01": [searchHit(1, "a.md", 0.5499999)] });
    const result = await calibrateThreshold(options);
    expect(readFileSync(result.path, "utf8")).toContain("0.550");
    expect(result.rows.map((row) => row.keptPairs)).toEqual([1, 0, 0, 0]);
    expect(result.recommended).toBe(0.5);
  });

  it("пара «вопрос — файл» считается один раз, сколько бы чанков файла ни прошло", async () => {
    const { options } = setup(question("q01", "a.md, b.md"), {
      "Вопрос q01": [searchHit(1, "a.md", 0.9), searchHit(2, "a.md", 0.8), searchHit(3, "a.md", 0.7)],
    });
    const result = await calibrateThreshold(options);
    expect(result.expectedPairs).toBe(2);
    expect(result.baselinePairs).toBe(1);
    expect(result.rows[0]).toMatchObject({ keptPairs: 1, lost: [] });
  });

  it("baseline — первые topK кандидатов без порога; кандидат за topK пары не добавляет", async () => {
    const { options } = setup(question("q01", "a.md"), {
      "Вопрос q01": [
        searchHit(1, "b.md", 0.9),
        searchHit(2, "c.md", 0.8),
        searchHit(3, "c.md", 0.7),
        searchHit(4, "a.md", 0.68),
      ],
    });
    const result = await calibrateThreshold(options);
    expect(result.baselinePairs).toBe(0);
    expect(result.rows.every((row) => row.keptPairs === 0 && row.lost.length === 0)).toBe(true);
  });
});

describe("calibrateThreshold: вызовы и отчёт", () => {
  it("один поиск на вопрос независимо от числа порогов; конечный отчёт содержит рекомендацию и потерянные пары", async () => {
    const { options, search } = setup(question("q01", "a.md") + question("q02", "—"), {
      "Вопрос q01": [searchHit(1, "b.md", 0.9), searchHit(2, "a.md", 0.58)],
      "Вопрос q02": [searchHit(1, "c.md", 0.3)],
    });
    const result = await calibrateThreshold(options);
    expect(search).toHaveBeenCalledTimes(2);
    expect(search.mock.calls.map((call) => call.slice(1))).toEqual([
      ["structure", 5],
      ["structure", 5],
    ]);
    const text = readFileSync(result.path, "utf8");
    expect(text).toContain("# Калибровка порога релевантности");
    expect(text).toContain("Текущее значение rag.similarityThreshold: 0.55");
    expect(text).toContain("Рекомендуемый порог: 0.55.");
    expect(text).toContain("- порог 0.60: q01, `a.md`");
    expect(text).toContain("| 0.55 | 1 | 0 | 1 | 1.0 | да |");
    expect(text).toContain("| q02 | — | 0.300 | — |");
  });

  it("неизвестный источник отклоняется до поиска", async () => {
    const { options, search } = setup(question("q01", "нет.md"), {});
    await expect(calibrateThreshold(options)).rejects.toMatchObject({
      code: "QUESTIONS_INVALID",
      data: { reason: "source", id: "q01", file: "нет.md" },
    });
    expect(search).not.toHaveBeenCalled();
  });

  it("несогласованные K отклоняются до поиска", async () => {
    const { options, search } = setup(question("q01", "a.md"), {}, { candidateTopK: 2, topK: 3 });
    await expect(calibrateThreshold(options)).rejects.toMatchObject({ code: "INVALID_RETRIEVAL_PARAMS" });
    expect(search).not.toHaveBeenCalled();
  });

  it("ошибка поиска и ошибка записи оставляют прежний отчёт без временных файлов", async () => {
    const { options, search } = setup(question("q01", "a.md"), { "Вопрос q01": [searchHit(1, "a.md", 0.9)] });
    await calibrateThreshold(options);
    writeFileSync(options.reportFile, "# Прежний\n");
    search.mockRejectedValueOnce(new Error("Ollama недоступна"));
    await expect(calibrateThreshold(options)).rejects.toThrow("Ollama недоступна");
    vi.mocked(rename).mockRejectedValueOnce(new Error("диск недоступен"));
    await expect(calibrateThreshold(options)).rejects.toMatchObject({ code: "INDEX_WRITE_FAILED" });
    expect(readFileSync(options.reportFile, "utf8")).toBe("# Прежний\n");
    expect(readdirSync(join(root, "out"))).toEqual(["rag-calibration.md"]);
  });
});
