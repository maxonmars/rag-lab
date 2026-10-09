import { describe, expect, it } from "vitest";
import { generateAnswer } from "../answer.ts";
import { renderTaskState } from "../chat/taskState.ts";
import { renderRagMessage } from "../context.ts";
import { readPrompt } from "../prompts.ts";
import { rewriteQuery } from "../rewrite.ts";
import { fakeModel, searchHit } from "./support.ts";

const MEMORY = {
  goal: "перевести проект на FEOD",
  clarifications: ["40 страниц"],
  constraints: ["deep imports запрещены"],
};
const HITS = [searchHit(1, "a.md", 0.9)];
const HISTORY = [
  { role: "user", content: "Первый вопрос" },
  { role: "assistant", content: "Первый ответ" },
] as const;

describe("renderRagMessage с памятью", () => {
  it("раздел «Память задачи» стоит до фрагментов, заголовки памяти понижены", () => {
    const message = renderRagMessage("Вопрос", HITS, MEMORY);
    expect(
      message.startsWith(`## Память задачи\n\n${renderTaskState(MEMORY).replace(/^## /gm, "### ")}\n\n## Фрагменты`),
    ).toBe(true);
    expect(message.endsWith("## Вопрос\n\nВопрос")).toBe(true);
  });

  it("без памяти сообщение совпадает с прежним", () => {
    expect(renderRagMessage("Вопрос", HITS)).toBe(renderRagMessage("Вопрос", HITS, undefined));
    expect(renderRagMessage("Вопрос", HITS)).not.toContain("Память задачи");
  });
});

describe("rewriteQuery с контекстом диалога", () => {
  it("system — rewrite-chat.md, user — память, реплики и вопрос", async () => {
    const { model, requests } = fakeModel({ rewrite: () => "запрос по FEOD" });
    const query = await rewriteQuery("А там что?", model, { memory: MEMORY, recent: HISTORY });
    expect(query).toBe("запрос по FEOD");
    expect(requests[0]?.messages).toEqual([
      { role: "system", content: readPrompt("rewrite-chat.md") },
      {
        role: "user",
        content: [
          `## Память задачи\n\n${renderTaskState(MEMORY).replace(/^## /gm, "### ")}`,
          "## Последние реплики\n\n- Пользователь: Первый вопрос\n- Ассистент: Первый ответ",
          "## Вопрос\n\nА там что?",
        ].join("\n\n"),
      },
    ]);
  });

  it("без реплик раздел «Последние реплики» содержит «—»", async () => {
    const { model, requests } = fakeModel({ rewrite: () => "запрос" });
    await rewriteQuery("Вопрос", model, { memory: MEMORY, recent: [] });
    expect(String(requests[0]?.messages[1]?.content)).toContain("## Последние реплики\n\n—\n\n## Вопрос");
  });

  it("многострочный ответ отклоняется и в чате: REWRITE_INVALID multiline", async () => {
    const { model } = fakeModel({ rewrite: () => "две\nстроки" });
    await expect(rewriteQuery("Вопрос", model, { memory: MEMORY, recent: [] })).rejects.toMatchObject({
      code: "REWRITE_INVALID",
      data: { reason: "multiline" },
    });
  });
});

describe("generateAnswer с chat", () => {
  const selection = { hits: HITS, belowThreshold: [], overLimit: [] };

  it("запрос модели: system с chat.md, история, user с памятью", async () => {
    const { model, requests } = fakeModel();
    await generateAnswer({
      model,
      systemPrompt: "S",
      answerPrompt: "default",
      question: "Вопрос",
      selection,
      threshold: null,
      chat: { memory: MEMORY, history: HISTORY },
    });
    expect(requests[0]?.messages).toEqual([
      { role: "system", content: `S\n\n${readPrompt("answer.md")}\n\n${readPrompt("chat.md")}` },
      ...HISTORY,
      { role: "user", content: renderRagMessage("Вопрос", HITS, MEMORY) },
    ]);
  });

  it("при пустом отборе модель не вызывается", async () => {
    const { model, requests } = fakeModel();
    const empty = { hits: [], belowThreshold: HITS, overLimit: [] };
    const result = await generateAnswer({
      model,
      systemPrompt: "S",
      answerPrompt: "default",
      question: "Вопрос",
      selection: empty,
      threshold: 0.9,
      chat: { memory: MEMORY, history: HISTORY },
    });
    expect(requests).toHaveLength(0);
    expect(result.answer).toMatchObject({ kind: "unknown", by: "retrieval" });
  });
});
