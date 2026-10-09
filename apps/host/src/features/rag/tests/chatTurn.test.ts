import { describe, expect, it } from "vitest";
import { EMPTY_DIALOG } from "../chat/dialog.ts";
import { renderTaskState } from "../chat/taskState.ts";
import { chatTurn } from "../chat/turn.ts";
import { readPrompt } from "../prompts.ts";
import { chatSetup, HITS, STATE } from "./chatSupport.ts";

describe("chatTurn: порядок шагов", () => {
  it("rewrite-filter: память → rewrite → поиск по переписанной строке → ответ", async () => {
    const { options, search, kinds } = chatSetup();
    const { turn, dialog } = await chatTurn(options);
    expect(kinds).toEqual(["state", "rewrite", "answer"]);
    expect(search).toHaveBeenCalledExactlyOnceWith(turn.query, "structure", 4);
    expect(turn.query).not.toBe(turn.question);
    expect(turn).toMatchObject({ question: "Что в первом файле?", hits: HITS, state: STATE, stateUpdated: true });
    expect(turn.answer).toMatchObject({ kind: "answer", problems: [] });
    expect(dialog).toEqual({ state: STATE, turns: [turn] });
  });

  it("compact: системное сообщение ответа — system, answer-compact.md и chat.md", async () => {
    const { options, ofKind } = chatSetup({ answerPrompt: "compact" });
    await chatTurn(options);
    expect(ofKind("answer")[0]?.messages[0]).toEqual({
      role: "system",
      content: `Системная инструкция.\n\n${readPrompt("answer-compact.md")}\n\n${readPrompt("chat.md")}`,
    });
  });

  it("baseline: память → ответ, поиск по исходному вопросу", async () => {
    const { options, search, kinds } = chatSetup({ mode: "baseline" });
    const { turn } = await chatTurn(options);
    expect(kinds).toEqual(["state", "answer"]);
    expect(search).toHaveBeenCalledExactlyOnceWith("Что в первом файле?", "structure", 4);
    expect(turn.timings.rewriteMs).toBe(0);
  });

  it("пустой отбор: память и rewrite вызваны, ответ — нет; память обновлена", async () => {
    const { options, kinds } = chatSetup({ threshold: 0.99 });
    const { turn, dialog } = await chatTurn(options);
    expect(kinds).toEqual(["state", "rewrite"]);
    expect(turn.hits).toEqual([]);
    expect(turn.answer).toMatchObject({ kind: "unknown", by: "retrieval", threshold: 0.99 });
    expect(dialog.state).toEqual(STATE);
  });

  it("ответ памяти без раздела «Цель» оставляет прежнюю память", async () => {
    const previous = { goal: "прежняя цель", clarifications: [], constraints: ["прежнее"] };
    const { options } = chatSetup(
      { dialog: { state: previous, turns: [] } },
      { state: () => "Не могу обновить память." },
    );
    const { turn, dialog } = await chatTurn(options);
    expect(turn).toMatchObject({ state: previous, stateUpdated: false });
    expect(dialog.state).toEqual(previous);
  });

  it("rewrite получает инструкцию rewrite-chat.md, память и последние реплики", async () => {
    const { options, ofKind } = chatSetup();
    const first = await chatTurn(options);
    await chatTurn({ ...options, dialog: first.dialog, question: "А что во втором?" });
    const [, second] = ofKind("rewrite");
    expect(second?.messages[0]?.content).toBe(readPrompt("rewrite-chat.md"));
    const user = String(second?.messages[1]?.content);
    expect(user).toContain(`## Память задачи\n\n${renderTaskState(STATE).replace(/^## /gm, "### ")}`);
    expect(user).toContain("- Пользователь: Что в первом файле?");
    expect(user.endsWith("## Вопрос\n\nА что во втором?")).toBe(true);
  });
});

