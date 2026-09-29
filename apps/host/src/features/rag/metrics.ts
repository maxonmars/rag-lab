import type { IndexFile } from "./indexFile.ts";
import { CodePointText } from "./text.ts";
import type { BlockType, Strategy } from "./types.ts";

export const BLOCK_KINDS = ["table", "code", "list", "paragraph", "other"] as const;
export type BlockKind = (typeof BLOCK_KINDS)[number];

const WORDS_PER_PAGE = 300;
const CHARS_PER_PAGE = 1800;
const P95 = 0.95;

export type CorpusMetrics = Readonly<{
  documents: number;
  chars: number;
  words: number;
  pagesByWords: number;
  pagesByChars: number;
}>;

export type StrategyMetrics = Readonly<{
  strategy: Strategy;
  chunks: number;
  size: Readonly<{ min: number; avg: number; p95: number; max: number }>;
  repeatedChars: number;
  repeatedShare: number;
  multiSectionChunks: number;
  uncoveredChars: number;
  blocks: Readonly<Record<BlockKind, number>>;
  broken: Readonly<Record<BlockKind, number>>;
  promptTokens: number;
  tokensPerChunk: number;
  chunkingMs: number;
  embeddingMs: number;
}>;

function kindOf(type: BlockType): BlockKind {
  return type === "table" || type === "code" || type === "list" || type === "paragraph" ? type : "other";
}

const emptyKinds = (): Record<BlockKind, number> => ({ table: 0, code: 0, list: 0, paragraph: 0, other: 0 });

/** Слово — пробельный фрагмент с буквой или цифрой вне блоков кода mdast; страница — 300 слов или 1800 символов. */
export function corpusMetrics(index: IndexFile): CorpusMetrics {
  let chars = 0;
  let words = 0;
  for (const document of index.documents) {
    const text = new CodePointText(document.text);
    chars += text.length;
    let prose = "";
    let position = 0;
    for (const block of document.blocks.filter((item) => item.type === "code")) {
      prose += `${text.slice(position, block.start)}\n`;
      position = block.end;
    }
    prose += text.slice(position, text.length);
    words += prose.split(/\s+/).filter((token) => /[\p{L}\p{N}]/u.test(token)).length;
  }
  return {
    documents: index.documents.length,
    chars,
    words,
    pagesByWords: Math.round(words / WORDS_PER_PAGE),
    pagesByChars: Math.round(chars / CHARS_PER_PAGE),
  };
}

export function strategyMetrics(index: IndexFile, strategy: Strategy): StrategyMetrics {
  const data = index.strategies[strategy];
  const sizes = data.chunks.map((chunk) => chunk.end - chunk.start).sort((a, b) => a - b);
  const blocks = emptyKinds();
  const broken = emptyKinds();
  let repeatedChars = 0;
  let uncoveredChars = 0;
  for (const document of index.documents) {
    const chunks = data.chunks.filter((chunk) => chunk.file === document.file);
    const text = new CodePointText(document.text);
    const covered = new Uint8Array(text.length);
    for (const chunk of chunks) covered.fill(1, chunk.start, chunk.end);
    const coveredChars = covered.reduce((sum, value) => sum + value, 0);
    repeatedChars += chunks.reduce((sum, chunk) => sum + chunk.end - chunk.start, 0) - coveredChars;
    for (let position = 0; position < text.length; position++) {
      if (!covered[position] && /\S/.test(text.slice(position, position + 1))) uncoveredChars++;
    }
    for (const block of document.blocks) {
      const kind = kindOf(block.type);
      blocks[kind]++;
      if (!chunks.some((chunk) => chunk.start <= block.start && block.end <= chunk.end)) broken[kind]++;
    }
  }
  const total = sizes.reduce((sum, value) => sum + value, 0);
  const corpusChars = corpusMetrics(index).chars;
  return {
    strategy,
    chunks: data.chunks.length,
    size: {
      min: sizes[0] ?? 0,
      avg: Math.round(total / Math.max(sizes.length, 1)),
      p95: sizes[Math.max(Math.ceil(sizes.length * P95) - 1, 0)] ?? 0,
      max: sizes.at(-1) ?? 0,
    },
    repeatedChars,
    repeatedShare: repeatedChars / Math.max(corpusChars, 1),
    multiSectionChunks: data.chunks.filter((chunk) => chunk.sections.length > 1).length,
    uncoveredChars,
    blocks,
    broken,
    promptTokens: data.promptTokens,
    tokensPerChunk: data.promptTokens / Math.max(data.chunks.length, 1),
    chunkingMs: data.chunkingMs,
    embeddingMs: data.embeddingMs,
  };
}
