import { Agent, AgentError, type ModelPort } from "../../core/index.ts";
import { renderRagMessage } from "./context.ts";
import { readPrompt } from "./prompts.ts";
import { checkRetrievalParams, type RetrievalMode, type RetrievalParams, usesRewrite } from "./retrieval.ts";
import { rewriteQuery } from "./rewrite.ts";
import type { SearchHit, SearchIndex } from "./search.ts";
import { selectForMode } from "./select.ts";
import { timed, timedSync } from "./timing.ts";
import type { Strategy } from "./types.ts";

/** Длительности этапов, мс; для режимов без rewrite `rewriteMs` равен 0. */
export type StageTimings = Readonly<{ rewriteMs: number; searchMs: number; selectMs: number; generateMs: number }>;

export type RagAnswer = Readonly<{
  answer: string;
  hits: readonly SearchHit[];
  contextChars: number;
  /** Строка, по которой выполнен поиск: исходный вопрос или результат rewrite. */
  query: string;
  candidates: readonly SearchHit[];
  timings: StageTimings;
}>;

export type RagAnswerOptions = RetrievalParams &
  Readonly<{
    question: string;
    index: SearchIndex;
    strategy: Strategy;
    mode: RetrievalMode;
    model: ModelPort;
    systemPrompt: string;
  }>;

export type GenerationOptions = Readonly<{
  model: ModelPort;
  systemPrompt: string;
  question: string;
  hits: readonly SearchHit[];
}>;

/** Ответ по готовым hits: поиск и rewrite не выполняются, вопрос остаётся исходным; `contextChars` — кодовые точки сообщения. */
export async function generateAnswer(
  options: GenerationOptions,
): Promise<Readonly<{ answer: string; contextChars: number }>> {
  const message = renderRagMessage(options.question, options.hits);
  const instruction = readPrompt("answer.md");
  const answer = await new Agent(options.model, `${options.systemPrompt}\n\n${instruction}`).respond(message);
  return { answer, contextChars: [...message].length };
}

/** Rewrite (по режиму) → поиск кандидатов → отбор → генерация; системная инструкция — та же, что без RAG, плюс prompts/answer.md. */
export async function answerWithRag(options: RagAnswerOptions): Promise<RagAnswer> {
  const question = options.question.trim();
  if (!question) throw new AgentError("EMPTY_INPUT");
  checkRetrievalParams(options);
  const rewritten = usesRewrite(options.mode)
    ? await timed(() => rewriteQuery(question, options.model))
    : { value: question, ms: 0 };
  const search = await timed(() => options.index.search(rewritten.value, options.strategy, options.candidateTopK));
  const selection = timedSync(() => selectForMode(options.mode, search.value, options));
  const { hits } = selection.value;
  const generation = await timed(() =>
    generateAnswer({ model: options.model, systemPrompt: options.systemPrompt, question, hits }),
  );
  return {
    answer: generation.value.answer,
    hits,
    contextChars: generation.value.contextChars,
    query: rewritten.value,
    candidates: search.value,
    timings: { rewriteMs: rewritten.ms, searchMs: search.ms, selectMs: selection.ms, generateMs: generation.ms },
  };
}
