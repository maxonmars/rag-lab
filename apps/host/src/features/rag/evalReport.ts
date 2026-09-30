import { integer, tableCell } from "./format.ts";
import type { ControlQuestion } from "./questions.ts";
import type { SearchHit, SearchIndex } from "./search.ts";
import type { Strategy } from "./types.ts";

export type QuestionResult = Readonly<{
  question: ControlQuestion;
  hits: readonly SearchHit[];
  found: readonly string[];
  firstRank: number | null;
  contextChars: number;
  plainAnswer: string;
  ragAnswer: string;
  plainMs: number;
  ragMs: number;
}>;

export type EvalReportData = Readonly<{
  now: Date;
  index: SearchIndex;
  strategy: Strategy;
  topK: number;
  questionsFile: string;
  llmModel: string;
  results: readonly QuestionResult[];
}>;

const seconds = (ms: number): string => (ms / 1000).toFixed(1);
const files = (sources: readonly string[]): string =>
  sources.length > 0 ? sources.map((s) => `\`${s}\``).join(", ") : "—";

function quoteBlock(text: string): string[] {
  return text
    .replaceAll("\r\n", "\n")
    .split("\n")
    .map((line) => (line ? `> ${line}` : ">"));
}

function header(data: EvalReportData): string[] {
  const { index } = data;
  return [
    "# Контрольные вопросы: ответы без RAG и с RAG",
    "",
    `Прогон ${data.now.toISOString()}. Вопросы: \`${data.questionsFile}\` (${data.results.length}).`,
    `Индекс создан ${index.createdAt}, модель эмбеддингов \`${index.model.name}\` (digest ${index.model.digest.slice(0, 12)}).`,
    `Модель ответов: \`${data.llmModel}\`. Поиск: стратегия ${data.strategy}, top-${data.topK}, косинусная близость, линейный перебор.`,
    "",
  ];
}

function summaryRow(result: QuestionResult): string {
  const expected = result.question.sources.length;
  const found = expected > 0 ? `${result.found.length} из ${expected}` : "—";
  const rank = result.firstRank === null ? "—" : String(result.firstRank);
  const cells = [result.question.id, found, rank, integer(result.contextChars)];
  return `| ${[...cells, seconds(result.plainMs), seconds(result.ragMs)].join(" | ")} |`;
}

function summary(data: EvalReportData): string[] {
  const expected = data.results.reduce((sum, result) => sum + result.question.sources.length, 0);
  const found = data.results.reduce((sum, result) => sum + result.found.length, 0);
  return [
    "## Сводка",
    "",
    "| Вопрос | Ожидаемые источники в top-K | Ранг первого | Контекст, символов | Без RAG, с | С RAG, с |",
    "|---|---|---|---|---|---|",
    ...data.results.map(summaryRow),
    "",
    `Найдено ожидаемых источников: ${found} из ${expected}.`,
    "",
    "Измерено: время ответа (один прогон). Вычислено: сходство, ранги, попадание ожидаемых файлов в top-K.",
    "Качество ответов здесь не оценивается — оценка автора в experiments/feod-rag/README.md.",
    "",
  ];
}

function hitRow(hit: SearchHit, expected: readonly string[]): string {
  const { chunk } = hit;
  const mark = expected.length === 0 ? "—" : expected.includes(chunk.file) ? "да" : "нет";
  const sections = tableCell(chunk.sections.join("; "));
  return `| ${hit.rank} | ${hit.score.toFixed(3)} | \`${chunk.file}\` | ${sections} | ${mark} |`;
}

function section(result: QuestionResult): string[] {
  const { question } = result;
  return [
    `## ${question.id}. ${question.question}`,
    "",
    `**Ожидание.** ${question.expectation}`,
    "",
    `**Ожидаемые источники:** ${files(question.sources)}`,
    "",
    "### Найденные фрагменты",
    "",
    "| Ранг | Сходство | Файл | Разделы | Ожидаемый |",
    "|---|---|---|---|---|",
    ...result.hits.map((hit) => hitRow(hit, question.sources)),
    "",
    "### Ответ без RAG",
    "",
    ...quoteBlock(result.plainAnswer),
    "",
    "### Ответ с RAG",
    "",
    ...quoteBlock(result.ragAnswer),
    "",
  ];
}

/** Отчёт `rag-eval.md`: измерения и ответы обоих режимов; оценки качества в него не входят. */
export function renderEvalReport(data: EvalReportData): string {
  return [...header(data), ...summary(data), ...data.results.flatMap(section)].join("\n");
}
