import { describe, expect, it } from "vitest";
import { GatewayError } from "../errors.ts";
import { parseJsonObject, validateChatRequest } from "../request.ts";

const limits = { model: "rag-local-opt", maxOutputTokens: 256 };
const valid = { model: "rag-local-opt", messages: [{ role: "user", content: "Привет" }] };

function codeOf(run: () => unknown): string | undefined {
  try {
    run();
  } catch (error) {
    return error instanceof GatewayError ? error.code : undefined;
  }
  return undefined;
}

describe("проверка запроса чата", () => {
  it("подставляет max_tokens и сохраняет остальные поля", () => {
    const { body } = validateChatRequest({ ...valid, reasoning_effort: "none", temperature: 0.2 }, limits);
    expect(body).toEqual({ ...valid, reasoning_effort: "none", temperature: 0.2, max_tokens: 256 });
  });

  it("оставляет max_tokens в пределах лимита", () => {
    expect(validateChatRequest({ ...valid, max_tokens: 64 }, limits).body.max_tokens).toBe(64);
  });

  it.each([[257], [0], [1.5], ["64"]])("max_tokens=%j даёт max_tokens_exceeded", (value) => {
    expect(codeOf(() => validateChatRequest({ ...valid, max_tokens: value }, limits))).toBe("max_tokens_exceeded");
  });

  it("чужая модель, stream, tools и некорректные messages получают свои коды", () => {
    expect(codeOf(() => validateChatRequest({ ...valid, model: "qwen3" }, limits))).toBe("model_not_allowed");
    expect(codeOf(() => validateChatRequest({ messages: valid.messages }, limits))).toBe("model_not_allowed");
    expect(codeOf(() => validateChatRequest({ ...valid, stream: true }, limits))).toBe("stream_not_supported");
    expect(codeOf(() => validateChatRequest({ ...valid, tools: [] }, limits))).toBe("tools_not_supported");
    expect(codeOf(() => validateChatRequest({ ...valid, messages: [] }, limits))).toBe("invalid_request");
    expect(codeOf(() => validateChatRequest({ model: valid.model }, limits))).toBe("invalid_request");
    for (const message of [{ role: "tool", content: "x" }, { role: "user", content: 1 }, "текст", null]) {
      expect(codeOf(() => validateChatRequest({ ...valid, messages: [message] }, limits))).toBe("invalid_request");
    }
  });

  it("считает символы в кодовых точках: эмодзи — один символ", () => {
    const messages = [
      { role: "system", content: "ab" },
      { role: "user", content: "😀😀я" },
    ];
    expect(validateChatRequest({ ...valid, messages }, limits).chars).toBe(5);
  });

  it("разбор тела: не JSON и не объект дают invalid_json", () => {
    expect(parseJsonObject('{"a":1}')).toEqual({ a: 1 });
    for (const text of ["{", "[]", "null", "42"]) {
      expect(codeOf(() => parseJsonObject(text))).toBe("invalid_json");
    }
  });
});
