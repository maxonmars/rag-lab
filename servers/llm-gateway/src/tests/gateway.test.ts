import { afterEach, describe, expect, it } from "vitest";
import { chatBody, KEY, post, startGateway, upstreamBody } from "./harness.ts";

type Running = Awaited<ReturnType<typeof startGateway>>;
let gateway: Running;
afterEach(() => gateway.close());

describe("шлюз: маршруты, авторизация и прокси", () => {
  it("/health отвечает без ключа и не вызывает Ollama", async () => {
    gateway = await startGateway();
    const response = await fetch(`${gateway.base}/health`);
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ status: "ok" });
    expect(gateway.upstream).not.toHaveBeenCalled();
  });

  it("без ключа и с чужим ключом даёт 401 invalid_api_key, Ollama не вызывается", async () => {
    gateway = await startGateway();
    for (const key of [null, "wrong-key-0123456789abcdef"]) {
      const response = await post(gateway.base, chatBody(), key);
      expect(response.status).toBe(401);
      expect(await response.json()).toMatchObject({ error: { code: "invalid_api_key", type: "gateway_error" } });
    }
    expect((await fetch(`${gateway.base}/v1/models`)).status).toBe(401);
    expect(gateway.upstream).not.toHaveBeenCalled();
  });

  it("проксирует чат: адрес Ollama, нормализованный max_tokens, статус и тело upstream", async () => {
    gateway = await startGateway();
    const response = await post(gateway.base, chatBody({ reasoning_effort: "none" }));
    expect(response.status).toBe(200);
    expect(response.headers.get("content-type")).toBe("application/json");
    expect(await response.json()).toMatchObject({ choices: [{ message: { content: "Ответ" } }] });
    expect(String(gateway.upstream.mock.calls[0]?.[0])).toBe("http://upstream.test/v1/chat/completions");
    expect(upstreamBody(gateway.upstream)).toEqual({ ...chatBody({ reasoning_effort: "none" }), max_tokens: 256 });
  });

  it("статус и тело ошибки upstream пробрасываются как есть", async () => {
    gateway = await startGateway();
    gateway.upstream.mockResolvedValueOnce(new Response('{"error":"model crashed"}', { status: 500 }));
    const response = await post(gateway.base, chatBody());
    expect(response.status).toBe(500);
    expect(await response.text()).toBe('{"error":"model crashed"}');
  });

  it("/v1/models отдаёт только GATEWAY_MODEL без вызова Ollama", async () => {
    gateway = await startGateway();
    const response = await fetch(`${gateway.base}/v1/models`, { headers: { authorization: `Bearer ${KEY}` } });
    expect(await response.json()).toEqual({
      object: "list",
      data: [{ id: "rag-local-opt", object: "model", owned_by: "local" }],
    });
    expect(gateway.upstream).not.toHaveBeenCalled();
  });

  it("неизвестный путь — 404, неверный метод — 405 с Allow", async () => {
    gateway = await startGateway();
    expect((await fetch(`${gateway.base}/api/embed`, { method: "POST" })).status).toBe(404);
    const wrong = await fetch(`${gateway.base}/v1/chat/completions`, {
      headers: { authorization: `Bearer ${KEY}` },
    });
    expect(wrong.status).toBe(405);
    expect(wrong.headers.get("allow")).toBe("POST");
    expect(gateway.upstream).not.toHaveBeenCalled();
  });

  it("ошибки запроса: не JSON — 400, тело больше потолка — 413, чужая модель — 400", async () => {
    gateway = await startGateway();
    const notJson = await post(gateway.base, "{");
    expect(notJson.status).toBe(400);
    expect(await notJson.json()).toMatchObject({ error: { code: "invalid_json" } });
    const large = await post(gateway.base, `{"padding":"${"x".repeat(1_048_577)}"}`);
    expect(large.status).toBe(413);
    expect(await large.json()).toMatchObject({ error: { code: "body_too_large" } });
    const foreign = await post(gateway.base, chatBody({ model: "qwen3.8:27b-mlx" }));
    expect(await foreign.json()).toMatchObject({ error: { code: "model_not_allowed" } });
    expect(gateway.upstream).not.toHaveBeenCalled();
  });

  it("контекст больше лимита — 413 context_length_exceeded с числами, Ollama не вызывается", async () => {
    gateway = await startGateway({ maxInputChars: 10 });
    const response = await post(gateway.base, chatBody({ messages: [{ role: "user", content: "я".repeat(11) }] }));
    expect(response.status).toBe(413);
    const { error } = (await response.json()) as { error: { code: string; message: string } };
    expect(error.code).toBe("context_length_exceeded");
    expect(error.message).toContain("11");
    expect(error.message).toContain("10");
    expect(gateway.upstream).not.toHaveBeenCalled();
    const boundary = await post(gateway.base, chatBody({ messages: [{ role: "user", content: "я".repeat(10) }] }));
    expect(boundary.status).toBe(200);
  });

  it("лог содержит id ключа, статус и upstream, но не сам ключ", async () => {
    gateway = await startGateway();
    await post(gateway.base, chatBody());
    await post(gateway.base, chatBody(), "wrong-key-0123456789abcdef");
    expect(gateway.logs).toHaveLength(2);
    expect(gateway.logs[0]).toMatch(/POST \/v1\/chat\/completions key=key1 status=200 ms=\d+ chars=6 upstream=yes$/);
    expect(gateway.logs[1]).toContain("key=- status=401");
    expect(gateway.logs[1]).toContain("upstream=no");
    expect(gateway.logs.join("\n")).not.toContain(KEY);
    expect(gateway.logs.join("\n")).not.toContain("wrong-key");
  });
});
