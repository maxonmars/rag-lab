import { createHash } from "node:crypto";
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import type { LoadedDocument } from "../corpus.ts";
import type { EmbedBatch, EmbeddingPort } from "../embeddings.ts";
import { parseBlocks } from "../markdown.ts";
import { CodePointText, sha256 } from "../text.ts";
import type { ChunkParams } from "../types.ts";

export const PARAMS: ChunkParams = { chunkSizeChars: 100, overlapChars: 20, minChunkChars: 40 };

export type FakeEmbeddings = EmbeddingPort & { calls: string[][]; failOnCall: number | undefined };

/** Детерминированные векторы из sha256 текста; `failOnCall` — номер вызова embed (с 1), который завершится ошибкой. */
export function fakeEmbeddings(dimension = 3): FakeEmbeddings {
  const port: FakeEmbeddings = {
    calls: [],
    failOnCall: undefined,
    async embed(texts): Promise<EmbedBatch> {
      port.calls.push([...texts]);
      if (port.failOnCall === port.calls.length) throw new Error("сбой эмбеддингов");
      return {
        vectors: texts.map((text) =>
          [...createHash("sha256").update(text).digest().subarray(0, dimension)].map((byte) => byte / 255),
        ),
        promptTokens: texts.reduce((sum, text) => sum + text.length, 0),
        loadDurationMs: 5,
      };
    },
    async describeModel() {
      return { name: "fake:latest", digest: "0123456789abcdef" };
    },
  };
  return port;
}

/** Вектор — число вхождений слов словаря в текст: близость запроса к чанку задаётся общими словами. */
export function keywordEmbeddings(vocabulary: readonly string[]): FakeEmbeddings {
  const count = (text: string, word: string) => text.toLowerCase().split(word).length - 1;
  const port = fakeEmbeddings(vocabulary.length);
  port.embed = async (texts): Promise<EmbedBatch> => {
    port.calls.push([...texts]);
    return {
      vectors: texts.map((text) => vocabulary.map((word) => count(text, word))),
      promptTokens: texts.length,
      loadDurationMs: 1,
    };
  };
  return port;
}

export function writeCorpus(root: string, files: Readonly<Record<string, string>>): void {
  for (const [file, text] of Object.entries(files)) {
    mkdirSync(dirname(join(root, file)), { recursive: true });
    writeFileSync(join(root, file), text);
  }
}

export function documentOf(text: string, file = "doc.md", title = "Doc"): LoadedDocument {
  const content = new CodePointText(text);
  return { file, source: `src/${file}`, title, hash: sha256(text), content, blocks: parseBlocks(content).blocks };
}
