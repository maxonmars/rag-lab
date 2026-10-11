import { GatewayError } from "./errors.ts";

export type UpstreamResponse = Readonly<{ status: number; body: string }>;

/** Куда идёт запрос: определяет тексты ошибок 502 и 504. */
export type ForwardTarget = "ollama" | "rag";

export type ForwardOptions = Readonly<{
  url: string;
  method: "POST" | "DELETE";
  body?: Readonly<Record<string, unknown>>;
  target: ForwardTarget;
  timeoutMs: number;
  clientSignal: AbortSignal;
  fetch: typeof globalThis.fetch;
}>;

const TIMEOUT_TEXT: Record<ForwardTarget, (timeoutMs: number) => string> = {
  ollama: (ms) => `Локальная модель не ответила за ${ms} мс.`,
  rag: (ms) => `RAG-сервис не ответил за ${ms} мс.`,
};

const UNAVAILABLE_TEXT: Record<ForwardTarget, string> = {
  ollama: "Локальная модель недоступна: не удалось подключиться к Ollama.",
  rag: "RAG-сервис недоступен: запустите rag serve.",
};

/** Пересылает запрос в Ollama или `rag serve`; статус и тело ответа не разбираются. Таймаут — 504, сетевая ошибка — 502. */
export async function forward(options: ForwardOptions): Promise<UpstreamResponse> {
  const timeout = AbortSignal.timeout(options.timeoutMs);
  const signal = AbortSignal.any([options.clientSignal, timeout]);
  try {
    const response = await options.fetch(options.url, {
      method: options.method,
      ...(options.body === undefined
        ? {}
        : { headers: { "content-type": "application/json" }, body: JSON.stringify(options.body) }),
      signal,
    });
    return { status: response.status, body: await response.text() };
  } catch (error) {
    if (options.clientSignal.aborted) throw error;
    if (timeout.aborted) {
      throw new GatewayError(504, "upstream_timeout", TIMEOUT_TEXT[options.target](options.timeoutMs));
    }
    throw new GatewayError(502, "upstream_unavailable", UNAVAILABLE_TEXT[options.target]);
  }
}
