export type RateLimitDecision = Readonly<{ allowed: true }> | Readonly<{ allowed: false; retryAfterSeconds: number }>;

export type RateLimiterOptions = Readonly<{ limit: number; windowMs: number; now: () => number }>;

/** Скользящее окно по ключу; отклонённый запрос в окно не записывается. */
export function createRateLimiter(options: RateLimiterOptions): { take(keyId: string): RateLimitDecision } {
  const { limit, windowMs, now } = options;
  const stamps = new Map<string, number[]>();
  return {
    take(keyId) {
      const current = now();
      const recent = (stamps.get(keyId) ?? []).filter((stamp) => stamp > current - windowMs);
      if (recent.length >= limit) {
        stamps.set(keyId, recent);
        const oldest = recent[0] ?? current;
        return { allowed: false, retryAfterSeconds: Math.max(1, Math.ceil((oldest + windowMs - current) / 1000)) };
      }
      recent.push(current);
      stamps.set(keyId, recent);
      return { allowed: true };
    },
  };
}
