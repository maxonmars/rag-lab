import type { CitationFailure, CitationMetrics, CitationResult, StageStats } from "./citationMetrics.ts";
import { describeCitationProblem, renderCitedAnswer } from "./citationRender.ts";
import { citationProblems } from "./citations.ts";
import { filesList, outOf, quoteBlock, seconds, tableCell } from "./format.ts";
import { type RetrievalMode, type RetrievalParams, usesFilter } from "./retrieval.ts";
import type { SearchHit, SearchIndex } from "./search.ts";
import type { Strategy } from "./types.ts";

export type CitationReportData = Readonly<{
  now: Date;
  index: SearchIndex;
  strategy: Strategy;
  mode: RetrievalMode;
  params: RetrievalParams;
  questionsFile: string;
  llmModel: string;
  wallMs: number;
  results: readonly CitationResult[];
  metrics: CitationMetrics;
}>;

function header(data: CitationReportData): string[] {
  const { index, params, mode } = data;
  const threshold = usesFilter(mode) ? "применяется" : "в этом режиме не применяется";
  return [
    "# Источники, цитаты и режим «не знаю»",
    "",
    `Прогон ${data.now.toISOString()}. Вопросы: \`${data.questionsFile}\` (${data.results.length}). Фактическая длительность прогона: ${seconds(data.wallMs)} с.`,
    `Индекс создан ${index.createdAt}, модель эмбеддингов \`${index.model.name}\` (digest ${index.model.digest.slice(0, 12)}).`,
    `Модель ответов и переписывания запроса: \`${data.llmModel}\`. Поиск: стратегия ${data.strategy}, режим ${mode}, кандидатов ${params.candidateTopK}, итоговый top-${params.topK}, порог ${params.threshold} (${threshold}).`,
    "",
  ];
}

function summary({ metrics }: CitationReportData): string[] {
  const refused = metrics.unknownByRetrieval + metrics.unknownByModel;
  const rows: readonly (readonly [string, string])[] = [
    ["Положительные: ответ с источником из переданных фрагментов", outOf(metrics.withSources, metrics.positives)],
    ["Положительные: ответ с дословной цитатой", outOf(metrics.withQuotes, metrics.positives)],
    ["Положительные: ожидаемый файл среди источников", outOf(metrics.expectedCited, metrics.positives)],
    ["Положительные: «не знаю»", outOf(metrics.positiveUnknown, metrics.positives)],
    [
      "Отрицательные: «не знаю»",
      `${outOf(refused, metrics.negatives)} (пустой контекст ${metrics.unknownByRetrieval}, моделью ${metrics.unknownByModel})`,
    ],
    ["Цитаты, найденные дословно", outOf(metrics.verifiedQuotes, metrics.quotes)],
    ["Ответы без замечаний", outOf(metrics.clean, metrics.questions)],
    ["Ошибки модели (вопрос без ответа)", outOf(metrics.failed, metrics.questions)],
  ];
  return [
    "## Сводка",
    "",
    "| Показатель | Значение |",
    "|---|---|",
    ...rows.map(([name, value]) => `| ${name} | ${value} |`),
    "",
    "Положительный вопрос — с ожидаемыми источниками, отрицательный — без них; показатели считаются по своей группе вопросов.",
    "Источник засчитывается, если его номер есть среди переданных фрагментов; цитата — если после нормализации пробелов, регистра, «ё», Markdown-символов, тире и кавычек она является подстрокой текста указанного фрагмента.",
    "Измерено: время этапов, размер сообщения, ошибки модели. Вычислено: разбор ответа, проверка ссылок и цитат. Совпадение смысла ответа с цитатами здесь не оценивается — ручная оценка в README эксперимента. «—» — знаменатель равен нулю.",
    "",
  ];
}

const stageRow = (name: string, stats: StageStats | null): string =>
  stats === null
    ? `| ${name} | 0 | — | — |`
    : `| ${name} | ${stats.count} | ${seconds(stats.medianMs)} | ${seconds(stats.maxMs)} |`;

function timingSection({ metrics }: CitationReportData): string[] {
  const { timing } = metrics;
  return [
    "## Время этапов",
    "",
    "| Этап | Вопросов | Медиана, с | Максимум, с |",
    "|---|---|---|---|",
    stageRow("Переписывание запроса", timing.rewrite),
    stageRow("Поиск", timing.search),
    stageRow("Генерация ответа", timing.generation),
    stageRow("Все этапы", timing.total),
    "",
    "Переписывание — вызов модели для запроса поиска (режимы с rewrite); поиск — эмбеддинг запроса в Ollama и косинусный перебор; генерация — вызов модели с фрагментами, отказы по пустому контексту не учитываются; все этапы — сумма по вопросу. Вопросы с ошибкой модели не учитываются.",
    "",
  ];
}

