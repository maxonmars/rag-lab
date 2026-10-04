import { bodyOf, splitSections } from "../sections.ts";

/** Память задачи: что пользователь уже сказал о цели, уточнениях, ограничениях и терминах. */
export type TaskState = Readonly<{ goal: string; clarifications: readonly string[]; constraints: readonly string[] }>;

export const EMPTY_TASK_STATE: TaskState = { goal: "", clarifications: [], constraints: [] };

const GOAL_HEADING = "Цель";
const CLARIFICATIONS_HEADING = "Уточнения";
const CONSTRAINTS_HEADING = "Ограничения и термины";
const EMPTY_MARK = "—";
const EMPTY_BODIES = new Set([EMPTY_MARK, "-"]);
const LIST_ITEM = /^\s*[-*]\s+(.+?)\s*$/;

const list = (items: readonly string[]): string =>
  items.length > 0 ? items.map((item) => `- ${item}`).join("\n") : EMPTY_MARK;

export function renderTaskState(state: TaskState): string {
  return [
    `## ${GOAL_HEADING}\n\n${state.goal === "" ? EMPTY_MARK : state.goal}`,
    `## ${CLARIFICATIONS_HEADING}\n\n${list(state.clarifications)}`,
    `## ${CONSTRAINTS_HEADING}\n\n${list(state.constraints)}`,
  ].join("\n\n");
}

/** Память для вложения в сообщение под своим заголовком второго уровня: её разделы понижаются до `### `. */
export const nestedTaskState = (state: TaskState): string => renderTaskState(state).replace(/^## /gm, "### ");

/** Пункт «- —» — пустой раздел, записанный списком: так его пишет модель. */
function items(body: string): string[] {
  return body.split("\n").flatMap((line) => {
    const item = LIST_ITEM.exec(line)?.[1];
    return item === undefined || EMPTY_BODIES.has(item) ? [] : [item];
  });
}

/** `null` — в ответе нет непустой «Цели»: вызывающий оставляет прежнее состояние. */
export function parseTaskState(raw: string): TaskState | null {
  const sections = splitSections(raw);
  const goal = bodyOf(sections, GOAL_HEADING);
  if (goal === "" || EMPTY_BODIES.has(goal)) return null;
  return {
    goal,
    clarifications: items(bodyOf(sections, CLARIFICATIONS_HEADING)),
    constraints: items(bodyOf(sections, CONSTRAINTS_HEADING)),
  };
}
