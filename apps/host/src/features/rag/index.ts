export { type CompareOptions, type CompareResult, compareIndex } from "./compare.ts";
export { EMBED_BATCH_SIZE, type EmbedBatch, type EmbeddingPort, type ModelInfo } from "./embeddings.ts";
export { describeRagError, RagError, type RagErrorCode } from "./errors.ts";
export { type IndexOptions, type IndexResult, indexCorpus, type ProgressEvent, type StrategyStats } from "./indexer.ts";
export { createOllamaEmbeddings, type OllamaOptions } from "./ollama.ts";
export type { ChunkParams, Strategy } from "./types.ts";
