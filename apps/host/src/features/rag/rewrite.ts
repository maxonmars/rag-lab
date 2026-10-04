import { Agent, type DialogMessage, type ModelPort } from "../../core/index.ts";
import { recentLines } from "./chat/dialog.ts";
import { nestedTaskState, type TaskState } from "./chat/taskState.ts";
import { RagError } from "./errors.ts";
import { readPrompt } from "./prompts.ts";

/** Память задачи и последние реплики диалога: по ним раскрываются отсылки вопроса. */
export type RewriteContext = Readonly<{ memory: TaskState; recent: readonly DialogMessage[] }>;

function chatMessage(question: string, context: RewriteContext): string {
  return [
    `## Память задачи\n\n${nestedTaskState(context.memory)}`,
    `## Последние реплики\n\n${recentLines(context.recent)}`,
    `## Вопрос\n\n${question}`,
  ].join("\n\n");
}

/** Один вызов Agent без истории и инструментов; ответ должен быть одной строкой, иначе исходный вопрос не подставляется. */
export async function rewriteQuery(question: string, model: ModelPort, context?: RewriteContext): Promise<string> {
  const instruction = readPrompt(context === undefined ? "rewrite.md" : "rewrite-chat.md");
  const message = context === undefined ? question : chatMessage(question, context);
  const query = (await new Agent(model, instruction).respond(message)).trim();
  if (/[\r\n]/.test(query)) throw new RagError("REWRITE_INVALID", { reason: "multiline" });
  if (query.startsWith("```")) throw new RagError("REWRITE_INVALID", { reason: "fence" });
  return query;
}
