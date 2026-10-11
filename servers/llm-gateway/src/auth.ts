import { createHash, timingSafeEqual } from "node:crypto";

const BEARER = /^Bearer\s+(\S+)$/i;

function digest(value: string): Buffer {
  return createHash("sha256").update(value).digest();
}

/** Возвращает id ключа (`key1`, `key2` — порядковый номер) или `null`; сравнивает SHA-256 в постоянное время. */
export function createKeyCheck(keys: readonly string[]): (header: string | undefined) => string | null {
  const digests = keys.map(digest);
  return (header) => {
    const token = header?.match(BEARER)?.[1];
    if (token === undefined) return null;
    const candidate = digest(token);
    let found: string | null = null;
    digests.forEach((expected, index) => {
      if (timingSafeEqual(candidate, expected)) found = `key${index + 1}`;
    });
    return found;
  };
}
