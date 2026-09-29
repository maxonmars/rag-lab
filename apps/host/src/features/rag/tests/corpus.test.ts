import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { loadCorpus } from "../corpus.ts";
import { RagError } from "../errors.ts";
import { writeCorpus } from "./support.ts";

let root: string;
beforeEach(() => {
  root = mkdtempSync(join(tmpdir(), "rag-lab-corpus-"));
});
afterEach(() => {
  rmSync(root, { recursive: true, force: true });
});

const codeOf = (action: () => unknown) => {
  try {
    action();
  } catch (error) {
    return error instanceof RagError ? error.code : "OTHER";
  }
  return "NONE";
};

describe("загрузка корпуса", () => {
  it("читает вложенные .md в стабильном порядке и игнорирует остальные файлы", () => {
    writeCorpus(root, { "b/two.md": "# Два", "a.md": "# Один", "notes.txt": "не документ", "b/one.md": "# Раз" });
    expect(loadCorpus(root).map((document) => document.file)).toEqual(["a.md", "b/one.md", "b/two.md"]);
  });

  it("убирает frontmatter из текста; source и title берёт из него", () => {
    writeCorpus(root, {
      "a.md": '---\nsource: "https://example.test/a.md"\ntitle: "Из метаданных"\n---\n\n# Заголовок\n\nТекст',
    });
    const [document] = loadCorpus(root);
    expect(document?.source).toBe("https://example.test/a.md");
    expect(document?.title).toBe("Из метаданных");
    expect(document?.content.text).toBe("# Заголовок\n\nТекст");
  });

  it("без метаданных источник — относительный путь, название — первый H1, затем имя файла", () => {
    writeCorpus(root, { "dir/a.md": "текст\n\n# Первый\n\nещё", "dir/plain.md": "только текст" });
    const documents = loadCorpus(root);
    expect(documents.map((document) => [document.source, document.title])).toEqual([
      ["dir/a.md", "Первый"],
      ["dir/plain.md", "plain"],
    ]);
  });

  it("нормализует BOM и переводы строк: хеш и текст не зависят от них", () => {
    writeCorpus(root, { "lf.md": "# T\n\nстрока", "crlf.md": "﻿# T\r\n\r\nстрока" });
    const [crlf, lf] = loadCorpus(root);
    expect(crlf?.content.text).toBe("# T\n\nстрока");
    expect(crlf?.hash).toBe(lf?.hash);
  });

  it("отклоняет frontmatter с ошибкой YAML и не-словарь", () => {
    writeCorpus(root, { "a.md": "---\ntitle: [\n---\n\n# T" });
    expect(codeOf(() => loadCorpus(root))).toBe("INVALID_FRONTMATTER");
    writeCorpus(root, { "a.md": "---\n- список\n---\n\n# T" });
    expect(codeOf(() => loadCorpus(root))).toBe("INVALID_FRONTMATTER");
  });

  it("отличает отсутствующий каталог от пустого корпуса", () => {
    expect(codeOf(() => loadCorpus(join(root, "missing")))).toBe("CORPUS_NOT_FOUND");
    writeFileSync(join(root, "file"), "x");
    expect(codeOf(() => loadCorpus(join(root, "file")))).toBe("CORPUS_NOT_FOUND");
    mkdirSync(join(root, "empty"));
    expect(codeOf(() => loadCorpus(join(root, "empty")))).toBe("EMPTY_CORPUS");
    writeCorpus(root, { "empty/blank.md": "---\ntitle: x\n---\n\n  \n" });
    expect(codeOf(() => loadCorpus(join(root, "empty")))).toBe("EMPTY_CORPUS");
  });
});
