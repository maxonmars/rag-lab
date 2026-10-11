import { afterEach, describe, expect, it, vi } from "vitest";
import { chatBody, completion, KEY, startGateway, upstreamBody } from "./harness.ts";

type Running = Awaited<ReturnType<typeof startGateway>>;
let gateway: Running;
afterEach(() => gateway.close());

const RAG_REPLY = { session_id: "s1", turn: 1, kind: "answer", answer: "Ответ" };

const ragResponse = (body: unknown = RAG_REPLY, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { "content-type": "application/json" } });

function ragPost(base: string, body: unknown, key: string | null = KEY): Promise<Response> {
  const headers: Record<string, string> = { "content-type": "application/json" };
  if (key) headers.authorization = `Bearer ${key}`;
  return fetch(`${base}/v1/rag/chat`, {
    method: "POST",
    headers,
    body: typeof body === "string" ? body : JSON.stringify(body),
  });
}

const ragDelete = (base: string, id: string, key: string | null = KEY) =>
  fetch(`${base}/v1/rag/sessions/${id}`, { method: "DELETE", headers: key ? { authorization: `Bearer ${key}` } : {} });

/** Фейковый fetch различает адреса: RAG-сервис отвечает `ragResponse`, остальное — как Ollama. */
function routeUpstream(running: Running, rag: (init: RequestInit | undefined) => Promise<Response>) {
  running.upstream.mockImplementation(async (url, init) =>
    String(url).startsWith("http://rag.test") ? rag(init) : completion(),
  );
}

