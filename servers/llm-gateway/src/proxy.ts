import { GatewayError } from "./errors.ts";

export type UpstreamResponse = Readonly<{ status: number; body: string }>;

export type ForwardOptions = Readonly<{
  url: string;
  body: Readonly<Record<string, unknown>>;
  timeoutMs: number;
  clientSignal: AbortSignal;
  fetch: typeof globalThis.fetch;
}>;

/** Пересылает запрос в Ollama; статус и тело ответа не разбираются. Таймаут — 504, сетевая ошибка — 502. */
export async function forwardChat(options: ForwardOptions): Promise<UpstreamResponse> {
  const timeout = AbortSignal.timeout(options.timeoutMs);
  const signal = AbortSignal.any([options.clientSignal, timeout]);
  try {
    const response = await options.fetch(options.url, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(options.body),
      signal,
    });
    return { status: response.status, body: await response.text() };
  } catch (error) {
    if (options.clientSignal.aborted) throw error;
    if (timeout.aborted) {
      throw new GatewayError(504, "upstream_timeout", `Локальная модель не ответила за ${options.timeoutMs} мс.`);
    }
    throw new GatewayError(
      502,
      "upstream_unavailable",
      "Локальная модель недоступна: не удалось подключиться к Ollama.",
    );
  }
}
