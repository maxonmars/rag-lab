import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { evaluateQuestions } from "../evaluation.ts";
import { evalRoot, setupEval } from "./evalSetup.ts";

const root = evalRoot();

async function report(overrides: Parameters<typeof setupEval>[1] = {}): Promise<string> {
  const { options } = setupEval(root.path, overrides);
  const result = await evaluateQuestions(options);
  return readFileSync(result.path, "utf8");
}

describe("отчёт rag-eval.md", () => {
  it("шапка содержит дату, файл вопросов, индекс, модели, стратегию, оба K, порог и фактическую длительность", async () => {
    const text = await report();
    expect(text).toContain("Прогон 2026-09-29T12:00:00.000Z. Вопросы: `experiments/feod-retrieval/questions.md` (3).");
    expect(text).toContain("Фактическая длительность прогона:");
    expect(text).toContain("модель эмбеддингов `bge-m3:latest` (digest 790764642607)");
    expect(text).toContain("Модель ответов и переписывания запроса: `deepseek-flash`.");
    expect(text).toContain("Шаблон ответа: `default` (prompts/answer.md).");
    expect(text).toContain("стратегия structure");
    expect(text).toContain("кандидатов 4, итоговый top-3, порог 0.65");
  });

  it("сводка режимов показывает hit@K, MRR, покрытие и долю отрицательных с контекстом", async () => {
    const text = await report();
    expect(text).toContain("| Режим | hit@3 | MRR | Покрытие источников | Отрицательные с непустым контекстом |");
    expect(text).toContain("| baseline | 2 из 2 (1.00) | 0.500 | 3 из 3 (1.00) | 1 из 1 (1.00) | 3.0 |");
    expect(text).toContain("| filter | 2 из 2 (1.00) | 0.500 | 2 из 3 (0.67) | 1 из 1 (1.00) | 2.0 |");
    expect(text).toContain("| rewrite | 2 из 2 (1.00) | 1.000 | 3 из 3 (1.00) | 1 из 1 (1.00) | 3.0 |");
    expect(text).toContain("сумма времён четырёх режимов не равна длительности прогона");
  });

  it("пустые знаменатели показываются как «—», без NaN и Infinity", async () => {
    const only = "## q01. Вопрос\nОжидание: x\nИсточники: a.md";
    writeFileSync(join(root.path, "questions.md"), only);
    const text = await report();
    expect(text).toContain("| baseline | 1 из 1 (1.00) | 0.500 | 1 из 1 (1.00) | — |");
    expect(text).not.toMatch(/NaN|Infinity|undefined/);
  });

  it("для каждого вопроса: исходный и переписанный запрос, кандидаты с scores и причиной исключения", async () => {
    const text = await report();
    expect(text).toContain("**Исходный запрос:** Что в первом файле?");
    expect(text).toContain("**Переписанный запрос:** запрос: Что в первом файле?");
    expect(text).toContain("### Кандидаты исходного запроса");
    expect(text).toContain("| Ранг | Сходство | Файл | Разделы | Ожидаемый | baseline | filter |");
    expect(text).toContain("| 3 | 0.300 | `b.md` | Doc › b.md | нет | передан | ниже порога |");
    expect(text).toContain("| 3 | 0.520 | `c.md` | Doc › c.md | нет | передан | ниже порога |");
  });

  it("отмечает отброшенных конечным K отдельно от отброшенных порогом", async () => {
    const text = await report({ topK: 1, threshold: 0.55 });
    expect(text).toContain("| 2 | 0.700 | `a.md` | Doc › a.md | да | вне top-K | вне top-K |");
    expect(text).toContain("| 3 | 0.300 | `b.md` | Doc › b.md | нет | вне top-K | ниже порога |");
  });

  it("содержит ответы всех четырёх режимов, размер сообщения и время этапов", async () => {
    const text = await report();
    for (const mode of ["baseline", "filter", "rewrite", "rewrite-filter"]) expect(text).toContain(`### Ответ ${mode}`);
    expect(text).toMatch(
      /Чанков передано: 2 · сообщение: \d+ символов · время этапов [\d.]+ с \(rewrite [\d.]+ с, поиск [\d.]+ с, отбор [\d.]+ мс, генерация [\d.]+ с\)/,
    );
    expect(text).toContain("> ответ: ");
  });

  it("отчёт отделяет измерения от оценки: качество ответов не оценивает", async () => {
    const text = await report();
    expect(text).toContain("Качество ответов здесь не оценивается");
    expect(text).toContain("не оценка релевантности чанков и не качество ответа");
  });
});
