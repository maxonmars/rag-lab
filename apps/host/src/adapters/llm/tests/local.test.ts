import { describe, expect, it, vi } from "vitest";
import { LocalModel } from "../index.ts";

const options = { baseUrl: "http://localhost:11434/v1", model: "qwen3", timeoutMs: 1000, maxOutputTokens: 123 };
const request = { messages: [{ role: "user", content: "Тест" }], tools: [], toolChoice: "none" } as const;

describe("локальный адаптер", () => {
  it("шлёт запрос на адрес сервера с reasoning_effort и без thinking", async () => {
    const fetch = vi
      .fn<typeof globalThis.fetch>()
      .mockResolvedValue(
        new Response(
          JSON.stringify({ choices: [{ message: { role: "assistant", content: "Привет" }, finish_reason: "stop" }] }),
          { headers: { "content-type": "application/json" } },
        ),
      );
    await expect(new LocalModel({ ...options, fetch }).complete(request)).resolves.toEqual({
      type: "text",
      content: "Привет",
    });
    const [url, init] = fetch.mock.calls[0] ?? [];
    expect(String(url)).toBe("http://localhost:11434/v1/chat/completions");
    expect(JSON.parse(String(init?.body))).toEqual({
      model: "qwen3",
      messages: [{ role: "user", content: "Тест" }],
      max_tokens: 123,
      reasoning_effort: "none",
    });
  });

  it("недоступный сервер даёт MODEL_FAILURE без повтора", async () => {
    const fetch = vi.fn<typeof globalThis.fetch>().mockRejectedValue(new Error("ECONNREFUSED"));
    await expect(new LocalModel({ ...options, fetch }).complete(request)).rejects.toMatchObject({
      code: "MODEL_FAILURE",
    });
    expect(fetch).toHaveBeenCalledTimes(1);
  });
});
