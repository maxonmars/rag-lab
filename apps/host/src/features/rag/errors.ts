export type RagErrorCode =
  | "INVALID_CHUNK_PARAMS"
  | "CORPUS_NOT_FOUND"
  | "EMPTY_CORPUS"
  | "INVALID_FRONTMATTER"
  | "OLLAMA_UNAVAILABLE"
  | "MODEL_NOT_FOUND"
  | "EMBEDDING_TIMEOUT"
  | "EMBEDDING_INPUT_TOO_LONG"
  | "EMBEDDING_HTTP_ERROR"
  | "INVALID_EMBEDDINGS"
  | "INDEX_NOT_FOUND"
  | "INDEX_INVALID"
  | "INDEX_WRITE_FAILED";

export class RagError extends Error {
  readonly code: RagErrorCode;
  readonly data: Readonly<Record<string, string | number>>;

  constructor(code: RagErrorCode, data: Readonly<Record<string, string | number>> = {}) {
    super(code);
    this.name = "RagError";
    this.code = code;
    this.data = Object.freeze({ ...data });
  }
}

const invalidEmbeddings: Record<string, string> = {
  count: "число векторов не равно числу текстов",
  empty: "вектор пустой",
  value: "в векторе есть нечисловое значение",
  dimension: "размерность вектора меняется",
  format: "неожиданный формат ответа",
};

export function describeRagError(error: RagError): string {
  const { data } = error;
  switch (error.code) {
    case "INVALID_CHUNK_PARAMS":
      return data.reason === "overlap"
        ? "rag.overlapChars должен быть меньше rag.chunkSizeChars."
        : "rag.minChunkChars не должен превышать rag.chunkSizeChars.";
    case "CORPUS_NOT_FOUND":
      return "Каталог корпуса не найден. Подготовьте его командой npm run corpus:feod или задайте rag.inputDir.";
    case "EMPTY_CORPUS":
      return "В каталоге корпуса нет непустых Markdown-документов.";
    case "INVALID_FRONTMATTER":
      return `Некорректный frontmatter в документе ${data.file}.`;
    case "OLLAMA_UNAVAILABLE":
      return `Ollama недоступна по ${data.baseUrl}. Запустите ollama serve.`;
    case "MODEL_NOT_FOUND":
      return `Модель ${data.model} не найдена в Ollama. Выполните: ollama pull ${data.model}`;
    case "EMBEDDING_TIMEOUT":
      return "Ollama не ответила за rag.embeddingTimeoutMs.";
    case "EMBEDDING_INPUT_TOO_LONG":
      return "Чанк не помещается в контекст модели эмбеддингов; обрезка отключена.";
    case "EMBEDDING_HTTP_ERROR":
      return `Ollama вернула HTTP ${data.status}.`;
    case "INVALID_EMBEDDINGS":
      return `Ollama вернула некорректные эмбеддинги: ${invalidEmbeddings[String(data.reason)] ?? "неизвестная причина"}.`;
    case "INDEX_NOT_FOUND":
      return "Индекс не найден. Сначала выполните rag index.";
    case "INDEX_INVALID":
      return "Файл индекса повреждён или создан другой версией формата. Пересоберите: rag index.";
    case "INDEX_WRITE_FAILED":
      return "Не удалось сохранить файл.";
  }
}
