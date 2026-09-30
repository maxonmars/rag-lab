import type { Writable } from "node:stream";
import type { Command } from "./commands.ts";
import { describeError } from "./errors.ts";
import { type Paint, painter } from "./paint.ts";
import { wrapText } from "./text.ts";

export type HelpSetting = Readonly<{ flag: string; type: string; description: string }>;
export type ConfigRow = Readonly<{ key: string; value: string; source: string }>;
export type CommandView = Pick<
  CliView,
  "answer" | "help" | "config" | "indexBuilt" | "comparisonSaved" | "ragAnswer" | "ragMode" | "evalSaved"
>;

const fallbackWidth = 88;
const columnGap = "  ";

type Row = Readonly<{ label: string; plain: string; text: string; note?: string | undefined }>;

export class CliView {
  readonly #output: Writable;
  readonly #error: Writable;
  readonly #paint: Paint;

  constructor(output: Writable, error: Writable) {
    this.#output = output;
    this.#error = error;
    this.#paint = painter(output);
  }

  answer(text: string): void {
    this.#block("Ответ агента", [text]);
  }

  /** Ответ с RAG: текст модели и под ним найденные фрагменты, чтобы режимы различались на экране. */
  ragAnswer(text: string, fragments: readonly string[]): void {
    const label = this.#paint("key", "Фрагменты:");
    const listed = fragments.length > 0 ? [label, ...fragments.map((line) => `  ${line}`)] : [`${label} не найдены`];
    this.#block("Ответ агента · RAG", [text, "", ...listed]);
  }

  ragMode(lines: readonly string[]): void {
    this.#block("Режим", lines);
  }

  help(commands: readonly Command[], settings: readonly HelpSetting[]): void {
    const paint = this.#paint;
    const commandRows = commands.map((command) => ({
      label: [paint("key", command.name), ...command.arguments].join(" "),
      plain: [command.name, ...command.arguments].join(" "),
      text: command.description,
      note: command.aliases?.length ? `Алиасы: ${command.aliases.join(", ")}.` : undefined,
    }));
    const settingRows = settings.map((setting) => ({
      label: `${paint("key", setting.flag)} ${paint("muted", `<${setting.type}>`)}`,
      plain: `${setting.flag} <${setting.type}>`,
      text: setting.description,
    }));
    this.#block("Справка", [
      paint("key", "Команды"),
      ...this.#table(commandRows),
      "",
      paint("key", "Настройки"),
      ...this.#table(settingRows),
    ]);
  }

  config(rows: readonly ConfigRow[]): void {
    const paint = this.#paint;
    const keyWidth = Math.max(...rows.map((row) => row.key.length));
    const valueWidth = Math.max(...rows.map((row) => row.value.length));
    this.#block(
      "Настройки",
      rows.map((row) => {
        const key = paint("key", row.key) + " ".repeat(keyWidth - row.key.length);
        const value = row.value.padEnd(valueWidth);
        return `${key}${columnGap}${value}${columnGap}${paint("muted", `(${row.source})`)}`;
      }),
    );
  }

  /** Итог `rag index`: по строке на стратегию и путь к сохранённому индексу. */
  indexBuilt(lines: readonly string[], path: string): void {
    this.#block("Индекс", [...lines, "", this.#paint("muted", `Сохранено: ${path}`)]);
  }

  comparisonSaved(lines: readonly string[], path: string): void {
    this.#block("Сравнение стратегий", [...lines, "", this.#paint("muted", `Сохранено: ${path}`)]);
  }

  evalSaved(lines: readonly string[], path: string): void {
    this.#block("Контрольные вопросы", [...lines, "", this.#paint("muted", `Сохранено: ${path}`)]);
  }

  /** Служебная строка хода длинной операции; пишется в stderr, чтобы не смешиваться с результатом. */
  progress(text: string): void {
    this.#error.write(`${painter(this.#error)("muted", text)}\n`);
  }

  /** Предупреждение, не прерывающее работу: пишется в stderr. */
  warning(text: string): void {
    const paint = painter(this.#error);
    this.#error.write(`${paint("errorLabel", "Предупреждение")}${paint("error", ` · ${text}`)}\n`);
  }

  error(error: unknown): void {
    const paint = painter(this.#error);
    this.#error.write(`${paint("errorLabel", "Ошибка")}${paint("error", ` · ${describeError(error)}`)}\n`);
  }

  banner(commands: readonly Command[]): void {
    const hint = `Команды: ${commands.map((command) => `/${command.name}`).join(" · ")}. Строка без / — вопрос агенту.`;
    this.#output.write(`${this.#paint("heading", "── rag-lab ──")}\n${this.#paint("muted", hint)}\n`);
  }

  prompt(): void {
    this.#output.write(`\n${this.#paint("prompt", "rag-lab >")} `);
  }

  #width(): number {
    const columns = (this.#output as Partial<Record<"columns", unknown>>).columns;
    return typeof columns === "number" && columns > 0 ? columns : fallbackWidth;
  }

  #table(rows: readonly Row[]): string[] {
    const labelWidth = Math.max(...rows.map((row) => row.plain.length));
    const indent = " ".repeat(2 + labelWidth + columnGap.length);
    const textWidth = Math.max(this.#width() - indent.length, 20);
    return rows.flatMap((row) => {
      const [first = "", ...rest] = wrapText(row.text, textWidth);
      const label = `  ${row.label}${" ".repeat(labelWidth - row.plain.length)}`;
      const notes = row.note ? wrapText(row.note, textWidth).map((line) => this.#paint("muted", line)) : [];
      return [`${label}${columnGap}${first}`, ...[...rest, ...notes].map((line) => `${indent}${line}`)];
    });
  }

  /** Блок начинается с пустой строки, чтобы в REPL отделяться от введённой реплики. */
  #block(title: string, lines: readonly string[]): void {
    const body = lines.join("\n");
    this.#output.write(`\n${this.#paint("heading", `── ${title} ──`)}\n\n${body.endsWith("\n") ? body : `${body}\n`}`);
  }
}
