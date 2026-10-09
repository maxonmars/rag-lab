import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach } from "vitest";
import type { EvalOptions } from "../evaluation.ts";
import { type FakeModelOptions, fakeModel, fakeSearchIndex, searchHit } from "./support.ts";

export const QUESTIONS = [
  "# Вопросы",
  "",
  "## q01. Что в первом файле?",
  "Ожидание: первый файл.",
  "Источники: a.md",
  "",
  "## q02. Что в обоих файлах?",
  "Ожидание: оба файла.",
  "Источники: a.md, b.md",
  "",
  "## q03. Чего нет в документации?",
  "Ожидание: ответа нет.",
  "Источники: —",
].join("\n");

/** Кандидаты исходного вопроса и переписанного запроса (запрос начинается с «запрос: »). */
export const ORIGINAL = [searchHit(1, "c.md", 0.8), searchHit(2, "a.md", 0.7), searchHit(3, "b.md", 0.3)];
export const REWRITTEN = [searchHit(1, "a.md", 0.9), searchHit(2, "b.md", 0.7), searchHit(3, "c.md", 0.52)];

export const REPORT_NAME = "rag-eval.md";

export function evalRoot(): { path: string } {
  const state = { path: "" };
  beforeEach(() => {
    state.path = mkdtempSync(join(tmpdir(), "rag-lab-eval-"));
    writeFileSync(join(state.path, "questions.md"), QUESTIONS);
  });
  afterEach(() => {
    rmSync(state.path, { recursive: true, force: true });
  });
  return state;
}

/** `log` — общий журнал вызовов поиска и модели в порядке выполнения. */
export function setupEval(root: string, overrides: Partial<EvalOptions> = {}, modelOptions: FakeModelOptions = {}) {
  const log: string[] = [];
  const { index, search } = fakeSearchIndex((query) => {
    log.push(`search:${query}`);
    return query.startsWith("запрос: ") ? REWRITTEN : ORIGINAL;
  });
  const fake = fakeModel({ ...modelOptions, onCall: (kind) => log.push(kind) });
  const options: EvalOptions = {
    questionsFile: join(root, "questions.md"),
    reportFile: join(root, "out", REPORT_NAME),
    index,
    strategy: "structure",
    candidateTopK: 4,
    topK: 3,
    threshold: 0.65,
    model: fake.model,
    systemPrompt: "Системная инструкция.",
    answerPrompt: "default",
    meta: { questionsFile: "experiments/feod-retrieval/questions.md", llmModel: "deepseek-flash" },
    now: () => new Date("2026-09-29T12:00:00Z"),
    ...overrides,
  };
  return { options, search, log, requests: fake.requests, kinds: fake.kinds };
}
