import { describe, expect, it } from "vitest";
import { createRateLimiter } from "../rateLimit.ts";

function limiter(limit: number) {
  const clock = { value: 0 };
  return { clock, take: createRateLimiter({ limit, windowMs: 60_000, now: () => clock.value }).take };
}

describe("rate limit", () => {
  it("пропускает limit запросов, затем отказывает с Retry-After до выхода старейшей отметки", () => {
    const { clock, take } = limiter(2);
    expect(take("key1")).toEqual({ allowed: true });
    clock.value = 10_000;
    expect(take("key1")).toEqual({ allowed: true });
    clock.value = 20_500;
    expect(take("key1")).toEqual({ allowed: false, retryAfterSeconds: 40 });
  });

  it("после сдвига на окно снова пропускает; отказ в окно не записывается", () => {
    const { clock, take } = limiter(1);
    take("key1");
    clock.value = 59_999;
    expect(take("key1")).toEqual({ allowed: false, retryAfterSeconds: 1 });
    clock.value = 60_000;
    expect(take("key1")).toEqual({ allowed: true });
  });

  it("считает ключи независимо", () => {
    const { take } = limiter(1);
    expect(take("key1").allowed).toBe(true);
    expect(take("key2").allowed).toBe(true);
    expect(take("key1").allowed).toBe(false);
  });
});
