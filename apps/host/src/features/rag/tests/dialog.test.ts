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
  it("ответ — разделы «Ответ», «Источники» с файлом и разделом, «Цитаты»; [N] сохраняются", () => {
    const answer: Answer = {
      kind: "answer",
      text: "Слои [1] такие [2].",
      problems: [],
      raw: "",
      sources: [
        { fragment: 1, hit: HIT_A },
        { fragment: 2, hit: HIT_B },
        { fragment: 9, hit: undefined },
      ],
      quotes: [{ fragment: 1, text: "цитата", hit: HIT_A, verified: true }],
    };
    expect(assistantHistoryText(answer)).toBe(
      "## Ответ\n\nСлои [1] такие [2].\n\n## Источники\n\n- [1] `a.md` › Doc › a.md\n- [2] `b.md` › Doc › b.md\n- [9]\n\n## Цитаты\n\n- [1] «цитата»",
    );
  });

  it("ответ с нарушением формата — только текст до первого заголовка второго уровня", () => {
    const raw = "Текст [1].\n\n## Источники\n\n- [1]\n\n## Цитаты\n\n- [1] «цитата»";
    expect(assistantHistoryText(answered(raw))).toBe("## Ответ\n\nТекст [1].");
  });

  it("отказ модели — разделы «Не знаю» и «Уточнение»; без уточнения — только «Не знаю»", () => {
    const refusal = {
      kind: "unknown",
      by: "model",
      text: "Нет сведений.",
      clarification: "О чём речь?",
      problems: [],
      raw: "",
    } as const;
    expect(assistantHistoryText(refusal)).toBe("## Не знаю\n\nНет сведений.\n\n## Уточнение\n\nО чём речь?");
    expect(assistantHistoryText({ ...refusal, clarification: "" })).toBe("## Не знаю\n\nНет сведений.");
  });

  it("отказ по отбору — фиксированная фраза без порога и ближайших разделов", () => {
    const refusal = { kind: "unknown", by: "retrieval", threshold: 0.55, nearest: [HIT_A] } as const;
    expect(assistantHistoryText(refusal)).toBe("## Не знаю\n\nВ документации не найдено фрагментов по этому вопросу.");
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
      "## Ответ\n\nДва.",
      "Третий",
      "## Ответ\n\nТри.",
    ]);
    expect(messages.map((message) => message.role)).toEqual(["user", "assistant", "user", "assistant"]);
  });

  it("окно больше числа ходов отдаёт все ходы", () => {
    expect(historyMessages(dialogOf(first, second), 6)).toHaveLength(4);
  });
});
