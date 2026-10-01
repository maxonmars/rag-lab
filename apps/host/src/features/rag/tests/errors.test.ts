import { expect, it } from "vitest";
import { describeRagError, RagError, type RagErrorCode } from "../errors.ts";

const CASES: readonly [RagErrorCode, Record<string, string | number>, string][] = [
  ["INVALID_CHUNK_PARAMS", { reason: "overlap" }, "rag.overlapChars должен быть меньше rag.chunkSizeChars."],
  ["INVALID_CHUNK_PARAMS", { reason: "min" }, "rag.minChunkChars не должен превышать rag.chunkSizeChars."],
  ["CORPUS_NOT_FOUND", {}, "npm run corpus:feod"],
  ["EMPTY_CORPUS", {}, "нет непустых Markdown-документов"],
  ["INVALID_FRONTMATTER", { file: "a.md" }, "документе a.md"],
  ["OLLAMA_UNAVAILABLE", { baseUrl: "http://localhost:11434" }, "ollama serve"],
  ["MODEL_NOT_FOUND", { model: "bge-m3" }, "ollama pull bge-m3"],
  ["EMBEDDING_TIMEOUT", {}, "rag.embeddingTimeoutMs"],
  ["EMBEDDING_INPUT_TOO_LONG", {}, "контекст модели"],
  ["EMBEDDING_HTTP_ERROR", { status: 503 }, "HTTP 503"],
  ["INVALID_EMBEDDINGS", { reason: "count" }, "число векторов не равно числу текстов"],
  ["INVALID_EMBEDDINGS", { reason: "dimension" }, "размерность вектора меняется"],
  ["INVALID_EMBEDDINGS", { reason: "unknown" }, "неизвестная причина"],
  ["INDEX_NOT_FOUND", {}, "rag index"],
  ["INDEX_INVALID", {}, "Пересоберите"],
  ["INDEX_WRITE_FAILED", {}, "Не удалось сохранить"],
  [
    "INDEX_MODEL_MISMATCH",
    { indexModel: "bge-m3:latest", model: "nomic-embed-text:latest" },
    "Индекс построен моделью bge-m3:latest, а для запроса выбрана nomic-embed-text:latest. Пересоберите индекс: rag index.",
  ],
  ["QUESTIONS_NOT_FOUND", {}, "Проверьте rag.questionsFile"],
  ["QUESTIONS_INVALID", { reason: "empty" }, "нет ни одного раздела «## qNN. Вопрос»."],
  ["QUESTIONS_INVALID", { reason: "heading", id: "q01" }, "заголовок раздела должен иметь вид «## qNN. Вопрос» (q01)."],
  ["QUESTIONS_INVALID", { reason: "expectation", id: "q02" }, "нет строки «Ожидание:» (q02)."],
  ["QUESTIONS_INVALID", { reason: "sources", id: "q03" }, "нет строки «Источники:» (q03)."],
  ["QUESTIONS_INVALID", { reason: "duplicate", id: "q04" }, "идентификатор повторяется (q04)."],
  ["QUESTIONS_INVALID", { reason: "source", id: "q05", file: "a.md" }, "источник не найден в индексе (q05, a.md)."],
  ["QUESTIONS_INVALID", { reason: "other" }, "неизвестная причина."],
  ["INVALID_RETRIEVAL_PARAMS", { reason: "candidateTopK" }, "rag.candidateTopK должен быть целым числом от 1 до 20."],
  ["INVALID_RETRIEVAL_PARAMS", { reason: "topK" }, "rag.topK должен быть целым числом от 1 до 20."],
  ["INVALID_RETRIEVAL_PARAMS", { reason: "order" }, "rag.topK не должен превышать rag.candidateTopK."],
  ["INVALID_RETRIEVAL_PARAMS", { reason: "threshold" }, "rag.similarityThreshold должен быть числом от -1 до 1."],
  ["INVALID_RETRIEVAL_PARAMS", { reason: "other" }, "Параметры поиска несовместимы."],
  ["REWRITE_INVALID", { reason: "multiline" }, "некорректный поисковый запрос: запрос занимает несколько строк."],
  ["REWRITE_INVALID", { reason: "fence" }, "некорректный поисковый запрос: запрос обёрнут в Markdown-забор."],
  ["REWRITE_INVALID", { reason: "other" }, "некорректный поисковый запрос: неизвестная причина."],
];

it.each(CASES)("%s %j → сообщение называет причину и следующий шаг", (code, data, expected) => {
  expect(describeRagError(new RagError(code, data))).toContain(expected);
});

it("данные ошибки неизменяемы", () => {
  const error = new RagError("EMBEDDING_HTTP_ERROR", { status: 500 });
  expect(Object.isFrozen(error.data)).toBe(true);
  expect(error.name).toBe("RagError");
});
