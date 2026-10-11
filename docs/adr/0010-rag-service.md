# 0010 — rag-lab как приватный RAG-сервис: `rag serve` за шлюзом

Статус: принято; дополняет [ADR 0009](0009-local-llm-service.md).
Дата: 2026-10-11.

## Контекст

После ADR 0009 по сети открыта только LLM: шлюз проксирует `/v1/chat/completions`, а rag-lab остаётся CLI/REPL-клиентом.
Поиск по корпусу, источники, цитаты и память задачи со второго устройства недоступны: шлюз не проксирует эмбеддинги,
у rag-lab нет HTTP-входа. Цель — второй Mac как тонкий клиент: вопрос по HTTP с ключом, ответ с источниками и цитатами,
как в REPL `/rag on`, с историей и памятью задачи. Корпус, индекс, эмбеддинги и модель остаются на первом Mac.

## Варианты

Куда ставить сетевой вход:

- Шлюз впереди `rag serve`: ключ, rate limit, очередь и лимит входа остаются в одном месте, наружу смотрит один порт. Выбран.
- `rag serve` сам в сети со своими ключом и лимитами: дублирует код шлюза (импорт `servers/*` из `apps/*` запрещён правилами
  зависимостей), открывает второй порт.
- SSH на первый Mac: не сервис, нет единого контракта.
- Прокси эмбеддингов в шлюзе: клиент остаётся толстым — индекс, поиск и промпты живут на втором Mac.

Где хранить диалог:

- Сессии в памяти процесса `rag serve` по `session_id` клиента. Выбран.
- Одиночные вопросы (как `rag ask`): нет истории и памяти задачи.
- Состояние у клиента: клиент пересылает `Dialog` целиком, формат памяти и ходов становится публичным контрактом.

## Решение

`rag serve` — HTTP-сервер `apps/host` на `127.0.0.1:8788` без авторизации (настройки `service.*`). Шлюз получает маршруты
`POST /v1/rag/chat` и `DELETE /v1/rag/sessions/{id}` и проксирует их в `rag serve` (`GATEWAY_RAG_URL`). Наружу смотрит порт
шлюза 8787 с прежними ключами и rate limit.

```text
второй Mac ──Bearer──▶ шлюз :8787 ──▶ rag serve :8788 ──▶ chatTurn ──▶ Ollama (эмбеддинги, модель)
```

Порядок проверок `POST /v1/rag/chat` в шлюзе: 401 `invalid_api_key` → 429 `rate_limit_exceeded` (тот же лимитер на ключ,
что у чата) → 413 `body_too_large` / 400 `invalid_json` → 400 `invalid_request` (`question` не строка или пуста после trim;
`session_id` не соответствует `^[A-Za-z0-9_-]{1,64}$`) → 413 `context_length_exceeded` (длина `question` в кодовых точках больше
`GATEWAY_MAX_INPUT_CHARS`) → 503 `server_busy` (отдельный лимитер RAG с теми же `GATEWAY_MAX_CONCURRENT` и `GATEWAY_MAX_QUEUE`)
→ прокси (504 `upstream_timeout` по `GATEWAY_RAG_TIMEOUT_MS`, 502 `upstream_unavailable`). `DELETE` проходит ключ, rate limit и
проверку `{id}`, без очереди. Статус и тело ответа `rag serve` отдаются клиенту без изменений.

Контракт `rag serve`: `POST /v1/rag/chat` с телом `{"question", "session_id"?}` отвечает `200` с полями `session_id`, `turn`,
`kind` (`answer` или `unknown`), `answer` (текст как в REPL), `sources`, `quotes`, `fragments`, `memory`, `model`, `timings_ms`;
`DELETE /v1/rag/sessions/{id}` — `204` или `404 session_not_found`; `GET /health` — `200`. Ошибки в формате шлюза с
`type: "rag_service_error"`: 400 `invalid_json` / `invalid_request`, 404 `not_found`, 405 `method_not_allowed`, 409 `session_busy`,
413 `body_too_large`, 503 `too_many_sessions`, 502 `model_failed` / `embeddings_failed`, 504 `embeddings_timeout`,
500 `internal_error`. Полная таблица — [README шлюза](../../servers/llm-gateway/README.md) и раздел `rag serve` в
[docs/commands.md](../commands.md).

Сессия — `Dialog` в `Map` процесса, как `let dialog` в REPL. Новая создаётся только после успешного первого хода; ошибка хода
оставляет прежний диалог. Параллельный ход той же сессии получает 409. Сессия удаляется после `service.sessionIdleMs` простоя,
при `service.maxSessions` вытесняется давно не использованная незанятая сессия.

Код: транспорт без знания о RAG — `apps/host/src/adapters/http`; хранилище сессий и обработчики — `apps/host/src/app`
(`ragSessions.ts`, `ragService.ts`); маршруты шлюза — `servers/llm-gateway/src`. Ядро, `ModelPort`, `EmbeddingPort`, фича rag и
промпты не менялись: используется публичный `index.ts` фичи.

Сессии в памяти — отступление от строки `docs/course.md` «не добавлять хранилища сессий»; она исправлена на месте.

## Последствия

- Сессии теряются при перезапуске `rag serve`; на диск они не пишутся.
- Сессия не привязана к ключу: любой держатель ключа с известным `session_id` продолжит её.
- Вызовы модели и эмбеддингов из `rag serve` идут в Ollama мимо очереди шлюза: RAG и чат LLM могут занять Ollama одновременно,
  она ставит их в свою очередь.
- `rag serve` без ключа слушает `127.0.0.1`, как Ollama; доступ к порту 8788 имеет любой локальный процесс этого Mac.
- HTTP без TLS; лимит вопроса считается в символах. Ход RAG — до трёх вызовов модели, поэтому `GATEWAY_RAG_TIMEOUT_MS` по
  умолчанию 300 с.
- Команда блокирующая: из REPL (`/rag serve`) она занимает его до Ctrl+C, поэтому запускать её нужно из CLI.
- Индексация, отчёты (`eval`, `citations`, `dialog`) и калибровка по сети недоступны.

## Проверка

Тесты `apps/host` (`adapters/http/tests`, `app/tests/ragSessions.test.ts`, `ragService.test.ts`, `config.test.ts`),
`servers/llm-gateway/src/tests` (`gatewayRag.test.ts`, `config.test.ts`). Ручное демо — `docs/demos/rag-service.md`.
