import type { CliView } from "../adapters/cli/index.ts";
import { answerWithRag, type EvalResult, evaluateQuestions, openIndex, type SearchHit } from "../features/rag/index.ts";
import { answerPlain, systemPrompt } from "./ask.ts";
import type { ResolvedConfig } from "./config.ts";
import { type CreateEmbeddings, configuredEmbeddings, ragPaths } from "./embeddings.ts";
import { type CreateModel, createConfiguredModel } from "./model.ts";
import type { RagOutcome } from "./rag.ts";

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
  return [
    `Ответы с RAG: стратегия ${values["rag.chunkStrategy"]}, top-${values["rag.topK"]}.`,
    "Обычные строки и /ask ищут по индексу.",
  ];
}

function evalLines(result: EvalResult, topK: number): string[] {
  const seconds = (ms: number) => (ms / 1000).toFixed(1);
  return [
    `Вопросов: ${result.questions}`,
    `Ожидаемые источники в top-${topK}: ${result.foundSources} из ${result.expectedSources}`,
    `Время ответов: без RAG ${seconds(result.plainMs)} с, с RAG ${seconds(result.ragMs)} с`,
  ];
}

export function createRagAnswerHandlers(options: RagAnswerHandlerOptions) {
  // Модель создаётся до индекса: ошибка ключа приходит раньше, чем обращение к Ollama.
  async function prepare() {
    const config = options.getConfig();
    const paths = ragPaths(options.cwd, config);
    const model = createConfiguredModel(config, options.createModel);
    const embeddings = configuredEmbeddings(config, options.createEmbeddings);
    const index = await openIndex({ indexFile: paths.indexFile, embeddings });
    const { values } = config;
    return { values, paths, model, index, strategy: values["rag.chunkStrategy"], topK: values["rag.topK"] };
  }

  return {
    async ask(text: string): Promise<RagReply> {
      const { model, index, strategy, topK } = await prepare();
      const result = await answerWithRag({
        question: text,
        index,
        strategy,
        topK,
        model,
        systemPrompt: systemPrompt(),
      });
      return { answer: result.answer, fragments: fragmentLines(result.hits) };
    },

    async evaluate(): Promise<RagOutcome> {
      const { values, paths, model, index, strategy, topK } = await prepare();
      const system = systemPrompt();
      const result = await evaluateQuestions({
        questionsFile: paths.questionsFile,
        reportFile: paths.evalFile,
        index,
        strategy,
        topK,
        meta: { questionsFile: values["rag.questionsFile"], llmModel: values["llm.model"] },
        askPlain: (question) => answerPlain(model, question),
        askRag: (question) => answerWithRag({ question, index, strategy, topK, model, systemPrompt: system }),
        onProgress: (event) => options.view.progress(`${event.id}: ${event.mode === "plain" ? "без RAG" : "с RAG"}`),
      });
      return { lines: evalLines(result, topK), path: result.path };
    },
  };
}
