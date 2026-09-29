# Фича rag: индексация документов

Читает Markdown-корпус, режет его двумя стратегиями, получает эмбеддинги через Ollama и сохраняет `index.json`.
Второй режим читает индекс и пишет отчёт сравнения стратегий. Поиска и генерации ответов здесь нет.
Решение и обоснование — [ADR 0002](../../../../../docs/adr/0002-document-indexing.md).

## Публичный контракт (`index.ts`)

- `indexCorpus(options)` — корпус → чанки `fixed` и `structure` → эмбеддинги → `index.json`. Индекс заменяется целиком
  после успеха всех запросов; при ошибке прежний файл остаётся. Возвращает счётчики, токены и время по стратегиям.
- `compareIndex({ indexFile, reportFile })` — читает индекс и пишет `comparison.md` без обращения к модели.
- `EmbeddingPort` — `embed(texts)` (векторы, `prompt_eval_count` и `load_duration` пакета) и `describeModel()`.
- `createOllamaEmbeddings(options)` — адаптер Ollama `/api/embed` и `/api/tags` с внедряемым `fetch`.
- `RagError`, `describeRagError` — типизированные ошибки и русские сообщения для CLI.

## Формат `index.json` (`formatVersion: 1`)

| Поле | Содержимое |
|---|---|
| `createdAt`, `corpusHash` | время построения; sha256 от списка файлов и хешей их текста |
| `params` | `chunkSizeChars`, `overlapChars`, `minChunkChars` |
| `model`, `modelLoadMs` | `name`, `digest`, `dimension`; `load_duration` прогрева |
| `documents[]` | `file`, `source`, `title`, `hash`, `text` (нормализованный), `blocks[]` (`type`, `start`, `end`, `section`) |
| `strategies.fixed`, `strategies.structure` | `chunkingMs`, `embeddingMs`, `promptTokens`, `chunks[]` |
| `chunks[]` | `chunk_id`, `strategy`, `source`, `title`, `file`, `sections[]`, `start`, `end`, `text`, `embedding` |

Диапазоны `start`–`end` — кодовые точки Unicode: `text` равен срезу `documents[].text` по диапазону.

## Настройки и команды

`rag.inputDir`, `rag.outputDir`, `rag.chunkSizeChars` (1800), `rag.overlapChars` (200, строго меньше размера),
`rag.minChunkChars` (500, не больше размера), `rag.embeddingBaseUrl`, `rag.embeddingModel` (`bge-m3`),
`rag.embeddingTimeoutMs`. Полный список — [docs/configuration.md](../../../../../docs/configuration.md).
Команды: `rag index`, `rag compare` — [docs/commands.md](../../../../../docs/commands.md).

## Ограничения

- Размеры в кодовых точках, не в токенах; токены известны только суммой на стратегию (по пакетам из 8 текстов).
- Frontmatter и переводы строк нормализуются; только `.md`, без PDF и TXT.
- Блок длиннее лимита в `structure` делится окнами как в `fixed`; такие блоки видны в метрике разорванных блоков.
- Время — один локальный прогон после прогрева. Качество поиска не измеряется.

## Проверка

`npm test` (тесты без сети: fake EmbeddingPort, подменённый fetch, временные каталоги),
затем ручной прогон по [docs/demos/indexing.md](../../../../../docs/demos/indexing.md).
