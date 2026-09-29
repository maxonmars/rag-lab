# rag-lab

Учебный репозиторий пятой недели курса — RAG. Первое задание — индексация документов: русскоязычная документация
FEOD (32 файла, около 174 тыс. символов) режется на чанки двумя стратегиями, для чанков считаются эмбеддинги в
локальной Ollama, результат сохраняется в `index.json` вместе с метаданными, а `rag compare` сравнивает стратегии.
Поиск, ответы с RAG и реранкинг появятся в следующих заданиях. Каркас взят из mcp-lab ([ADR 0001](docs/adr/0001-repository-foundation.md)).

## Запуск

```sh
nvm use
npm ci
npm run hooks:install
npm run corpus:feod
ollama pull bge-m3
npm run dev -- rag index
npm run dev -- rag compare
```

Управление Ollama (включить, выключить, проверить, освободить память) — [docs/ollama.md](docs/ollama.md).

`corpus:feod` клонирует feod-docs в `.local/rag/source`, переключает на закреплённый коммит и собирает 32 документа в
`.local/rag/corpus`. Ollama должна быть запущена (`ollama serve`); `rag index` печатает ход по стратегиям в stderr.
Результаты — `.local/rag/index.json` и `.local/rag/comparison.md` (каталог `.local/` не попадает в git).
Ключ DeepSeek нужен только для `ask`: `LAB_LLM_API_KEY` в корневом `.env` или окружении процесса.

```sh
npm run dev -- help
npm run dev -- config show
npm run dev -- --rag-chunk-size-chars=1200 --rag-min-chunk-chars=300 rag index
npm run dev -- ask "Что такое чанкинг?"
```

Настройки — YAML-файл, env (`LAB_RAG_…`) и флаги; приоритет и список — [docs/configuration.md](docs/configuration.md),
команды — [docs/commands.md](docs/commands.md). Пример файла — [lab.config.example.yaml](lab.config.example.yaml).

## Материалы

- [ADR 0002](docs/adr/0002-document-indexing.md) — решения индексации и выбор модели эмбеддингов.
- [Фича rag](apps/host/src/features/rag/README.md) — контракт, формат индекса, ограничения.
- [Демо](docs/demos/indexing.md) и [эксперимент](experiments/feod-chunking/README.md) — воспроизведение и выводы.
- [Архитектура](ARCHITECTURE.md), [курс](docs/course.md), [правила для агентов](AGENTS.md).

## Проверки

`npm run check` — lint, typecheck, границы зависимостей, структура и размеры, генерируемая документация, тесты с
coverage и сборка. Тесты не обращаются к сети и Ollama.
