import { join, resolve } from "node:path";
import { createOllamaEmbeddings, type EmbeddingPort, type OllamaOptions } from "../features/rag/index.ts";
import type { ResolvedConfig } from "./config.ts";

export type CreateEmbeddings = (options: OllamaOptions) => EmbeddingPort;

export function configuredEmbeddings(
  config: ResolvedConfig,
  create: CreateEmbeddings | undefined = createOllamaEmbeddings,
): EmbeddingPort {
  const { values } = config;
  return create({
    baseUrl: values["rag.embeddingBaseUrl"],
    model: values["rag.embeddingModel"],
    timeoutMs: values["rag.embeddingTimeoutMs"],
  });
}

export type RagPaths = Readonly<{
  inputDir: string;
  indexFile: string;
  reportFile: string;
  evalFile: string;
  calibrationFile: string;
  citationsFile: string;
  dialogReportFile: string;
  questionsFile: string;
  dialogFile: string;
}>;

export function ragPaths(cwd: string, config: ResolvedConfig): RagPaths {
  const { values } = config;
  const outputDir = resolve(cwd, values["rag.outputDir"]);
  return {
    inputDir: resolve(cwd, values["rag.inputDir"]),
    indexFile: join(outputDir, "index.json"),
    reportFile: join(outputDir, "comparison.md"),
    evalFile: join(outputDir, "rag-eval.md"),
    calibrationFile: join(outputDir, "rag-calibration.md"),
    citationsFile: join(outputDir, "rag-citations.md"),
    dialogReportFile: join(outputDir, "rag-dialog.md"),
    questionsFile: resolve(cwd, values["rag.questionsFile"]),
    dialogFile: resolve(cwd, values["rag.dialogFile"]),
  };
}
