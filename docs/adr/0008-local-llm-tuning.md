# 0008 — Оптимизация локальной LLM: Modelfile и шаблон ответа

Статус: принято по плану задания «Оптимизация локальной LLM».
Дата: 2026-10-09.

## Контекст

Задание: настроить локальную модель под RAG по документации FEOD и сравнить «до» и «после» по качеству, скорости и ресурсам.
Рычаги: параметры модели (temperature, контекст, max tokens), квантование, промпт-шаблон. Точка «до» — `experiments/feod-local-llm`:
у `rag-local` 60 из 66 цитат дословно, а `temperature 1` берётся из дефолтов модели.

## Варианты

Temperature: настройка проекта с передачей в теле запроса или `PARAMETER` в Modelfile. Настройка потребовала бы поля в `ModelPort`
или `extraBody` адаптера ради одного провайдера; `num_ctx` через `/v1/chat/completions` не передаётся вовсе. Выбран Modelfile.
Промпт: правка `answer.md` или отдельный шаблон. Правка меняет и DeepSeek, и все существующие отчёты; выбран отдельный файл.

## Решение

Параметры модели лежат в `experiments/feod-local-tuning/Modelfile` (`rag-local-opt`: `temperature 0.2`, `num_ctx 16384`); адаптер
и `llm.maxOutputTokens` не меняются. Квантование nvfp4 не меняется, новые веса не скачиваются.
Настройка `rag.answerPrompt` (`default` — `prompts/answer.md`, `compact` — `prompts/answer-compact.md`) выбирает шаблон ответа
для `rag ask`, `rag eval`, `rag citations`, `rag dialog` и чата `/rag on`. Перечень `ANSWER_PROMPTS` принадлежит фиче rag, поле
`answerPrompt` обязательно во всех опциях, доходящих до `generateAnswer`. Ветвления по провайдеру нет. Шапки отчётов называют шаблон.

## Последствия

Temperature и `num_ctx` не видны в `config show` и шапке отчёта; фиксируются в README эксперимента. `ollama create` выполняется
один раз на машине. `answer.md`, DeepSeek и значения по умолчанию не меняются. Ресурсы измеряются снаружи (`ollama ps`,
поля `eval_count` и `eval_duration` ответа `/api/generate`): `ModelPort` не возвращает токены, расширять его ради эксперимента не стали.

## Проверка

Тесты `features/rag/tests/answer.test.ts` (выбор шаблона, заголовки шаблонов), `chatTurn.test.ts` (шаблон в чате),
`citationEval.test.ts` и `evalReport.test.ts` (шапка), `app/tests/config.test.ts` и `ragAnswer.test.ts` (настройка и флаг).
Ручное демо — `docs/demos/local-tuning.md`, измерения — `experiments/feod-local-tuning/README.md`.
