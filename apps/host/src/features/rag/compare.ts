import { writeFileAtomic } from "./atomicWrite.ts";
import { readIndex } from "./indexFile.ts";
import { type CorpusMetrics, corpusMetrics, type StrategyMetrics, strategyMetrics } from "./metrics.ts";
import { renderReport } from "./report.ts";
import type { Strategy } from "./types.ts";

export type CompareOptions = Readonly<{ indexFile: string; reportFile: string }>;

export type CompareResult = Readonly<{
  path: string;
  corpus: CorpusMetrics;
  strategies: Readonly<Record<Strategy, StrategyMetrics>>;
}>;

/** Читает сохранённый индекс и пишет `comparison.md`; модель и корпус на диске не нужны. */
export async function compareIndex(options: CompareOptions): Promise<CompareResult> {
  const { index, bytes } = await readIndex(options.indexFile);
  const corpus = corpusMetrics(index);
  const strategies = { fixed: strategyMetrics(index, "fixed"), structure: strategyMetrics(index, "structure") };
  await writeFileAtomic(options.reportFile, renderReport({ index, bytes, corpus, strategies }));
  return { path: options.reportFile, corpus, strategies };
}
