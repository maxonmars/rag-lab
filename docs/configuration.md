# Настройки

Генерируется из реестра: `npm run docs:generate`.

Приоритет: defaults < YAML-файл < env < CLI. Любой некорректный заданный источник отклоняется.
YAML содержит плоские ключи с точками. Секреты разрешены только в env; config.file недоступен внутри YAML.
`npm run dev` и `npm start` читают корневой `.env`, если он существует. Значения из окружения процесса имеют приоритет; config show показывает источник каждого значения.

| Ключ | Тип | Default | Env | Флаг | Описание |
|---|---|---|---|---|---|
| config.file | string | lab.config.yaml | LAB_CONFIG_FILE | --config-file | Путь к YAML-конфигурации относительно текущего рабочего каталога. |
| llm.model | string | deepseek-flash | LAB_LLM_MODEL | --llm-model | Идентификатор модели DeepSeek. |
| llm.timeoutMs | number | 30000 | LAB_LLM_TIMEOUT_MS | --llm-timeout-ms | Таймаут одного запроса к модели, миллисекунды. |
| llm.maxOutputTokens | number | 1024 | LAB_LLM_MAX_OUTPUT_TOKENS | --llm-max-output-tokens | Максимальное число токенов ответа. |
| llm.apiKey | string | — | LAB_LLM_API_KEY | — | Ключ DeepSeek; принимается только из env, значение никогда не выводится. |
| rag.inputDir | string | .local/rag/corpus | LAB_RAG_INPUT_DIR | --rag-input-dir | Каталог Markdown-корпуса относительно текущего рабочего каталога; готовится командой `npm run corpus:feod`. |
| rag.outputDir | string | .local/rag | LAB_RAG_OUTPUT_DIR | --rag-output-dir | Каталог результатов относительно текущего рабочего каталога: `index.json`, `comparison.md`, `rag-calibration.md` и `rag-eval.md`. |
| rag.chunkSizeChars | number | 1800 | LAB_RAG_CHUNK_SIZE_CHARS | --rag-chunk-size-chars | Максимальный размер чанка и окна fixed в кодовых точках Unicode. |
| rag.overlapChars | number | 200 | LAB_RAG_OVERLAP_CHARS | --rag-overlap-chars | Перекрытие соседних окон fixed и предел перекрытия из целых блоков в structure; строго меньше размера чанка. |
| rag.minChunkChars | number | 500 | LAB_RAG_MIN_CHUNK_CHARS | --rag-min-chunk-chars | Размер, ниже которого чанк structure объединяется с соседним, если вместе они не длиннее максимального; не больше размера чанка. |
| rag.embeddingBaseUrl | string | http://localhost:11434 | LAB_RAG_EMBEDDING_BASE_URL | --rag-embedding-base-url | Адрес сервера Ollama. |
| rag.embeddingModel | string | bge-m3 | LAB_RAG_EMBEDDING_MODEL | --rag-embedding-model | Имя модели эмбеддингов в Ollama; модель скачивается командой `ollama pull`. |
| rag.embeddingTimeoutMs | number | 120000 | LAB_RAG_EMBEDDING_TIMEOUT_MS | --rag-embedding-timeout-ms | Таймаут одного запроса эмбеддингов к Ollama, миллисекунды. |
| rag.chunkStrategy | string | structure | LAB_RAG_CHUNK_STRATEGY | --rag-chunk-strategy | Стратегия чанкинга, по чанкам которой ищут `rag ask`, режим `/rag on`, `rag calibrate` и `rag eval`; индекс содержит обе: `fixed` и `structure`. |
| rag.retrievalMode | string | rewrite-filter | LAB_RAG_RETRIEVAL_MODE | --rag-retrieval-mode | Режим поиска в `rag ask` и в режиме `/rag on`: `baseline` — top-K по исходному вопросу; `filter` — то же с порогом сходства; `rewrite` — поиск по переписанному моделью запросу; `rewrite-filter` — переписанный запрос и порог. `rag eval` всегда сравнивает все четыре режима. |
| rag.candidateTopK | number | 10 | LAB_RAG_CANDIDATE_TOP_K | --rag-candidate-top-k | Сколько кандидатов возвращает поиск до отбора, от 1 до 20; не меньше `rag.topK`. Порог отсекает слабый хвост среди кандидатов; при `rag.candidateTopK` больше `rag.topK` итоговая выдача фильтра сама по себе не меняется. |
| rag.topK | number | 5 | LAB_RAG_TOP_K | --rag-top-k | Конечный лимит: сколько чанков после порога передаётся модели, от 1 до 20; не больше `rag.candidateTopK`. |
| rag.similarityThreshold | number | 0.55 | LAB_RAG_SIMILARITY_THRESHOLD | --rag-similarity-threshold | Минимальное косинусное сходство чанка для режимов `filter` и `rewrite-filter`, число от -1 до 1; чанк со сходством, равным порогу, проходит. Порядок результатов не меняется. Значение по умолчанию 0.55 выбрано `rag calibrate` на вопросах q01–q10 (experiments/feod-retrieval); команда настройку не меняет. |
| rag.questionsFile | string | experiments/feod-retrieval/questions.md | LAB_RAG_QUESTIONS_FILE | --rag-questions-file | Markdown-файл контрольных вопросов для `rag calibrate` и `rag eval` относительно текущего рабочего каталога. |
