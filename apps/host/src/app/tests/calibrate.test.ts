import { existsSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { invoke, keywordEmbeddings, writeCorpus } from "./harness.ts";

const QUESTIONS = [
  "# Вопросы",
  "",
  "## q01. слово",
  "Ожидание: документ Один.",
  "Источники: a.md",
  "",
  "## q02. короткий",
  "Ожидание: документ Два.",
  "Источники: b.md",
  "",
  "## q03. Вопрос без слов словаря",
  "Ожидание: ответа нет.",
  "Источники: —",
].join("\n");

const embeddings = () => keywordEmbeddings(["слово", "короткий"]);

let cwd: string;
beforeEach(async () => {
  cwd = mkdtempSync(join(tmpdir(), "rag-lab-calibrate-"));
  writeCorpus(join(cwd, ".local/rag/corpus"), {
    "a.md": `# Один\n\n${"слово ".repeat(500)}\n\n## Раздел\n\nтекст раздела`,
    "b.md": "# Два\n\nкороткий документ",
  });
  writeCorpus(join(cwd, "experiments/feod-retrieval"), { "questions.md": QUESTIONS });
  await invoke(["rag", "index"], { cwd, embeddings: embeddings() });
});
afterEach(() => {
  rmSync(cwd, { recursive: true, force: true });
});

describe("rag calibrate", () => {
  it("работает без ключа DeepSeek и модели генерации, пишет отчёт и показывает рекомендацию", async () => {
    const result = await invoke(["rag", "calibrate"], { cwd, embeddings: embeddings(), authenticated: false });
    const report = join(cwd, ".local/rag/rag-calibration.md");
    expect(result.code).toBe(0);
    expect(result.createModel).not.toHaveBeenCalled();
    expect(result.complete).not.toHaveBeenCalled();
    expect(result.output).toContain("── Калибровка порога ──");
    expect(result.output).toContain("Вопросов: 3; ожидаемых пар «вопрос — файл»: 2, baseline находит 2");
    expect(result.output).toContain("0.50: сохранено пар 2, потеряно 0, отрицательных с пустым контекстом 1");
    expect(result.output).toContain("Рекомендуемый порог: 0.65 (настройки не изменены)");
    expect(result.output).toContain(`Сохранено: ${report}`);
    expect(result.error).toBe("q01: поиск\nq02: поиск\nq03: поиск\n");
    expect(readFileSync(report, "utf8")).toContain("# Калибровка порога релевантности");
  });

  it("не меняет конфигурацию: файл настроек не создаётся, порог остаётся прежним", async () => {
    await invoke(["rag", "calibrate"], { cwd, embeddings: embeddings() });
    expect(existsSync(join(cwd, "lab.config.yaml"))).toBe(false);
    const config = await invoke(["config", "show"], { cwd });
    expect(config.output).toMatch(/rag\.similarityThreshold\s+0\.55\s+\(default\)/);
  });

  it("один поиск на вопрос: три вопроса — три обращения к эмбеддингам поверх индекса", async () => {
    const port = embeddings();
    const embed = vi.spyOn(port, "embed");
    await invoke(["rag", "calibrate"], { cwd, embeddings: port });
    expect(embed).toHaveBeenCalledTimes(3);
  });

  it("файл вопросов задаётся --rag-questions-file, REPL и CLI дают один итог", async () => {
    writeCorpus(join(cwd, "own"), { "q.md": QUESTIONS });
    const flags = ["--rag-questions-file=own/q.md"];
    const cli = await invoke([...flags, "rag", "calibrate"], { cwd, embeddings: embeddings() });
    const repl = await invoke(flags, { cwd, input: "/rag calibrate\n/exit\n", embeddings: embeddings() });
    expect(cli.code).toBe(0);
    expect(repl.output).toBe(cli.output);
  });

  it("неизвестный источник отклоняется до поиска, прежний отчёт остаётся", async () => {
    const report = join(cwd, ".local/rag/rag-calibration.md");
    writeFileSync(report, "# Прежний\n");
    writeCorpus(join(cwd, "experiments/feod-retrieval"), {
      "questions.md": "## q01. слово\nОжидание: x\nИсточники: нет.md",
    });
    const port = embeddings();
    const embed = vi.spyOn(port, "embed");
    const result = await invoke(["rag", "calibrate"], { cwd, embeddings: port });
    expect(result.code).toBe(1);
    expect(result.error).toContain("источник не найден в индексе (q01, нет.md)");
    expect(embed).not.toHaveBeenCalled();
    expect(readFileSync(report, "utf8")).toBe("# Прежний\n");
  });

  it("без индекса подсказывает rag index, без файла вопросов — rag.questionsFile", async () => {
    const empty = mkdtempSync(join(tmpdir(), "rag-lab-empty-"));
    try {
      const noIndex = await invoke(["rag", "calibrate"], { cwd: empty, embeddings: embeddings() });
      expect(noIndex.error).toContain("rag index");
      rmSync(join(cwd, "experiments"), { recursive: true });
      const noQuestions = await invoke(["rag", "calibrate"], { cwd, embeddings: embeddings() });
      expect(noQuestions.error).toContain("rag.questionsFile");
    } finally {
      rmSync(empty, { recursive: true, force: true });
    }
  });
});

describe("справка и реестр", () => {
  it("справка показывает rag calibrate и новые флаги", async () => {
    const help = await invoke(["help"], { cwd, authenticated: false });
    expect(help.output).toContain("rag calibrate");
    for (const flag of ["--rag-retrieval-mode", "--rag-candidate-top-k", "--rag-similarity-threshold"]) {
      expect(help.output).toContain(flag);
    }
  });
});
