import { describe, expect, it } from "vitest";
import { HttpError } from "../../adapters/http/index.ts";
import { type Dialog, EMPTY_DIALOG } from "../../features/rag/index.ts";
import { createSessionStore } from "../ragSessions.ts";

const dialogWith = (goal: string): Dialog => ({ state: { goal, clarifications: [], constraints: [] }, turns: [] });

function store(maxSessions = 2, idleMs = 1000) {
  const clock = { value: 0 };
  return { clock, sessions: createSessionStore({ maxSessions, idleMs, now: () => clock.value }) };
}

function rejection(action: () => unknown): HttpError {
  try {
    action();
  } catch (error) {
    if (error instanceof HttpError) return error;
  }
  throw new Error("ожидалась HttpError");
}

describe("хранилище сессий rag serve", () => {
  it("без id создаёт новую сессию с пустым диалогом; после commit её можно продолжить", () => {
    const { sessions } = store();
    const first = sessions.begin();
    expect(first.dialog).toBe(EMPTY_DIALOG);
    sessions.commit(first.id, dialogWith("цель"));
    sessions.release(first.id);
    expect(sessions.begin(first.id)).toEqual({ id: first.id, dialog: dialogWith("цель") });
  });

  it("неудачный первый ход не создаёт сессию, неудачный следующий оставляет прежний диалог", () => {
    const { sessions } = store();
    const failed = sessions.begin("a");
    sessions.release(failed.id);
    expect(sessions.begin("a").dialog).toBe(EMPTY_DIALOG);
    sessions.commit("a", dialogWith("один"));
    sessions.release("a");
    sessions.begin("a");
    sessions.release("a");
    expect(sessions.begin("a").dialog).toEqual(dialogWith("один"));
    expect(sessions.delete("missing")).toBe(false);
  });

  it("параллельный ход той же сессии — 409 session_busy, после release ход возможен", () => {
    const { sessions } = store();
    sessions.begin("a");
    expect(rejection(() => sessions.begin("a"))).toMatchObject({ status: 409, code: "session_busy" });
    sessions.commit("a", EMPTY_DIALOG);
    sessions.release("a");
    expect(sessions.begin("a").id).toBe("a");
  });

  it("сессия старше idleMs не продолжается, занятая не истекает", () => {
    const { sessions, clock } = store(2, 1000);
    sessions.begin("a");
    sessions.commit("a", dialogWith("один"));
    sessions.release("a");
    clock.value = 1000;
    expect(sessions.begin("a").dialog).toEqual(dialogWith("один"));
    sessions.release("a");
    clock.value = 2001;
    expect(sessions.begin("a").dialog).toBe(EMPTY_DIALOG);
    clock.value = 10_000;
    expect(rejection(() => sessions.begin("a"))).toMatchObject({ code: "session_busy" });
  });

  it("при лимите вытесняет давно не использованную свободную сессию", () => {
    const { sessions, clock } = store(2, 10_000);
    for (const id of ["a", "b"]) {
      clock.value += 1;
      sessions.begin(id);
      sessions.commit(id, dialogWith(id));
      sessions.release(id);
    }
    clock.value += 1;
    sessions.begin("a");
    sessions.commit("a", dialogWith("a"));
    sessions.release("a");
    clock.value += 1;
    sessions.begin("c");
    sessions.commit("c", dialogWith("c"));
    sessions.release("c");
    expect(sessions.begin("a").dialog).toEqual(dialogWith("a"));
    sessions.release("a");
    expect(sessions.begin("b").dialog).toBe(EMPTY_DIALOG);
  });

  it("503 too_many_sessions, когда все сессии заняты ходом", () => {
    const { sessions } = store(2);
    sessions.begin("a");
    sessions.begin("b");
    expect(rejection(() => sessions.begin("c"))).toMatchObject({ status: 503, code: "too_many_sessions" });
  });

  it("delete удаляет завершённую сессию один раз", () => {
    const { sessions } = store();
    sessions.begin("a");
    expect(sessions.delete("a")).toBe(false);
    sessions.commit("a", EMPTY_DIALOG);
    sessions.release("a");
    expect(sessions.delete("a")).toBe(true);
    expect(sessions.delete("a")).toBe(false);
  });
});
