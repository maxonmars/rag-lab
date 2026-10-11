import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { Writable } from "node:stream";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { CliView } from "../../adapters/cli/index.ts";
import { listen, type RunningServer } from "../../adapters/http/index.ts";
import { AgentError, type ModelRequest } from "../../core/index.ts";
import { type EmbeddingPort, RagError } from "../../features/rag/index.ts";
import { resolveConfig } from "../config.ts";
import { createRagService, httpErrorOf } from "../ragService.ts";
import { createSessionStore } from "../ragSessions.ts";
import { type CompleteMock, invoke, keywordEmbeddings, writeCorpus } from "./harness.ts";

const STATE_REPLY = [
  "## Цель",
  "",
  "изучить слово",
  "",
  "## Уточнения",
  "",
  "- пользователь спрашивает про документ",
  "",
  "## Ограничения и термины",
  "",
  "—",
].join("\n");

const REPLY = [
  "## Ответ",
  "",
  "Документ повторяет слово [1].",
  "",
  "## Источники",
  "",
  "- [1]",
  "",
  "## Цитаты",
  "",
  "- [1] «слово слово слово слово слово»",
].join("\n");

const text = (content: string) => ({ type: "text" as const, content });
const embeddings = () => keywordEmbeddings(["слово", "короткий"]);

/** Память, rewrite и ответ различаются по системной инструкции; `answer` подменяет вызов ответа. */
function scriptedModel(rewrite = "слово", answer?: (call: number) => Promise<ReturnType<typeof text>>): CompleteMock {
  let answers = 0;
  return vi.fn(async (request: ModelRequest) => {
    const system = String(request.messages[0]?.content);
    if (system.includes("обновляешь память задачи")) return text(STATE_REPLY);
    if (system.includes("переписываешь")) return text(rewrite);
    answers += 1;
    return answer ? answer(answers) : text(REPLY);
  });
}

const answerRequests = (complete: CompleteMock): ModelRequest[] =>
  complete.mock.calls
    .map(([request]) => request)
    .filter((request) => String(request.messages[0]?.content).includes("фрагменты документации"));

let cwd: string;
let running: RunningServer | undefined;
beforeEach(async () => {
  cwd = mkdtempSync(join(tmpdir(), "rag-lab-service-"));
  writeCorpus(join(cwd, ".local/rag/corpus"), {
    "a.md": `# Один\n\n${"слово ".repeat(500)}\n\n## Раздел\n\nтекст раздела`,
    "b.md": "# Два\n\nкороткий документ",
  });
  await invoke(["rag", "index"], { cwd, embeddings: embeddings() });
});
afterEach(async () => {
  await running?.close();
  running = undefined;
  rmSync(cwd, { recursive: true, force: true });
});

async function start(complete: CompleteMock, port = embeddings(), env: Record<string, string> = {}) {
  const config = resolveConfig({}, { LAB_LLM_API_KEY: "test-key", ...env }, cwd);
  const sink = new Writable({ write: (_chunk, _encoding, done) => done() });
  const store = createSessionStore({
    maxSessions: config.values["service.maxSessions"],
    idleMs: config.values["service.sessionIdleMs"],
    now: Date.now,
  });
  const service = await createRagService({
    cwd,
    getConfig: () => config,
    createModel: () => ({ complete }),
    createEmbeddings: () => port,
    view: new CliView(sink, sink),
    store,
  });
  running = await listen({
    host: "127.0.0.1",
    port: 0,
    handle: service.handle,
    errorType: "rag_service_error",
    log: () => {},
  });
  return { url: running.url, service };
}

const chat = (url: string, body: unknown) =>
  fetch(`${url}/v1/rag/chat`, { method: "POST", body: typeof body === "string" ? body : JSON.stringify(body) });

