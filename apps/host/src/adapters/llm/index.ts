import { ChatCompletionsModel } from "./chatCompletions.ts";

export type DeepSeekOptions = Readonly<{
  apiKey: string;
  model: string;
  timeoutMs: number;
  maxOutputTokens: number;
  fetch?: typeof globalThis.fetch;
}>;

export type LocalModelOptions = Readonly<{
  baseUrl: string;
  model: string;
  timeoutMs: number;
  maxOutputTokens: number;
  fetch?: typeof globalThis.fetch;
}>;

export class DeepSeekModel extends ChatCompletionsModel {
  constructor(options: DeepSeekOptions) {
    super({ ...options, baseUrl: "https://api.deepseek.com", extraBody: { thinking: { type: "disabled" } } });
  }
}

/** Локальный OpenAI-совместимый сервер (Ollama, LM Studio, mlx_lm.server); ключ не проверяется, SDK требует непустой. */
export class LocalModel extends ChatCompletionsModel {
  constructor(options: LocalModelOptions) {
    super({ ...options, apiKey: "local", extraBody: { reasoning_effort: "none" } });
  }
}
