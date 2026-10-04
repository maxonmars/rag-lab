import { readFileSync } from "node:fs";
import { RagError } from "../errors.ts";

export type ScenarioMemoryKey = Readonly<{ fromTurn: number; key: string }>;

export type Scenario = Readonly<{
  id: string;
  title: string;
  goal: string;
  goalKeys: readonly string[];
  memory: readonly ScenarioMemoryKey[];
  messages: readonly string[];
}>;

const HEADING = /^(s\d+)\.\s+(\S.*)$/;
const MEMORY_LINE = /^-\s*(\d+):\s*(\S.*)$/;
const MESSAGE_LINE = /^\d+\.\s+(\S.*)$/;
const MEMORY_LABEL = "Память:";
const MESSAGES_LABEL = "Реплики:";

function fieldValue(lines: readonly string[], label: string): string | undefined {
  return lines
    .find((line) => line.startsWith(label))
    ?.slice(label.length)
    .trim();
}

/** Строки между меткой и следующей меткой раздела; без метки — пусто. */
function blockAfter(lines: readonly string[], label: string, until: string): string[] {
  const start = lines.findIndex((line) => line.trim() === label);
  if (start < 0) return [];
  const rest = lines.slice(start + 1);
  const end = rest.findIndex((line) => line.trim() === until);
  return (end < 0 ? rest : rest.slice(0, end)).map((line) => line.trim()).filter(Boolean);
}

function parseMessages(lines: readonly string[]): string[] {
  const start = lines.findIndex((line) => line.trim() === MESSAGES_LABEL);
  return start < 0 ? [] : lines.slice(start + 1).flatMap((line) => MESSAGE_LINE.exec(line.trim())?.[1] ?? []);
}

function parseMemory(lines: readonly string[], count: number, id: string): ScenarioMemoryKey[] {
  return blockAfter(lines, MEMORY_LABEL, MESSAGES_LABEL).map((line) => {
    const match = MEMORY_LINE.exec(line);
    const fromTurn = Number(match?.[1]);
    const key = match?.[2];
    if (key === undefined || fromTurn < 1 || fromTurn > count)
      throw new RagError("SCENARIOS_INVALID", { reason: "memory", id });
    return { fromTurn, key: key.trim() };
  });
}

function parseSection(section: string): Scenario {
  const [heading = "", ...lines] = section.split("\n");
  const match = HEADING.exec(heading.trimEnd());
  if (!match?.[1] || !match[2]) throw new RagError("SCENARIOS_INVALID", { reason: "heading" });
  const id = match[1];
  const goal = fieldValue(lines, "Цель:");
  if (!goal) throw new RagError("SCENARIOS_INVALID", { reason: "goal", id });
  const goalKeys = (fieldValue(lines, "Ключи цели:") ?? "")
    .split(",")
    .map((key) => key.trim())
    .filter(Boolean);
  if (goalKeys.length === 0) throw new RagError("SCENARIOS_INVALID", { reason: "goalKeys", id });
  const messages = parseMessages(lines);
  if (messages.length === 0) throw new RagError("SCENARIOS_INVALID", { reason: "messages", id });
  return { id, title: match[2], goal, goalKeys, memory: parseMemory(lines, messages.length, id), messages };
}

/** Разбирает `## sN. Название` с полями «Цель:», «Ключи цели:», необязательной «Память:» и нумерованными «Реплики:»; текст до первого раздела — преамбула. */
export function parseScenarios(text: string): Scenario[] {
  const sections = text.replaceAll("\r\n", "\n").split(/^## /m).slice(1);
  if (sections.length === 0) throw new RagError("SCENARIOS_INVALID", { reason: "empty" });
  const scenarios = sections.map(parseSection);
  const seen = new Set<string>();
  for (const { id } of scenarios) {
    if (seen.has(id)) throw new RagError("SCENARIOS_INVALID", { reason: "duplicate", id });
    seen.add(id);
  }
  return scenarios;
}

export function loadScenarios(path: string): Scenario[] {
  let text: string;
  try {
    text = readFileSync(path, "utf8");
  } catch {
    throw new RagError("SCENARIOS_NOT_FOUND");
  }
  return parseScenarios(text);
}
