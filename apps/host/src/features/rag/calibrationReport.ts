import { filesList, tableCell } from "./format.ts";
import type { ControlQuestion } from "./questions.ts";
import type { RetrievalParams } from "./retrieval.ts";
import type { SearchHit, SearchIndex } from "./search.ts";
import type { Strategy } from "./types.ts";

export type CalibrationQuestion = Readonly<{ question: ControlQuestion; candidates: readonly SearchHit[] }>;

export type ThresholdRow = Readonly<{
  threshold: number;
  keptPairs: number;
  /** Пары, найденные baseline, но потерянные порогом. */
  lost: readonly Readonly<{ id: string; file: string }>[];
  emptyNegatives: number;
  meanHits: number;
}>;

export type CalibrationReportData = Readonly<{
  now: Date;
  index: SearchIndex;
  strategy: Strategy;
  params: RetrievalParams;
  questionsFile: string;
  items: readonly CalibrationQuestion[];
  rows: readonly ThresholdRow[];
  baselinePairs: number;
  expectedPairs: number;
  recommended: number;
}>;

const score = (hit: SearchHit | undefined): string => (hit ? hit.score.toFixed(3) : "—");

function header(data: CalibrationReportData): string[] {
  const { index, params } = data;
  const negatives = data.items.filter(({ question }) => question.sources.length === 0).length;
  return [
    "# Калибровка порога релевантности",
    "",
    `Прогон ${data.now.toISOString()}. Вопросы: \`${data.questionsFile}\` (${data.items.length}, отрицательных ${negatives}). Один поиск исходной формулировкой на вопрос.`,
    `Индекс создан ${index.createdAt}, модель эмбеддингов \`${index.model.name}\` (digest ${index.model.digest.slice(0, 12)}).`,
    `Поиск: стратегия ${data.strategy}, кандидатов ${params.candidateTopK}, итоговый top-${params.topK}. Текущее значение rag.similarityThreshold: ${params.threshold} (калибровка его не меняет).`,
    "",
  ];
}

function thresholdTable(data: CalibrationReportData): string[] {
  const rows = data.rows.map((row) => {
    const mark = row.threshold === data.recommended ? "да" : "";
    const cells = [
      row.threshold.toFixed(2),
      row.keptPairs,
      row.lost.length,
      row.emptyNegatives,
      row.meanHits.toFixed(1),
    ];
    return `| ${[...cells, mark].join(" | ")} |`;
  });
  return [
    "## Пороги",
    "",
    `Baseline — первые ${data.params.topK} кандидатов без порога: найдено ${data.baselinePairs} из ${data.expectedPairs} ожидаемых пар «вопрос — файл».`,
    "",
    "| Порог | Сохранено пар | Потеряно пар | Отрицательные с пустым контекстом | Чанков в среднем | Рекомендован |",
    "|---|---|---|---|---|---|",
    ...rows,
    "",
    `Рекомендуемый порог: ${data.recommended.toFixed(2)}. Выбор — лексикографический максимум: сохранённые пары, затем пустые контексты отрицательных вопросов, затем порог; потеря источника не компенсируется отсечением отрицательного вопроса.`,
    "Выбор сделан по точным значениям сходства, а не по округлённым в таблицах.",
    "",
  ];
}

function lostPairs(data: CalibrationReportData): string[] {
  const lines = data.rows.flatMap((row) =>
    row.lost.map(({ id, file }) => `- порог ${row.threshold.toFixed(2)}: ${id}, \`${file}\``),
  );
  const none = ["Нет: ни один порог сетки не потерял ожидаемый файл."];
  return ["## Потерянные пары", "", ...(lines.length > 0 ? lines : none), ""];
}

function questionTable(data: CalibrationReportData): string[] {
  const rows = data.items.map(({ question, candidates }) => {
    const expected = candidates.find((hit) => question.sources.includes(hit.chunk.file));
    const cells = [question.id, tableCell(filesList(question.sources)), score(candidates[0]), score(expected)];
    return `| ${cells.join(" | ")} |`;
  });
  return [
    "## Вопросы",
    "",
    "| Вопрос | Ожидаемые источники | Лучшее сходство | Лучшее сходство ожидаемого файла |",
    "|---|---|---|---|",
    ...rows,
    "",
    "Значения округлены до трёх знаков только для отображения. «—» у ожидаемого файла — его чанков нет среди кандидатов; у отрицательных вопросов ожидаемых файлов нет.",
    "",
  ];
}

/** Отчёт `rag-calibration.md`: таблица порогов, потерянные пары и лучшее сходство по вопросам. */
export function renderCalibrationReport(data: CalibrationReportData): string {
  return [...header(data), ...thresholdTable(data), ...lostPairs(data), ...questionTable(data)].join("\n");
}