describe("rag serve: чат", () => {
  it("первый ход создаёт сессию и возвращает поля контракта с источниками и проверенными цитатами", async () => {
    const { url } = await start(scriptedModel());
    const response = await chat(url, { question: "Что повторяется в документе?" });
    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body).toMatchObject({
      turn: 1,
      kind: "answer",
      model: "deepseek · deepseek-flash",
      memory: {
        goal: "изучить слово",
        clarifications: ["пользователь спрашивает про документ"],
        constraints: [],
      },
      quotes: [{ fragment: 1, text: "слово слово слово слово слово", verified: true }],
      sources: [{ fragment: 1, file: "a.md", section: "Один" }],
    });
    expect(body.session_id).toMatch(/^[0-9a-f-]{36}$/);
    expect(body.answer).toContain("Документ повторяет слово [1].");
    expect(body.answer).toContain("- [1] `a.md` › Один");
    expect(body.sources[0]).toEqual({
      fragment: 1,
      file: "a.md",
      section: "Один",
      chunk_id: expect.any(String),
      score: expect.any(Number),
    });
    expect(body.fragments[0]).toMatchObject({ rank: 1, file: "a.md", section: "Один" });
    expect(Object.keys(body.timings_ms)).toEqual(["state", "rewrite", "search", "generate"]);
  });

  it("второй ход с тем же id получает историю первого; без id выдаётся новый id", async () => {
    const complete = scriptedModel();
    const { url } = await start(complete);
    const first = await (await chat(url, { question: "вопрос 1" })).json();
    const second = await (await chat(url, { question: "вопрос 2", session_id: first.session_id })).json();
    expect(second).toMatchObject({ session_id: first.session_id, turn: 2 });
    const [, request] = answerRequests(complete);
    expect(request?.messages.map((message) => message.role)).toEqual(["system", "user", "assistant", "user"]);
    expect(request?.messages[1]?.content).toBe("вопрос 1");
    const other = await (await chat(url, { question: "вопрос 3" })).json();
    expect(other.session_id).not.toBe(first.session_id);
    expect(other.turn).toBe(1);
  });

  it("пустой отбор — kind unknown без источников и цитат, модель ответа не вызывается", async () => {
    const complete = scriptedModel("ничего");
    const { url } = await start(complete);
    const body = await (await chat(url, { question: "Про погоду?" })).json();
    expect(body).toMatchObject({ kind: "unknown", sources: [], quotes: [], fragments: [] });
    expect(answerRequests(complete)).toHaveLength(0);
  });

  it("клиентский session_id принимается как есть и продолжается", async () => {
    const { url } = await start(scriptedModel());
    await chat(url, { question: "один", session_id: "mac-2" });
    expect(await (await chat(url, { question: "два", session_id: "mac-2" })).json()).toMatchObject({
      session_id: "mac-2",
      turn: 2,
    });
  });

  it("DELETE: 204, затем 404 session_not_found; после удаления сессия начинается заново", async () => {
    const { url } = await start(scriptedModel());
    await chat(url, { question: "один", session_id: "s1" });
    expect((await fetch(`${url}/v1/rag/sessions/s1`, { method: "DELETE" })).status).toBe(204);
    const again = await fetch(`${url}/v1/rag/sessions/s1`, { method: "DELETE" });
    expect(again.status).toBe(404);
    expect(await again.json()).toMatchObject({ error: { type: "rag_service_error", code: "session_not_found" } });
    expect(await (await chat(url, { question: "три", session_id: "s1" })).json()).toMatchObject({ turn: 1 });
  });

  it("сессия старше service.sessionIdleMs не продолжается", async () => {
    const { url } = await start(scriptedModel(), embeddings(), { LAB_SERVICE_SESSION_IDLE_MS: "1" });
    await chat(url, { question: "один", session_id: "s1" });
    await new Promise((resolve) => setTimeout(resolve, 20));
    expect(await (await chat(url, { question: "два", session_id: "s1" })).json()).toMatchObject({ turn: 1 });
  });
});

