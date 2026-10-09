# Демо: оптимизация локальной LLM

Цель: создать модель `rag-local-opt` с параметрами из Modelfile, выбрать шаблон ответа `compact` и увидеть их в работе.
Одиночный прогон; сравнение качества, скорости и ресурсов — в [experiments/feod-local-tuning](../../experiments/feod-local-tuning/README.md).

## 1. Модель с параметрами

Веса `qwen3.8:27b-mlx` общие с `rag-local`, повторно не скачиваются:

```bash
ollama create rag-local-opt -f experiments/feod-local-tuning/Modelfile
```

```bash
ollama show rag-local-opt --parameters
```

Ожидание: `temperature 0.2` и `num_ctx 16384`.

## 2. Настройка шаблона ответа

```bash
npm run dev -- config show
```

Ожидание: строка `rag.answerPrompt  default  (default)`. Значения: `default` — `prompts/answer.md`, `compact` —
`prompts/answer-compact.md`; env `LAB_RAG_ANSWER_PROMPT`, флаг `--rag-answer-prompt`.

## 3. Ответ с шаблоном compact

Индекс должен быть построен (`rag index`), Ollama запущена:

```bash
npm run dev:local -- --llm-local-model rag-local-opt --rag-answer-prompt compact rag ask "Какие верхние уровни используются в FEOD?"
```

Ожидание: ответ с разделами `Ответ`, `Источники`, `Цитаты` и пометками «найдена во фрагменте N» у цитат; замечания к цитатам, если
они есть, перечислены в конце. В REPL баннер `/rag on` называет шаблон: `…, шаблон compact.`

## 4. Шапка отчёта

```bash
npm run dev:local -- --llm-local-model rag-local-opt --rag-answer-prompt compact rag citations --rag-questions-file experiments/feod-citations/questions.md
```

Ожидание: в шапке `.local/rag/rag-citations.md` — `local · rag-local-opt` и ``Шаблон ответа: `compact` (prompts/answer-compact.md).``

## 5. Профиль

[lab.local.yaml](../../lab.local.yaml) выбирает `rag-local-opt` с шаблоном `default` (конфигурация params). Шаблон `compact` в профиль
не включён: на этих вопросах он не прошёл критерий по дословности цитат, см. «Выводы» в README эксперимента.
