import { existsSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { RagAnswer } from "../answer.ts";
import { RagError } from "../errors.ts";
import { type EvalOptions, type EvalProgress, evaluateQuestions } from "../evaluation.ts";
import type { SearchHit, SearchIndex } from "../search.ts";

const QUESTIONS = [
  "# Вопросы",
  "",
  "## q01. Что в первом файле?",
  "Ожидание: первый файл.",
  "Источники: a.md",
  "",
  "## q02. Что в обоих файлах?",
  "Ожидание: оба файла.",
  "Источники: a.md, b.md",
  "",
  "## q03. Чего нет в документации?",
  "Ожидание: ответа нет.",
  "Источники: —",
].join("\n");

const hit = (rank: number, file: string): SearchHit => ({
  rank,
  score: 1 - rank / 10,
  chunk: {
    chunk_id: `${file}#${rank}`,
    strategy: "structure",
    source: "src",
    title: "Doc",
    file,
    sections: ["Doc › Раздел | с чертой"],
    start: 0,
    end: 1,
    text: "т",
  },
});

const index: SearchIndex = {
  createdAt: "2026-09-29T10:00:00.000Z",
  model: { name: "bge-m3:latest", digest: "790764642607abcdef", dimension: 2 },
  files: ["a.md", "b.md", "c.md"],
  search: async () => [],
};

let root: string;
beforeEach(() => {
  root = mkdtempSync(join(tmpdir(), "rag-lab-eval-"));
  writeFileSync(join(root, "questions.md"), QUESTIONS);
});
afterEach(() => {
  rmSync(root, { recursive: true, force: true });
});

function options(overrides: Partial<EvalOptions> = {}): EvalOptions {
  const hitsByQuestion: Record<string, SearchHit[]> = {
    "Что в первом файле?": [hit(1, "c.md"), hit(2, "a.md")],
    "Что в обоих файлах?": [hit(1, "b.md")],
    "Чего нет в документации?": [hit(1, "c.md")],
  };
  return {
    questionsFile: join(root, "questions.md"),
    reportFile: join(root, "out", "rag-eval.md"),
    index,
    strategy: "structure",
    topK: 5,
    meta: { questionsFile: "experiments/feod-rag/questions.md", llmModel: "deepseek-flash" },
    askPlain: async (question) => `без RAG: ${question}\n\nвторой абзац`,
    askRag: async (question): Promise<RagAnswer> => ({
      answer: `с RAG: ${question}`,
      hits: hitsByQuestion[question] ?? [],
      contextChars: 4210,
    }),
    now: () => new Date("2026-09-29T12:00:00Z"),
    ...overrides,
  };
}

describe("прогон контрольных вопросов", () => {
  it("вызывает режимы по порядку, сообщает прогресс и считает попадание источников", async () => {
    const order: string[] = [];
    const events: EvalProgress[] = [];
    const result = await evaluateQuestions(
      options({
        onProgress: (event) => events.push(event),
        askPlain: async (question) => {
          order.push(`plain:${question}`);
          return "ответ";
        },
        askRag: async (question) => {
          order.push(`rag:${question}`);
          return { answer: "ответ", hits: [hit(1, "b.md")], contextChars: 10 };
        },
      }),
    );
    expect(order).toEqual([
      "plain:Что в первом файле?",
      "rag:Что в первом файле?",
      "plain:Что в обоих файлах?",
      "rag:Что в обоих файлах?",
      "plain:Чего нет в документации?",
      "rag:Чего нет в документации?",
    ]);
    expect(events.slice(0, 3)).toEqual([
      { id: "q01", mode: "plain" },
      { id: "q01", mode: "rag" },
      { id: "q02", mode: "plain" },
    ]);
    expect(events).toHaveLength(6);
    expect(result).toMatchObject({ questions: 3, expectedSources: 3, foundSources: 1 });
    expect(result.path).toBe(join(root, "out", "rag-eval.md"));
    expect(result.plainMs).toBeGreaterThanOrEqual(0);
    expect(result.ragMs).toBeGreaterThanOrEqual(0);
  });

  it("пишет отчёт: шапка, сводка, ранги, вопрос без источников и ответы в цитатах", async () => {
    await evaluateQuestions(options());
    const report = readFileSync(join(root, "out", "rag-eval.md"), "utf8");
    expect(report).toContain("Прогон 2026-09-29T12:00:00.000Z. Вопросы: `experiments/feod-rag/questions.md` (3).");
    expect(report).toContain("модель эмбеддингов `bge-m3:latest` (digest 790764642607)");
    expect(report).toContain("Модель ответов: `deepseek-flash`. Поиск: стратегия structure, top-5");
    expect(report).toContain("| q01 | 1 из 1 | 2 | 4 210 |");
    expect(report).toContain("| q02 | 1 из 2 | 1 | 4 210 |");
    expect(report).toContain("| q03 | — | — | 4 210 |");
    expect(report).toContain("Найдено ожидаемых источников: 2 из 3.");
    expect(report).toContain("**Ожидаемые источники:** `a.md`, `b.md`");
    expect(report).toContain("**Ожидаемые источники:** —");
    expect(report).toContain("| 2 | 0.800 | `a.md` | Doc › Раздел \\| с чертой | да |");
    expect(report).toContain("| 1 | 0.900 | `c.md` | Doc › Раздел \\| с чертой | — |");
    expect(report).toContain("### Ответ без RAG\n\n> без RAG: Что в первом файле?\n>\n> второй абзац");
    expect(report).toContain("### Ответ с RAG\n\n> с RAG: Что в первом файле?");
  });

  it("неизвестный источник отклоняется до первого вызова модели", async () => {
    writeFileSync(join(root, "questions.md"), "## q01. Вопрос\nОжидание: x\nИсточники: a.md, нет.md");
    const askPlain = vi.fn(async () => "ответ");
    const error = await evaluateQuestions(options({ askPlain })).catch((caught: unknown) => caught);
    expect(error).toBeInstanceOf(RagError);
    expect((error as RagError).data).toEqual({ reason: "source", id: "q01", file: "нет.md" });
    expect(askPlain).not.toHaveBeenCalled();
  });

  it("ошибка модели прерывает прогон, отчёт не создаётся", async () => {
    let calls = 0;
    const askRag = async (): Promise<RagAnswer> => {
      if (++calls === 2) throw new Error("сбой модели");
      return { answer: "ответ", hits: [], contextChars: 1 };
    };
    await expect(evaluateQuestions(options({ askRag }))).rejects.toThrow("сбой модели");
    expect(calls).toBe(2);
    expect(existsSync(join(root, "out", "rag-eval.md"))).toBe(false);
  });
});