describe("rag serve: ошибки", () => {
  it.each([
    [{ question: "  " }],
    [{ question: 5 }],
    [{}],
    [{ question: "а", session_id: "плохой id" }],
    [{ question: "а", session_id: 7 }],
    [{ question: "а", session_id: "x".repeat(65) }],
  ])("400 invalid_request на %j", async (body) => {
    const { url } = await start(scriptedModel());
    const response = await chat(url, body);
    expect(response.status).toBe(400);
    expect(await response.json()).toMatchObject({ error: { code: "invalid_request" } });
  });

  it("400 на не-JSON и на плохой id в DELETE; 404 на неизвестный путь; 405 с Allow", async () => {
    const { url } = await start(scriptedModel());
    expect(await (await chat(url, "не json")).json()).toMatchObject({ error: { code: "invalid_json" } });
    expect((await fetch(`${url}/v1/rag/sessions/bad.id`, { method: "DELETE" })).status).toBe(400);
    expect((await fetch(`${url}/v1/other`)).status).toBe(404);
    const notAllowed = await fetch(`${url}/v1/rag/chat`);
    expect(notAllowed.status).toBe(405);
    expect(notAllowed.headers.get("allow")).toBe("POST");
    expect(await (await fetch(`${url}/v1/rag/sessions/s1`)).json()).toMatchObject({
      error: { code: "method_not_allowed" },
    });
    expect(await (await fetch(`${url}/health`)).json()).toEqual({ status: "ok" });
  });

  it("413 на тело больше 1 МиБ", async () => {
    const { url } = await start(scriptedModel());
    const body = JSON.stringify({ question: "x".repeat(1_048_577 - 14) });
    const response = await fetch(`${url}/v1/rag/chat`, { method: "POST", body, headers: { connection: "close" } });
    expect(response.status).toBe(413);
    expect(await response.json()).toMatchObject({ error: { code: "body_too_large" } });
  });

  it("параллельный ход той же сессии — 409 session_busy; другая сессия идёт", async () => {
    let release: () => void = () => {};
    const gate = new Promise<void>((resolve) => {
      release = resolve;
    });
    const complete = scriptedModel("слово", async (call) => {
      if (call === 1) await gate;
      return text(REPLY);
    });
    const { url } = await start(complete);
    const held = chat(url, { question: "один", session_id: "s1" });
    await vi.waitFor(() => expect(answerRequests(complete)).toHaveLength(1));
    const busy = await chat(url, { question: "два", session_id: "s1" });
    expect(busy.status).toBe(409);
    expect(await busy.json()).toMatchObject({ error: { code: "session_busy" } });
    expect((await chat(url, { question: "три", session_id: "s2" })).status).toBe(200);
    release();
    expect((await held).status).toBe(200);
  });

  it("503 too_many_sessions, когда все места заняты ходами", async () => {
    let release: () => void = () => {};
    const gate = new Promise<void>((resolve) => {
      release = resolve;
    });
    const complete = scriptedModel("слово", async () => {
      await gate;
      return text(REPLY);
    });
    const { url } = await start(complete, embeddings(), { LAB_SERVICE_MAX_SESSIONS: "1" });
    const held = chat(url, { question: "один", session_id: "s1" });
    await vi.waitFor(() => expect(answerRequests(complete)).toHaveLength(1));
    const full = await chat(url, { question: "два", session_id: "s2" });
    expect(full.status).toBe(503);
    expect(await full.json()).toMatchObject({ error: { code: "too_many_sessions" } });
    release();
    await held;
  });

  it("сбой модели — 502 model_failed, сессия сохраняет прежний диалог", async () => {
    const complete = scriptedModel("слово", async (call) => {
      if (call === 2) throw new AgentError("MODEL_FAILURE", { status: 500 });
      return text(REPLY);
    });
    const { url } = await start(complete);
    await chat(url, { question: "один", session_id: "s1" });
    const failed = await chat(url, { question: "два", session_id: "s1" });
    expect(failed.status).toBe(502);
    expect(await failed.json()).toMatchObject({
      error: { type: "rag_service_error", code: "model_failed", message: "API вернул HTTP 500." },
    });
    expect(await (await chat(url, { question: "три", session_id: "s1" })).json()).toMatchObject({ turn: 2 });
  });

  it("сбой первого хода не создаёт сессию: DELETE даёт 404", async () => {
    const complete = scriptedModel("слово", async () => {
      throw new AgentError("MODEL_FAILURE");
    });
    const { url } = await start(complete);
    expect((await chat(url, { question: "один", session_id: "s1" })).status).toBe(502);
    expect((await fetch(`${url}/v1/rag/sessions/s1`, { method: "DELETE" })).status).toBe(404);
  });

  it("эмбеддинги недоступны — 502 embeddings_failed", async () => {
    const failing: EmbeddingPort = {
      ...embeddings(),
      embed: async () => {
        throw new RagError("OLLAMA_UNAVAILABLE", { baseUrl: "http://localhost:11434" });
      },
    };
    const { url } = await start(scriptedModel(), failing);
    const response = await chat(url, { question: "один" });
    expect(response.status).toBe(502);
    expect(await response.json()).toMatchObject({ error: { code: "embeddings_failed" } });
  });

  it("необработанная ошибка — 500 internal_error без текста причины", async () => {
    const complete = scriptedModel("слово", async () => {
      throw new Error("секретная причина");
    });
    const { url } = await start(complete);
    const response = await chat(url, { question: "один" });
    expect(response.status).toBe(500);
    expect(await response.text()).not.toContain("секретная причина");
  });

  it("сопоставление ошибок: таймаут эмбеддингов — 504, REWRITE_INVALID — 502, прочее — не сопоставлено", () => {
    expect(httpErrorOf(new RagError("EMBEDDING_TIMEOUT"))).toMatchObject({ status: 504, code: "embeddings_timeout" });
    expect(httpErrorOf(new RagError("REWRITE_INVALID", { reason: "fence" }))).toMatchObject({ code: "model_failed" });
    expect(httpErrorOf(new RagError("INDEX_INVALID"))).toBeUndefined();
    expect(httpErrorOf(new AgentError("EMPTY_INPUT"))).toBeUndefined();
    expect(httpErrorOf(new AgentError("EMPTY_RESPONSE"))).toMatchObject({ code: "model_failed" });
  });
});

describe("rag serve: запуск", () => {
  it("без индекса createRagService отклоняется с INDEX_NOT_FOUND до listen", async () => {
    rmSync(join(cwd, ".local/rag/index.json"));
    await expect(start(scriptedModel())).rejects.toMatchObject({ code: "INDEX_NOT_FOUND" });
  });

  it("describe называет модель, поиск и лимиты сессий", async () => {
    const { service } = await start(scriptedModel());
    expect(service.describe()).toEqual([
      "Модель: deepseek · deepseek-flash",
      "Поиск: стратегия structure, режим rewrite-filter, кандидатов 10, top-5, порог 0.55",
      "Сессии: не больше 20, простой до 1800000 мс, история 6 ходов",
    ]);
  });
});
