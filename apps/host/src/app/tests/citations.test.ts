import { existsSync, mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { AgentError, type ModelRequest } from "../../core/index.ts";
import { type CompleteMock, invoke, keywordEmbeddings, writeCorpus } from "./harness.ts";

const QUESTIONS = [
  "# Вопросы",
  "",
  "## q01. Что значит слово?",
  "Ожидание: документ Один.",
  "Источники: a.md",
  "",
  "## q02. Чего в корпусе нет?",
  "Ожидание: ответа нет.",
  "Источники: —",
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

/** Rewrite возвращает «слово» для вопроса про слово и «ничего» (нулевой вектор) для остальных. */
function scriptedModel(): CompleteMock {
  return vi.fn(async (request: ModelRequest) => {
    const rewrite = String(request.messages[0]?.content).includes("переписываешь");
    const question = String(request.messages[1]?.content);
    const content = rewrite ? (question.includes("слово") ? "слово" : "ничего") : REPLY;
    return { type: "text" as const, content };
  });
}

let cwd: string;
beforeEach(async () => {
  cwd = mkdtempSync(join(tmpdir(), "rag-lab-citations-"));
  writeCorpus(join(cwd, ".local/rag/corpus"), {
    "a.md": `# Один\n\n${"слово ".repeat(500)}\n\n## Раздел\n\nтекст раздела`,
    "b.md": "# Два\n\nкороткий документ",
  });
  writeCorpus(join(cwd, "own"), { "questions.md": QUESTIONS });
  await invoke(["rag", "index"], { cwd, embeddings: embeddings() });
});
afterEach(() => {
  rmSync(cwd, { recursive: true, force: true });
});

const report = () => join(cwd, ".local/rag/rag-citations.md");

describe("rag citations", () => {
  it("прогоняет вопросы в настроенном режиме: три вызова модели, ход в stderr, сводка в stdout", async () => {
    const complete = scriptedModel();
    const flags = ["--rag-questions-file=own/questions.md", "rag", "citations"];
    const result = await invoke(flags, { cwd, embeddings: embeddings(), complete });
    expect(result.code).toBe(0);
    expect(complete).toHaveBeenCalledTimes(3);
    expect(result.error).toContain("q01: ответ с источниками\nq02: ответ с источниками");
    expect(result.output).toContain("── Контрольные вопросы ──");
    expect(result.output).toContain("Вопросов: 2, режим rewrite-filter");
    expect(result.output).toContain(
      "Положительные: с источниками 1 из 1, с цитатами 1 из 1, ожидаемый файл среди источников 1 из 1, «не знаю» 0 из 1",
    );
    expect(result.output).toContain("Отрицательные: «не знаю» 1 из 1 (пустой контекст 1, моделью 0)");
    expect(result.output).toContain("Цитаты дословно: 1 из 1; ответов без замечаний: 2 из 2");
    expect(result.output).toContain("Ошибки модели: 0 из 2");
    expect(result.output).toContain("Генерация: медиана ");
    expect(result.output).toContain("Длительность прогона: ");
    expect(result.output).toContain(`Сохранено: ${report()}`);
  });

  it("ошибка модели на ответе не прерывает команду: ход сообщает код, сводка считает ошибку", async () => {
    const complete: CompleteMock = vi.fn(async (request: ModelRequest) => {
      if (!String(request.messages[0]?.content).includes("переписываешь")) {
        throw new AgentError("MODEL_FAILURE", { status: 500 });
      }
      return {
        type: "text" as const,
        content: String(request.messages[1]?.content).includes("слово") ? "слово" : "ничего",
      };
    });
    const flags = ["--rag-questions-file=own/questions.md", "rag", "citations"];
    const result = await invoke(flags, { cwd, embeddings: embeddings(), complete });
    expect(result.code).toBe(0);
    expect(result.error).toContain("q01: ошибка модели MODEL_FAILURE");
    expect(result.output).toContain("Ошибки модели: 1 из 2");
    expect(result.output).toContain("Генерация: модель не вызывалась");
    expect(existsSync(report())).toBe(true);
  });

  it("отчёт содержит chunk_id фрагмента, проверку цитаты и отказ без вызова модели", async () => {
    const flags = ["--rag-questions-file=own/questions.md", "rag", "citations"];
    await invoke(flags, { cwd, embeddings: embeddings(), complete: scriptedModel() });
    const text = readFileSync(report(), "utf8");
    expect(text).toContain("# Источники, цитаты и режим «не знаю»");
    expect(text).toContain("structure:a.md#");
    expect(text).toContain("найдена во фрагменте 1");
    expect(text).toContain("Контекст пуст: модель не вызывалась.");
  });

  it("без файла вопросов сообщает про rag.questionsFile и не пишет отчёт", async () => {
    const result = await invoke(["rag", "citations"], { cwd, embeddings: embeddings() });
    expect(result.code).toBe(1);
    expect(result.error).toContain("rag.questionsFile");
    expect(existsSync(report())).toBe(false);
  });
});

describe("rag ask с источниками и цитатами", () => {
  it("печатает ответ, раскрытые источники и найденные цитаты", async () => {
    const result = await invoke(["rag", "ask", "Что значит слово?"], {
      cwd,
      embeddings: embeddings(),
      complete: scriptedModel(),
    });
    expect(result.code).toBe(0);
    expect(result.output).toContain("Документ повторяет слово [1].");
    expect(result.output).toContain("Источники:\n- [1] `a.md` › ");
    expect(result.output).toContain("Цитаты:\n- [1] «слово слово слово слово слово» — найдена во фрагменте 1");
    expect(result.output).toContain("Фрагменты:");
  });
});
