# Host

Рабочий пакет с CLI/REPL, агентом и фичей rag. `ask` отправляет одну реплику в DeepSeek без истории: без поиска по
документам, а после `/rag on` в REPL — с RAG. `rag ask` всегда отвечает по найденным фрагментам в режиме
`rag.retrievalMode` (по умолчанию `rewrite-filter`), `rag eval` сравнивает четыре режима на контрольных вопросах,
`rag calibrate` подбирает порог сходства. `rag index`, `rag compare` и `rag calibrate` строят и оценивают индексы корпуса,
ключ DeepSeek им не нужен.

## Навигация

- `src/core` — Agent, ModelPort, ToolSource, AgentError, собственные тесты.
- `src/adapters/llm` — DeepSeek SDK, перевод ошибок, тесты с подменённым fetch.
- `src/adapters/cli` — dispatch, чтение строк и CliView: оформление вывода и ошибок через styleText.
- `src/app` — запуск, composition root и режим сессии, реестры настроек и команд, системная инструкция, обработчики `ask`, `rag` (`index`, `compare`, `calibrate`) и `rag ask`/`rag eval`.
- `src/features/rag` — индексация документов (корпус, чанкинг, эмбеддинги Ollama, `index.json`, сравнение стратегий), поиск по индексу, rewrite запроса, отбор по порогу, ответ с RAG, калибровка порога, контрольные вопросы и отчёт `rag eval`.

Из корня репозитория: `npm run dev`, `npm run dev -- help`, `npm run dev -- rag index`, `npm run dev -- rag compare`,
`npm run dev -- rag calibrate`,
`npm run dev -- rag ask "вопрос"`, `npm run dev -- rag eval`.
После сборки: `npm start -- help`. Скрипты читают корневой `.env`, если файл существует.
Публичный src/index.ts экспортирует Agent, типы порта и ошибки без запуска процесса.
Исполняемый вход — src/app/main.ts. Границы и развитие описаны в [ARCHITECTURE](../../ARCHITECTURE.md).