describe("шлюз: RAG-маршруты", () => {
  it("POST /v1/rag/chat проксируется в rag serve с телом, статус и тело ответа отдаются как есть", async () => {
    gateway = await startGateway();
    gateway.upstream.mockResolvedValueOnce(ragResponse());
    const request = { question: "Что такое индекс?", session_id: "s1" };
    const response = await ragPost(gateway.base, request);
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual(RAG_REPLY);
    expect(String(gateway.upstream.mock.calls[0]?.[0])).toBe("http://rag.test/v1/rag/chat");
    expect(gateway.upstream.mock.calls[0]?.[1]?.method).toBe("POST");
    expect(upstreamBody(gateway.upstream)).toEqual(request);
  });

  it.each([
    [409, { error: { message: "занято", type: "rag_service_error", code: "session_busy" } }],
    [502, { error: { message: "модель", type: "rag_service_error", code: "model_failed" } }],
  ])("ошибка rag serve %i отдаётся без изменений", async (status, body) => {
    gateway = await startGateway();
    gateway.upstream.mockResolvedValueOnce(ragResponse(body, status));
    const response = await ragPost(gateway.base, { question: "вопрос" });
    expect(response.status).toBe(status);
    expect(await response.json()).toEqual(body);
  });

  it("без ключа и с чужим ключом — 401, rag serve не вызывается; GET и DELETE тоже требуют ключ", async () => {
    gateway = await startGateway();
    for (const key of [null, "wrong-key-0123456789abcdef"]) {
      const response = await ragPost(gateway.base, { question: "вопрос" }, key);
      expect(response.status).toBe(401);
      expect(await response.json()).toMatchObject({ error: { code: "invalid_api_key" } });
      expect((await ragDelete(gateway.base, "s1", key)).status).toBe(401);
    }
    expect(gateway.upstream).not.toHaveBeenCalled();
  });

  it("rate limit на ключ общий с чатом LLM", async () => {
    gateway = await startGateway({ rateLimitPerMinute: 2 });
    gateway.upstream.mockImplementation(async () => ragResponse());
    const chat = await fetch(`${gateway.base}/v1/chat/completions`, {
      method: "POST",
      headers: { authorization: `Bearer ${KEY}` },
      body: JSON.stringify(chatBody()),
    });
    expect(chat.status).toBe(200);
    expect((await ragPost(gateway.base, { question: "вопрос" })).status).toBe(200);
    const limited = await ragPost(gateway.base, { question: "вопрос" });
    expect(limited.status).toBe(429);
    expect(limited.headers.get("retry-after")).toBe("60");
    expect((await ragDelete(gateway.base, "s1")).status).toBe(429);
  });

  it.each([
    ["не JSON", "{", "invalid_json"],
    ["массив", "[]", "invalid_json"],
    ["нет question", {}, "invalid_request"],
    ["question не строка", { question: 5 }, "invalid_request"],
    ["пустой question", { question: "  \n" }, "invalid_request"],
    ["session_id не строка", { question: "а", session_id: 5 }, "invalid_request"],
    ["session_id с пробелом", { question: "а", session_id: "a b" }, "invalid_request"],
    ["session_id длиннее 64", { question: "а", session_id: "x".repeat(65) }, "invalid_request"],
  ])("400 на плохой запрос: %s", async (_name, body, code) => {
    gateway = await startGateway();
    const response = await ragPost(gateway.base, body);
    expect(response.status).toBe(400);
    expect(await response.json()).toMatchObject({ error: { code } });
    expect(gateway.upstream).not.toHaveBeenCalled();
  });

  it("длина question считается в кодовых точках: 100 проходит, 101 — 413 без обращения к rag serve", async () => {
    gateway = await startGateway({ maxInputChars: 100 });
    gateway.upstream.mockResolvedValue(ragResponse());
    expect((await ragPost(gateway.base, { question: "😀".repeat(100) })).status).toBe(200);
    const tooLong = await ragPost(gateway.base, { question: "я".repeat(101) });
    expect(tooLong.status).toBe(413);
    expect(await tooLong.json()).toMatchObject({ error: { code: "context_length_exceeded" } });
    expect(gateway.upstream).toHaveBeenCalledTimes(1);
    expect(gateway.logs.at(-1)).toMatch(/status=413 .*chars=101 upstream=no$/);
  });

  it("занятый RAG-слот даёт 503 с Retry-After, а чат LLM при этом не блокируется", async () => {
    gateway = await startGateway({ maxConcurrent: 1, maxQueue: 0 });
    const held: Array<() => void> = [];
    routeUpstream(gateway, () => new Promise((resolve) => held.push(() => resolve(ragResponse()))));
    const first = ragPost(gateway.base, { question: "один" });
    await vi.waitFor(() => expect(held).toHaveLength(1));
    const busy = await ragPost(gateway.base, { question: "два" });
    expect(busy.status).toBe(503);
    expect(busy.headers.get("retry-after")).toBe("10");
    expect(await busy.json()).toMatchObject({ error: { code: "server_busy" } });
    const chat = await fetch(`${gateway.base}/v1/chat/completions`, {
      method: "POST",
      headers: { authorization: `Bearer ${KEY}` },
      body: JSON.stringify(chatBody()),
    });
    expect(chat.status).toBe(200);
    held[0]?.();
    expect((await first).status).toBe(200);
  });

  it("rag serve недоступен — 502 с текстом про RAG-сервис, слот свободен", async () => {
    gateway = await startGateway({ maxConcurrent: 1, maxQueue: 0 });
    gateway.upstream.mockRejectedValueOnce(new Error("ECONNREFUSED"));
    const failed = await ragPost(gateway.base, { question: "вопрос" });
    expect(failed.status).toBe(502);
    expect(await failed.json()).toMatchObject({
      error: { code: "upstream_unavailable", message: "RAG-сервис недоступен: запустите rag serve." },
    });
    gateway.upstream.mockResolvedValueOnce(ragResponse());
    expect((await ragPost(gateway.base, { question: "вопрос" })).status).toBe(200);
  });

  it("rag serve не ответил за GATEWAY_RAG_TIMEOUT_MS — 504", async () => {
    gateway = await startGateway({ ragTimeoutMs: 30 });
    routeUpstream(
      gateway,
      (init) =>
        new Promise((_, reject) => {
          init?.signal?.addEventListener("abort", () => reject(init.signal?.reason));
        }),
    );
    const timedOut = await ragPost(gateway.base, { question: "вопрос" });
    expect(timedOut.status).toBe(504);
    expect(await timedOut.json()).toMatchObject({
      error: { code: "upstream_timeout", message: "RAG-сервис не ответил за 30 мс." },
    });
  });

  it("DELETE /v1/rag/sessions/{id} проксируется методом DELETE без тела и очереди", async () => {
    gateway = await startGateway({ maxConcurrent: 1, maxQueue: 0 });
    gateway.upstream.mockResolvedValueOnce(new Response(null, { status: 204 }));
    const response = await ragDelete(gateway.base, "s-1_A");
    expect(response.status).toBe(204);
    expect(await response.text()).toBe("");
    expect(String(gateway.upstream.mock.calls[0]?.[0])).toBe("http://rag.test/v1/rag/sessions/s-1_A");
    expect(gateway.upstream.mock.calls[0]?.[1]).toMatchObject({ method: "DELETE" });
    expect(gateway.upstream.mock.calls[0]?.[1]?.body).toBeUndefined();
    gateway.upstream.mockResolvedValueOnce(ragResponse({ error: { code: "session_not_found" } }, 404));
    expect((await ragDelete(gateway.base, "s-1_A")).status).toBe(404);
  });

  it("DELETE с id вне шаблона — 400, rag serve не вызывается", async () => {
    gateway = await startGateway();
    const response = await ragDelete(gateway.base, "bad.id");
    expect(response.status).toBe(400);
    expect(await response.json()).toMatchObject({ error: { code: "invalid_request" } });
    expect(gateway.upstream).not.toHaveBeenCalled();
  });

  it("неверные методы — 405 с Allow, вложенный путь сессий — 404", async () => {
    gateway = await startGateway();
    const headers = { authorization: `Bearer ${KEY}` };
    const chat = await fetch(`${gateway.base}/v1/rag/chat`, { headers });
    expect(chat.status).toBe(405);
    expect(chat.headers.get("allow")).toBe("POST");
    const session = await fetch(`${gateway.base}/v1/rag/sessions/s1`, { headers });
    expect(session.status).toBe(405);
    expect(session.headers.get("allow")).toBe("DELETE");
    expect((await fetch(`${gateway.base}/v1/rag/sessions/s1/extra`, { headers })).status).toBe(404);
    expect((await fetch(`${gateway.base}/v1/rag/sessions/`, { headers })).status).toBe(404);
    expect(gateway.upstream).not.toHaveBeenCalled();
  });

  it("лог содержит длину вопроса, но не его текст и не ключ", async () => {
    gateway = await startGateway();
    gateway.upstream.mockResolvedValueOnce(ragResponse());
    await ragPost(gateway.base, { question: "секретный вопрос" });
    const line = gateway.logs.at(-1) ?? "";
    expect(line).toMatch(/POST \/v1\/rag\/chat key=key1 status=200 ms=\d+ chars=16 upstream=yes$/);
    expect(line).not.toContain("секретный");
    expect(line).not.toContain(KEY);
  });
});
