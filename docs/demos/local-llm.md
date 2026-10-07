# Демо: локальная LLM и переключатель провайдера

Цель: убедиться, что локальная модель запускается, отвечает по CLI и HTTP, и что тот же вопрос можно отправить в DeepSeek и в неё.
Один запрос, одиночный прогон; скорость и качество не измерялись.

## 1. Запуск модели

Модель скачивается один раз; `<модель>` — имя тега из `ollama list`.

```bash
ollama pull <модель>
```

Контекст по умолчанию мал для RAG-запроса: задайте его до запуска сервера (в приложении Ollama — Context length).

```bash
OLLAMA_CONTEXT_LENGTH=16384 ollama serve
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

## Если модель не запускается в Ollama

MLX-сборку можно поднять в LM Studio или `mlx_lm.server` и указать адрес: `--llm-local-base-url http://localhost:1234/v1`.
Эмбеддинги при этом остаются в Ollama.
