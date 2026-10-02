import { renderCitedAnswer } from "./citationRender.ts";
import { type ModeOutcome, type QuestionResult, stageTotalMs } from "./evalMetrics.ts";
import { filesList, quoteBlock, seconds, tableCell } from "./format.ts";
import type { ControlQuestion } from "./questions.ts";
import { RETRIEVAL_MODES, type RetrievalMode } from "./retrieval.ts";
import type { SearchHit } from "./search.ts";
import type { Selection } from "./select.ts";

function reason(selection: Selection, hit: SearchHit): string {
  if (selection.hits.includes(hit)) return "передан";
  return selection.belowThreshold.includes(hit) ? "ниже порога" : "вне top-K";
}

function candidateRow(hit: SearchHit, question: ControlQuestion, outcomes: readonly ModeOutcome[]): string {
  const { chunk } = hit;
  const expected = question.sources.length === 0 ? "—" : question.sources.includes(chunk.file) ? "да" : "нет";
  const cells = [hit.rank, hit.score.toFixed(3), `\`${chunk.file}\``, tableCell(chunk.sections.join("; ")), expected];
  return `| ${[...cells, ...outcomes.map((outcome) => reason(outcome.selection, hit))].join(" | ")} |`;
}

function candidateTable(question: ControlQuestion, modes: readonly RetrievalMode[], result: QuestionResult): string[] {
  const outcomes = modes.map((mode) => result.outcomes[mode]);
  const candidates = outcomes[0]?.candidates ?? [];
  return [
    `| Ранг | Сходство | Файл | Разделы | Ожидаемый | ${modes.join(" | ")} |`,
    `|---|---|---|---|---|${modes.map(() => "---").join("|")}|`,
    ...candidates.map((hit) => candidateRow(hit, question, outcomes)),
  ];
}

function answerBlock(mode: RetrievalMode, outcome: ModeOutcome): string[] {
  const { timings, selection } = outcome;
  const stages = [
    `rewrite ${seconds(timings.rewriteMs)} с`,
    `поиск ${seconds(timings.searchMs)} с`,
    `отбор ${timings.selectMs.toFixed(1)} мс`,
    `генерация ${seconds(timings.generateMs)} с`,
  ];
  return [
    `### Ответ ${mode}`,
    "",
    `Чанков передано: ${selection.hits.length} · сообщение: ${outcome.contextChars} символов · время этапов ${seconds(stageTotalMs(timings))} с (${stages.join(", ")})`,
    "",
    ...quoteBlock(renderCitedAnswer(outcome.answer)),
    "",
  ];
}

export function questionSection(result: QuestionResult): string[] {
  const { question } = result;
  return [
    `## ${question.id}. ${question.question}`,
    "",
    `**Ожидание.** ${question.expectation}`,
    "",
    `**Ожидаемые источники:** ${filesList(question.sources)}`,
    "",
    `**Исходный запрос:** ${question.question}`,
    "",
    `**Переписанный запрос:** ${result.rewrittenQuery}`,
    "",
    "### Кандидаты исходного запроса",
    "",
    ...candidateTable(question, ["baseline", "filter"], result),
    "",
    "### Кандидаты переписанного запроса",
    "",
    ...candidateTable(question, ["rewrite", "rewrite-filter"], result),
    "",
    ...RETRIEVAL_MODES.flatMap((mode) => answerBlock(mode, result.outcomes[mode])),
  ];
}
