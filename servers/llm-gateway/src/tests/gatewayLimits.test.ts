import { afterEach, describe, expect, it, vi } from "vitest";
import { chatBody, completion, post, startGateway } from "./harness.ts";

type Running = Awaited<ReturnType<typeof startGateway>>;
let gateway: Running;
afterEach(() => gateway.close());

function holdUpstream(running: Running): Array<() => void> {
  const gates: Array<() => void> = [];
  running.upstream.mockImplementation(() => new Promise((resolve) => gates.push(() => resolve(completion()))));
  return gates;
}

function waitsForAbort(init: RequestInit | undefined): Promise<Response> {
  return new Promise((_, reject) => {
    init?.signal?.addEventListener("abort", () => reject(init.signal?.reason));
  });
}

describe("шлюз: лимиты и отказы upstream", () => {
  it("rate limit: после лимита 429 с Retry-After, после окна снова 200", async () => {
    gateway = await startGateway({ rateLimitPerMinute: 2 });
    expect((await post(gateway.base, chatBody())).status).toBe(200);
    expect((await post(gateway.base, chatBody())).status).toBe(200);
    const limited = await post(gateway.base, chatBody());
    expect(limited.status).toBe(429);
    expect(limited.headers.get("retry-after")).toBe("60");
    expect(await limited.json()).toMatchObject({ error: { code: "rate_limit_exceeded" } });
    expect(gateway.upstream).toHaveBeenCalledTimes(2);
    gateway.clock.value += 60_000;
    expect((await post(gateway.base, chatBody())).status).toBe(200);
  });

  it("rate limit считает и запросы, отклонённые валидацией", async () => {
    gateway = await startGateway({ rateLimitPerMinute: 1 });
    expect((await post(gateway.base, chatBody({ stream: true }))).status).toBe(400);
    expect((await post(gateway.base, chatBody())).status).toBe(429);
  });

  it("перегрузка: третий параллельный запрос получает 503 с Retry-After, второй доходит до Ollama после первого", async () => {
    gateway = await startGateway({ maxConcurrent: 1, maxQueue: 1 });
    const gates = holdUpstream(gateway);
    const first = post(gateway.base, chatBody());
    await vi.waitFor(() => expect(gateway.upstream).toHaveBeenCalledTimes(1));
    const second = post(gateway.base, chatBody());
    const third = post(gateway.base, chatBody());
    const busy = await Promise.race([second, third]);
    expect(busy.status).toBe(503);
    expect(busy.headers.get("retry-after")).toBe("10");
    expect(await busy.json()).toMatchObject({ error: { code: "server_busy" } });
    expect(gateway.upstream).toHaveBeenCalledTimes(1);
    gates[0]?.();
    expect((await first).status).toBe(200);
    await vi.waitFor(() => expect(gateway.upstream).toHaveBeenCalledTimes(2));
    gates[1]?.();
    const statuses = (await Promise.all([second, third])).map((response) => response.status).sort();
    expect(statuses).toEqual([200, 503]);
  });

  it("сетевая ошибка upstream — 502, слот после неё свободен", async () => {
    gateway = await startGateway();
    gateway.upstream.mockRejectedValueOnce(new Error("ECONNREFUSED"));
    const failed = await post(gateway.base, chatBody());
    expect(failed.status).toBe(502);
    expect(await failed.json()).toMatchObject({ error: { code: "upstream_unavailable" } });
    expect((await post(gateway.base, chatBody())).status).toBe(200);
  });

  it("таймаут upstream — 504, слот после него свободен", async () => {
    gateway = await startGateway({ upstreamTimeoutMs: 30 });
    gateway.upstream.mockImplementationOnce((_url, init) => waitsForAbort(init));
    const timedOut = await post(gateway.base, chatBody());
    expect(timedOut.status).toBe(504);
    expect(await timedOut.json()).toMatchObject({ error: { code: "upstream_timeout" } });
    expect((await post(gateway.base, chatBody())).status).toBe(200);
  });

  it("клиент закрыл соединение — запрос в Ollama отменяется, слот освобождается", async () => {
    gateway = await startGateway();
    let upstreamSignal: AbortSignal | null | undefined;
    gateway.upstream.mockImplementationOnce((_url, init) => {
      upstreamSignal = init?.signal;
      return waitsForAbort(init);
    });
    const controller = new AbortController();
    const aborted = post(gateway.base, chatBody(), undefined, controller.signal);
    await vi.waitFor(() => expect(upstreamSignal).toBeDefined());
    controller.abort();
    await expect(aborted).rejects.toBeDefined();
    await vi.waitFor(() => expect(upstreamSignal?.aborted).toBe(true));
    await vi.waitFor(() => expect(gateway.logs.some((line) => line.includes("status=aborted"))).toBe(true));
    expect((await post(gateway.base, chatBody())).status).toBe(200);
  });

  it("клиент, ушедший из очереди, не доходит до Ollama", async () => {
    gateway = await startGateway({ maxConcurrent: 1, maxQueue: 1 });
    const gates = holdUpstream(gateway);
    const first = post(gateway.base, chatBody());
    await vi.waitFor(() => expect(gateway.upstream).toHaveBeenCalledTimes(1));
    const controller = new AbortController();
    const queued = post(gateway.base, chatBody(), undefined, controller.signal);
    await new Promise((resolve) => setTimeout(resolve, 50));
    controller.abort();
    await expect(queued).rejects.toBeDefined();
    await vi.waitFor(() => expect(gateway.logs.some((line) => line.includes("status=aborted"))).toBe(true));
    gates[0]?.();
    expect((await first).status).toBe(200);
    expect(gateway.upstream).toHaveBeenCalledTimes(1);
  });
});
