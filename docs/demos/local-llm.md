# Демо: локальная LLM и переключатель провайдера

Цель: убедиться, что локальная модель запускается, отвечает по CLI и HTTP, и что тот же вопрос можно отправить в DeepSeek и в неё.
Один запрос, одиночный прогон; скорость и качество не измерялись.

## 1. Запуск модели

Модель скачивается один раз; `<модель>` — имя тега из `ollama list`.

```bash
ollama pull <модель>
```

## 2. Обращение через CLI

```bash
ollama run <модель> "Назови столицу Франции одним словом."
```

## 3. Обращение через HTTP

```bash
curl http://localhost:11434/v1/chat/completions -d '{"model":"<модель>","messages":[{"role":"user","content":"Назови столицу Франции одним словом."}],"reasoning_effort":"none"}'
```

Ожидание: JSON с `choices[0].message.content`.

## 4. Переключатель в rag-lab

```bash
npm run dev -- --llm-provider local --llm-local-model <модель> ask "Назови столицу Франции одним словом."
npm run dev -- --llm-provider local --llm-local-model <модель> rag ask "<контрольный вопрос>"
npm run dev -- rag ask "<контрольный вопрос>"
```

Первые две команды идут в локальную модель и не требуют `LAB_LLM_API_KEY`, третья — в DeepSeek. Постоянный выбор: `LAB_LLM_PROVIDER=local`
или `llm.provider: local` в `lab.config.yaml`.

## 5. Две модели в одном Ollama

```bash
ollama ps
```

После `rag ask` в списке обе модели: `bge-m3` (эмбеддинги) и локальная модель ответов.

## 6. Приложение на локальной модели

Контекст Ollama по умолчанию может не вместить RAG-запрос с историей, переполнение обрезается молча. Модель `rag-local-opt` из
[Modelfile](../../experiments/feod-local-tuning/Modelfile) — `qwen3.8:27b-mlx` с `num_ctx 16384` и `temperature 0.2`; создаётся один раз,
веса не копируются:

```bash
ollama create rag-local-opt -f experiments/feod-local-tuning/Modelfile
```

Профиль [lab.local.yaml](../../lab.local.yaml) выбирает `llm.provider: local` и `rag-local-opt` (шаблон ответа по умолчанию). Он заменяет `lab.config.yaml`,
остальные настройки берутся по умолчанию. REPL на локальной модели:

```bash
npm run dev:local
```

Ожидание: баннер `── rag-lab ──` и под ним строка `Модель: local · rag-local-opt`. `LAB_LLM_API_KEY` из `.env` локальной модели
не передаётся.

В REPL:

```text
/rag on
<вопрос по корпусу>
<уточняющий вопрос>
/rag state
```

Ожидание: блоки `── Ответ агента · RAG-чат · local · rag-local-opt ──` с `Источники:`, `Цитаты:`, `Фрагменты:`, `Цель:` и `Память:`;
`/rag state` показывает память задачи. Индекс должен быть построен (`rag index`).

Обе локальные модели загружены — `ollama ps` показывает `bge-m3` и модель ответов:

```bash
ollama ps
```

Подпись в заголовке — настроенная модель ответов; при «не знаю» по пустому отбору модель не вызывается, подпись остаётся.
Одиночный прогон, качество и скорость не измерялись.

## 7. Полностью локальный RAG и сравнение

Прогрейте модель одним вопросом и проверьте загруженные модели:

```bash
npm run dev:local -- rag ask "Какие верхние уровни используются в FEOD?"
```

```bash
ollama ps
```

Ожидание: `bge-m3` и `rag-local-opt`, в колонке CONTEXT у `rag-local-opt` — 16384. Затем контрольные вопросы:

```bash
npm run dev:local -- rag citations --rag-questions-file experiments/feod-citations/questions.md
```

Ожидание: в шапке `.local/rag/rag-citations.md` — `local · rag-local-opt`, в отчёте раздел «Время этапов» и строка «Ошибки модели».
Необязательно: тот же прогон с отключённой сетью, чтобы убедиться, что облако не участвует.
Сравнение с DeepSeek по качеству, скорости и стабильности — [experiments/feod-local-llm/README.md](../../experiments/feod-local-llm/README.md).

## Если модель не запускается в Ollama

MLX-сборку можно поднять в LM Studio или `mlx_lm.server` и указать адрес: `--llm-local-base-url http://localhost:1234/v1`.
Эмбеддинги при этом остаются в Ollama.
