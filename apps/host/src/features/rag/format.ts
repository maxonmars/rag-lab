export const integer = (value: number): string =>
  Math.round(value)
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, " ");

/** Забор для блока кода: длиннее любой серии обратных кавычек в тексте. */
export function fence(text: string): string {
  const longest = Math.max(2, ...[...text.matchAll(/`+/g)].map((match) => match[0].length));
  return "`".repeat(longest + 1);
}

/** Текст в ячейку таблицы Markdown: перевод строки и вертикальная черта не ломают строку. */
export function tableCell(text: string): string {
  return text.replaceAll("\n", "⏎").replaceAll("|", "\\|");
}

export const seconds = (ms: number): string => (ms / 1000).toFixed(1);

/** Цитата Markdown: каждая строка с `> `, пустые — `>`. */
export function quoteBlock(text: string): string[] {
  return text
    .replaceAll("\r\n", "\n")
    .split("\n")
    .map((line) => (line ? `> ${line}` : ">"));
}

export const filesList = (files: readonly string[]): string =>
  files.length > 0 ? files.map((file) => `\`${file}\``).join(", ") : "—";

export const outOf = (part: number, whole: number): string => (whole === 0 ? "—" : `${part} из ${whole}`);
