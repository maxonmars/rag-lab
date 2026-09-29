import type { Command, CommandView, ConfigRow } from "../adapters/cli/index.ts";
import { sections } from "./markdown.ts";
import type { RagOutcome } from "./rag.ts";
import { settingEntries } from "./settings.ts";

const descriptions = sections(new URL("./commands.md", import.meta.url));

type CommandContext = {
  ask: (text: string) => Promise<string>;
  config: () => readonly ConfigRow[];
  ragIndex: () => Promise<RagOutcome>;
  ragCompare: () => Promise<RagOutcome>;
  view: CommandView;
};

function ragCommands(context: CommandContext): Command[] {
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
  ];
}

export function createCommands(context: CommandContext): readonly Command[] {
  const commands: Command[] = [
    {
      name: "ask",
      arguments: ["<текст...>"],
      description: descriptions.ask ?? "",
      run: async (args) => {
        context.view.answer(await context.ask(args.join(" ")));
        return "continue";
      },
    },
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
    ...ragCommands(context),
    {
      name: "exit",
      arguments: [],
      description: descriptions.exit ?? "",
      run: async () => "exit",
    },
  ];
  return commands;
}
