import { describe, expect, it } from "vitest";
import { assistantHistoryText, type Dialog, type DialogTurn, EMPTY_DIALOG, historyMessages } from "../chat/dialog.ts";
import { EMPTY_TASK_STATE } from "../chat/taskState.ts";
import type { CitedAnswer } from "../citations.ts";
import { searchHit } from "./support.ts";

const HIT_A = searchHit(1, "a.md", 0.9);
const HIT_B = searchHit(2, "b.md", 0.8);

type Answer = Extract<CitedAnswer, { kind: "answer" }>;

const answered = (text: string, sources: Answer["sources"] = []): CitedAnswer => ({
  kind: "answer",
  text,
  sources,
  quotes: [],
  problems: [],
  raw: text,
});

function turn(question: string, answer: CitedAnswer): DialogTurn {
  return {
    question,
    query: question,
    hits: [],
    answer,
    state: EMPTY_TASK_STATE,
    stateUpdated: true,
    timings: { stateMs: 0, rewriteMs: 0, searchMs: 0, generateMs: 0 },
  };
}

const dialogOf = (...turns: DialogTurn[]): Dialog => ({ state: EMPTY_TASK_STATE, turns });

describe("assistantHistoryText", () => {
  it("убирает [N] и пробел перед ними, источники раскрывает в файл и раздел без дублей", () => {
    const answer = answered("Слои [1] такие [2], и так [1].", [
      { fragment: 1, hit: HIT_A },
      { fragment: 2, hit: HIT_B },
      { fragment: 3, hit: HIT_A },
      { fragment: 9, hit: undefined },
    ]);
    expect(assistantHistoryText(answer)).toBe(
      "Слои такие, и так.\n\nИсточники: `a.md` › Doc › a.md; `b.md` › Doc › b.md",
    );
  });

  it("ответ без раскрытых источников — «Источники: нет»", () => {
    expect(assistantHistoryText(answered("Текст."))).toBe("Текст.\n\nИсточники: нет");
  });

  it("отказ модели несёт текст и уточнение; без уточнения — только текст", () => {
    const refusal = {
      kind: "unknown",
      by: "model",
      text: "Нет сведений.",
      clarification: "О чём речь?",
      problems: [],
      raw: "",
    } as const;
    expect(assistantHistoryText(refusal)).toBe("Не знаю. Нет сведений.\n\nУточнение: О чём речь?");
    expect(assistantHistoryText({ ...refusal, clarification: "" })).toBe("Не знаю. Нет сведений.");
  });

  it("отказ по отбору — фиксированная фраза без порога и ближайших разделов", () => {
    const refusal = { kind: "unknown", by: "retrieval", threshold: 0.55, nearest: [HIT_A] } as const;
    expect(assistantHistoryText(refusal)).toBe("Не знаю: в документации не найдено фрагментов по этому вопросу.");
  });
});

describe("historyMessages", () => {
  const first = turn("Первый", answered("Один."));
  const second = turn("Второй", answered("Два."));
  const third = turn("Третий", answered("Три."));

  it("пустой диалог не даёт сообщений", () => {
    expect(historyMessages(EMPTY_DIALOG, 6)).toEqual([]);
  });

  it("берёт последние N ходов парами user/assistant в хронологическом порядке", () => {
    const messages = historyMessages(dialogOf(first, second, third), 2);
    expect(messages.map((message) => message.content)).toEqual([
      "Второй",
      "Два.\n\nИсточники: нет",
      "Третий",
      "Три.\n\nИсточники: нет",
    ]);
    expect(messages.map((message) => message.role)).toEqual(["user", "assistant", "user", "assistant"]);
  });

  it("окно больше числа ходов отдаёт все ходы", () => {
    expect(historyMessages(dialogOf(first, second), 6)).toHaveLength(4);
  });
});
