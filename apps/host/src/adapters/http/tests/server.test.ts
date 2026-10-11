import { afterEach, describe, expect, it } from "vitest";
import { type Handler, HttpError, listen, type RunningServer, readJsonObject, sendJson } from "../index.ts";

let running: RunningServer;
let logs: string[];
afterEach(() => running.close());

async function start(handle: Handler): Promise<string> {
  logs = [];
  running = await listen({
    host: "127.0.0.1",
    port: 0,
    handle,
    errorType: "test_error",
    log: (line) => logs.push(line),
  });
  return running.url;
}

const echo: Handler = async (req, res) => {
  sendJson(res, 200, await readJsonObject(req, 20));
};

const post = (url: string, body: string) => fetch(url, { method: "POST", body });

describe("HTTP-адаптер", () => {
  it("читает JSON-объект и отвечает JSON", async () => {
    const url = await start(echo);
    const response = await post(url, '{"a":1}');
    expect(response.status).toBe(200);
    expect(response.headers.get("content-type")).toBe("application/json");
    expect(await response.json()).toEqual({ a: 1 });
  });

  it("тело больше лимита — 413 body_too_large", async () => {
    const url = await start(echo);
    const response = await post(url, JSON.stringify({ long: "x".repeat(50) }));
    expect(response.status).toBe(413);
    expect(await response.json()).toEqual({
      error: { message: "Тело запроса превышает лимит 20 байт.", type: "test_error", code: "body_too_large" },
    });
  });

  it("не JSON и массив — 400 invalid_json", async () => {
    const url = await start(echo);
    for (const body of ["не json", "[1]", "null"]) {
      const response = await post(url, body);
      expect(response.status).toBe(400);
      expect(await response.json()).toMatchObject({ error: { code: "invalid_json" } });
    }
  });

  it("HttpError отдаёт статус, код и заголовки; 204 без тела", async () => {
    const url = await start(async (req, res) => {
      if (req.method === "DELETE") return sendJson(res, 204);
      throw new HttpError(405, "method_not_allowed", "Нельзя.", { allow: "DELETE" });
    });
    const denied = await fetch(url);
    expect(denied.status).toBe(405);
    expect(denied.headers.get("allow")).toBe("DELETE");
    const deleted = await fetch(url, { method: "DELETE" });
    expect(deleted.status).toBe(204);
    expect(await deleted.text()).toBe("");
  });

  it("необработанное исключение — 500 internal_error без текста причины, причина в логе", async () => {
    const url = await start(async () => {
      throw new Error("секретная причина");
    });
    const response = await fetch(url);
    expect(response.status).toBe(500);
    const text = await response.text();
    expect(text).toContain("internal_error");
    expect(text).not.toContain("секретная причина");
    expect(logs.some((line) => line.includes("секретная причина"))).toBe(true);
  });

  it("лог: одна строка на запрос с методом, путём и статусом, без тела", async () => {
    const url = await start(echo);
    await post(`${url}/v1/x?secret=1`, '{"q":"вопрос"}');
    const [line] = logs;
    expect(logs).toHaveLength(1);
    expect(line).toMatch(/POST \/v1\/x status=200 ms=\d+$/);
    expect(line).not.toContain("вопрос");
    expect(line).not.toContain("secret");
  });

  it("порт занят — listen отклоняется", async () => {
    const url = await start(echo);
    const port = Number(new URL(url).port);
    await expect(
      listen({ host: "127.0.0.1", port, handle: echo, errorType: "t", log: () => {} }),
    ).rejects.toMatchObject({
      code: "EADDRINUSE",
    });
  });
});
