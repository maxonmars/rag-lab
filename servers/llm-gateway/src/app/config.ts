export type GatewayConfig = Readonly<{
  apiKeys: readonly string[];
  host: string;
  port: number;
  upstreamUrl: string;
  model: string;
  upstreamTimeoutMs: number;
  rateLimitPerMinute: number;
  maxConcurrent: number;
  maxQueue: number;
  maxInputChars: number;
  maxOutputTokens: number;
}>;

export const MIN_KEY_LENGTH = 16;

/** Текст ошибки называет переменную и правило; значения ключей в него не попадают. */
export class GatewayConfigError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "GatewayConfigError";
  }
}

type Env = Readonly<Record<string, string | undefined>>;

function raw(env: Env, name: string): string | undefined {
  const value = env[name]?.trim();
  return value ? value : undefined;
}

function integer(env: Env, name: string, fallback: number, min: number, max = Number.MAX_SAFE_INTEGER): number {
  const value = raw(env, name);
  if (value === undefined) return fallback;
  const parsed = /^\d+$/.test(value) ? Number(value) : Number.NaN;
  if (!Number.isSafeInteger(parsed) || parsed < min || parsed > max) {
    const range = max === Number.MAX_SAFE_INTEGER ? `не меньше ${min}` : `от ${min} до ${max}`;
    throw new GatewayConfigError(`${name}: ожидается целое ${range}`);
  }
  return parsed;
}

function parseKeys(env: Env): string[] {
  const value = raw(env, "GATEWAY_API_KEYS");
  if (value === undefined) {
    throw new GatewayConfigError("GATEWAY_API_KEYS: задайте ключи через запятую (например, openssl rand -hex 32)");
  }
  const keys = value.split(",").map((key) => key.trim());
  keys.forEach((key, index) => {
    if (key.length < MIN_KEY_LENGTH) {
      throw new GatewayConfigError(`GATEWAY_API_KEYS: ключ №${index + 1} короче ${MIN_KEY_LENGTH} символов`);
    }
    const first = keys.indexOf(key);
    if (first !== index) {
      throw new GatewayConfigError(`GATEWAY_API_KEYS: ключи №${first + 1} и №${index + 1} совпадают`);
    }
  });
  return keys;
}

function parseUpstreamUrl(env: Env): string {
  const value = raw(env, "GATEWAY_UPSTREAM_URL") ?? "http://127.0.0.1:11434/v1";
  try {
    const url = new URL(value);
    if (url.protocol !== "http:" && url.protocol !== "https:") throw new Error("protocol");
  } catch {
    throw new GatewayConfigError("GATEWAY_UPSTREAM_URL: ожидается адрес http:// или https://");
  }
  return value.replace(/\/+$/, "");
}

export function parseGatewayConfig(env: Env): GatewayConfig {
  return {
    apiKeys: parseKeys(env),
    host: raw(env, "GATEWAY_HOST") ?? "0.0.0.0",
    port: integer(env, "GATEWAY_PORT", 8787, 1, 65535),
    upstreamUrl: parseUpstreamUrl(env),
    model: raw(env, "GATEWAY_MODEL") ?? "rag-local-opt",
    upstreamTimeoutMs: integer(env, "GATEWAY_UPSTREAM_TIMEOUT_MS", 180000, 1),
    rateLimitPerMinute: integer(env, "GATEWAY_RATE_LIMIT_PER_MINUTE", 20, 1),
    maxConcurrent: integer(env, "GATEWAY_MAX_CONCURRENT", 1, 1),
    maxQueue: integer(env, "GATEWAY_MAX_QUEUE", 4, 0),
    maxInputChars: integer(env, "GATEWAY_MAX_INPUT_CHARS", 32000, 1),
    maxOutputTokens: integer(env, "GATEWAY_MAX_OUTPUT_TOKENS", 1024, 1),
  };
}