describe("chatTurn: история и память в запросе ответа", () => {
  it("второй ход: первая пара уходит user/assistant-сообщениями, память — разделом в user-сообщении", async () => {
    const { options, ofKind } = chatSetup();
    const first = await chatTurn(options);
    await chatTurn({ ...options, dialog: first.dialog, question: "А что во втором?" });
    const request = ofKind("answer")[1];
    const messages = request?.messages ?? [];
    expect(messages.map((message) => message.role)).toEqual(["system", "user", "assistant", "user"]);
    expect(messages[1]).toEqual({ role: "user", content: "Что в первом файле?" });
    expect(messages[2]).toEqual({
      role: "assistant",
      content: expect.stringMatching(/^## Ответ\n\nТак[\s\S]*\n\n## Источники\n\n- \[1\] `a\.md` › /),
    });
    expect(String(messages[3]?.content)).toMatch(/^## Память задачи\n\n### Цель\n\nперевести проект на FEOD/);
    expect(String(messages[0]?.content)).toContain(readPrompt("chat.md"));
  });

  it("память задачи на втором ходу получает прошлую память и новое сообщение, без реплик ассистента", async () => {
    const { options, ofKind } = chatSetup();
    const first = await chatTurn(options);
    await chatTurn({ ...options, dialog: first.dialog, question: "Уточню: 40 страниц" });
    const request = ofKind("state")[1];
    expect(request?.messages[0]?.content).toBe(readPrompt("task-state.md"));
    const user = String(request?.messages[1]?.content);
    expect(user).toContain("## Текущая память задачи\n\n### Цель\n\nперевести проект на FEOD");
    expect(user).not.toContain("Так.");
    expect(user.endsWith("## Новое сообщение пользователя\n\nУточню: 40 страниц")).toBe(true);
  });

  it("окно historyTurns = 1 на третьем ходу содержит только второй ход", async () => {
    const { options, ofKind } = chatSetup({ historyTurns: 1 });
    let dialog = EMPTY_DIALOG;
    for (const question of ["Первый", "Второй", "Третий"]) {
      dialog = (await chatTurn({ ...options, dialog, question })).dialog;
    }
    const contents = ofKind("answer")[2]?.messages.map((message) => String(message.content));
    expect(contents).toHaveLength(4);
    expect(contents?.[1]).toBe("Второй");
    expect(contents?.[3]).toContain("## Вопрос\n\nТретий");
    expect(dialog.turns).toHaveLength(3);
  });
});

describe("chatTurn: ошибки", () => {
  it("пустой вопрос отклоняется до модели и поиска", async () => {
    const { options, search, requests } = chatSetup({ question: "  " });
    await expect(chatTurn(options)).rejects.toMatchObject({ code: "EMPTY_INPUT" });
    expect(search).not.toHaveBeenCalled();
    expect(requests).toHaveLength(0);
  });

  it.each([0, 21, 1.5, Number.NaN])("historyTurns = %s отклоняется до модели и поиска", async (historyTurns) => {
    const { options, search, requests } = chatSetup({ historyTurns });
    await expect(chatTurn(options)).rejects.toMatchObject({
      code: "INVALID_RETRIEVAL_PARAMS",
      data: { reason: "historyTurns" },
    });
    expect(search).not.toHaveBeenCalled();
    expect(requests).toHaveLength(0);
  });

  it("несогласованные параметры поиска отклоняются до модели", async () => {
    const { options, requests } = chatSetup({ candidateTopK: 2, topK: 3 });
    await expect(chatTurn(options)).rejects.toMatchObject({ data: { reason: "order" } });
    expect(requests).toHaveLength(0);
  });

  it("ошибка модели на шаге ответа отклоняет промис и не меняет входной диалог", async () => {
    const { options } = chatSetup({}, { failOn: { kind: "answer", call: 2 } });
    const first = await chatTurn(options);
    const before = structuredClone(first.dialog);
    await expect(chatTurn({ ...options, dialog: first.dialog, question: "Второй" })).rejects.toThrow("сбой модели");
    expect(first.dialog).toEqual(before);
    expect(first.dialog.turns).toHaveLength(1);
  });
});
