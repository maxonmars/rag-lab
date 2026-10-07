import { existsSync, mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { ModelRequest } from "../../core/index.ts";
import { type CompleteMock, invoke, keywordEmbeddings, writeCorpus } from "./harness.ts";

const SCENARIOS = [
  "# Сценарии",
  "",
  "## s1. Про слово",
  "Цель: изучить слово",
  "Ключи цели: слово",
  "Память:",
  "- 2: пользователь",
  "Реплики:",
  "1. Что повторяется в документе?",
  "2. А как часто?",
].join("\n");

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

const embeddings = () => keywordEmbeddings(["слово", "короткий"]);
const text = (content: string) => ({ type: "text" as const, content });

/** Память, rewrite и ответ различаются по системной инструкции; `failAnswerCall` — номер вызова ответа (с 1), который упадёт. */
function scriptedModel(failAnswerCall?: number): CompleteMock {
  let answers = 0;
  return vi.fn(async (request: ModelRequest) => {
    const system = String(request.messages[0]?.content);
    if (system.includes("обновляешь память задачи")) return text(STATE_REPLY);
    if (system.includes("переписываешь")) return text("слово");
    answers += 1;
    if (answers === failAnswerCall) throw new Error("сбой модели");
    return text(REPLY);
  });
}

const answerRequests = (complete: CompleteMock): ModelRequest[] =>
  complete.mock.calls
    .map(([request]) => request)
    .filter((request) => String(request.messages[0]?.content).includes("фрагменты документации"));

let cwd: string;
beforeEach(async () => {
  cwd = mkdtempSync(join(tmpdir(), "rag-lab-chat-"));
  writeCorpus(join(cwd, ".local/rag/corpus"), {
    "a.md": `# Один\n\n${"слово ".repeat(500)}\n\n## Раздел\n\nтекст раздела`,
    "b.md": "# Два\n\nкороткий документ",
  });
  writeCorpus(join(cwd, "own"), { "scenarios.md": SCENARIOS });
  await invoke(["rag", "index"], { cwd, embeddings: embeddings() });
});
afterEach(() => {
  rmSync(cwd, { recursive: true, force: true });
});

describe("REPL: чат с RAG", () => {
  it("второй ход получает первую пару как user/assistant-сообщения; вывод содержит источники, цель и память", async () => {
    const complete = scriptedModel();
    const input = "/rag on\nвопрос 1\nвопрос 2\n/rag state\n/rag reset\n/rag state\n";
    const result = await invoke([], { cwd, input, embeddings: embeddings(), complete });
    expect(result.code).toBe(0);
    expect(complete).toHaveBeenCalledTimes(6);
    const [, second] = answerRequests(complete);
    const roles = second?.messages.map((message) => message.role);
    expect(roles).toEqual(["system", "user", "assistant", "user"]);
    expect(second?.messages[1]?.content).toBe("вопрос 1");
    expect(second?.messages[2]?.content).toBe(
      "## Ответ\n\nДокумент повторяет слово [1].\n\n## Источники\n\n- [1] `a.md` › Один\n\n## Цитаты\n\n- [1] «слово слово слово слово слово»",
    );
    expect(String(second?.messages[3]?.content)).toContain("## Память задачи");
    expect(result.output.match(/── Ответ агента · RAG-чат · deepseek · deepseek-flash ──/g)).toHaveLength(2);
    expect(result.output).toContain("Источники:");
    expect(result.output).toContain("Цель: изучить слово");
    expect(result.output).toContain(
      "Память: добавлено\n  + цель: изучить слово\n  + уточнение: пользователь спрашивает про документ",
    );
    expect(result.output).toContain("Память: без изменений");
    expect(result.output).toContain("── Память задачи ──\n\nХодов: 2\n\n## Цель\n\nизучить слово");
    expect(result.output.split("── Память задачи ──").at(-1)).toContain("Память задачи пуста.");
  });

  it("/rag on сообщает про историю и память; /rag off диалог не сбрасывает", async () => {
    const input = "/rag on\nвопрос\n/rag off\n/rag on\n/rag state\n";
    const result = await invoke([], { cwd, input, embeddings: embeddings(), complete: scriptedModel() });
    expect(result.output).toContain("Ответы учитывают историю (последние 6 ходов) и память задачи");
    expect(result.output).toContain("Ходов: 1");
  });

  it("/rag ask в том же сеансе одиночный: без истории и памяти, диалог не меняет", async () => {
    const complete = scriptedModel();
    const input = "/rag on\nвопрос 1\n/rag ask вопрос 2\n/rag state\n";
    const result = await invoke([], { cwd, input, embeddings: embeddings(), complete });
    const asked = answerRequests(complete)[1];
    expect(asked?.messages).toHaveLength(2);
    expect(String(asked?.messages[1]?.content)).not.toContain("Память задачи");
    expect(result.output).toContain("── Ответ агента · RAG · deepseek · deepseek-flash ──");
    expect(result.output).toContain("Ходов: 1");
  });

  it("обычный ask без режима RAG остаётся без истории", async () => {
    const complete = scriptedModel();
    await invoke([], { cwd, input: "/ask один\n/ask два\n", complete });
    expect(complete.mock.calls.map(([request]) => request.messages.length)).toEqual([2, 2]);
  });

  it("ошибка модели посреди хода не сбрасывает и не портит диалог: следующий ход видит прежнюю историю", async () => {
    const complete = scriptedModel(2);
    const input = "/rag on\nпервый\nвторой\nтретий\n/rag state\n";
    const result = await invoke([], { cwd, input, embeddings: embeddings(), complete });
    expect(result.code).toBe(1);
    expect(result.error).toContain("Ошибка");
    const third = answerRequests(complete)[2];
    expect(third?.messages.map((message) => message.content).filter((content) => content === "второй")).toEqual([]);
    expect(third?.messages[1]?.content).toBe("первый");
    expect(third?.messages).toHaveLength(4);
    expect(result.output).toContain("Ходов: 2");
  });

  it("без ключа сообщает про LAB_LLM_API_KEY раньше, чем обращается к Ollama", async () => {
    const result = await invoke([], { cwd, input: "/rag on\nвопрос\n", authenticated: false });
    expect(result.error).toContain("LAB_LLM_API_KEY");
    expect(result.createEmbeddings).not.toHaveBeenCalled();
  });
});

describe("rag dialog", () => {
  const report = () => join(cwd, ".local/rag/rag-dialog.md");
  const flags = ["--rag-dialog-file=own/scenarios.md", "rag", "dialog"];

  it("прогоняет сценарии, ход пишет в stderr, итог и путь — в stdout, отчёт — в файл", async () => {
    const complete = scriptedModel();
    const result = await invoke(flags, { cwd, embeddings: embeddings(), complete });
    expect(result.code).toBe(0);
    expect(complete).toHaveBeenCalledTimes(6);
    expect(result.error).toContain("s1: ход 1\ns1: ход 2");
    expect(result.output).toContain("── Контрольные вопросы ──");
    expect(result.output).toContain("Сценариев: 1, реплик 2, режим rewrite-filter, окно истории 6");
    expect(result.output).toContain(
      "s1: ходов 2, ответов с источниками 2 из 2, цель сохранена 2 из 2, ключи памяти 1 из 1",
    );
    expect(result.output).toContain(`Сохранено: ${report()}`);
    const content = readFileSync(report(), "utf8");
    expect(content).toContain("# RAG-чат: история, память задачи и источники");
    expect(content).toContain("Окно истории: 6 ходов.");
  });

  it("ошибка модели посередине прогона не пишет отчёт", async () => {
    const result = await invoke(flags, { cwd, embeddings: embeddings(), complete: scriptedModel(2) });
    expect(result.code).toBe(1);
    expect(existsSync(report())).toBe(false);
  });

  it("без файла сценариев сообщает про rag.dialogFile", async () => {
    const result = await invoke(["rag", "dialog"], { cwd, embeddings: embeddings(), complete: scriptedModel() });
    expect(result.code).toBe(1);
    expect(result.error).toContain("rag.dialogFile");
  });

  it("--rag-history-turns вне 1–20 отклоняется до обращения к модели и Ollama", async () => {
    const result = await invoke(["--rag-history-turns=21", "rag", "dialog"], { cwd, embeddings: embeddings() });
    expect(result.error).toBe("Ошибка · Некорректная настройка rag.historyTurns (источник: cli).\n");
    expect(result.createModel).not.toHaveBeenCalled();
  });
});
