import { describe, expect, it } from "vitest";
import { EMPTY_TASK_STATE, nestedTaskState, parseTaskState, renderTaskState } from "../chat/taskState.ts";

const STATE = {
  goal: "перевести проект с FSD на FEOD",
  clarifications: ["проект на TypeScript", "около 40 страниц"],
  constraints: ["deep imports запрещены"],
};

describe("renderTaskState", () => {
  it("пишет три раздела; пустые значения — «—»", () => {
    expect(renderTaskState(EMPTY_TASK_STATE)).toBe(
      "## Цель\n\n—\n\n## Уточнения\n\n—\n\n## Ограничения и термины\n\n—",
    );
    expect(renderTaskState(STATE)).toBe(
      [
        "## Цель\n\nперевести проект с FSD на FEOD",
        "## Уточнения\n\n- проект на TypeScript\n- около 40 страниц",
        "## Ограничения и термины\n\n- deep imports запрещены",
      ].join("\n\n"),
    );
  });

  it("nestedTaskState понижает заголовки разделов до третьего уровня", () => {
    expect(nestedTaskState(STATE)).toContain("### Цель\n\nперевести");
    expect(nestedTaskState(STATE)).not.toMatch(/^## /m);
  });
});

describe("parseTaskState", () => {
  it("возвращает то же состояние, которое записал renderTaskState", () => {
    expect(parseTaskState(renderTaskState(STATE))).toEqual(STATE);
  });

  it("«—» и «-» в разделе означают пустой список", () => {
    const raw = "## Цель\n\nцель\n\n## Уточнения\n\n—\n\n## Ограничения и термины\n\n-";
    expect(parseTaskState(raw)).toEqual({ goal: "цель", clarifications: [], constraints: [] });
  });

  it("игнорирует текст до первого раздела", () => {
    const raw = `Вот обновлённая память:\n\n${renderTaskState(STATE)}`;
    expect(parseTaskState(raw)).toEqual(STATE);
  });

  it("пункт «- —» означает пустой раздел, а не пункт со значением «—»", () => {
    const raw = "## Цель\n\nцель\n\n## Уточнения\n\n- факт\n\n## Ограничения и термины\n\n- —";
    expect(parseTaskState(raw)).toEqual({ goal: "цель", clarifications: ["факт"], constraints: [] });
  });

  it("принимает маркеры «-» и «*»", () => {
    const raw = "## Цель\n\nцель\n\n## Уточнения\n\n* первое\n- второе\n\n## Ограничения и термины\n\n* третье";
    expect(parseTaskState(raw)).toEqual({
      goal: "цель",
      clarifications: ["первое", "второе"],
      constraints: ["третье"],
    });
  });

  it("без раздела «Цель» — null", () => {
    expect(parseTaskState("## Уточнения\n\n- пункт")).toBeNull();
  });

  it("пустая «Цель» — null, в том числе «—»", () => {
    expect(parseTaskState("## Цель\n\n\n## Уточнения\n\n- пункт")).toBeNull();
    expect(parseTaskState(renderTaskState(EMPTY_TASK_STATE))).toBeNull();
  });

  it("отсутствующие списки дают пустые значения", () => {
    expect(parseTaskState("## Цель\n\nцель")).toEqual({ goal: "цель", clarifications: [], constraints: [] });
  });
});
