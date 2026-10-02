import type { Command, CommandView, ConfigRow } from "../adapters/cli/index.ts";
import { sections } from "./markdown.ts";
import type { RagOutcome } from "./rag.ts";
import type { RagReply } from "./ragAnswer.ts";
import { settingEntries } from "./settings.ts";

const descriptions = sections(new URL("./commands.md", import.meta.url));

type CommandContext = {
  ask: (text: string) => Promise<string>;
  config: () => readonly ConfigRow[];
  ragIndex: () => Promise<RagOutcome>;
  ragCompare: () => Promise<RagOutcome>;
  ragAsk: (text: string) => Promise<RagReply>;
  ragMode: () => boolean;
  setRagMode: (enabled: boolean) => readonly string[];
  ragCalibrate: () => Promise<RagOutcome>;
  ragEval: () => Promise<RagOutcome>;
  ragCitations: () => Promise<RagOutcome>;
  view: CommandView;
};

function ragIndexCommands(context: CommandContext): Command[] {
  return [
    {
      name: "rag index",
      arguments: [],
      description: descriptions["rag index"] ?? "",
      run: async () => {
        const outcome = await context.ragIndex();
        context.view.indexBuilt(outcome.lines, outcome.path);
        return "continue";
      },
    },
    {
      name: "rag compare",
      arguments: [],
      description: descriptions["rag compare"] ?? "",
      run: async () => {
        const outcome = await context.ragCompare();
        context.view.comparisonSaved(outcome.lines, outcome.path);
        return "continue";
      },
    },
    {
      name: "rag calibrate",
      arguments: [],
      description: descriptions["rag calibrate"] ?? "",
      run: async () => {
        const outcome = await context.ragCalibrate();
        context.view.calibrationSaved(outcome.lines, outcome.path);
        return "continue";
      },
    },
  ];
}

function ragAnswerCommands(context: CommandContext): Command[] {
  const mode =
    (enabled: boolean): Command["run"] =>
    async () => {
      context.view.ragMode(context.setRagMode(enabled));
      return "continue";
    };
  return [
    {
      name: "rag ask",
      arguments: ["<текст...>"],
      description: descriptions["rag ask"] ?? "",
      run: async (args) => {
        const reply = await context.ragAsk(args.join(" "));
        context.view.ragAnswer(reply.answer, reply.fragments);
        return "continue";
      },
    },
    { name: "rag on", arguments: [], description: descriptions["rag on"] ?? "", run: mode(true) },
    { name: "rag off", arguments: [], description: descriptions["rag off"] ?? "", run: mode(false) },
    {
      name: "rag eval",
      arguments: [],
      description: descriptions["rag eval"] ?? "",
      run: async () => {
        const outcome = await context.ragEval();
        context.view.evalSaved(outcome.lines, outcome.path);
        return "continue";
      },
    },
    {
      name: "rag citations",
      arguments: [],
      description: descriptions["rag citations"] ?? "",
      run: async () => {
        const outcome = await context.ragCitations();
        context.view.evalSaved(outcome.lines, outcome.path);
        return "continue";
      },
    },
  ];
}

function askCommand(context: CommandContext): Command {
  return {
    name: "ask",
    arguments: ["<текст...>"],
    description: descriptions.ask ?? "",
    run: async (args) => {
      const text = args.join(" ");
      if (context.ragMode()) {
        const reply = await context.ragAsk(text);
        context.view.ragAnswer(reply.answer, reply.fragments);
      } else context.view.answer(await context.ask(text));
      return "continue";
    },
  };
}

export function createCommands(context: CommandContext): readonly Command[] {
  const commands: Command[] = [
    askCommand(context),
    {
      name: "help",
      arguments: [],
      aliases: ["--help", "-h"],
      description: descriptions.help ?? "",
      run: async () => {
        context.view.help(
          commands,
          settingEntries.filter((entry) => !entry.secret),
        );
        return "continue";
      },
    },
    {
      name: "config show",
      arguments: [],
      description: descriptions["config show"] ?? "",
      run: async () => {
        context.view.config(context.config());
        return "continue";
      },
    },
    ...ragIndexCommands(context),
    ...ragAnswerCommands(context),
    {
      name: "exit",
      arguments: [],
      description: descriptions.exit ?? "",
      run: async () => "exit",
    },
  ];
  return commands;
}
