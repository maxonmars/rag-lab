import { nestedTaskState, type TaskState } from "./chat/taskState.ts";
import { fence } from "./format.ts";
import type { SearchHit } from "./search.ts";

function fragment(hit: SearchHit): string {
  const { chunk } = hit;
  const mark = fence(chunk.text);
  return [
    `### Фрагмент ${hit.rank}`,
    "",
    `- Файл: \`${chunk.file}\``,
    `- Документ: ${chunk.title}`,
    `- Разделы: ${chunk.sections.join("; ")}`,
    "",
    `${mark}markdown`,
    chunk.text,
    mark,
  ].join("\n");
}

/** Сообщение пользователя в режиме RAG: память задачи (если есть), найденные фрагменты, затем вопрос; инструкции модели здесь нет. */
export function renderRagMessage(question: string, hits: readonly SearchHit[], memory?: TaskState): string {
  const remembered = memory === undefined ? [] : [`## Память задачи\n\n${nestedTaskState(memory)}`];
  return [...remembered, "## Фрагменты документации", ...hits.map(fragment), `## Вопрос\n\n${question}`].join("\n\n");
}
