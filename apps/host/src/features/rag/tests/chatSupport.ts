import { vi } from "vitest";
import type { ModelPort, ModelRequest } from "../../../core/index.ts";
import { renderTaskState, type TaskState } from "../chat/taskState.ts";
import type { ChatTurnOptions } from "../chat/turn.ts";
import { fakeSearchIndex, searchHit } from "./support.ts";

export type ChatKind = "state" | "rewrite" | "answer";

export const QUOTE = "Первый фрагмент подробно описывает порядок работы";
export const HITS = [searchHit(1, "a.md", 0.9, `${QUOTE} с модулем.`), searchHit(2, "b.md", 0.7, "Второй фрагмент.")];
export const REPLY = `## Ответ\n\nТак [1].\n\n## Источники\n\n- [1]\n\n## Цитаты\n\n- [1] «${QUOTE}»`;
export const STATE: TaskState = {
  goal: "перевести проект на FEOD",
  clarifications: ["проект на TypeScript"],
  constraints: [],
};

export type FakeChatModelOptions = Readonly<{
  state?: (user: string) => string;
  rewrite?: (user: string) => string;
  answer?: (user: string) => string;
  /** Номер вызова этого вида (с 1), который завершится ошибкой. */
  failOn?: Readonly<{ kind: ChatKind; call: number }>;
}>;

const kindOf = (request: ModelRequest): ChatKind => {
  const system = String(request.messages[0]?.content);
  if (system.includes("обновляешь память задачи")) return "state";
  return system.includes("переписываешь") ? "rewrite" : "answer";
};

/** Модель различает вызовы по системной инструкции: память задачи, rewrite, ответ по фрагментам. */
export function fakeChatModel(options: FakeChatModelOptions = {}) {
  const requests: ModelRequest[] = [];
  const kinds: ChatKind[] = [];
  const model: ModelPort = {
    async complete(request) {
      const kind = kindOf(request);
      requests.push(request);
      kinds.push(kind);
      if (options.failOn?.kind === kind && options.failOn.call === kinds.filter((item) => item === kind).length) {
        throw new Error("сбой модели");
      }
      const user = String(request.messages.at(-1)?.content);
      const replies = {
        state: options.state ?? (() => renderTaskState(STATE)),
        rewrite: options.rewrite ?? ((text: string) => `запрос: ${text.split("\n").at(-1)}`),
        answer: options.answer ?? (() => REPLY),
      };
      return { type: "text", content: replies[kind](user) };
    },
  };
  return { model, requests, kinds, ofKind: (kind: ChatKind) => requests.filter((_, i) => kinds[i] === kind) };
}

export function chatSetup(overrides: Partial<ChatTurnOptions> = {}, modelOptions: FakeChatModelOptions = {}) {
  const { index, search } = fakeSearchIndex(() => HITS);
  const fake = fakeChatModel(modelOptions);
  const options: ChatTurnOptions = {
    dialog: { state: { goal: "", clarifications: [], constraints: [] }, turns: [] },
    question: "  Что в первом файле?  ",
    index,
    strategy: "structure",
    mode: "rewrite-filter",
    candidateTopK: 4,
    topK: 3,
    threshold: 0.6,
    model: fake.model,
    systemPrompt: "Системная инструкция.",
    historyTurns: 6,
    ...overrides,
  };
  return { options, search: vi.mocked(search), ...fake };
}
