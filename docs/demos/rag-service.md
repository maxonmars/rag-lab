# Демо: RAG как приватный сервис

Цель: со второго Mac задать связанные вопросы по корпусу и получить ответы с источниками, проверенными цитатами и памятью задачи через
шлюз с ключом. Корпус, индекс, эмбеддинги и модель остаются на первом Mac (сервер); второму Mac (клиент) нужны только `curl` и `jq`,
оба есть в macOS. Одиночный прогон; HTTP без TLS. Подробности — [ADR 0010](../adr/0010-rag-service.md),
[README шлюза](../../servers/llm-gateway/README.md), сеть и лимиты чата LLM — [local-service.md](local-service.md).

Шаги выполняются по порядку; команды клиента — в одном окне терминала, переменные живут только в нём.

## 1. Сервер: запуск

Нужны индекс (`npm run corpus:feod`, `npm run dev -- rag index`), модели `bge-m3` и `rag-local-opt` в Ollama и ключ шлюза в `.env`
(раздел 1 [local-service.md](local-service.md)). Три терминала в корне репозитория:

```bash
OLLAMA_KEEP_ALIVE=30m ollama serve
```

```bash
npm run gateway
```

```bash
npm run dev:local -- rag serve
```

Ожидание: `rag serve` печатает блок «RAG-сервис» с адресом `http://127.0.0.1:8788`, моделью, параметрами поиска и лимитами сессий,
без ключей. Без индекса команда завершается с кодом 1 и текстом «Индекс не найден» до запуска сервера.

Адрес сервера в локальной сети — для клиента:

```bash
ipconfig getifaddr en0
```

## 2. Клиент: адрес и ключ

На сервере ключ копируется в буфер обмена, не выводясь на экран (при общем Apple ID буфер доступен на клиенте; иначе — AirDrop):

```bash
grep '^GATEWAY_API_KEYS=' .env | cut -d= -f2 | tr -d '\n' | pbcopy
```

На клиенте — адрес сервера из шага 1 (ниже — пример) и ключ через `read -s` (не попадает в историю shell):

```bash
IP=192.168.1.10; read -s "GATEWAY_KEY?Ключ: "; echo; echo "длина ключа: ${#GATEWAY_KEY}"
```

Ожидание: `длина ключа: 64`. Шлюз доступен:

```bash
curl -s http://$IP:8787/health
```

Ожидание: `{"status":"ok"}`.

## 3. Первый вопрос

```bash
curl -s http://$IP:8787/v1/rag/chat -H "Authorization: Bearer $GATEWAY_KEY" -H 'content-type: application/json' -d '{"question":"Мы переводим frontend-проект с FSD на FEOD. Какие верхние уровни есть в FEOD?"}' | tee /tmp/rag1.json | jq .
```

Ожидание: `session_id` (выдан сервером), `turn: 1`, `kind: "answer"`, текст в `answer`, `sources` и `quotes` (у цитат `verified: true`),
`fragments`, `memory.goal`, `timings_ms`. Ход — три вызова модели и поиск, ответ идёт десятки секунд. В логе шлюза —
`POST /v1/rag/chat … upstream=yes`.

## 4. Связанный вопрос в той же сессии

```bash
SID=$(jq -r .session_id /tmp/rag1.json); echo "SID=$SID"
```

```bash
curl -s http://$IP:8787/v1/rag/chat -H "Authorization: Bearer $GATEWAY_KEY" -H 'content-type: application/json' -d "{\"question\":\"Куда при переезде деть наш слой shared?\",\"session_id\":\"$SID\"}" | tee /tmp/rag2.json | jq '{session_id, turn, kind, sources, memory}'
```

Ожидание: тот же `session_id`, `turn: 2`, источники и цитаты, `memory.goal` про переезд с FSD на FEOD сохранилась. Полный ответ —
`jq -r .answer /tmp/rag2.json`.

## 5. Тонкий клиент `ragchat`

История и память задачи хранятся на сервере, клиент передаёт только вопрос и `session_id`. Этим `ragchat` отличается от функции `chat`
из [local-service.md](local-service.md): та ходит в `/v1/chat/completions` без RAG и сама пересылает всю историю в `messages`.

```zsh
ragchat() {
  local sid="" q reply new
  local url="http://$IP:8787/v1/rag"
  while read -r "q?вы> "; do
    case "$q" in
      "") continue ;;
      /exit) return 0 ;;
      /reset)
        [ -n "$sid" ] && curl -s -o /dev/null -X DELETE "$url/sessions/$sid" -H "Authorization: Bearer $GATEWAY_KEY"
        sid=""; echo "Сессия сброшена."; continue ;;
    esac
    reply=$(jq -n --arg q "$q" --arg s "$sid" '{question: $q} + (if $s == "" then {} else {session_id: $s} end)' \
      | curl -s "$url/chat" -H "Authorization: Bearer $GATEWAY_KEY" -H 'content-type: application/json' -d @-)
    if new=$(jq -er '.session_id' <<<"$reply" 2>/dev/null); then
      sid=$new; jq -r '.answer' <<<"$reply"
    else
      jq -r '.error.message // "нет ответа"' <<<"$reply" 2>/dev/null || echo "нет ответа"
    fi
  done
}
```

