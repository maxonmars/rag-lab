import { describe, expect, it } from "vitest";
import { createKeyCheck } from "../auth.ts";
import { KEY, OTHER_KEY } from "./harness.ts";

describe("проверка ключа", () => {
  const check = createKeyCheck([KEY, OTHER_KEY]);

  it("возвращает порядковый id ключа", () => {
    expect(check(`Bearer ${KEY}`)).toBe("key1");
    expect(check(`bearer ${OTHER_KEY}`)).toBe("key2");
  });

  it("отклоняет отсутствующий, чужой и не-Bearer заголовок", () => {
    expect(check(undefined)).toBeNull();
    expect(check("Bearer other-wrong-key-0123456")).toBeNull();
    expect(check(KEY)).toBeNull();
    expect(check(`Basic ${KEY}`)).toBeNull();
    expect(check("Bearer ")).toBeNull();
  });
});
