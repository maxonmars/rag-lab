import { CliView, runCli, type Terminal } from "../adapters/cli/index.ts";
import { DeepSeekModel, LocalModel } from "../adapters/llm/index.ts";
import { type Dialog, EMPTY_DIALOG } from "../features/rag/index.ts";
import { createAskHandler } from "./ask.ts";
import { createCommands } from "./commands.ts";
import { parseOptions, type ResolvedConfig, resolveConfig, showConfig } from "./config.ts";
import type { CreateEmbeddings } from "./embeddings.ts";
import { type CreateModel, type ModelOptions, modelLabel } from "./model.ts";
import { createRagHandlers } from "./rag.ts";
import { createRagAnswerHandlers, modeLines } from "./ragAnswer.ts";
import { createRagChatHandlers, stateLines } from "./ragChat.ts";

export type RunOptions = Readonly<{
  argv: readonly string[];
  env: Readonly<Record<string, string | undefined>>;
  cwd: string;
  terminal: Terminal;
  createModel?: CreateModel;
  createEmbeddings?: CreateEmbeddings;
}>;

function defaultCreateModel(options: ModelOptions) {
  return options.provider === "local" ? new LocalModel(options) : new DeepSeekModel(options);
}

export async function run(options: RunOptions): Promise<number> {
  let config: ResolvedConfig;
  const view = new CliView(options.terminal.output, options.terminal.error);
  const getConfig = () => config;
  const createModel = options.createModel ?? defaultCreateModel;
  const { cwd, createEmbeddings } = options;
  const rag = createRagHandlers({ cwd, getConfig, view, createEmbeddings });
  const ragAnswer = createRagAnswerHandlers({ cwd, getConfig, createModel, createEmbeddings, view });
  const ragChat = createRagChatHandlers({ cwd, getConfig, createModel, createEmbeddings, view });
  let ragMode = false;
  let dialog: Dialog = EMPTY_DIALOG;
  const commands = createCommands({
    ask: createAskHandler({ createModel, getConfig }),
    modelLabel: () => modelLabel(config),
    config: () => showConfig(config),
    ragIndex: rag.index,
    ragCompare: rag.compare,
    ragCalibrate: rag.calibrate,
    ragAsk: ragAnswer.ask,
    ragChat: async (text) => {
      const result = await ragChat.chat(dialog, text);
      dialog = result.dialog;
      return result.reply;
    },
    ragState: () => stateLines(dialog),
    ragReset: () => {
      dialog = EMPTY_DIALOG;
      return ["Диалог и память задачи сброшены."];
    },
    ragMode: () => ragMode,
    setRagMode: (enabled) => {
      ragMode = enabled;
      return modeLines(enabled, config);
    },
    ragEval: ragAnswer.evaluate,
    ragCitations: ragAnswer.citations,
    ragDialog: ragChat.dialogs,
    view,
  });
  let command: string[];
  try {
    const parsed = parseOptions(
      options.argv,
      commands.flatMap((item) => item.aliases ?? []),
    );
    command = parsed.command;
    config = resolveConfig(parsed.flags, options.env, options.cwd);
  } catch (error) {
    view.error(error);
    return 1;
  }
  return runCli(commands, command, options.terminal, view, modelLabel(config));
}
