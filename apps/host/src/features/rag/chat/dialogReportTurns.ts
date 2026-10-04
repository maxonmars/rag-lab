import { describeCitationProblem, renderCitedAnswer } from "../citationRender.ts";
import { fragmentTable } from "../citationReport.ts";
import { citationProblems } from "../citations.ts";
import { integer, outOf, quoteBlock, seconds, tableCell } from "../format.ts";
import type { DialogTurn } from "./dialog.ts";
import { answeredOf, goalKept, memoryOnTurn, type ScenarioRun } from "./dialogMetrics.ts";
import type { Scenario } from "./scenarios.ts";
import { renderTaskState } from "./taskState.ts";

const totalMs = ({ timings }: DialogTurn): number =>
  timings.stateMs + timings.rewriteMs + timings.searchMs + timings.generateMs;

function outcome({ answer }: DialogTurn): string {
  if (answer.kind === "answer") return "ответ";
  return answer.by === "retrieval" ? "не знаю (пустой контекст)" : "не знаю (модель)";
}

function turnRow(scenario: Scenario, turn: DialogTurn, index: number): string {
  const answer = answeredOf(turn);
  const { due, held } = memoryOnTurn(scenario, turn, index + 1);
  const cells = answer
    ? [
        outOf(answer.sources.filter((source) => source.hit !== undefined).length, answer.sources.length),
        outOf(answer.quotes.filter((quote) => quote.verified).length, answer.quotes.length),
      ]
    : ["—", "—"];
  return `| ${[
    index + 1,
    outcome(turn),
    ...cells,
    goalKept(scenario, turn) ? "да" : "нет",
    due === 0 ? "—" : outOf(held, due),
    tableCell(turn.query),
    integer(totalMs(turn)),
  ].join(" | ")} |`;
}

function turnTable(run: ScenarioRun): string[] {
  return [
    "| Ход | Исход | Источники | Цитаты дословно | Цель сохранена | Ключи памяти | Строка поиска | мс |",
    "|---|---|---|---|---|---|---|---|",
    ...run.turns.map((turn, index) => turnRow(run.scenario, turn, index)),
    "",
  ];
}

function turnDetails(id: string, turn: DialogTurn, number: number): string[] {
  const { timings } = turn;
  const problems = citationProblems(turn.answer).map(describeCitationProblem);
  return [
    `### ${id} · ход ${number}`,
    "",
    `**Реплика.** ${turn.question}`,
    "",
    `**Строка поиска:** ${turn.query}`,
    "",
    ...fragmentTable(turn.hits),
    "",
    `Время этапов, с: память ${seconds(timings.stateMs)}, rewrite ${seconds(timings.rewriteMs)}, поиск ${seconds(timings.searchMs)}, ответ ${seconds(timings.generateMs)}`,
    "",
    ...quoteBlock(renderCitedAnswer(turn.answer)),
    "",
    `**Память после хода.**${turn.stateUpdated ? "" : " Не обновлена: ответ модели не разобран, оставлена прежняя."}`,
    "",
    ...quoteBlock(renderTaskState(turn.state)),
    ...(problems.length > 0 ? ["", `Замечания к ответу: ${problems.join("; ")}.`] : []),
    "",
  ];
}

/** Раздел сценария: цель и ключи, таблица ходов, затем детали каждого хода. */
export function scenarioSection(run: ScenarioRun): string[] {
  const { scenario } = run;
  const memory = scenario.memory.map(({ fromTurn, key }) => `«${key}» с хода ${fromTurn}`).join("; ");
  return [
    `## ${scenario.id}. ${scenario.title}`,
    "",
    `**Цель:** ${scenario.goal}. **Ключи цели:** ${scenario.goalKeys.join(", ")}. **Ключи памяти:** ${memory || "—"}.`,
    "",
    ...turnTable(run),
    ...run.turns.flatMap((turn, index) => turnDetails(scenario.id, turn, index + 1)),
  ];
}
