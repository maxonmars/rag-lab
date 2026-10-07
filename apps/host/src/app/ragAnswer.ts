import type { CliView } from "../adapters/cli/index.ts";
import {
  answerWithRag,
  type CitationEvalResult,
  type EvalProgress,
  type EvalResult,
  evaluateCitations,
  evaluateQuestions,
  openIndex,
  RETRIEVAL_MODES,
  type RetrievalMode,
  renderCitedAnswer,
  type SearchHit,
  usesFilter,
} from "../features/rag/index.ts";
import { systemPrompt } from "./ask.ts";
import type { ResolvedConfig } from "./config.ts";
import { type CreateEmbeddings, configuredEmbeddings, ragPaths } from "./embeddings.ts";
import { type CreateModel, createConfiguredModel, modelLabel } from "./model.ts";
import type { RagOutcome } from "./rag.ts";
import { retrievalSettings } from "./retrieval.ts";

export type RagReply = Readonly<{ answer: string; fragments: readonly string[] }>;

export type RagAnswerHandlerOptions = Readonly<{
  cwd: string;
  getConfig: () => ResolvedConfig;
  createModel: CreateModel;
  createEmbeddings?: CreateEmbeddings | undefined;
  view: CliView;
}>;

/** Строка на фрагмент: ранг, файл, первый раздел, сходство; остальные разделы — суффикс `(+N)`. */
export function fragmentLines(hits: readonly SearchHit[]): string[] {
  return hits.map(({ rank, score, chunk }) => {
    const more = chunk.sections.length > 1 ? ` (+${chunk.sections.length - 1})` : "";
    return `${rank}. ${chunk.file} › ${chunk.sections[0] ?? chunk.title} · ${score.toFixed(2)}${more}`;
  });
}

export function modeLines(enabled: boolean, config: ResolvedConfig): string[] {
  if (!enabled) return ["Ответы без RAG."];
  const { values } = config;
  const mode = values["rag.retrievalMode"];
  const threshold = usesFilter(mode) ? `, порог ${values["rag.similarityThreshold"]}` : "";
  const limits = `кандидатов ${values["rag.candidateTopK"]}, итоговый top-${values["rag.topK"]}`;
  return [
    `Ответы с RAG: стратегия ${values["rag.chunkStrategy"]}, режим ${mode}, ${limits}${threshold}.`,
    "Обычные строки и /ask ищут по индексу.",
    `Ответы учитывают историю (последние ${values["rag.historyTurns"]} ходов) и память задачи; /rag state показывает память, /rag reset сбрасывает диалог.`,
  ];
}

const STEP_LABELS: Readonly<Record<EvalProgress["step"], string>> = {
  search: "поиск исходным вопросом",
  "query-rewrite": "переписывание запроса",
  baseline: "baseline",
  filter: "filter",
  rewrite: "rewrite",
  "rewrite-filter": "rewrite-filter",
};

const share = (part: number, whole: number): string => (whole === 0 ? "—" : `${part} из ${whole}`);

function evalLines(result: EvalResult, topK: number): string[] {
  const modes = RETRIEVAL_MODES.map((mode) => {
    const metrics = result.metrics[mode];
    const mrr = metrics.mrr === null ? "—" : metrics.mrr.toFixed(2);
    return `${mode}: hit@${topK} ${share(metrics.hitQuestions, metrics.positives)}, MRR ${mrr}, источники ${share(metrics.foundPairs, metrics.expectedPairs)}, отрицательные с контекстом ${share(metrics.nonEmptyNegatives, metrics.negatives)}`;
  });
  return [`Вопросов: ${result.questions}`, `Длительность прогона: ${(result.wallMs / 1000).toFixed(1)} с`, ...modes];
}

function citationLines(result: CitationEvalResult, mode: RetrievalMode): string[] {
  const { metrics: m } = result;
  return [
    `Вопросов: ${result.questions}, режим ${mode}`,
    `Положительные: с источниками ${share(m.withSources, m.positives)}, с цитатами ${share(m.withQuotes, m.positives)}, ожидаемый файл среди источников ${share(m.expectedCited, m.positives)}, «не знаю» ${share(m.positiveUnknown, m.positives)}`,
    `Отрицательные: «не знаю» ${share(m.unknownByRetrieval + m.unknownByModel, m.negatives)} (пустой контекст ${m.unknownByRetrieval}, моделью ${m.unknownByModel})`,
    `Цитаты дословно: ${share(m.verifiedQuotes, m.quotes)}; ответов без замечаний: ${share(m.clean, m.questions)}`,
    `Длительность прогона: ${(result.wallMs / 1000).toFixed(1)} с`,
  ];
}

// Параметры проверяются первыми, модель создаётся до индекса: ошибка ключа приходит раньше, чем обращение к Ollama.
export async function prepareRag(options: RagAnswerHandlerOptions) {
  const config = options.getConfig();
  const retrieval = retrievalSettings(config);
  const paths = ragPaths(options.cwd, config);
  const model = createConfiguredModel(config, options.createModel);
  const embeddings = configuredEmbeddings(config, options.createEmbeddings);
  const index = await openIndex({ indexFile: paths.indexFile, embeddings });
  return { values: config.values, paths, model, modelName: modelLabel(config), index, retrieval };
}

export function createRagAnswerHandlers(options: RagAnswerHandlerOptions) {
  const prepare = () => prepareRag(options);

  return {
    async ask(text: string): Promise<RagReply> {
      const { values, model, index, retrieval } = await prepare();
      const mode = values["rag.retrievalMode"];
      const result = await answerWithRag({
        question: text,
        index,
        model,
        systemPrompt: systemPrompt(),
        mode,
        ...retrieval,
      });
      return { answer: renderCitedAnswer(result.answer), fragments: fragmentLines(result.hits) };
    },

    async evaluate(): Promise<RagOutcome> {
      const { values, paths, model, modelName, index, retrieval } = await prepare();
      const result = await evaluateQuestions({
        questionsFile: paths.questionsFile,
        reportFile: paths.evalFile,
        index,
        model,
        systemPrompt: systemPrompt(),
        ...retrieval,
        meta: { questionsFile: values["rag.questionsFile"], llmModel: modelName },
        onProgress: (event) => options.view.progress(`${event.id}: ${STEP_LABELS[event.step]}`),
      });
      return { lines: evalLines(result, retrieval.topK), path: result.path };
    },

    async citations(): Promise<RagOutcome> {
      const { values, paths, model, modelName, index, retrieval } = await prepare();
      const mode = values["rag.retrievalMode"];
      const result = await evaluateCitations({
        questionsFile: paths.questionsFile,
        reportFile: paths.citationsFile,
        index,
        model,
        systemPrompt: systemPrompt(),
        mode,
        ...retrieval,
        meta: { questionsFile: values["rag.questionsFile"], llmModel: modelName },
        onProgress: (event) => options.view.progress(`${event.id}: ответ с источниками`),
      });
      return { lines: citationLines(result, mode), path: result.path };
    },
  };
}
