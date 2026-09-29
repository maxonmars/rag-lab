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
Каталог результатов относительно текущего рабочего каталога: `index.json` и `comparison.md`.

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
