import { expect, it } from "vitest";
import { COMMIT, documentFiles, REPOSITORY, SECTIONS, withFrontmatter } from "../feod-corpus.ts";

it("явный список — 32 уникальных документа из пяти разделов", () => {
  const files = documentFiles();
  expect(files).toHaveLength(32);
  expect(new Set(files).size).toBe(32);
  expect(Object.keys(SECTIONS)).toEqual(["get-started", "core-concepts", "structure", "guides", "reference"]);
  expect(Object.values(SECTIONS).map((names) => names.length)).toEqual([5, 6, 5, 9, 7]);
});

it("frontmatter содержит ссылку на файл закреплённого коммита и первый H1, текст не меняется", () => {
  const original = '# Уровни `app`\n\nТекст с "кавычками": и двоеточием.\n';
  const result = withFrontmatter("core-concepts/levels.md", original);
  expect(result).toBe(
    `---\nsource: "${REPOSITORY}/blob/${COMMIT}/docs/core-concepts/levels.md"\ntitle: "Уровни \`app\`"\n---\n\n${original}`,
  );
  expect(result.endsWith(original)).toBe(true);
});

it("документ без заголовка первого уровня отклоняется", () => {
  expect(() => withFrontmatter("x.md", "## только второй\n")).toThrow(/нет заголовка первого уровня/);
});
