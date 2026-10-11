# llm-gateway

Приватный HTTP-шлюз перед локальной Ollama (ADR 0009). Слушает сеть, проверяет Bearer-ключ, ограничивает частоту запросов,
параллельность и размер входного контекста и проксирует `/v1/chat/completions` в Ollama на `127.0.0.1:11434`.
Ollama ключей и лимитов не знает, поэтому наружу смотрит только шлюз. По ADR 0010 он же проксирует RAG-чат
(`/v1/rag/*`) в `rag serve` на `127.0.0.1:8788`: корпус, индекс и эмбеддинги остаются на машине с Ollama.

Процесс на `node:http` и глобальном `fetch`, зависимостей времени выполнения нет. `process.env` читается только в `src/app/main.ts`.

## Запуск

```bash
OLLAMA_KEEP_ALIVE=30m ollama serve          # отдельный терминал; без него модель выгружается через 5 минут
echo "GATEWAY_API_KEYS=$(openssl rand -hex 32)" >> .env
npm run gateway                              # из корня репозитория; остановка — Ctrl+C или SIGTERM
```

Без `GATEWAY_API_KEYS` процесс печатает ошибку с именем переменной и завершается с кодом 1. При старте выводятся адрес,
модель и значения лимитов; ключи не выводятся.

## Эндпоинты

| Метод и путь | Ключ | Поведение |
|---|---|---|
| `GET /health` | нет | `200 {"status":"ok"}`, Ollama не вызывается |
| `GET /v1/models` | да | список из одной модели `GATEWAY_MODEL`, Ollama не вызывается |
| `POST /v1/chat/completions` | да | проверки, затем прокси в `<GATEWAY_UPSTREAM_URL>/chat/completions` |
| `POST /v1/rag/chat` | да | проверки, затем прокси в `<GATEWAY_RAG_URL>/v1/rag/chat`; тело `{"question", "session_id"?}` |
| `DELETE /v1/rag/sessions/{id}` | да | ключ и rate limit, затем прокси в `<GATEWAY_RAG_URL>/v1/rag/sessions/{id}` без очереди |
| остальное | — | `404 not_found`; неверный метод — `405 method_not_allowed` |

Статус и тело ответа Ollama и `rag serve` отдаются клиенту без изменений. `max_tokens` без значения заменяется на `GATEWAY_MAX_OUTPUT_TOKENS`;
остальные поля (например, `reasoning_effort`) пробрасываются как есть.

## Переменные окружения

| Переменная | По умолчанию | Назначение |
|---|---|---|
| `GATEWAY_API_KEYS` | — (обязательна) | ключи через запятую, каждый ≥ 16 символов, без дублей; генерация: `openssl rand -hex 32` |
| `GATEWAY_HOST` | `0.0.0.0` | адрес прослушивания |
| `GATEWAY_PORT` | `8787` | порт, 1–65535 |
| `GATEWAY_UPSTREAM_URL` | `http://127.0.0.1:11434/v1` | OpenAI-совместимый адрес Ollama |
| `GATEWAY_RAG_URL` | `http://127.0.0.1:8788` | адрес `rag serve`, http:// или https:// |
| `GATEWAY_RAG_TIMEOUT_MS` | `300000` | таймаут ответа `rag serve`: ход RAG — до трёх вызовов модели и эмбеддинги |
| `GATEWAY_MODEL` | `rag-local-opt` | единственная разрешённая модель |
| `GATEWAY_UPSTREAM_TIMEOUT_MS` | `180000` | таймаут ответа Ollama |
| `GATEWAY_RATE_LIMIT_PER_MINUTE` | `20` | запросов на ключ за скользящие 60 с |
| `GATEWAY_MAX_CONCURRENT` | `1` | одновременных запросов в Ollama |
| `GATEWAY_MAX_QUEUE` | `4` | ожидающих запросов сверх параллельных |
| `GATEWAY_MAX_INPUT_CHARS` | `32000` | сумма длин `content` всех `messages` в символах (кодовых точках); для RAG — длина `question` |
| `GATEWAY_MAX_OUTPUT_TOKENS` | `1024` | потолок и значение по умолчанию для `max_tokens` |

## Порядок проверок `POST /v1/chat/completions` и коды ошибок

Ответ ошибки совместим с OpenAI SDK: `{"error":{"message","type":"gateway_error","code"}}`.

