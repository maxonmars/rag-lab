import { readFileSync } from "node:fs";
import { Agent, AgentError, type ModelPort } from "../../core/index.ts";
import { renderRagMessage } from "./context.ts";
import type { SearchHit, SearchIndex } from "./search.ts";
import type { Strategy } from "./types.ts";

export type RagAnswer = Readonly<{ answer: string; hits: readonly SearchHit[]; contextChars: number }>;

export type RagAnswerOptions = Readonly<{
  question: string;
  index: SearchIndex;
  strategy: Strategy;
  topK: number;
  model: ModelPort;
  systemPrompt: string;
}>;

/** Поиск → сообщение с фрагментами → Agent; системная инструкция — та же, что без RAG, плюс prompts/answer.md. */
export async function answerWithRag(options: RagAnswerOptions): Promise<RagAnswer> {
  const question = options.question.trim();
  if (!question) throw new AgentError("EMPTY_INPUT");
  const hits = await options.index.search(question, options.strategy, options.topK);
  const message = renderRagMessage(question, hits);
  const instruction = readFileSync(new URL("./prompts/answer.md", import.meta.url), "utf8").trim();
  const answer = await new Agent(options.model, `${options.systemPrompt}\n\n${instruction}`).respond(message);
  return { answer, hits, contextChars: [...message].length };
}
