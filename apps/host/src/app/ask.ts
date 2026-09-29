import { readFileSync } from "node:fs";
import { Agent } from "../core/index.ts";
import type { ResolvedConfig } from "./config.ts";
import { type CreateModel, createConfiguredModel } from "./model.ts";

export type AskHandlerOptions = Readonly<{ createModel: CreateModel; getConfig: () => ResolvedConfig }>;

/** Реплика без поиска по документам; RAG-режим появится с заданием, которое его вводит. */
export function createAskHandler(options: AskHandlerOptions): (text: string) => Promise<string> {
  return (text) => {
    const model = createConfiguredModel(options.getConfig(), options.createModel);
    const system = readFileSync(new URL("./system.md", import.meta.url), "utf8").trim();
    return new Agent(model, system).respond(text);
  };
}
