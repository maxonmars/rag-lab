import { readFileSync } from "node:fs";
import { RagError } from "./errors.ts";

export type ControlQuestion = Readonly<{
  id: string;
  question: string;
  expectation: string;
  sources: readonly string[];
}>;

const HEADING = /^(q\d{2})\.\s+(\S.*)$/;
const NO_SOURCES = new Set(["—", "-"]);

function fieldValue(lines: readonly string[], label: string): string | undefined {
  return lines
    .find((line) => line.startsWith(label))
    ?.slice(label.length)
    .trim();
}

function parseSources(value: string): string[] {
  if (NO_SOURCES.has(value)) return [];
  return value
    .split(",")
    .map((item) =>
      item
        .trim()
        .replace(/^`+|`+$/g, "")
        .trim(),
    )
    .filter(Boolean);
}

function parseSection(section: string): ControlQuestion {
  const [heading = "", ...lines] = section.split("\n");
  const match = HEADING.exec(heading.trimEnd());
  if (!match?.[1] || !match[2]) throw new RagError("QUESTIONS_INVALID", { reason: "heading" });
  const id = match[1];
  const expectation = fieldValue(lines, "Ожидание:");
  if (!expectation) throw new RagError("QUESTIONS_INVALID", { reason: "expectation", id });
  const rawSources = fieldValue(lines, "Источники:");
  if (!rawSources) throw new RagError("QUESTIONS_INVALID", { reason: "sources", id });
  return { id, question: match[2], expectation, sources: parseSources(rawSources) };
}

/** Разбирает `## qNN. Вопрос` с однострочными «Ожидание:» и «Источники:»; текст до первого раздела — преамбула. */
export function parseQuestions(text: string): ControlQuestion[] {
  const sections = text.replaceAll("\r\n", "\n").split(/^## /m).slice(1);
  if (sections.length === 0) throw new RagError("QUESTIONS_INVALID", { reason: "empty" });
  const questions = sections.map(parseSection);
  const seen = new Set<string>();
  for (const { id } of questions) {
    if (seen.has(id)) throw new RagError("QUESTIONS_INVALID", { reason: "duplicate", id });
    seen.add(id);
  }
  return questions;
}

export function loadQuestions(path: string): ControlQuestion[] {
  let text: string;
  try {
    text = readFileSync(path, "utf8");
  } catch {
    throw new RagError("QUESTIONS_NOT_FOUND");
  }
  return parseQuestions(text);
}