function outcome(row: CitationResult): string {
  if ("failure" in row) return `ошибка \`${row.failure.code}\``;
  const { answer } = row.result;
  if (answer.kind === "answer") return "ответ";
  return answer.by === "retrieval" ? "не знаю (пустой контекст)" : "не знаю (модель)";
}

function describeFailure({ code, data, elapsedMs }: CitationFailure): string {
  const fields = Object.entries(data).map(([key, value]) => `${key} ${value}`);
  const details = fields.length > 0 ? ` (${fields.join(", ")})` : "";
  return `\`${code}\`${details} через ${seconds(elapsedMs)} с`;
}

function questionRow(row: CitationResult): string {
  const { question } = row;
  if ("failure" in row) {
    return `| ${[question.id, filesList(question.sources), outcome(row), ...Array<string>(6).fill("—")].join(" | ")} |`;
  }
  const { result } = row;
  const { answer } = result;
  const problems = citationProblems(answer).map(describeCitationProblem).join("; ");
  const cells =
    answer.kind === "answer"
      ? [
          outOf(answer.sources.filter((source) => source.hit !== undefined).length, answer.sources.length),
          outOf(answer.quotes.filter((quote) => quote.verified).length, answer.quotes.length),
        ]
      : ["—", "—"];
  const generated = answer.kind === "unknown" && answer.by === "retrieval" ? "—" : seconds(result.timings.generateMs);
  return `| ${[
    question.id,
    filesList(question.sources),
    outcome(row),
    result.candidates[0]?.score.toFixed(3) ?? "—",
    ...cells,
    result.timings.rewriteMs > 0 ? seconds(result.timings.rewriteMs) : "—",
    generated,
    problems === "" ? "—" : tableCell(problems),
  ].join(" | ")} |`;
}

function questionTable(data: CitationReportData): string[] {
  return [
    "## Вопросы",
    "",
    "| Вопрос | Ожидаемые источники | Исход | Лучшее сходство | Источники в контексте | Цитаты дословно | Rewrite, с | Генерация, с | Замечания |",
    "|---|---|---|---|---|---|---|---|---|",
    ...data.results.map(questionRow),
    "",
  ];
}

/** Таблица фрагментов, переданных модели, с `chunk_id`; пустой список — «Контекст пуст». */
export function fragmentTable(hits: readonly SearchHit[]): string[] {
  if (hits.length === 0) return ["Контекст пуст: модель не вызывалась."];
  return [
    "| Фрагмент | Сходство | Файл | Разделы | chunk_id |",
    "|---|---|---|---|---|",
    ...hits.map(
      ({ rank, score, chunk }) =>
        `| ${rank} | ${score.toFixed(3)} | \`${chunk.file}\` | ${tableCell(chunk.sections.join("; "))} | \`${chunk.chunk_id}\` |`,
    ),
  ];
}

function questionSection(row: CitationResult): string[] {
  const { question } = row;
  const head = [
    `## ${question.id}. ${question.question}`,
    "",
    `**Ожидание.** ${question.expectation}`,
    "",
    `**Ожидаемые источники:** ${filesList(question.sources)}`,
    "",
  ];
  if ("failure" in row) {
    return [...head, `**Ошибка модели:** ${describeFailure(row.failure)}; фрагменты и ответ не получены.`, ""];
  }
  const { result } = row;
  const { timings } = result;
  return [
    ...head,
    `**Запрос поиска:** ${result.query}`,
    "",
    "### Переданные фрагменты",
    "",
    ...fragmentTable(result.hits),
    "",
    "### Ответ",
    "",
    `Сообщение: ${result.contextChars} символов · rewrite ${seconds(timings.rewriteMs)} с · поиск ${seconds(timings.searchMs)} с · генерация ${seconds(timings.generateMs)} с`,
    "",
    ...quoteBlock(renderCitedAnswer(result.answer)),
    "",
  ];
}

/** Отчёт `rag-citations.md`: измерения и ответы одного режима; оценки смысла в него не входят. */
export function renderCitationReport(data: CitationReportData): string {
  return [
    ...header(data),
    ...summary(data),
    ...timingSection(data),
    ...questionTable(data),
    ...data.results.flatMap(questionSection),
  ].join("\n");
}