Запуск — `ragchat`. Первая реплика создаёт сессию, дальше подставляется сохранённый `session_id`; `/reset` удаляет сессию на сервере,
`/exit` выходит. Ожидание: два связанных вопроса (как в шагах 3–4) дают ответы с источниками и цитатами.

## 6. Порт `rag serve` закрыт для сети

```bash
curl -s --max-time 3 http://$IP:8788/health; echo " exit=$?"
```

Ожидание: пустой ответ и `exit=7` (отказ соединения) или `exit=28` (таймаут) — `rag serve` слушает только `127.0.0.1`, вход — шлюз.

## 7. Отказы

Без ключа:

```bash
curl -s -w ' %{http_code}\n' http://$IP:8787/v1/rag/chat -H 'content-type: application/json' -d '{"question":"привет"}'
```

Ожидание: 401 `invalid_api_key`, в логе шлюза `upstream=no`.

Вопрос длиннее `GATEWAY_MAX_INPUT_CHARS` (32000 символов):

```bash
{ printf '{"question":"'; printf 'я%.0s' {1..32001}; printf '"}'; } > /tmp/over-rag.json
curl -s -w ' %{http_code}\n' http://$IP:8787/v1/rag/chat -H "Authorization: Bearer $GATEWAY_KEY" -H 'content-type: application/json' -d @/tmp/over-rag.json
```

Ожидание: 413 `context_length_exceeded`, в логе шлюза `chars=32001 upstream=no`.

Сброс сессии из шагов 3–4:

```bash
curl -s -o /dev/null -w '%{http_code}\n' -X DELETE http://$IP:8787/v1/rag/sessions/$SID -H "Authorization: Bearer $GATEWAY_KEY"
curl -s -w ' %{http_code}\n' -X DELETE http://$IP:8787/v1/rag/sessions/$SID -H "Authorization: Bearer $GATEWAY_KEY"
```

Ожидание: `204`, затем 404 `session_not_found`.

## 8. Очередь RAG и чат LLM

У RAG в шлюзе своя очередь. На сервере перезапустить шлюз (Ctrl+C) с одним слотом без ожидания; сессии `rag serve` при этом сохраняются:

```bash
GATEWAY_MAX_CONCURRENT=1 GATEWAY_MAX_QUEUE=0 npm run gateway
```

На клиенте — тело запроса чата LLM, затем два RAG-вопроса одновременно и через секунду чат:

```bash
printf '%s' '{"model":"rag-local-opt","messages":[{"role":"user","content":"Назови столицу Франции одним словом."}],"max_tokens":64,"reasoning_effort":"none"}' > /tmp/chat.json
```

```bash
for i in 1 2; do curl -s -o /dev/null -w "rag $i: %{http_code} retry-after=%header{retry-after}\n" http://$IP:8787/v1/rag/chat -H "Authorization: Bearer $GATEWAY_KEY" -H 'content-type: application/json' -d '{"question":"Какие верхние уровни есть в FEOD?"}' & done; sleep 1; curl -s -o /dev/null -w 'llm chat: %{http_code}\n' http://$IP:8787/v1/chat/completions -H "Authorization: Bearer $GATEWAY_KEY" -H 'content-type: application/json' -d @/tmp/chat.json; wait
```

Ожидание (порядок строк может отличаться): сразу один `503 retry-after=10`; `llm chat: 200` — очередь чата не занята RAG, но ответ
может задержаться, пока Ollama доделывает вызов RAG; последним — второй RAG `200`.

## 9. `rag serve` остановлен

На сервере — Ctrl+C в окне `rag serve`; процесс завершается с первого нажатия. На клиенте:

```bash
curl -s -w ' %{http_code}\n' http://$IP:8787/v1/rag/chat -H "Authorization: Bearer $GATEWAY_KEY" -H 'content-type: application/json' -d '{"question":"Какие верхние уровни есть в FEOD?"}'
curl -s -o /dev/null -w 'llm chat: %{http_code}\n' http://$IP:8787/v1/chat/completions -H "Authorization: Bearer $GATEWAY_KEY" -H 'content-type: application/json' -d @/tmp/chat.json
```

Ожидание: 502 `upstream_unavailable` «RAG-сервис недоступен: запустите rag serve.» без задержки; `llm chat: 200`.

## 10. Возврат в рабочий режим

На сервере — шлюз со значениями по умолчанию и снова `rag serve`:

```bash
npm run gateway
```

```bash
npm run dev:local -- rag serve
```

Сессии, созданные до остановки `rag serve`, потеряны; `ragchat` начинает новую после `/reset` или перезапуска функции.

## Ограничения

- Одиночный прогон, HTTP без TLS: ключ и тексты идут открытым текстом внутри локальной сети.
- Сессии живут в памяти `rag serve` и не привязаны к ключу.
- Внутренние вызовы модели из `rag serve` идут в Ollama мимо очереди шлюза, поэтому RAG и чат LLM ждут друг друга в Ollama (шаг 8).
