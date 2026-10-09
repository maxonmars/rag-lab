import { ANSWER_PROMPT_FILES, type AnswerPrompt } from "./answer.ts";
import type { ModeMetrics, QuestionResult } from "./evalMetrics.ts";
import { questionSection } from "./evalSections.ts";
import { filesList, integer, seconds } from "./format.ts";
import { foundSources } from "./questions.ts";
import { RETRIEVAL_MODES, type RetrievalMode, type RetrievalParams } from "./retrieval.ts";
import type { SearchIndex } from "./search.ts";
import type { Strategy } from "./types.ts";

export type EvalReportData = Readonly<{
  now: Date;
  index: SearchIndex;
  strategy: Strategy;
  params: RetrievalParams;
  questionsFile: string;
  llmModel: string;
  answerPrompt: AnswerPrompt;
  wallMs: number;
  results: readonly QuestionResult[];
  metrics: Readonly<Record<RetrievalMode, ModeMetrics>>;
}>;

const fixed = (value: number | null, digits = 2): string => (value === null ? "—" : value.toFixed(digits));
const share = (part: number, whole: number): string =>
  whole === 0 ? "—" : `${part} из ${whole} (${(part / whole).toFixed(2)})`;

function header(data: EvalReportData): string[] {
  const { index, params } = data;
  return [
    "# Сравнение режимов поиска: baseline, filter, rewrite, rewrite-filter",
    "",
    `Прогон ${data.now.toISOString()}. Вопросы: \`${data.questionsFile}\` (${data.results.length}). Фактическая длительность прогона: ${seconds(data.wallMs)} с.`,
    `Индекс создан ${index.createdAt}, модель эмбеддингов \`${index.model.name}\` (digest ${index.model.digest.slice(0, 12)}).`,
    `Модель ответов и переписывания запроса: \`${data.llmModel}\`. Шаблон ответа: \`${data.answerPrompt}\` (prompts/${ANSWER_PROMPT_FILES[data.answerPrompt]}). Поиск: стратегия ${data.strategy}, косинусная близость, линейный перебор; кандидатов ${params.candidateTopK}, итоговый top-${params.topK}, порог ${params.threshold} (используется в filter и rewrite-filter).`,
    "",
  ];
}

function modeRow(mode: RetrievalMode, metrics: ModeMetrics): string {
  const cells = [
    mode,
    share(metrics.hitQuestions, metrics.positives),
    fixed(metrics.mrr, 3),
    share(metrics.foundPairs, metrics.expectedPairs),
    share(metrics.nonEmptyNegatives, metrics.negatives),
    fixed(metrics.meanHits, 1),
    integer(metrics.meanContextChars),
    seconds(metrics.totalMs),
  ];
  return `| ${cells.join(" | ")} |`;
}

function modeSummary(data: EvalReportData): string[] {
  const topK = data.params.topK;
  return [
    "## Сводка режимов",
    "",
    `| Режим | hit@${topK} | MRR | Покрытие источников | Отрицательные с непустым контекстом | Чанков в среднем | Сообщение, символов в среднем | Время этапов, с |`,
    "|---|---|---|---|---|---|---|---|",
    ...RETRIEVAL_MODES.map((mode) => modeRow(mode, data.metrics[mode])),
    "",
    `Положительный вопрос — с ожидаемыми источниками, отрицательный — без них. hit@${topK}, MRR и покрытие считаются только по положительным вопросам, последняя доля — только по отрицательным; «—» — знаменатель равен нулю.`,
    "hit@K — доля вопросов, у которых итоговые чанки содержат хотя бы один ожидаемый файл; MRR — среднее 1/позиция первого ожидаемого чанка (0, если его нет);",
    "покрытие — найденные уникальные пары «вопрос — ожидаемый файл» из всех ожидаемых. Метрики считаются по файлам итоговых чанков: это не оценка релевантности чанков и не качество ответа.",
    "Время режима — сумма его этапов, включая общие с парным режимом поиск и rewrite; сумма времён четырёх режимов не равна длительности прогона.",
    "",
  ];
}

function questionRow(result: QuestionResult): string {
  const { question } = result;
  const cells = RETRIEVAL_MODES.map((mode) => {
    const { hits } = result.outcomes[mode].selection;
    const found =
      question.sources.length === 0 ? "" : `${foundSources(question, hits).length} из ${question.sources.length}, `;
    return `${found}чанков ${hits.length}`;
  });
  return `| ${[question.id, filesList(question.sources), ...cells].join(" | ")} |`;
}

function questionSummary(data: EvalReportData): string[] {
  return [
    "## Сводка по вопросам",
    "",
    `| Вопрос | Ожидаемые источники | ${RETRIEVAL_MODES.join(" | ")} |`,
    `|---|---|${RETRIEVAL_MODES.map(() => "---").join("|")}|`,
    ...data.results.map(questionRow),
    "",
    "Измерено: время этапов, размер сообщения. Вычислено: сходство, отбор, попадание ожидаемых файлов. Качество ответов здесь не оценивается — оценка автора в README эксперимента.",
    "",
  ];
}

/** Отчёт `rag-eval.md`: измерения и ответы четырёх режимов; оценки качества в него не входят. */
export function renderEvalReport(data: EvalReportData): string {
  return [
    ...header(data),
    ...modeSummary(data),
    ...questionSummary(data),
    ...data.results.flatMap(questionSection),
  ].join("\n");
}
