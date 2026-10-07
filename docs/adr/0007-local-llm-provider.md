# 0007 — Локальная LLM: переключатель провайдера модели

Статус: принято по плану задания «Запуск локальной LLM».
Дата: 2026-10-05.

## Контекст

Задание: запустить локальную LLM и убедиться, что к ней можно обратиться через CLI или HTTP API и она отвечает. Нужно также
сравнивать запросы к облачному DeepSeek и к локальной модели на одних и тех же командах. Эмбеддинги уже локальные (Ollama, `bge-m3`),
вся генерация — ответы, rewrite запроса и память задачи — идёт через `ModelPort`, единственная реализация которого была
`DeepSeekModel` с зашитым адресом.

## Варианты

Нативный API Ollama (`/api/chat`) требует отдельного адаптера со своим форматом сообщений и tool calls и привязывает к Ollama.
OpenAI-совместимый `/v1/chat/completions` читается тем же SDK и работает с Ollama, LM Studio и `mlx_lm.server`; MLX-сборки модели
в Ollama могут не запускаться, а меняется только адрес. Выбран OpenAI-совместимый endpoint.
Место переключателя: ветвление по провайдеру в ядре или фиче запрещено. Выбрана композиция: `createConfiguredModel` читает
`llm.provider` и передаёт фабрике `ModelOptions` с полем `provider`.

## Решение

`adapters/llm/chatCompletions.ts` содержит общий `ChatCompletionsModel` (адрес, ключ, `extraBody`). `DeepSeekModel` задаёт адрес DeepSeek
и `thinking: disabled`, `LocalModel` — адрес из `llm.localBaseUrl`, заглушку ключа и `reasoning_effort: "none"`, чтобы размышления
Qwen3 не расходовали `llm.maxOutputTokens`. Ядро, порты и фича rag не меняются.

Настройки: `llm.provider` (`deepseek` по умолчанию, `local`), `llm.localBaseUrl`, `llm.localModel`, `llm.localTimeoutMs`.
`llm.maxOutputTokens` общий. Ключ `LAB_LLM_API_KEY` нужен только DeepSeek. Подпись `провайдер · модель` попадает в метаданные
отчётов `rag eval`, `rag citations`, `rag dialog`, чтобы отчёты разных провайдеров различались.

## Последствия

Один процесс Ollama обслуживает обе модели: эмбеддинги — `/api/embed` с `rag.embeddingModel`, генерация — `/v1/chat/completions`
с `llm.localModel`; модель загружается по первому запросу и выгружается через `keep_alive`.
Контекст по умолчанию в Ollama может быть меньше RAG-запроса (5 чанков по 1800 символов плюс история): переполнение обрезается молча,
поэтому задайте `OLLAMA_CONTEXT_LENGTH` (например 16384) и перезапустите сервер.
Локальный вывод медленнее облачного; таймаут вынесен в `llm.localTimeoutMs`. Качество моделей и скорость в ADR не сравниваются.

## Проверка

Тесты `adapters/llm/tests/local.test.ts` (адрес, тело запроса, ошибка соединения) и `app/tests/cli.test.ts` (выбор провайдера,
работа без ключа). Ручное демо — `docs/demos/local-llm.md`.
