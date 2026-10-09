# Описания настроек

## config.file
Путь к YAML-конфигурации относительно текущего рабочего каталога.

## llm.provider
Провайдер модели ответов, rewrite и памяти задачи: `deepseek` — облачный API, `local` — локальный OpenAI-совместимый сервер (Ollama, LM Studio, `mlx_lm.server`). Эмбеддинги от провайдера не зависят и всегда идут в Ollama.

## llm.model
Идентификатор модели DeepSeek; используется при `llm.provider: deepseek`.

## llm.timeoutMs
Таймаут одного запроса к модели, миллисекунды.

## llm.maxOutputTokens
Максимальное число токенов ответа; общий для обоих провайдеров.

## llm.localBaseUrl
Адрес OpenAI-совместимого API локального сервера, вместе с `/v1`; используется при `llm.provider: local`. Ollama — `http://localhost:11434/v1`, LM Studio — `http://localhost:1234/v1`.

## llm.localModel
Имя локальной модели на сервере, например из `ollama list`.

## llm.localTimeoutMs
Таймаут одного запроса к локальной модели, миллисекунды; локальный вывод заметно медленнее облачного.

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

## rag.answerPrompt
Шаблон инструкции ответа: `default` — `prompts/answer.md`; `compact` — `prompts/answer-compact.md`, короче и со строгими правилами цитат, для локальной модели. Действует на `rag ask`, `rag eval`, `rag citations`, `rag dialog` и чат `/rag on`.

## rag.candidateTopK
Сколько кандидатов возвращает поиск до отбора, от 1 до 20; не меньше `rag.topK`. Порог отсекает слабый хвост среди кандидатов; при `rag.candidateTopK` больше `rag.topK` итоговая выдача фильтра сама по себе не меняется.

## rag.topK
Конечный лимит: сколько чанков после порога передаётся модели, от 1 до 20; не больше `rag.candidateTopK`.

## rag.similarityThreshold
Минимальное косинусное сходство чанка для режимов `filter` и `rewrite-filter`, число от -1 до 1; чанк со сходством, равным порогу, проходит. Порядок результатов не меняется. Значение по умолчанию 0.55 выбрано `rag calibrate` на вопросах q01–q10 (experiments/feod-retrieval); команда настройку не меняет.

## rag.questionsFile
Markdown-файл контрольных вопросов для `rag calibrate` и `rag eval` относительно текущего рабочего каталога.

## rag.historyTurns
Окно истории RAG-чата: сколько последних ходов (пар «вопрос — ответ») передаётся модели настоящими сообщениями, от 1 до 20. Действует в режиме `/rag on` и в `rag dialog`; `rag ask` истории не использует.

## rag.dialogFile
Markdown-файл сценариев диалога для `rag dialog` относительно текущего рабочего каталога.
