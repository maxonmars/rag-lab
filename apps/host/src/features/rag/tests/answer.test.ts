import { readFileSync } from "node:fs";
import { describe, expect, it, vi } from "vitest";
import { AgentError, type ModelRequest } from "../../../core/index.ts";
import { answerWithRag } from "../answer.ts";
import { renderRagMessage } from "../context.ts";
import type { SearchHit, SearchIndex } from "../search.ts";

const hits: SearchHit[] = [
  {
    rank: 1,
    score: 0.9,
    chunk: {
      chunk_id: "c1",
      strategy: "structure",
      source: "src",
      title: "Global",
      file: "structure/global.md",
      sections: ["Global"],
      start: 0,
      end: 5,
      text: "текст",
    },
  },
];

function setup() {
  const search = vi.fn(async () => hits);
  const index: SearchIndex = {
    createdAt: "2026-09-29T10:00:00.000Z",
    model: { name: "fake:latest", digest: "0123456789abcdef", dimension: 2 },
    files: ["structure/global.md"],
    search,
  };
  const complete = vi.fn(async (_request: ModelRequest) => ({ type: "text" as const, content: "готовый ответ" }));
  return { index, search, complete, model: { complete } };
}

describe("answerWithRag", () => {
  it("отправляет системную инструкцию с prompts/answer.md и сообщение с фрагментами", async () => {
    const { index, search, complete, model } = setup();
    const result = await answerWithRag({
      question: "  Что такое global?  ",
      index,
      strategy: "fixed",
      topK: 3,
      model,
      systemPrompt: "Системная инструкция.",
    });
    const instruction = readFileSync(new URL("../prompts/answer.md", import.meta.url), "utf8").trim();
    const message = renderRagMessage("Что такое global?", hits);
    expect(search).toHaveBeenCalledWith("Что такое global?", "fixed", 3);
    expect(complete.mock.calls[0]?.[0].messages).toEqual([
      { role: "system", content: `Системная инструкция.\n\n${instruction}` },
      { role: "user", content: message },
    ]);
    expect(result).toEqual({ answer: "готовый ответ", hits, contextChars: [...message].length });
  });

  it("считает размер контекста в кодовых точках, а не в единицах UTF-16", async () => {
    const { index: base, model } = setup();
    const emoji = { ...hits[0], chunk: { ...(hits[0] as SearchHit).chunk, text: "😀" } } as SearchHit;
    const index: SearchIndex = { ...base, search: async () => [emoji] };
    const result = await answerWithRag({
      question: "Q",
      index,
      strategy: "structure",
      topK: 1,
      model,
      systemPrompt: "S",
    });
    const message = renderRagMessage("Q", [emoji]);
    expect(message.length).toBeGreaterThan([...message].length);
    expect(result.contextChars).toBe([...message].length);
  });

  it("пустой вопрос отклоняется до поиска и запроса к модели", async () => {
    const { index, search, complete, model } = setup();
    const call = answerWithRag({ question: "   ", index, strategy: "structure", topK: 1, model, systemPrompt: "S" });
    await expect(call).rejects.toBeInstanceOf(AgentError);
    await expect(call).rejects.toMatchObject({ code: "EMPTY_INPUT" });
    expect(search).not.toHaveBeenCalled();
    expect(complete).not.toHaveBeenCalled();
  });
});
