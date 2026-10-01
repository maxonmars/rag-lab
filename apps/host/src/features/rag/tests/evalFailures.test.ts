import { readdirSync, readFileSync, writeFileSync } from "node:fs";
import { rename } from "node:fs/promises";
import { join } from "node:path";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { RagError } from "../errors.ts";
import { evaluateQuestions } from "../evaluation.ts";
import { evalRoot, REPORT_NAME, setupEval } from "./evalSetup.ts";

vi.mock("node:fs/promises", async (importOriginal) => {
  const actual = await importOriginal<typeof import("node:fs/promises")>();
  return { ...actual, rename: vi.fn(actual.rename) };
});

const OLD_REPORT = "# Прежний отчёт\n";
const root = evalRoot();

beforeEach(() => {
  vi.mocked(rename).mockClear();
});

async function seedOldReport(): Promise<string> {
  const { options } = setupEval(root.path);
  await evaluateQuestions(options);
  writeFileSync(options.reportFile, OLD_REPORT);
  return options.reportFile;
}

const unchanged = (file: string): void => {
  expect(readFileSync(file, "utf8")).toBe(OLD_REPORT);
  expect(readdirSync(join(root.path, "out"))).toEqual([REPORT_NAME]);
};

describe("evaluateQuestions: сбои не портят прежний отчёт", () => {
  it("ошибка rewrite: отчёт прежний, поиск переписанной строки и ответы rewrite-режимов не выполнялись", async () => {
    const file = await seedOldReport();
    const { options, log } = setupEval(root.path, {}, { failOn: { kind: "rewrite", call: 2 } });
    await expect(evaluateQuestions(options)).rejects.toThrow("сбой модели");
    unchanged(file);
    expect(log.filter((entry) => entry === "rewrite")).toHaveLength(2);
    expect(log.at(-1)).toBe("rewrite");
  });

  it("неверный формат rewrite: RagError REWRITE_INVALID, отчёт прежний", async () => {
    const file = await seedOldReport();
    const { options } = setupEval(root.path, {}, { rewrite: () => "две\nстроки" });
    await expect(evaluateQuestions(options)).rejects.toMatchObject({ code: "REWRITE_INVALID" });
    unchanged(file);
  });

  it("ошибка поиска: отчёт прежний", async () => {
    const file = await seedOldReport();
    const { options } = setupEval(root.path);
    let calls = 0;
    const failing = {
      ...options.index,
      search: async (...args: Parameters<typeof options.index.search>) => {
        if (++calls === 4) throw new RagError("OLLAMA_UNAVAILABLE", { baseUrl: "http://localhost:11434" });
        return options.index.search(...args);
      },
    };
    await expect(evaluateQuestions({ ...options, index: failing })).rejects.toMatchObject({
      code: "OLLAMA_UNAVAILABLE",
    });
    unchanged(file);
  });

  it("ошибка генерации на пятом ответе: отчёт прежний", async () => {
    const file = await seedOldReport();
    const { options } = setupEval(root.path, {}, { failOn: { kind: "answer", call: 5 } });
    await expect(evaluateQuestions(options)).rejects.toThrow("сбой модели");
    unchanged(file);
  });

  it("ошибка записи (rename): INDEX_WRITE_FAILED, прежний отчёт цел, временного файла нет", async () => {
    const file = await seedOldReport();
    vi.mocked(rename).mockRejectedValueOnce(new Error("диск недоступен"));
    const { options } = setupEval(root.path);
    await expect(evaluateQuestions(options)).rejects.toMatchObject({ code: "INDEX_WRITE_FAILED" });
    unchanged(file);
  });
});

describe("evaluateQuestions: проверки до внешних вызовов", () => {
  it("несогласованные K отклоняются до поиска и модели", async () => {
    const { options, search, requests } = setupEval(root.path, { candidateTopK: 2, topK: 3 });
    await expect(evaluateQuestions(options)).rejects.toMatchObject({
      code: "INVALID_RETRIEVAL_PARAMS",
      data: { reason: "order" },
    });
    expect(search).not.toHaveBeenCalled();
    expect(requests).toHaveLength(0);
  });

  it("неизвестный источник отклоняется до первого поиска и вызова модели", async () => {
    writeFileSync(join(root.path, "questions.md"), "## q01. Вопрос\nОжидание: x\nИсточники: a.md, нет.md");
    const { options, search, requests } = setupEval(root.path);
    const error = await evaluateQuestions(options).catch((caught: unknown) => caught);
    expect(error).toBeInstanceOf(RagError);
    expect((error as RagError).data).toEqual({ reason: "source", id: "q01", file: "нет.md" });
    expect(search).not.toHaveBeenCalled();
    expect(requests).toHaveLength(0);
  });
});
