import { describe, expect, it } from "vitest";
import { GatewayConfigError, parseGatewayConfig } from "../app/config.ts";
import { KEY, OTHER_KEY } from "./harness.ts";

const env = { GATEWAY_API_KEYS: KEY };

describe("конфигурация шлюза", () => {
  it("подставляет значения по умолчанию", () => {
    expect(parseGatewayConfig(env)).toEqual({
      apiKeys: [KEY],
      host: "0.0.0.0",
      port: 8787,
      upstreamUrl: "http://127.0.0.1:11434/v1",
      model: "rag-local-opt",
      upstreamTimeoutMs: 180000,
      rateLimitPerMinute: 20,
      maxConcurrent: 1,
      maxQueue: 4,
      maxInputChars: 32000,
      maxOutputTokens: 1024,
    });
  });

  it("читает ключи через запятую с пробелами и убирает хвостовой слэш адреса", () => {
    const config = parseGatewayConfig({
      GATEWAY_API_KEYS: ` ${KEY} , ${OTHER_KEY}`,
      GATEWAY_UPSTREAM_URL: "http://localhost:11434/v1/",
      GATEWAY_PORT: "9000",
      GATEWAY_MAX_QUEUE: "0",
    });
    expect(config.apiKeys).toEqual([KEY, OTHER_KEY]);
    expect(config.upstreamUrl).toBe("http://localhost:11434/v1");
    expect(config.port).toBe(9000);
    expect(config.maxQueue).toBe(0);
  });

  it("без GATEWAY_API_KEYS называет переменную", () => {
    expect(() => parseGatewayConfig({})).toThrow(GatewayConfigError);
    expect(() => parseGatewayConfig({ GATEWAY_API_KEYS: "  " })).toThrow(/GATEWAY_API_KEYS/);
  });

  it("короткий ключ и дубли отклоняются без значения ключа в тексте", () => {
    const short = "short-secret";
    expect(() => parseGatewayConfig({ GATEWAY_API_KEYS: `${KEY},${short}` })).toThrow(/ключ №2 короче 16/);
    expect(() => parseGatewayConfig({ GATEWAY_API_KEYS: `${KEY},${KEY}` })).toThrow(/№1 и №2 совпадают/);
    for (const keys of [`${KEY},${short}`, `${KEY},${KEY}`]) {
      try {
        parseGatewayConfig({ GATEWAY_API_KEYS: keys });
      } catch (error) {
        expect((error as Error).message).not.toContain(short);
        expect((error as Error).message).not.toContain(KEY);
      }
    }
  });

  it.each([
    ["GATEWAY_PORT", "70000", /GATEWAY_PORT: ожидается целое от 1 до 65535/],
    ["GATEWAY_PORT", "80.5", /GATEWAY_PORT/],
    ["GATEWAY_MAX_CONCURRENT", "0", /GATEWAY_MAX_CONCURRENT: ожидается целое не меньше 1/],
    ["GATEWAY_MAX_QUEUE", "-1", /GATEWAY_MAX_QUEUE: ожидается целое не меньше 0/],
    ["GATEWAY_RATE_LIMIT_PER_MINUTE", "abc", /GATEWAY_RATE_LIMIT_PER_MINUTE/],
    ["GATEWAY_UPSTREAM_URL", "ftp://host", /GATEWAY_UPSTREAM_URL/],
    ["GATEWAY_UPSTREAM_URL", "не адрес", /GATEWAY_UPSTREAM_URL/],
  ])("%s=%s отклоняется с названием переменной", (name, value, message) => {
    expect(() => parseGatewayConfig({ ...env, [name]: value })).toThrow(message);
  });
});
