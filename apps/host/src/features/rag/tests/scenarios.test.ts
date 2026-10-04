import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { loadScenarios, parseScenarios } from "../chat/scenarios.ts";
import { describeRagError, RagError } from "../errors.ts";

const VALID = [
  "# Сценарии",
  "",
  "Преамбула с `## ` внутри строки.",
  "",
  "## s1. Первый сценарий",
  "Цель: сделать первое",
  "Ключи цели: первое, FEOD",
  "Память:",
  "- 2: TypeScript",
  "- 3: deep imports",
  "Реплики:",
  "1. Привет",
  "2. Уточню: TypeScript",
  "3. Запрещаем deep imports",
  "",
  "## s2. Второй",
  "Цель: сделать второе",
  "Ключи цели: второе",
  "Реплики:",
  "1. Только реплика",
].join("\n");

const reasonOf = (text: string): unknown => {
  try {
    parseScenarios(text);
  } catch (error) {
    return (error as { data: unknown }).data;
  }
  return undefined;
};

describe("parseScenarios", () => {
  it("разбирает цель, ключи, память с номерами ходов и реплики; преамбула игнорируется", () => {
    expect(parseScenarios(VALID)).toEqual([
      {
        id: "s1",
        title: "Первый сценарий",
        goal: "сделать первое",
        goalKeys: ["первое", "FEOD"],
        memory: [
          { fromTurn: 2, key: "TypeScript" },
          { fromTurn: 3, key: "deep imports" },
        ],
        messages: ["Привет", "Уточню: TypeScript", "Запрещаем deep imports"],
      },
      {
        id: "s2",
        title: "Второй",
        goal: "сделать второе",
        goalKeys: ["второе"],
        memory: [],
        messages: ["Только реплика"],
      },
    ]);
  });

  it("принимает CRLF", () => {
    expect(parseScenarios(VALID.replaceAll("\n", "\r\n"))).toHaveLength(2);
  });

  it.each([
    ["empty", "Текст без разделов", {}],
    ["heading", "## Без идентификатора\nЦель: x", {}],
    ["goal", "## s1. Имя\nКлючи цели: x\nРеплики:\n1. a", { id: "s1" }],
    ["goalKeys", "## s1. Имя\nЦель: x\nРеплики:\n1. a", { id: "s1" }],
    ["messages", "## s1. Имя\nЦель: x\nКлючи цели: k", { id: "s1" }],
    ["messages", "## s1. Имя\nЦель: x\nКлючи цели: k\nРеплики:\nбез номера", { id: "s1" }],
    ["memory", "## s1. Имя\nЦель: x\nКлючи цели: k\nПамять:\n- 2: ключ\nРеплики:\n1. a", { id: "s1" }],
    ["memory", "## s1. Имя\nЦель: x\nКлючи цели: k\nПамять:\n- 0: ключ\nРеплики:\n1. a", { id: "s1" }],
    ["memory", "## s1. Имя\nЦель: x\nКлючи цели: k\nПамять:\nключ без номера\nРеплики:\n1. a", { id: "s1" }],
    [
      "duplicate",
      "## s1. A\nЦель: x\nКлючи цели: k\nРеплики:\n1. a\n\n## s1. B\nЦель: x\nКлючи цели: k\nРеплики:\n1. a",
      { id: "s1" },
    ],
  ])("причина %s: %s", (reason, text, extra) => {
    expect(reasonOf(text)).toEqual({ reason, ...extra });
  });

  it("текст ошибки называет причину и сценарий", () => {
    const error = new RagError("SCENARIOS_INVALID", { reason: "messages", id: "s1" });
    expect(describeRagError(error)).toBe(
      "Некорректный файл сценариев диалога: нет нумерованных реплик после «Реплики:» (s1).",
    );
    expect(describeRagError(new RagError("SCENARIOS_NOT_FOUND"))).toBe(
      "Файл сценариев диалога не найден. Проверьте rag.dialogFile.",
    );
  });
});

describe("loadScenarios", () => {
  it("несуществующий файл — SCENARIOS_NOT_FOUND", () => {
    expect(() => loadScenarios("/нет/такого/scenarios.md")).toThrowError(
      expect.objectContaining({ code: "SCENARIOS_NOT_FOUND" }),
    );
  });

  it("experiments/feod-chat/scenarios.md: два сценария по 10–15 реплик, ключи памяти внутри диапазона", () => {
    const path = new URL("../../../../../../experiments/feod-chat/scenarios.md", import.meta.url);
    const scenarios = parseScenarios(readFileSync(path, "utf8"));
    expect(scenarios.map((scenario) => scenario.id)).toEqual(["s1", "s2"]);
    for (const { messages, memory } of scenarios) {
      expect(messages.length).toBeGreaterThanOrEqual(10);
      expect(messages.length).toBeLessThanOrEqual(15);
      expect(memory.length).toBeGreaterThan(0);
      for (const { fromTurn, key } of memory) expect(messages[fromTurn - 1]).toContain(key);
    }
  });
});
