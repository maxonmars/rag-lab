export { answerWithRag, type RagAnswer, type StageTimings } from "./answer.ts";
export { type CalibrationOptions, type CalibrationResult, calibrateThreshold } from "./calibration.ts";
export {
  type CitationEvalOptions,
  type CitationEvalResult,
  type CitationProgress,
  evaluateCitations,
} from "./citationEval.ts";
export type { CitationMetrics } from "./citationMetrics.ts";
export { describeCitationProblem, renderCitedAnswer } from "./citationRender.ts";
export type { CitationProblem, CitedAnswer } from "./citations.ts";
export { type CompareOptions, type CompareResult, compareIndex } from "./compare.ts";
export { EMBED_BATCH_SIZE, type EmbedBatch, type EmbeddingPort, type ModelInfo } from "./embeddings.ts";
export { describeRagError, RagError, type RagErrorCode } from "./errors.ts";
export type { ModeMetrics } from "./evalMetrics.ts";
export { type EvalOptions, type EvalProgress, type EvalResult, evaluateQuestions } from "./evaluation.ts";
export { type IndexOptions, type IndexResult, indexCorpus, type ProgressEvent, type StrategyStats } from "./indexer.ts";
export { createOllamaEmbeddings, type OllamaOptions } from "./ollama.ts";
export {
  checkRetrievalParams,
  MAX_TOP_K,
  RETRIEVAL_MODES,
  type RetrievalMode,
  type RetrievalParams,
  SIMILARITY_RANGE,
  usesFilter,
} from "./retrieval.ts";
export { openIndex, type SearchHit, type SearchIndex } from "./search.ts";
export { type ChunkParams, STRATEGIES, type Strategy } from "./types.ts";
