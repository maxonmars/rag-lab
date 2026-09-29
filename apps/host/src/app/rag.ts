import { join, resolve } from "node:path";
import type { CliView } from "../adapters/cli/index.ts";
import {
  type CompareResult,
  compareIndex,
  createOllamaEmbeddings,
  type EmbeddingPort,
  type IndexResult,
  indexCorpus,
  type OllamaOptions,
} from "../features/rag/index.ts";
import type { ResolvedConfig } from "./config.ts";

export type CreateEmbeddings = (options: OllamaOptions) => EmbeddingPort;

export type RagHandlerOptions = Readonly<{
  cwd: string;
  getConfig: () => ResolvedConfig;
  view: CliView;
  createEmbeddings?: CreateEmbeddings | undefined;
}>;

export type RagOutcome = Readonly<{ lines: readonly string[]; path: string }>;

const integer = (value: number) =>
  Math.round(value)
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, " ");

function indexLines(result: IndexResult): string[] {
  const strategies = (["fixed", "structure"] as const).map((name) => {
    const stats = result.strategies[name];
    const seconds = (stats.embeddingMs / 1000).toFixed(1);
    return `${name}: ${integer(stats.chunks)} чанков, токенов ${integer(stats.promptTokens)}, эмбеддинги ${seconds} с`;
  });
  return [
    `Документов: ${result.documents}, символов: ${integer(result.chars)}`,
    `Модель: ${result.model.name}, digest ${result.model.digest.slice(0, 12)}, размерность ${result.model.dimension}`,
    ...strategies,
  ];
}

function compareLines(result: CompareResult): string[] {
  return (["fixed", "structure"] as const).map((name) => {
    const metrics = result.strategies[name];
    const broken = Object.values(metrics.broken).reduce((sum, count) => sum + count, 0);
    return `${name}: ${integer(metrics.chunks)} чанков, размер ${integer(metrics.size.min)}–${integer(metrics.size.max)}, разорванных блоков ${broken}`;
  });
}

export function createRagHandlers(options: RagHandlerOptions) {
  const files = () => {
    const values = options.getConfig().values;
    const outputDir = resolve(options.cwd, values["rag.outputDir"]);
    return { values, indexFile: join(outputDir, "index.json"), reportFile: join(outputDir, "comparison.md") };
  };
  return {
    async index(): Promise<RagOutcome> {
      const { values, indexFile } = files();
      const createEmbeddings = options.createEmbeddings ?? createOllamaEmbeddings;
      const result = await indexCorpus({
        inputDir: resolve(options.cwd, values["rag.inputDir"]),
        outputFile: indexFile,
        params: {
          chunkSizeChars: values["rag.chunkSizeChars"],
          overlapChars: values["rag.overlapChars"],
          minChunkChars: values["rag.minChunkChars"],
        },
        embeddings: createEmbeddings({
          baseUrl: values["rag.embeddingBaseUrl"],
          model: values["rag.embeddingModel"],
          timeoutMs: values["rag.embeddingTimeoutMs"],
        }),
        onProgress: (event) =>
          options.view.progress(
            `${event.strategy}: ${event.stage === "chunked" ? "разбиение" : "эмбеддинги"}, чанков ${event.chunks}`,
          ),
      });
      return { lines: indexLines(result), path: result.path };
    },
    async compare(): Promise<RagOutcome> {
      const { indexFile, reportFile } = files();
      const result = await compareIndex({ indexFile, reportFile });
      return { lines: compareLines(result), path: result.path };
    },
  };
}
