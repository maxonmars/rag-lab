import { type CitedAnswer, citationProblems, normalizeQuote } from "../citations.ts";
import type { DialogTurn } from "./dialog.ts";
import type { Scenario } from "./scenarios.ts";
import { renderTaskState } from "./taskState.ts";

export type ScenarioRun = Readonly<{ scenario: Scenario; turns: readonly DialogTurn[]; wallMs: number }>;

/** Метрики одного сценария; цель и память проверяются по подстрокам ключей, а не по смыслу. */
export type ScenarioMetrics = Readonly<{
  id: string;
  turns: number;
  answers: number;
  withSources: number;
  withVerifiedQuote: number;
  quotes: number;
  verifiedQuotes: number;
  unknownByRetrieval: number;
  unknownByModel: number;
  goalKept: number;
  memoryChecks: number;
  memoryKept: number;
  stateFormatFailures: number;
  withProblems: number;
  wallMs: number;
}>;

type Answered = Extract<CitedAnswer, { kind: "answer" }>;

const count = <T>(items: readonly T[], test: (item: T) => boolean): number => items.filter(test).length;

export const answeredOf = ({ answer }: DialogTurn): Answered | undefined =>
  answer.kind === "answer" ? answer : undefined;

const isUnknownBy = ({ answer }: DialogTurn, by: "model" | "retrieval"): boolean =>
  answer.kind === "unknown" && answer.by === by;

/** Цель сохранена, если каждый ключ цели сценария — подстрока нормализованной цели из памяти. */
export function goalKept(scenario: Scenario, turn: DialogTurn): boolean {
  const goal = normalizeQuote(turn.state.goal);
  return scenario.goalKeys.every((key) => goal.includes(normalizeQuote(key)));
}

/** Ключи памяти, которые к ходу `turnNumber` (с 1) уже заданы пользователем; `held` — найден в памяти после хода. */
export function memoryOnTurn(scenario: Scenario, turn: DialogTurn, turnNumber: number) {
  const state = normalizeQuote(renderTaskState(turn.state));
  const due = scenario.memory.filter(({ fromTurn }) => turnNumber >= fromTurn);
  return { due: due.length, held: count(due, ({ key }) => state.includes(normalizeQuote(key))) };
}

export function scenarioMetrics({ scenario, turns, wallMs }: ScenarioRun): ScenarioMetrics {
  const quotes = turns.flatMap((turn) => answeredOf(turn)?.quotes ?? []);
  const memory = turns.map((turn, index) => memoryOnTurn(scenario, turn, index + 1));
  return {
    id: scenario.id,
    turns: turns.length,
    answers: count(turns, (turn) => answeredOf(turn) !== undefined),
    withSources: count(turns, (turn) => answeredOf(turn)?.sources.some((source) => source.hit !== undefined) ?? false),
    withVerifiedQuote: count(turns, (turn) => answeredOf(turn)?.quotes.some((quote) => quote.verified) ?? false),
    quotes: quotes.length,
    verifiedQuotes: count(quotes, (quote) => quote.verified),
    unknownByRetrieval: count(turns, (turn) => isUnknownBy(turn, "retrieval")),
    unknownByModel: count(turns, (turn) => isUnknownBy(turn, "model")),
    goalKept: count(turns, (turn) => goalKept(scenario, turn)),
    memoryChecks: memory.reduce((sum, item) => sum + item.due, 0),
    memoryKept: memory.reduce((sum, item) => sum + item.held, 0),
    stateFormatFailures: count(turns, (turn) => !turn.stateUpdated),
    withProblems: count(turns, (turn) => citationProblems(turn.answer).length > 0),
    wallMs,
  };
}
