import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { compareIndex } from "../compare.ts";
import { RagError } from "../errors.ts";
import { fragmentViews } from "../fragments.ts";
import { indexCorpus } from "../indexer.ts";
import { type IndexFile, readIndex } from "../indexFile.ts";
import { corpusMetrics, strategyMetrics } from "../metrics.ts";
import { fakeEmbeddings, PARAMS, writeCorpus } from "./support.ts";

const TABLE = "| h1 | h2 |\n| -- | -- |\n| 1  | 2  |";
const LEVELS =
  "# Уровни\n\n## Уровень `app`\n\nОписание уровня app и его границ.\n\n```ts\nimport { x } from 'y';\n```";
const IMPORT_MATRIX = `# Матрица импортов\n\n## Что может импортировать код на уровне\n\nВвод.\n\n${TABLE}\n\nПримечание.`;
const PUBLIC_API = [
  "# Публичный API",
  "## Правило\n\nВнешний код использует модуль через public API.",
  "## Good example\n\n````md\n```ts\nimport { A } from '@/modules/a';\n```\n````",
  "## Исключения\n\nВнутри модуля файлы импортируют друг друга напрямую.",
  "## Связанные страницы\n\n- [x](./x.md)",
].join("\n\n");

let root: string;
let indexFile: string;
let reportFile: string;
beforeEach(() => {
  root = mkdtempSync(join(tmpdir(), "rag-lab-compare-"));
  indexFile = join(root, "index.json");
  reportFile = join(root, "comparison.md");
});
afterEach(() => {
  rmSync(root, { recursive: true, force: true });
});

async function indexOf(files: Record<string, string>, params = PARAMS): Promise<IndexFile> {
  writeCorpus(join(root, "corpus"), files);
  await indexCorpus({ inputDir: join(root, "corpus"), outputFile: indexFile, params, embeddings: fakeEmbeddings() });
  return (await readIndex(indexFile)).index;
}

describe("метрики", () => {
  it("fixed разрывает таблицу на границе окна, structure оставляет её целой", async () => {
    const index = await indexOf({ "a.md": `# T\n\n${"a".repeat(60)}\n\n${TABLE}` });
    const fixed = strategyMetrics(index, "fixed");
    const structure = strategyMetrics(index, "structure");
    expect([fixed.broken.table, structure.broken.table]).toEqual([1, 0]);
    expect([fixed.blocks.table, structure.blocks.table]).toEqual([1, 1]);
    expect([fixed.chunks, structure.chunks]).toEqual([2, 2]);
    expect(fixed.size).toEqual({ min: 22, avg: 61, p95: 100, max: 100 });
    expect(structure.size).toEqual({ min: 35, avg: 50, p95: 65, max: 65 });
    expect([fixed.repeatedChars, structure.repeatedChars]).toEqual([20, 0]);
    expect([fixed.uncoveredChars, structure.uncoveredChars]).toEqual([0, 0]);
    expect([fixed.promptTokens, structure.promptTokens]).toEqual([122, 100]);
    expect([fixed.tokensPerChunk, structure.tokensPerChunk]).toEqual([61, 50]);
  });

  it("считает слова с буквой или цифрой вне блоков кода, разметку без слов не считает", async () => {
    const index = await indexOf({ "a.md": "# Заголовок\n\nодин два три\n\n```js\nconst a = 1;\n```\n\nчетыре" });
    expect(corpusMetrics(index)).toMatchObject({ documents: 1, chars: index.documents[0]?.text.length, words: 5 });
  });
});

describe("участки для ручного сравнения", () => {
  const files = {
    "reference/import-matrix.md": IMPORT_MATRIX,
    "core-concepts/levels.md": LEVELS,
    "core-concepts/public-api.md": PUBLIC_API,
  };

  it("находит три участка; диапазон «правило — исключение» идёт от заголовка правила до конца исключений", async () => {
    const index = await indexOf(files, { chunkSizeChars: 200, overlapChars: 30, minChunkChars: 60 });
    const views = fragmentViews(index);
    expect(views.map((view) => view.spec.file)).toEqual([
      "reference/import-matrix.md",
      "core-concepts/levels.md",
      "core-concepts/public-api.md",
    ]);
    expect(views[0]?.text).toBe(TABLE);
    expect(views[1]?.text).toMatch(/^## Уровень `app`\n\nОписание.*```$/s);
    expect(views[2]?.text).toMatch(/^## Правило\n\n.*напрямую\.$/s);
    expect(views[2]?.text).not.toContain("Связанные страницы");
  });

  it("не падает, если участков нет в корпусе", async () => {
    expect(fragmentViews(await indexOf({ "other.md": "# Другой\n\nтекст" }))).toEqual([]);
  });
});

describe("compareIndex", () => {
  it("пишет отчёт из одного index.json: таблицы измерений, оговорки и участки без модели", async () => {
    await indexOf({ ...{ "a.md": `# T\n\n${"a".repeat(60)}\n\n${TABLE}` }, "core-concepts/public-api.md": PUBLIC_API });
    const result = await compareIndex({ indexFile, reportFile });
    const report = readFileSync(reportFile, "utf8");
    expect(result.path).toBe(reportFile);
    for (const text of [
      "# Сравнение стратегий чанкинга",
      "## Корпус",
      "## Результаты",
      "| Чанков |",
      "`prompt_eval_count`",
    ]) {
      expect(report).toContain(text);
    }
    expect(report).toContain("качество поиска не измерялось");
    expect(report).toContain("### 1. Правило и исключение");
  });

  it("выбирает ограждение длиннее любой серии обратных кавычек в участке и экранирует | в ячейках", async () => {
    await indexOf(
      { "core-concepts/public-api.md": PUBLIC_API, "reference/import-matrix.md": IMPORT_MATRIX },
      { chunkSizeChars: 200, overlapChars: 30, minChunkChars: 60 },
    );
    await compareIndex({ indexFile, reportFile });
    const report = readFileSync(reportFile, "utf8");
    expect(report).toContain("`````markdown\n## Правило");
    expect(report).toContain("\\| h1 \\| h2 \\|");
  });

  it("отличает отсутствующий индекс от повреждённого и от чужой версии формата", async () => {
    const codeOf = async () => {
      try {
        await compareIndex({ indexFile, reportFile });
      } catch (error) {
        return error instanceof RagError ? error.code : "OTHER";
      }
      return "NONE";
    };
    expect(await codeOf()).toBe("INDEX_NOT_FOUND");
    writeFileSync(indexFile, "{ не json");
    expect(await codeOf()).toBe("INDEX_INVALID");
    writeFileSync(indexFile, JSON.stringify({ formatVersion: 2 }));
    expect(await codeOf()).toBe("INDEX_INVALID");
  });
});
