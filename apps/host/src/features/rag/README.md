# Фича rag: индексация, поиск и ответ с RAG

Читает Markdown-корпус, режет его двумя стратегиями, получает эмбеддинги через Ollama и сохраняет `index.json`.
Отчёт сравнения стратегий читает индекс. Поиск находит top-K чанков по вопросу, `answerWithRag` склеивает их с
вопросом в Markdown и отправляет модели; `evaluateQuestions` прогоняет контрольные вопросы без RAG и с RAG и пишет отчёт.
Решения — [ADR 0002](../../../../../docs/adr/0002-document-indexing.md) (индексация) и
[ADR 0003](../../../../../docs/adr/0003-first-rag-query.md) (RAG-запрос).

## Публичный контракт (`index.ts`)

- `indexCorpus(options)` — корпус → чанки `fixed` и `structure` → эмбеддинги → `index.json`. Индекс заменяется целиком
  после успеха всех запросов; при ошибке прежний файл остаётся. Возвращает счётчики, токены и время по стратегиям.
- `compareIndex({ indexFile, reportFile })` — читает индекс и пишет `comparison.md` без обращения к модели.
- `openIndex({ indexFile, embeddings })` — читает индекс один раз и проверяет digest модели эмбеддингов; возвращает
  `SearchIndex` с `search(question, strategy, topK)`: эмбеддинг вопроса → косинусная близость по чанкам одной
  стратегии → `SearchHit[]` (`rank` с 1, `score`, чанк без вектора).
- `answerWithRag({ question, index, strategy, topK, model, systemPrompt })` — поиск, сообщение с фрагментами и ответ
  `Agent`; системная инструкция вызывающего дополняется `prompts/answer.md`. Пустой вопрос — `AgentError EMPTY_INPUT`
  до поиска. Возвращает `answer`, `hits`, `contextChars`.
- `evaluateQuestions(options)` — читает контрольные вопросы, для каждого вызывает `askPlain` и `askRag`, считает
  попадание ожидаемых файлов в top-K и пишет `rag-eval.md`; первая ошибка прерывает прогон, отчёт не пишется.
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

## Сообщение в режиме RAG

Пользовательское сообщение собирает `renderRagMessage` как Markdown; инструкции модели в нём нет, они в `prompts/answer.md`:

````text
## Фрагменты документации

### Фрагмент 1

- Файл: `structure/global.md`
- Документ: Global
- Разделы: Global › Правило; Global › Почему

```markdown
<текст чанка как есть>
```

## Вопрос

<вопрос>
````

Забор длиннее любой серии обратных кавычек в тексте чанка. Сходство и URL источника модели не передаются.

## Контрольные вопросы

Файл `experiments/feod-rag/questions.md`: раздел `## qNN. Вопрос`, строки `Ожидание:` и `Источники:` (файлы корпуса
через запятую, `—` — ответа в корпусе нет). Ошибки формата — `QUESTIONS_INVALID` с причиной; источник, которого нет в
индексе, отклоняется до первого вызова модели. Отчёт `rag-eval.md` содержит сводку, найденные фрагменты, ранг первого
ожидаемого файла и ответы обоих режимов; оценки качества в него не входят.

## Настройки и команды

`rag.inputDir`, `rag.outputDir`, `rag.chunkSizeChars` (1800), `rag.overlapChars` (200, строго меньше размера),
`rag.minChunkChars` (500, не больше размера), `rag.embeddingBaseUrl`, `rag.embeddingModel` (`bge-m3`),
`rag.embeddingTimeoutMs`; для поиска — `rag.chunkStrategy` (`structure`), `rag.topK` (5, от 1 до 20),
`rag.questionsFile`. Полный список — [docs/configuration.md](../../../../../docs/configuration.md).
Команды: `rag index`, `rag compare`, `rag ask`, `rag on`, `rag off`, `rag eval` — [docs/commands.md](../../../../../docs/commands.md).

## Ограничения

- Размеры в кодовых точках, не в токенах; токены известны только суммой на стратегию (по пакетам из 8 текстов).
- Frontmatter и переводы строк нормализуются; только `.md`, без PDF и TXT.
- Блок длиннее лимита в `structure` делится окнами как в `fixed`; такие блоки видны в метрике разорванных блоков.
- Время — один локальный прогон после прогрева.
- Поиск — линейный перебор без порога и реранкинга: модель получает top-K всегда, даже если ничего не похоже на вопрос.
- Индекс читается целиком на каждый `rag ask`; при другой модели эмбеддингов (digest) поиск отказывается работать.
- Попадание источника считается по файлу, а не по разделу; агрегированных метрик (hit@k, MRR) нет.
- `rag eval` — один прогон, DeepSeek недетерминирован; разброс между прогонами не измерен.
- История диалога, цитаты и режим «не знаю» не реализованы.

## Проверка

`npm test` (тесты без сети: fake EmbeddingPort, подменённый fetch, временные каталоги),
затем ручные прогоны по [docs/demos/indexing.md](../../../../../docs/demos/indexing.md) и
[docs/demos/rag-query.md](../../../../../docs/demos/rag-query.md).
