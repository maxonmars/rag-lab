import type { AddressInfo } from "node:net";
import { vi } from "vitest";
import type { GatewayConfig } from "../app/config.ts";
import { createGateway } from "../index.ts";

export const KEY = "test-key-0123456789abcdef";
export const OTHER_KEY = "other-key-0123456789abcdef";

export const baseConfig: GatewayConfig = {
  apiKeys: [KEY, OTHER_KEY],
  host: "127.0.0.1",
  port: 0,
  upstreamUrl: "http://upstream.test/v1",
  model: "rag-local-opt",
  upstreamTimeoutMs: 2000,
  ragUrl: "http://rag.test",
  ragTimeoutMs: 2000,
  rateLimitPerMinute: 20,
  maxConcurrent: 1,
  maxQueue: 4,
  maxInputChars: 100,
  maxOutputTokens: 256,
};

export function completion(content = "Ответ"): Response {
  const body = { choices: [{ message: { role: "assistant", content }, finish_reason: "stop" }] };
  return new Response(JSON.stringify(body), { headers: { "content-type": "application/json" } });
}

export function chatBody(extra: Record<string, unknown> = {}): Record<string, unknown> {
  return { model: "rag-local-opt", messages: [{ role: "user", content: "Привет" }], ...extra };
}

export async function startGateway(overrides: Partial<GatewayConfig> = {}) {
  const upstream = vi.fn<typeof globalThis.fetch>(async () => completion());
  const logs: string[] = [];
  const clock = { value: 1_700_000_000_000 };
  const server = createGateway({
    config: { ...baseConfig, ...overrides },
    fetch: upstream,
    now: () => clock.value,
    log: (line) => logs.push(line),
  });
  await new Promise<void>((resolve) => server.listen(0, "127.0.0.1", resolve));
  const base = `http://127.0.0.1:${(server.address() as AddressInfo).port}`;
  return {
    base,
    upstream,
    logs,
    clock,
    close: () =>
      new Promise<void>((resolve) => {
        server.close(() => resolve());
        server.closeAllConnections();
      }),
  };
}

export function post(base: string, body: unknown, key: string | null = KEY, signal?: AbortSignal): Promise<Response> {
  const headers: Record<string, string> = { "content-type": "application/json" };
  if (key) headers.authorization = `Bearer ${key}`;
  const payload = typeof body === "string" ? body : JSON.stringify(body);
  return fetch(`${base}/v1/chat/completions`, { method: "POST", headers, body: payload, signal });
}

export function upstreamBody(upstream: { mock: { calls: Parameters<typeof globalThis.fetch>[] } }, index = 0): unknown {
  return JSON.parse(String(upstream.mock.calls[index]?.[1]?.body));
}
