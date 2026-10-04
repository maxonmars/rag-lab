import { existsSync, mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { ModelRequest } from "../../core/index.ts";
import { type CompleteMock, fakeEmbeddings, invoke, writeCorpus } from "./harness.ts";

const QUESTIONS = [
  "# Контрольные вопросы",
  "",
  "## q01. Что в документе Один?",
  "Ожидание: слово.",
  "Источники: a.md",
  "",
  "## q02. Чего в корпусе нет?",
  "Ожидание: ответа нет.",
  "Источники: —",
].join("\n");

let cwd: string;
beforeEach(async () => {
  cwd = mkdtempSync(join(tmpdir(), "rag-lab-answer-"));
  writeCorpus(join(cwd, ".local/rag/corpus"), {
    "a.md": `# Один\n\n${"слово ".repeat(500)}\n\n## Раздел\n\ntext раздела`,
    "b.md": "# Два\n\nкороткий документ",
  });
  await invoke(["rag", "index"], { cwd, embeddings: fakeEmbeddings() });
});
afterEach(() => {
  rmSync(cwd, { recursive: true, force: true });
});

/** Как echo harness, но rewrite отвечает одной строкой: многострочный запрос в чате — REWRITE_INVALID. */
const echoWithRewrite = (): CompleteMock =>
  vi.fn(async (request: ModelRequest) => {
    const rewrite = String(request.messages[0]?.content).includes("переписываешь");
    return { type: "text" as const, content: rewrite ? "запрос" : `Ответ: ${request.messages.at(-1)?.content}` };
  });

const requestOf = (result: { complete: { mock: { calls: unknown[][] } } }, call = 0) =>
  result.complete.mock.calls[call]?.[0] as ModelRequest;

describe("rag ask", () => {
  it("печатает ответ с фрагментами; модель получает system.md, инструкцию RAG и фрагменты с вопросом", async () => {
    const result = await invoke(["--rag-retrieval-mode=baseline", "rag", "ask", "Что такое короткий документ?"], {
      cwd,
      embeddings: fakeEmbeddings(),
    });
    expect(result.code).toBe(0);
    expect(result.output).toContain("── Ответ агента · RAG ──");
    expect(result.output).toContain("Фрагменты:");
    expect(result.output).toMatch(/\n {2}1\. [ab]\.md › /);
    const request = requestOf(result);
    expect(request.messages[0]?.content).toContain("полезный собеседник");
    expect(request.messages[0]?.content).toContain("фрагменты документации");
    const user = String(request.messages[1]?.content);
    expect(user).toContain("### Фрагмент 1");
    expect(user).toContain("короткий документ");
    expect(user.endsWith("## Вопрос\n\nЧто такое короткий документ?")).toBe(true);
    expect(request.tools).toEqual([]);
  });

  it("--rag-top-k ограничивает число фрагментов", async () => {
    const baseline = "--rag-retrieval-mode=baseline";
    const one = await invoke([baseline, "--rag-top-k=1", "rag", "ask", "Вопрос"], {
      cwd,
      embeddings: fakeEmbeddings(),
    });
    const many = await invoke([baseline, "--rag-candidate-top-k=20", "--rag-top-k=20", "rag", "ask", "Вопрос"], {
      cwd,
      embeddings: fakeEmbeddings(),
    });
    expect(one.output.match(/^ {2}\d+\. /gm)).toHaveLength(1);
    expect(many.output.match(/^ {2}\d+\. /gm)?.length).toBeGreaterThan(1);
    expect(requestOf(one).messages[1]?.content).not.toContain("### Фрагмент 2");
  });

  it("--rag-chunk-strategy выбирает чанки другой стратегии", async () => {
    writeCorpus(join(cwd, ".local/rag/corpus"), {
      "c.md": `# Три\n\n${"альфа ".repeat(40)}\n\n## Раздел\n\n${"бета ".repeat(40)}`,
    });
    const small = ["--rag-chunk-size-chars=300", "--rag-overlap-chars=0", "--rag-min-chunk-chars=100"];
    await invoke([...small, "rag", "index"], { cwd, embeddings: fakeEmbeddings() });
    const ask = (strategy: string) =>
      invoke(
        [
          "--rag-retrieval-mode=baseline",
          `--rag-chunk-strategy=${strategy}`,
          "--rag-candidate-top-k=20",
          "--rag-top-k=20",
          "rag",
          "ask",
          "Вопрос",
        ],
        { cwd, embeddings: fakeEmbeddings() },
      );
    const [structure, fixed] = [await ask("structure"), await ask("fixed")];
    expect(fixed.code).toBe(0);
    expect(requestOf(fixed).messages[1]?.content).not.toBe(requestOf(structure).messages[1]?.content);
  });

  it.each([
    ["--rag-top-k=0", "rag.topK"],
    ["--rag-top-k=21", "rag.topK"],
    ["--rag-top-k=1.5", "rag.topK"],
    ["--rag-chunk-strategy=hybrid", "rag.chunkStrategy"],
  ])("%s отклоняется до обращения к модели и Ollama", async (flag, key) => {
    const result = await invoke([flag, "rag", "ask", "Вопрос"], { cwd, embeddings: fakeEmbeddings() });
    expect(result.code).toBe(1);
    expect(result.error).toBe(`Ошибка · Некорректная настройка ${key} (источник: cli).\n`);
    expect(result.createModel).not.toHaveBeenCalled();
  });

  it("без индекса завершается кодом 1 с подсказкой rag index", async () => {
    const empty = mkdtempSync(join(tmpdir(), "rag-lab-empty-"));
    try {
      const result = await invoke(["rag", "ask", "Вопрос"], { cwd: empty, embeddings: fakeEmbeddings() });
      expect(result.code).toBe(1);
      expect(result.error).toContain("rag index");
      expect(result.complete).not.toHaveBeenCalled();
    } finally {
      rmSync(empty, { recursive: true, force: true });
    }
  });

  it("без ключа сообщает про LAB_LLM_API_KEY раньше, чем обращается к Ollama", async () => {
    const result = await invoke(["rag", "ask", "Вопрос"], { cwd, authenticated: false });
    expect(result.code).toBe(1);
    expect(result.error).toContain("LAB_LLM_API_KEY");
    expect(result.createEmbeddings).not.toHaveBeenCalled();
  });

  it("при другой модели эмбеддингов подсказывает пересобрать индекс", async () => {
    const other = fakeEmbeddings();
    other.describeModel = async () => ({ name: "other:latest", digest: "ffff" });
    const result = await invoke(["rag", "ask", "Вопрос"], { cwd, embeddings: other });
    expect(result.code).toBe(1);
    expect(result.error).toContain("Индекс построен моделью fake:latest, а для запроса выбрана other:latest");
  });
});

describe("режим сессии REPL", () => {
  it("/rag on отправляет обычную строку в настроенный конвейер, /rag off возвращает ответ без поиска", async () => {
    const input = "/rag on\nВопрос один\n/rag off\nВопрос два\n/exit\n";
    const result = await invoke([], { cwd, input, embeddings: fakeEmbeddings(), complete: echoWithRewrite() });
    expect(result.code).toBe(0);
    expect(result.output).toContain(
      "── Режим ──\n\nОтветы с RAG: стратегия structure, режим rewrite-filter, кандидатов 10, итоговый top-5, порог 0.55.",
    );
    expect(result.output).toContain("Ответы без RAG.");
    expect(result.output.match(/── Ответ агента · RAG-чат ──/g)).toHaveLength(1);
    expect(result.output).toContain("\n── Ответ агента ──\n\nОтвет: Вопрос два\n");
    expect(result.complete).toHaveBeenCalledTimes(4);
    expect(requestOf(result, 0).messages[0]?.content).toContain("обновляешь память задачи");
    expect(requestOf(result, 1).messages[0]?.content).toContain("переписываешь");
    expect(requestOf(result, 2).messages[1]?.content).toContain("## Вопрос\n\nВопрос один");
    expect(requestOf(result, 3).messages[1]?.content).toBe("Вопрос два");
    expect(requestOf(result, 3).messages[0]?.content).not.toContain("фрагменты документации");
  });

  it("/ask следует режиму сессии, а режим по умолчанию — без RAG", async () => {
    const off = await invoke([], { cwd, input: "/ask Вопрос\n/exit\n", embeddings: fakeEmbeddings() });
    const on = await invoke([], {
      cwd,
      input: "/rag on\n/ask Вопрос\n/exit\n",
      embeddings: fakeEmbeddings(),
      complete: echoWithRewrite(),
    });
    expect(off.output).toContain("── Ответ агента ──");
    expect(on.output).toContain("── Ответ агента · RAG-чат ──");
  });

  it("режим не переносится между запусками CLI", async () => {
    const result = await invoke(["rag", "on"], { cwd });
    expect(result.output).toContain("Ответы с RAG");
    const next = await invoke(["ask", "Вопрос"], { cwd });
    expect(next.output).toContain("── Ответ агента ──");
    expect(next.createEmbeddings).not.toHaveBeenCalled();
  });
});

describe("rag eval", () => {
  const questionsFile = () => writeCorpus(join(cwd, "experiments/feod-retrieval"), { "questions.md": QUESTIONS });

  it("сравнивает четыре режима: пять вызовов модели на вопрос, ход в stderr, итог по режимам в stdout", async () => {
    questionsFile();
    const result = await invoke(["rag", "eval"], { cwd, embeddings: fakeEmbeddings() });
    const report = join(cwd, ".local/rag/rag-eval.md");
    expect(result.code).toBe(0);
    expect(result.complete).toHaveBeenCalledTimes(10);
    expect(result.error).toContain(
      [
        "q01: поиск исходным вопросом",
        "q01: baseline",
        "q01: filter",
        "q01: переписывание запроса",
        "q01: rewrite",
        "q01: rewrite-filter",
        "q02: поиск исходным вопросом",
      ].join("\n"),
    );
    expect(result.output).toContain("── Контрольные вопросы ──");
    expect(result.output).toContain("Вопросов: 2\nДлительность прогона: ");
    for (const mode of ["baseline", "filter", "rewrite", "rewrite-filter"]) {
      expect(result.output).toMatch(
        new RegExp(
          `${mode}: hit@5 [01] из 1, MRR [01]\\.\\d\\d, источники [01] из 1, отрицательные с контекстом 1 из 1`,
        ),
      );
    }
    expect(result.output).toContain(`Сохранено: ${report}`);
    const text = readFileSync(report, "utf8");
    expect(text).toContain("# Сравнение режимов поиска");
    expect(text).toContain("## q02. Чего в корпусе нет?");
  });

  it("запускает все четыре режима независимо от rag.retrievalMode", async () => {
    questionsFile();
    const result = await invoke(["--rag-retrieval-mode=baseline", "rag", "eval"], {
      cwd,
      embeddings: fakeEmbeddings(),
    });
    expect(result.code).toBe(0);
    expect(result.complete).toHaveBeenCalledTimes(10);
  });

  it("файл вопросов и лимиты настраиваются: --rag-questions-file, --rag-candidate-top-k и --rag-top-k", async () => {
    writeCorpus(join(cwd, "own"), { "q.md": QUESTIONS });
    const flags = ["--rag-questions-file=own/q.md", "--rag-candidate-top-k=3", "--rag-top-k=2"];
    const result = await invoke([...flags, "rag", "eval"], { cwd, embeddings: fakeEmbeddings() });
    expect(result.code).toBe(0);
    expect(result.output).toContain("hit@2");
    expect(readFileSync(join(cwd, ".local/rag/rag-eval.md"), "utf8")).toContain("кандидатов 3, итоговый top-2");
  });

  it("без файла вопросов сообщает про rag.questionsFile и не пишет отчёт", async () => {
    const result = await invoke(["rag", "eval"], { cwd, embeddings: fakeEmbeddings() });
    expect(result.code).toBe(1);
    expect(result.error).toContain("rag.questionsFile");
    expect(existsSync(join(cwd, ".local/rag/rag-eval.md"))).toBe(false);
  });

  it("ошибка модели останавливает прогон без отчёта", async () => {
    questionsFile();
    const complete = (await invoke(["ask", "x"], { cwd })).complete;
    complete.mockReset();
    complete.mockRejectedValue(new Error("сбой"));
    const result = await invoke(["rag", "eval"], { cwd, embeddings: fakeEmbeddings(), complete });
    expect(result.code).toBe(1);
    expect(existsSync(join(cwd, ".local/rag/rag-eval.md"))).toBe(false);
  });
});
