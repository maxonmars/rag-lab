import type { CliView } from "../adapters/cli/index.ts";
import {
  type CalibrationResult,
  type CompareResult,
  calibrateThreshold,
  compareIndex,
  type IndexResult,
  indexCorpus,
  openIndex,
} from "../features/rag/index.ts";
import type { ResolvedConfig } from "./config.ts";
import { type CreateEmbeddings, configuredEmbeddings, ragPaths } from "./embeddings.ts";
import { retrievalSettings } from "./retrieval.ts";

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

function calibrationLines(result: CalibrationResult): string[] {
  const rows = result.rows.map(
    (row) =>
      `${row.threshold.toFixed(2)}: сохранено пар ${row.keptPairs}, потеряно ${row.lost.length}, отрицательных с пустым контекстом ${row.emptyNegatives}`,
  );
  return [
    `Вопросов: ${result.questions}; ожидаемых пар «вопрос — файл»: ${result.expectedPairs}, baseline находит ${result.baselinePairs}`,
    ...rows,
    `Рекомендуемый порог: ${result.recommended.toFixed(2)} (настройки не изменены)`,
  ];
}

export function createRagHandlers(options: RagHandlerOptions) {
  return {
    async index(): Promise<RagOutcome> {
      const config = options.getConfig();
      const { values } = config;
      const paths = ragPaths(options.cwd, config);
      const result = await indexCorpus({
        inputDir: paths.inputDir,
        outputFile: paths.indexFile,
        params: {
          chunkSizeChars: values["rag.chunkSizeChars"],
          overlapChars: values["rag.overlapChars"],
          minChunkChars: values["rag.minChunkChars"],
        },
        embeddings: configuredEmbeddings(config, options.createEmbeddings),
        onProgress: (event) =>
          options.view.progress(
            `${event.strategy}: ${event.stage === "chunked" ? "разбиение" : "эмбеддинги"}, чанков ${event.chunks}`,
          ),
      });
      return { lines: indexLines(result), path: result.path };
    },
    async compare(): Promise<RagOutcome> {
      const { indexFile, reportFile } = ragPaths(options.cwd, options.getConfig());
      const result = await compareIndex({ indexFile, reportFile });
      return { lines: compareLines(result), path: result.path };
    },
    /** Только поиск: модель генерации не создаётся, ключ DeepSeek не нужен. */
    async calibrate(): Promise<RagOutcome> {
      const config = options.getConfig();
      const retrieval = retrievalSettings(config);
      const paths = ragPaths(options.cwd, config);
      const embeddings = configuredEmbeddings(config, options.createEmbeddings);
      const index = await openIndex({ indexFile: paths.indexFile, embeddings });
      const result = await calibrateThreshold({
        questionsFile: paths.questionsFile,
        reportFile: paths.calibrationFile,
        index,
        ...retrieval,
        meta: { questionsFile: config.values["rag.questionsFile"] },
        onProgress: (event) => options.view.progress(`${event.id}: поиск`),
      });
      return { lines: calibrationLines(result), path: result.path };
    },
  };
}
