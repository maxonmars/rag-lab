# Описания настроек

## config.file
Путь к YAML-конфигурации относительно текущего рабочего каталога.

## llm.model
Идентификатор модели DeepSeek.

## llm.timeoutMs
Таймаут одного запроса к модели, миллисекунды.

## llm.maxOutputTokens
Максимальное число токенов ответа.

## llm.apiKey
Ключ DeepSeek; принимается только из env, значение никогда не выводится.

## rag.inputDir
Каталог Markdown-корпуса относительно текущего рабочего каталога; готовится командой `npm run corpus:feod`.

## rag.outputDir
Каталог результатов относительно текущего рабочего каталога: `index.json`, `comparison.md`, `rag-calibration.md` и `rag-eval.md`.

## rag.chunkSizeChars
Максимальный размер чанка и окна fixed в кодовых точках Unicode.

## rag.overlapChars
Перекрытие соседних окон fixed и предел перекрытия из целых блоков в structure; строго меньше размера чанка.

## rag.minChunkChars
Размер, ниже которого чанк structure объединяется с соседним, если вместе они не длиннее максимального; не больше размера чанка.

## rag.embeddingBaseUrl
Адрес сервера Ollama.

## rag.embeddingModel
Имя модели эмбеддингов в Ollama; модель скачивается командой `ollama pull`.

## rag.embeddingTimeoutMs
Таймаут одного запроса эмбеддингов к Ollama, миллисекунды.

## rag.chunkStrategy
Стратегия чанкинга, по чанкам которой ищут `rag ask`, режим `/rag on`, `rag calibrate` и `rag eval`; индекс содержит обе: `fixed` и `structure`.

## rag.retrievalMode
Режим поиска в `rag ask` и в режиме `/rag on`: `baseline` — top-K по исходному вопросу; `filter` — то же с порогом сходства; `rewrite` — поиск по переписанному моделью запросу; `rewrite-filter` — переписанный запрос и порог. `rag eval` всегда сравнивает все четыре режима.

## rag.candidateTopK
Сколько кандидатов возвращает поиск до отбора, от 1 до 20; не меньше `rag.topK`. Порог отсекает слабый хвост среди кандидатов; при `rag.candidateTopK` больше `rag.topK` итоговая выдача фильтра сама по себе не меняется.

## rag.topK
Конечный лимит: сколько чанков после порога передаётся модели, от 1 до 20; не больше `rag.candidateTopK`.

## rag.similarityThreshold
Минимальное косинусное сходство чанка для режимов `filter` и `rewrite-filter`, число от -1 до 1; чанк со сходством, равным порогу, проходит. Порядок результатов не меняется. Значение по умолчанию 0.55 выбрано `rag calibrate` на вопросах q01–q10 (experiments/feod-retrieval); команда настройку не меняет.

## rag.questionsFile
Markdown-файл контрольных вопросов для `rag calibrate` и `rag eval` относительно текущего рабочего каталога.
