import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { RagError } from "../errors.ts";
import { loadQuestions, parseQuestions } from "../questions.ts";

const VALID = [
  "# Контрольные вопросы",
  "",
  "Преамбула без раздела.",
  "",
  "## q01. Как называется методология?",
  "Ожидание: FEOD.",
  "Источники: `a.md`, b/c.md ,",
  "",
  "### Подзаголовок не начинает вопрос",
  "",
  "## q02. Чего в документации нет?",
  "Ожидание: ответа нет.",
  "Источники: —",
].join("\n");

const reasonOf = (text: string): Record<string, string | number> | undefined => {
  try {
    parseQuestions(text);
  } catch (error) {
    if (error instanceof RagError && error.code === "QUESTIONS_INVALID") return { ...error.data };
    throw error;
  }
  return undefined;
};

describe("parseQuestions", () => {
  it("разбирает разделы, пропускает преамбулу, убирает кавычки и пробелы у источников", () => {
    expect(parseQuestions(VALID)).toEqual([
      { id: "q01", question: "Как называется методология?", expectation: "FEOD.", sources: ["a.md", "b/c.md"] },
      { id: "q02", question: "Чего в документации нет?", expectation: "ответа нет.", sources: [] },
    ]);
  });

  it("понимает переводы строк Windows и дефис как пустой список источников", () => {
    const text = VALID.replaceAll("\n", "\r\n").replace("Источники: —", "Источники: -");
    expect(parseQuestions(text).map((item) => item.sources)).toEqual([["a.md", "b/c.md"], []]);
  });

  it("сообщает причину: нет разделов", () => {
    expect(reasonOf("# Только шапка\n\nтекст")).toEqual({ reason: "empty" });
  });

  it("сообщает причину: заголовок не вида «qNN. Вопрос»", () => {
    expect(reasonOf("## Вопрос без номера\nОжидание: x\nИсточники: —")).toEqual({ reason: "heading" });
  });

  it("сообщает причину: нет ожидания или оно пустое", () => {
    expect(reasonOf("## q01. В\nИсточники: —")).toEqual({ reason: "expectation", id: "q01" });
    expect(reasonOf("## q01. В\nОжидание:   \nИсточники: —")).toEqual({ reason: "expectation", id: "q01" });
  });

  it("сообщает причину: нет источников", () => {
    expect(reasonOf("## q07. В\nОжидание: x")).toEqual({ reason: "sources", id: "q07" });
  });

  it("сообщает причину: повторяющийся идентификатор", () => {
    const section = "## q01. В\nОжидание: x\nИсточники: —\n";
    expect(reasonOf(`${section}\n${section}`)).toEqual({ reason: "duplicate", id: "q01" });
  });
});

describe("loadQuestions", () => {
  it("читает файл и сообщает QUESTIONS_NOT_FOUND, если файла нет", () => {
    const root = mkdtempSync(join(tmpdir(), "rag-lab-questions-"));
    try {
      writeFileSync(join(root, "q.md"), VALID);
      expect(loadQuestions(join(root, "q.md"))).toHaveLength(2);
      expect(() => loadQuestions(join(root, "нет.md"))).toThrowError(
        expect.objectContaining({ code: "QUESTIONS_NOT_FOUND" }),
      );
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });
});
