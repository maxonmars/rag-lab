import { CliView, runCli, type Terminal } from "../adapters/cli/index.ts";
import { DeepSeekModel, type DeepSeekOptions } from "../adapters/llm/index.ts";
import type { ModelPort } from "../core/index.ts";
import { createAskHandler } from "./ask.ts";
import { createCommands } from "./commands.ts";
import { parseOptions, type ResolvedConfig, resolveConfig, showConfig } from "./config.ts";
import type { CreateEmbeddings } from "./embeddings.ts";
import { createRagHandlers } from "./rag.ts";
import { createRagAnswerHandlers, modeLines } from "./ragAnswer.ts";

export type RunOptions = Readonly<{
  argv: readonly string[];
  env: Readonly<Record<string, string | undefined>>;
  cwd: string;
  terminal: Terminal;
  createModel?: (options: DeepSeekOptions) => ModelPort;
  createEmbeddings?: CreateEmbeddings;
}>;

export async function run(options: RunOptions): Promise<number> {
  let config: ResolvedConfig;
  const view = new CliView(options.terminal.output, options.terminal.error);
  const getConfig = () => config;
  const createModel = options.createModel ?? ((settings: DeepSeekOptions) => new DeepSeekModel(settings));
  const { cwd, createEmbeddings } = options;
  const rag = createRagHandlers({ cwd, getConfig, view, createEmbeddings });
  const ragAnswer = createRagAnswerHandlers({ cwd, getConfig, createModel, createEmbeddings, view });
  let ragMode = false;
  const commands = createCommands({
    ask: createAskHandler({ createModel, getConfig }),
    config: () => showConfig(config),
    ragIndex: rag.index,
    ragCompare: rag.compare,
    ragCalibrate: rag.calibrate,
    ragAsk: ragAnswer.ask,
    ragMode: () => ragMode,
    setRagMode: (enabled) => {
      ragMode = enabled;
      return modeLines(enabled, config);
    },
    ragEval: ragAnswer.evaluate,
    ragCitations: ragAnswer.citations,
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
  return runCli(commands, command, options.terminal, view);
}
