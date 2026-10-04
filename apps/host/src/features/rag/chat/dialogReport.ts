import { outOf, seconds } from "../format.ts";
import { type RetrievalMode, type RetrievalParams, usesFilter } from "../retrieval.ts";
import type { SearchIndex } from "../search.ts";
import type { Strategy } from "../types.ts";
import type { ScenarioMetrics, ScenarioRun } from "./dialogMetrics.ts";
import { scenarioSection } from "./dialogReportTurns.ts";

export type DialogReportData = Readonly<{
  now: Date;
  index: SearchIndex;
  strategy: Strategy;
  mode: RetrievalMode;
  params: RetrievalParams;
  historyTurns: number;
  scenariosFile: string;
  llmModel: string;
  wallMs: number;
  runs: readonly ScenarioRun[];
  metrics: readonly ScenarioMetrics[];
}>;

function header(data: DialogReportData): string[] {
  const { index, params, mode } = data;
  const threshold = usesFilter(mode) ? "применяется" : "в этом режиме не применяется";
  const turns = data.metrics.reduce((sum, item) => sum + item.turns, 0);
  return [
    "# RAG-чат: история, память задачи и источники",
    "",
    `Прогон ${data.now.toISOString()}. Сценарии: \`${data.scenariosFile}\` (${data.runs.length}, реплик ${turns}). Фактическая длительность прогона: ${seconds(data.wallMs)} с.`,
    `Индекс создан ${index.createdAt}, модель эмбеддингов \`${index.model.name}\` (digest ${index.model.digest.slice(0, 12)}).`,
    `Модель ответов, памяти задачи и переписывания запроса: \`${data.llmModel}\`. Поиск: стратегия ${data.strategy}, режим ${mode}, кандидатов ${params.candidateTopK}, итоговый top-${params.topK}, порог ${params.threshold} (${threshold}). Окно истории: ${data.historyTurns} ходов.`,
    "",
  ];
}

function summaryRow(item: ScenarioMetrics): string {
  const refused = `${item.unknownByRetrieval + item.unknownByModel} (пустой контекст ${item.unknownByRetrieval}, моделью ${item.unknownByModel})`;
  return `| ${[
    item.id,
    item.turns,
    outOf(item.withSources, item.turns),
    outOf(item.withVerifiedQuote, item.turns),
    outOf(item.verifiedQuotes, item.quotes),
    outOf(item.goalKept, item.turns),
    outOf(item.memoryKept, item.memoryChecks),
    refused,
    item.stateFormatFailures,
    item.withProblems,
    seconds(item.wallMs),
  ].join(" | ")} |`;
}

function summary(data: DialogReportData): string[] {
  return [
    "## Сводка",
    "",
    "| Сценарий | Ходов | Ответы с источником | Ответы с дословной цитатой | Цитаты дословно | Цель сохранена | Ключи памяти | «Не знаю» | Память не разобрана | Ответы с замечаниями | Длительность, с |",
    "|---|---|---|---|---|---|---|---|---|---|---|",
    ...data.metrics.map(summaryRow),
    "",
    "Каждый сценарий идёт в новом пустом диалоге. «Цель сохранена» — число ходов, на которых каждый ключ цели сценария является подстрокой цели из памяти после хода. «Ключи памяти» — пары «ход — ключ», где ключ, заданный пользователем к этому ходу, найден в памяти после хода. Сравнение подстрок после нормализации регистра, «ё», пробелов и Markdown-символов; смысл не оценивается.",
    "Источник засчитывается, если его номер есть среди переданных фрагментов; цитата — если после нормализации она является подстрокой текста указанного фрагмента. Смысл ответов здесь не оценивается — ручная оценка в README эксперимента. «—» — знаменатель равен нулю.",
    "Измерено: время этапов хода (память, rewrite, поиск, ответ). Вычислено: разбор ответов, проверка ссылок и цитат, сравнение ключей с памятью.",
    "",
  ];
}

/** Отчёт `rag-dialog.md`: измерения и ответы по сценариям; оценок смысла в нём нет. */
export function renderDialogReport(data: DialogReportData): string {
  return [...header(data), ...summary(data), ...data.runs.flatMap(scenarioSection)].join("\n");
}
