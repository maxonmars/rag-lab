import { type FragmentView, fragmentViews } from "./fragments.ts";
import type { IndexFile } from "./indexFile.ts";
import { BLOCK_KINDS, type CorpusMetrics, type StrategyMetrics } from "./metrics.ts";
import type { Strategy } from "./types.ts";

export type ReportData = Readonly<{
  index: IndexFile;
  bytes: number;
  corpus: CorpusMetrics;
  strategies: Readonly<Record<Strategy, StrategyMetrics>>;
}>;

const integer = (value: number): string =>
  Math.round(value)
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, " ");
const percent = (value: number): string => `${(value * 100).toFixed(1)}%`;

function fence(text: string): string {
  const longest = Math.max(2, ...[...text.matchAll(/`+/g)].map((match) => match[0].length));
  return "`".repeat(longest + 1);
}

function quote(text: string): string {
  return text.replaceAll("\n", "⏎").replaceAll("|", "\\|");
}

function row(label: string, fixed: string, structure: string): string {
  return `| ${label} | ${fixed} | ${structure} |`;
}

function metricRows({ strategies }: ReportData): string[] {
  const [f, s] = [strategies.fixed, strategies.structure];
  const both = (pick: (metrics: StrategyMetrics) => string) => [pick(f), pick(s)] as const;
  const brokenOf = (metrics: StrategyMetrics) =>
    BLOCK_KINDS.map((kind) => `${kind} ${metrics.broken[kind]}/${metrics.blocks[kind]}`).join(", ");
  return [
    row("Метрика", "fixed", "structure"),
    row("---", "---", "---"),
    row("Чанков", ...both((m) => integer(m.chunks))),
    row(
      "Размер чанка: мин / среднее / p95 / макс, символов",
      ...both(
        (m) => `${integer(m.size.min)} / ${integer(m.size.avg)} / ${integer(m.size.p95)} / ${integer(m.size.max)}`,
      ),
    ),
    row(
      "Повторённый текст, символов (доля корпуса)",
      ...both((m) => `${integer(m.repeatedChars)} (${percent(m.repeatedShare)})`),
    ),
    row("Чанков, захвативших несколько разделов", ...both((m) => integer(m.multiSectionChunks))),
    row("Блоков, не поместившихся целиком ни в один чанк (из всех блоков)", ...both(brokenOf)),
    row("Непокрытый текст, символов без пробелов", ...both((m) => integer(m.uncoveredChars))),
    row("Токены, измерено: сумма `prompt_eval_count`", ...both((m) => integer(m.promptTokens))),
    row("Токенов на чанк, вычислено: сумма / число чанков", ...both((m) => m.tokensPerChunk.toFixed(1))),
    row("Время разбиения, мс", ...both((m) => m.chunkingMs.toFixed(1))),
    row("Время эмбеддингов, с", ...both((m) => (m.embeddingMs / 1000).toFixed(1))),
  ];
}

function fragmentSection(view: FragmentView, number: number): string[] {
  const size = view.range.end - view.range.start;
  const mark = fence(view.text);
  const lines = [
    `### ${number}. ${view.spec.label}`,
    "",
    `Файл \`${view.spec.file}\`, диапазон ${view.range.start}–${view.range.end} (${integer(size)} символов).`,
    "",
    `${mark}markdown`,
    view.text,
    mark,
    "",
  ];
  for (const strategy of ["fixed", "structure"] as const) {
    const { whole, chunks } = view.strategies[strategy];
    lines.push(`**${strategy}**: чанков ${chunks.length}, целиком в одном чанке — ${whole ? "да" : "нет"}.`, "");
    lines.push(
      "| Чанк | Диапазон | Доля участка | Начало участка в чанке | Конец участка в чанке |",
      "|---|---|---|---|---|",
    );
    for (const chunk of chunks) {
      lines.push(
        `| \`${chunk.chunkId}\` | ${chunk.start}–${chunk.end} | ${percent(chunk.covered)} | ${quote(chunk.head)} | ${quote(chunk.tail)} |`,
      );
    }
    lines.push("");
  }
  return lines;
}

/** Отчёт `comparison.md`: измерения из индекса, без обращения к модели; выводы в него не входят. */
export function renderReport(data: ReportData): string {
  const { index, corpus } = data;
  return [
    "# Сравнение стратегий чанкинга",
    "",
    `Индекс создан ${index.createdAt}, формат ${index.formatVersion}, хеш корпуса \`${index.corpusHash.slice(0, 12)}\`.`,
    `Модель: \`${index.model.name}\`, digest \`${index.model.digest.slice(0, 12)}\`, размерность ${index.model.dimension}.`,
    `Параметры: размер ${index.params.chunkSizeChars}, перекрытие ${index.params.overlapChars}, минимальный чанк ${index.params.minChunkChars}; все размеры — кодовые точки Unicode.`,
    "",
    "## Корпус",
    "",
    "| Показатель | Значение |",
    "|---|---|",
    `| Документов | ${corpus.documents} |`,
    `| Символов | ${integer(corpus.chars)} |`,
    `| Слов вне блоков кода | ${integer(corpus.words)} |`,
    `| Страниц по 300 слов | ${corpus.pagesByWords} |`,
    `| Страниц по 1800 символов | ${corpus.pagesByChars} |`,
    "",
    "## Результаты",
    "",
    ...metricRows(data),
    "",
    `Размер \`index.json\`: ${(data.bytes / 1024 / 1024).toFixed(2)} МБ. Загрузка модели при прогреве: ${index.modelLoadMs.toFixed(0)} мс.`,
    "",
    "Измерено: число чанков, размеры, токены (сумма по пакетам из 8 текстов), время. Вычислено: токены на чанк — среднее,",
    "по отдельному чанку токены не измерялись. Время — один локальный прогон после прогрева; качество поиска не измерялось.",
    "",
    "## Ручное сравнение",
    "",
    ...fragmentViews(index).flatMap((view, position) => fragmentSection(view, position + 1)),
  ].join("\n");
}
