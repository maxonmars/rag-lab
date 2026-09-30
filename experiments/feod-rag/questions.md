# Контрольные вопросы по документации FEOD

Вопросы для `rag ask` и `rag eval` (ADR 0003). Каждый вопрос — раздел `## qNN. Вопрос`; под заголовком две однострочные
строки: `Ожидание:` — что должен содержать хороший ответ, `Источники:` — файлы корпуса через запятую.
Источники — пути относительно `.local/rag/corpus` (как в `documents[].file` индекса); `—` значит, что ответа в корпусе нет.
Ожидания сверены с текстом корпуса на коммите `f00eaf533cfee37f67e118c96291d535b0895a6f`.

Документация FEOD — Copyright (c) 2026 FEOD Architecture, лицензия MIT
([LICENSE](https://github.com/feod-architecture/feod-docs/blob/f00eaf533cfee37f67e118c96291d535b0895a6f/LICENSE)).

## q01. Как расшифровывается FEOD и что это за методология?
Ожидание: Fractal Entity Oriented Design — методология организации frontend-приложения вокруг модулей, public API, фрактальной структуры и контролируемых зависимостей.
Источники: get-started/overview.md

## q02. Какие верхние уровни используются в FEOD?
Ожидание: ровно пять — app, pages, modules, common, global; других верхних уровней нет.
Источники: core-concepts/levels.md, get-started/overview.md

## q03. Что разрешено хранить на уровне global?
Ожидание: только инфраструктуру глобального действия — .d.ts, shims, polyfills, глобальные расширения типов, side-effect imports; нельзя бизнес-логику, UI, helpers и то, что импортируется как обычная зависимость.
Источники: structure/global.md

## q04. Что может импортировать код на уровне pages и что ему запрещено?
Ожидание: можно modules и common; запрещены app, global, другие страницы, внутренности чужих модулей и deep imports.
Источники: reference/import-matrix.md, core-concepts/levels.md

## q05. Можно ли одному модулю импортировать другой модуль?
Ожидание: да, только через public API (корневой index.ts) и без циклических и скрытых зависимостей; импорт внутренних файлов (deep import) — нарушение.
Источники: get-started/faq.md, reference/import-matrix.md

## q06. Из чего состоит минимальный контракт модуля?
Ожидание: название (имя директории в modules), ответственность (README или описание в review), public API (корневой index.ts), внутренние детали (ui, model, api, lib), ограничения зависимостей (README, чеклист review или FEOD config).
Источники: reference/module-contract.md

## q07. Где хранить API-клиент?
Ожидание: API-клиент продуктовой области или сценария — внутри соответствующего модуля в modules; нейтральная HTTP-обёртка без доменных знаний — в common.
Источники: get-started/faq.md, guides/where-to-place-code.md

## q08. Чем FEOD отличается от FSD?
Ожидание: это отдельная методология, а не переименование FSD; основной термин — уровень, а не слой; нет обязательных слоёв entities, features, widgets; главный строительный блок — модуль с public API и контролируемыми зависимостями.
Источники: get-started/overview.md, get-started/faq.md, guides/migration-from-fsd.md

## q09. Как поступить с legacy deep imports при переходе на FEOD?
Ожидание: не чинить всё за один проход — сначала выделить public API, затем перевести потребителей, после этого закрыть внутренние пути; временно допустимы migration aliases или совместимые exports.
Источники: get-started/faq.md, guides/migration-from-modular.md

## q10. Какой state-менеджер рекомендует FEOD?
Ожидание: документация не называет конкретный state-менеджер; хороший ответ прямо говорит об этом и не придумывает рекомендацию.
Источники: —
