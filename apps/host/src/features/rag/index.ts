export { answerWithRag, type RagAnswer } from "./answer.ts";
export { type CompareOptions, type CompareResult, compareIndex } from "./compare.ts";
export { EMBED_BATCH_SIZE, type EmbedBatch, type EmbeddingPort, type ModelInfo } from "./embeddings.ts";
export { describeRagError, RagError, type RagErrorCode } from "./errors.ts";
export { type EvalOptions, type EvalProgress, type EvalResult, evaluateQuestions } from "./evaluation.ts";
export { type IndexOptions, type IndexResult, indexCorpus, type ProgressEvent, type StrategyStats } from "./indexer.ts";
export { createOllamaEmbeddings, type OllamaOptions } from "./ollama.ts";
export { openIndex, type SearchHit, type SearchIndex } from "./search.ts";
export { type ChunkParams, STRATEGIES, type Strategy } from "./types.ts";
