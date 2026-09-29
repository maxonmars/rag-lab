import type { IndexFile } from "./indexFile.ts";
import { CodePointText } from "./text.ts";
import type { BlockType, Range, Strategy } from "./types.ts";

const SECTION_SEPARATOR = " › ";

export type FragmentSpec = Readonly<{
  label: string;
  file: string;
  from: string;
  to?: string;
  blockType?: BlockType;
}>;

/** Три участка корпуса FEOD, на которых видно, где чанки режут смысл. */
export const FRAGMENTS: readonly FragmentSpec[] = [
  {
    label: "Таблица разрешённых импортов",
    file: "reference/import-matrix.md",
    from: "Матрица импортов › Что может импортировать код на уровне",
    blockType: "table",
  },
  { label: "Правило с примерами кода", file: "core-concepts/levels.md", from: "Уровни › Уровень app" },
  {
    label: "Правило и исключение",
    file: "core-concepts/public-api.md",
    from: "Публичный API › Правило",
    to: "Публичный API › Исключения",
  },
];

export type FragmentChunk = Readonly<{
  chunkId: string;
  start: number;
  end: number;
  covered: number;
  head: string;
  tail: string;
}>;

export type FragmentView = Readonly<{
  spec: FragmentSpec;
  range: Range;
  text: string;
  strategies: Readonly<Record<Strategy, { whole: boolean; chunks: readonly FragmentChunk[] }>>;
}>;

const within = (section: string, prefix: string) =>
  section === prefix || section.startsWith(`${prefix}${SECTION_SEPARATOR}`);
const EXCERPT = 60;

function locate(index: IndexFile, spec: FragmentSpec): { range: Range; text: CodePointText } | undefined {
  const document = index.documents.find((item) => item.file === spec.file);
  if (!document) return undefined;
  const first = document.blocks.find((block) => within(block.section, spec.from));
  const last = document.blocks.filter((block) => within(block.section, spec.to ?? spec.from)).at(-1);
  if (!first || !last) return undefined;
  const single = spec.blockType
    ? document.blocks.find(
        (block) => block.type === spec.blockType && block.start >= first.start && block.end <= last.end,
      )
    : undefined;
  if (spec.blockType && !single) return undefined;
  return {
    range: { start: (single ?? first).start, end: (single ?? last).end },
    text: new CodePointText(document.text),
  };
}

function describeChunks(index: IndexFile, spec: FragmentSpec, range: Range, text: CodePointText, strategy: Strategy) {
  const chunks = index.strategies[strategy].chunks
    .filter((chunk) => chunk.file === spec.file && chunk.start < range.end && chunk.end > range.start)
    .map((chunk) => {
      const from = Math.max(chunk.start, range.start);
      const to = Math.min(chunk.end, range.end);
      return {
        chunkId: chunk.chunk_id,
        start: chunk.start,
        end: chunk.end,
        covered: (to - from) / (range.end - range.start),
        head: text.slice(from, Math.min(from + EXCERPT, to)),
        tail: text.slice(Math.max(to - EXCERPT, from), to),
      };
    });
  return { whole: chunks.some((chunk) => chunk.start <= range.start && chunk.end >= range.end), chunks };
}

export function fragmentViews(index: IndexFile): FragmentView[] {
  return FRAGMENTS.flatMap((spec) => {
    const found = locate(index, spec);
    if (!found) return [];
    const { range, text } = found;
    return [
      {
        spec,
        range,
        text: text.slice(range.start, range.end),
        strategies: {
          fixed: describeChunks(index, spec, range, text, "fixed"),
          structure: describeChunks(index, spec, range, text, "structure"),
        },
      },
    ];
  });
}
