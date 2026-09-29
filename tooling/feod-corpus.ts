import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { isMain } from "./files.ts";

export const REPOSITORY = "https://github.com/feod-architecture/feod-docs";
export const COMMIT = "f00eaf533cfee37f67e118c96291d535b0895a6f";

export const SECTIONS: Readonly<Record<string, readonly string[]>> = {
  "get-started": ["faq", "feod-in-5-minutes", "is-feod-for-my-project", "overview", "quick-start"],
  "core-concepts": ["dependency-rules", "entity-orientation", "fractality", "levels", "modularity", "public-api"],
  structure: ["app", "common", "global", "modules", "pages"],
  guides: [
    "code-review",
    "common-boundaries",
    "design-module",
    "migration-from-fsd",
    "migration-from-modular",
    "module-readme",
    "split-large-module",
    "submodules",
    "where-to-place-code",
  ],
  reference: ["code-smells", "glossary", "import-matrix", "module-contract", "naming", "public-api", "terms"],
};

const EXCLUDED = [
  "docs/en/** — английские переводы",
  "docs/meta/** — служебные страницы о самой документации",
  "docs/about, blog, community, examples, frameworks, tools, tutorial — вне выбранных пяти разделов",
  "docs/index.md, docs/public/**, docs/.vitepress/** — оформление сайта, включая llms-full.txt",
];

export function documentFiles(): string[] {
  return Object.entries(SECTIONS).flatMap(([section, names]) => names.map((name) => `${section}/${name}.md`));
}

/** Frontmatter с `source` (файл на закреплённом коммите) и `title` (первый H1); текст документа не меняется. */
export function withFrontmatter(file: string, text: string): string {
  const title = /^# (.+)$/m.exec(text)?.[1]?.trim();
  if (!title) throw new Error(`${file}: нет заголовка первого уровня`);
  const source = `${REPOSITORY}/blob/${COMMIT}/docs/${file}`;
  return `---\nsource: ${JSON.stringify(source)}\ntitle: ${JSON.stringify(title)}\n---\n\n${text}`;
}

function checkout(directory: string): void {
  const git = (...args: string[]) =>
    execFileSync("git", args, { encoding: "utf8", stdio: ["ignore", "pipe", "inherit"] }).trim();
  if (!existsSync(join(directory, ".git"))) git("clone", "--quiet", `${REPOSITORY}.git`, directory);
  git("-C", directory, "checkout", "--quiet", COMMIT);
  if (git("-C", directory, "rev-parse", "HEAD") !== COMMIT) throw new Error("Не удалось переключиться на COMMIT.");
}

function describeCorpus(sizes: ReadonlyMap<string, number>): string {
  const total = [...sizes.values()].reduce((sum, size) => sum + size, 0);
  return [
    "# Корпус FEOD",
    "",
    `Источник: ${REPOSITORY} на коммите \`${COMMIT}\`. Лицензия — MIT, текст в файле LICENSE рядом.`,
    "Воспроизведение: `npm run corpus:feod`. Содержимое документов не редактируется; добавлен только frontmatter.",
    "",
    `Документов: ${sizes.size}, символов в исходниках: ${total}.`,
    "",
    "## Исключено",
    "",
    ...EXCLUDED.map((item) => `- ${item}`),
    "",
    "## Файлы",
    "",
    ...[...sizes].map(([file, size]) => `- ${file} — ${size}`),
    "",
  ].join("\n");
}

export function prepareCorpus(root: string): { documents: number; chars: number } {
  const base = join(root, ".local/rag");
  const source = join(base, "source/feod-docs");
  mkdirSync(dirname(source), { recursive: true });
  checkout(source);
  const sizes = new Map<string, number>();
  for (const file of documentFiles()) {
    const text = readFileSync(join(source, "docs", file), "utf8");
    const target = join(base, "corpus", file);
    mkdirSync(dirname(target), { recursive: true });
    writeFileSync(target, withFrontmatter(file, text));
    sizes.set(file, [...text].length);
  }
  writeFileSync(join(base, "LICENSE"), readFileSync(join(source, "LICENSE")));
  writeFileSync(join(base, "CORPUS.md"), describeCorpus(sizes));
  return { documents: sizes.size, chars: [...sizes.values()].reduce((sum, size) => sum + size, 0) };
}

if (isMain(import.meta.url)) {
  const result = prepareCorpus(resolve("."));
  console.log(`Корпус FEOD: ${result.documents} документов, ${result.chars} символов, .local/rag/corpus.`);
}
