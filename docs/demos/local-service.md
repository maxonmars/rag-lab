# Демо: локальная LLM как приватный сервис

Цель: открыть локальную модель по сети через шлюз с ключом и лимитами и увидеть отказы 401, 413, 429 и 503. Одиночный прогон; HTTP без TLS.
Подробности — [ADR 0009](../adr/0009-local-llm-service.md), [README шлюза](../../servers/llm-gateway/README.md), измерения —
[experiments/feod-local-service](../../experiments/feod-local-service/README.md).

## 1. Запуск Ollama и шлюза

Ollama остаётся на `127.0.0.1:11434`; `OLLAMA_KEEP_ALIVE=30m` не даёт модели выгрузиться между запросами.

```bash
OLLAMA_KEEP_ALIVE=30m ollama serve
```

В `.env` в корне репозитория (файл не попадает в git) нужны два одинаковых значения: ключ шлюза и ключ клиента.

```bash
KEY=$(openssl rand -hex 32)
printf 'GATEWAY_API_KEYS=%s\nLAB_LLM_LOCAL_API_KEY=%s\n' "$KEY" "$KEY" >> .env
```

В другом терминале:

```bash
npm run gateway
```

Ожидание: строка с адресом, моделью и лимитами, без ключей. Без `GATEWAY_API_KEYS` процесс завершается с кодом 1 и называет переменную.

## 2. Доступ по сети

Адрес машины и ключ для следующих команд:

```bash
IP=$(ipconfig getifaddr en0); GATEWAY_KEY=$(grep '^GATEWAY_API_KEYS=' .env | cut -d= -f2)
```

```bash
curl http://$IP:8787/health
```

Ожидание: `{"status":"ok"}`. Лучше выполнить со второго устройства в той же сети, подставив `IP` вручную.

```bash
curl -s http://$IP:11434/api/version
```

Ожидание: отказ соединения — Ollama из сети не видна.

## 3. Чат через API

```bash
curl -s http://$IP:8787/v1/chat/completions -H "Authorization: Bearer $GATEWAY_KEY" -H 'content-type: application/json' -d @experiments/feod-local-service/chat-multiturn.json
```

Ожидание: ответ учитывает предыдущие реплики из массива `messages`.

## 4. Отказы

```bash
curl -s -w ' %{http_code}\n' http://$IP:8787/v1/chat/completions -H 'content-type: application/json' -d @experiments/feod-local-service/chat.json
```

Ожидание: 401 `invalid_api_key`.

Контекст сверх лимита (`GATEWAY_MAX_INPUT_CHARS`, по умолчанию 32000 символов) отклоняется до вызова Ollama:

```bash
node -e 'console.log(JSON.stringify({model:"rag-local-opt",messages:[{role:"user",content:"я".repeat(32001)}],max_tokens:16}))' > /tmp/over.json
curl -s -w ' %{http_code}\n' http://$IP:8787/v1/chat/completions -H "Authorization: Bearer $GATEWAY_KEY" -H 'content-type: application/json' -d @/tmp/over.json
```

Ожидание: 413 `context_length_exceeded`, в логе шлюза `upstream=no`.

Rate limit: перезапустить шлюз как `GATEWAY_RATE_LIMIT_PER_MINUTE=3 npm run gateway` и отправить `chat.json` пять раз подряд.

```bash
for i in 1 2 3 4 5; do curl -s -o /dev/null -w '%{http_code} retry-after=%header{retry-after}\n' http://$IP:8787/v1/chat/completions -H "Authorization: Bearer $GATEWAY_KEY" -H 'content-type: application/json' -d @experiments/feod-local-service/chat.json; done
```

Ожидание: три `200`, затем два `429` с `Retry-After`.

Очередь: при значениях по умолчанию (1 слот, очередь 4) восемь параллельных запросов дают пять `200` и три `503` с `Retry-After: 10`.

```bash
seq 8 | xargs -P 8 -I{} curl -s -o /dev/null -w '%{http_code}\n' http://$IP:8787/v1/chat/completions -H "Authorization: Bearer $GATEWAY_KEY" -H 'content-type: application/json' -d @experiments/feod-local-service/chat.json
```

## 5. rag-lab через шлюз

```bash
npm run dev:local -- --llm-local-base-url http://$IP:8787/v1
```

В REPL: обычная реплика, затем `/rag on` и два связанных вопроса — ответы с источниками. Без `LAB_LLM_LOCAL_API_KEY` команда `ask`
печатает `API вернул HTTP 401.`. Эмбеддинги rag-lab берёт из локальной Ollama, а не через шлюз.
