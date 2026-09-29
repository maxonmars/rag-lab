# Host

Рабочий пакет с CLI/REPL, агентом и фичей индексации документов. `ask` отправляет одну реплику в DeepSeek без поиска
по документам и без истории. `rag index` и `rag compare` строят и сравнивают индексы корпуса, ключ DeepSeek им не нужен.

## Навигация

- `src/core` — Agent, ModelPort, ToolSource, AgentError, собственные тесты.
- `src/adapters/llm` — DeepSeek SDK, перевод ошибок, тесты с подменённым fetch.
- `src/adapters/cli` — dispatch, чтение строк и CliView: оформление вывода и ошибок через styleText.
- `src/app` — запуск, composition root, реестры настроек и команд, системная инструкция, обработчики `ask` и `rag`.
- `src/features/rag` — индексация документов: корпус, чанкинг, эмбеддинги Ollama, `index.json`, сравнение стратегий.

Из корня репозитория: `npm run dev`, `npm run dev -- help`, `npm run dev -- rag index`, `npm run dev -- rag compare`.
После сборки: `npm start -- help`. Скрипты читают корневой `.env`, если файл существует.
Публичный src/index.ts экспортирует Agent, типы порта и ошибки без запуска процесса.
Исполняемый вход — src/app/main.ts. Границы и развитие описаны в [ARCHITECTURE](../../ARCHITECTURE.md).