| Порядок | Статус | `code` | Условие |
|---|---|---|---|
| 1 | 401 | `invalid_api_key` | нет заголовка `Authorization: Bearer` или ключ не найден |
| 2 | 429 | `rate_limit_exceeded` | исчерпан лимит запросов; заголовок `Retry-After` в секундах |
| 3 | 413 | `body_too_large` | тело больше 1 048 576 байт |
| 3 | 400 | `invalid_json` | тело не JSON или не объект |
| 4 | 400 | `invalid_request` | `messages` пуст или сообщение без строкового `content` / допустимой `role` |
| 4 | 400 | `model_not_allowed` | `model` не равна `GATEWAY_MODEL` |
| 4 | 400 | `stream_not_supported` | `stream: true` |
| 4 | 400 | `max_tokens_exceeded` | `max_tokens` не целое от 1 до `GATEWAY_MAX_OUTPUT_TOKENS` |
| 4 | 400 | `tools_not_supported` | в теле есть `tools` |
| 5 | 413 | `context_length_exceeded` | символов больше `GATEWAY_MAX_INPUT_CHARS` |
| 6 | 503 | `server_busy` | заняты все слоты и очередь полна; `Retry-After: 10` |
| 7 | 504 | `upstream_timeout` | Ollama не ответила за `GATEWAY_UPSTREAM_TIMEOUT_MS` |
| 7 | 502 | `upstream_unavailable` | Ollama недоступна |
| — | 500 | `internal_error` | необработанная ошибка шлюза; причина только в логе |

Лимит запросов считает каждый авторизованный запрос к `/v1/*`, включая отклонённые валидацией; запрос, отклонённый по 429,
в окно не записывается. Клиент, закрывший соединение в очереди или во время ответа, снимается с очереди, запрос в Ollama отменяется.

## Порядок проверок `POST /v1/rag/chat`

Те же коды ошибок и формат, что у чата; `type: "gateway_error"` — для ошибок шлюза, ответы `rag serve` приходят как есть
(`type: "rag_service_error"`: `session_busy` 409, `too_many_sessions` 503, `model_failed` и `embeddings_failed` 502,
`embeddings_timeout` 504, `session_not_found` 404).

| Порядок | Статус | `code` | Условие |
|---|---|---|---|
| 1 | 401 | `invalid_api_key` | нет заголовка `Authorization: Bearer` или ключ не найден |
| 2 | 429 | `rate_limit_exceeded` | лимитер на ключ общий с чатом LLM |
| 3 | 413 | `body_too_large` | тело больше 1 048 576 байт |
| 3 | 400 | `invalid_json` | тело не JSON или не объект |
| 4 | 400 | `invalid_request` | `question` не строка или пуста после trim; `session_id` не соответствует `^[A-Za-z0-9_-]{1,64}$` |
| 5 | 413 | `context_length_exceeded` | длина `question` в кодовых точках больше `GATEWAY_MAX_INPUT_CHARS` |
| 6 | 503 | `server_busy` | заняты все RAG-слоты и очередь полна; `Retry-After: 10` |
| 7 | 504 | `upstream_timeout` | `rag serve` не ответил за `GATEWAY_RAG_TIMEOUT_MS` |
| 7 | 502 | `upstream_unavailable` | `rag serve` недоступен: «RAG-сервис недоступен: запустите rag serve.» |

У RAG отдельный семафор с теми же `GATEWAY_MAX_CONCURRENT` и `GATEWAY_MAX_QUEUE`: занятые RAG-слоты не блокируют чат LLM.
Для `DELETE` порядок: 401, 429, 400 `invalid_request` (id вне шаблона), прокси; очереди нет.

## Лог

Одна строка в stdout на запрос: `время метод путь key=<id> status=<код> ms=<мс> [chars=<n>] upstream=yes|no`.
Id ключа — порядковый номер в `GATEWAY_API_KEYS` (`key1`), сам ключ не логируется.

## Ограничения

- Только HTTP без TLS: ключ и тексты идут открытым текстом внутри локальной сети.
- Лимит контекста считается в символах, а не токенах; плотные по токенам тексты дают больше токенов на символ, чем русская проза.
- Состояние лимитов и очереди хранится в памяти процесса и сбрасывается при перезапуске; запускается один процесс.
- Эмбеддинги (`/api/embed`) не проксируются, `stream: true` отклоняется.
- Диалоги RAG хранит `rag serve` в памяти процесса; сессия не привязана к ключу, при перезапуске `rag serve` она теряется.
- Вызовы модели и эмбеддингов внутри `rag serve` идут в Ollama мимо очередей шлюза.
