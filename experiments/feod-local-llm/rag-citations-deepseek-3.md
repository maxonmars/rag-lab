# Источники, цитаты и режим «не знаю»

Прогон 2026-10-07T13:35:29.894Z. Вопросы: `experiments/feod-citations/questions.md` (10). Фактическая длительность прогона: 29.9 с.
Индекс создан 2026-09-30T14:27:30.045Z, модель эмбеддингов `bge-m3:latest` (digest 790764642607).
Модель ответов и переписывания запроса: `deepseek · deepseek-flash`. Поиск: стратегия structure, режим rewrite-filter, кандидатов 10, итоговый top-5, порог 0.55 (применяется).

## Сводка

| Показатель | Значение |
|---|---|
| Положительные: ответ с источником из переданных фрагментов | 7 из 7 |
| Положительные: ответ с дословной цитатой | 7 из 7 |
| Положительные: ожидаемый файл среди источников | 7 из 7 |
| Положительные: «не знаю» | 0 из 7 |
| Отрицательные: «не знаю» | 3 из 3 (пустой контекст 2, моделью 1) |
| Цитаты, найденные дословно | 21 из 21 |
| Ответы без замечаний | 9 из 10 |
| Ошибки модели (вопрос без ответа) | 0 из 10 |

Положительный вопрос — с ожидаемыми источниками, отрицательный — без них; показатели считаются по своей группе вопросов.
Источник засчитывается, если его номер есть среди переданных фрагментов; цитата — если после нормализации пробелов, регистра, «ё», Markdown-символов, тире и кавычек она является подстрокой текста указанного фрагмента.
Измерено: время этапов, размер сообщения, ошибки модели. Вычислено: разбор ответа, проверка ссылок и цитат. Совпадение смысла ответа с цитатами здесь не оценивается — ручная оценка в README эксперимента. «—» — знаменатель равен нулю.

## Время этапов

| Этап | Вопросов | Медиана, с | Максимум, с |
|---|---|---|---|
| Переписывание запроса | 10 | 1.1 | 1.9 |
| Поиск | 10 | 0.1 | 0.1 |
| Генерация ответа | 8 | 2.1 | 2.7 |
| Все этапы | 10 | 3.0 | 4.7 |

Переписывание — вызов модели для запроса поиска (режимы с rewrite); поиск — эмбеддинг запроса в Ollama и косинусный перебор; генерация — вызов модели с фрагментами, отказы по пустому контексту не учитываются; все этапы — сумма по вопросу. Вопросы с ошибкой модели не учитываются.

## Вопросы

| Вопрос | Ожидаемые источники | Исход | Лучшее сходство | Источники в контексте | Цитаты дословно | Rewrite, с | Генерация, с | Замечания |
|---|---|---|---|---|---|---|---|---|
| q02 | `core-concepts/levels.md`, `get-started/overview.md` | ответ | 0.677 | 3 из 3 | 3 из 3 | 1.4 | 2.7 | — |
| q03 | `structure/global.md` | ответ | 0.706 | 3 из 3 | 3 из 3 | 0.9 | 1.9 | — |
| q04 | `reference/import-matrix.md`, `core-concepts/levels.md` | ответ | 0.681 | 4 из 4 | 4 из 4 | 1.5 | 2.4 | цитата [1] короче 20 символов |
| q05 | `get-started/faq.md`, `reference/import-matrix.md` | ответ | 0.621 | 4 из 4 | 4 из 4 | 1.0 | 2.4 | — |
| q06 | `reference/module-contract.md` | ответ | 0.564 | 1 из 1 | 1 из 1 | 1.1 | 1.8 | — |
| q07 | `get-started/faq.md`, `guides/where-to-place-code.md` | ответ | 0.710 | 1 из 1 | 1 из 1 | 1.1 | 1.8 | — |
| q08 | `get-started/overview.md`, `get-started/faq.md`, `guides/migration-from-fsd.md` | ответ | 0.648 | 2 из 2 | 5 из 5 | 1.9 | 2.7 | — |
| q10 | — | не знаю (пустой контекст) | 0.520 | — | — | 1.2 | — | — |
| q14 | — | не знаю (модель) | 0.607 | — | — | 1.1 | 1.4 | — |
| q15 | — | не знаю (пустой контекст) | 0.483 | — | — | 1.1 | — | — |

## q02. Какие верхние уровни используются в FEOD?

**Ожидание.** ровно пять — app, pages, modules, common, global; других верхних уровней нет.

**Ожидаемые источники:** `core-concepts/levels.md`, `get-started/overview.md`

**Запрос поиска:** верхние уровни FEOD

### Переданные фрагменты

| Фрагмент | Сходство | Файл | Разделы | chunk_id |
|---|---|---|---|---|
| 1 | 0.677 | `get-started/overview.md` | FEOD: методология frontend-архитектуры › Верхние уровни FEOD | `structure:get-started/overview.md#004-debd75dc` |
| 2 | 0.637 | `core-concepts/levels.md` | Уровни; Уровни › Короткое определение; Уровни › Какую проблему решает | `structure:core-concepts/levels.md#000-cdf97650` |
| 3 | 0.594 | `reference/glossary.md` | Глоссарий; Глоссарий › Термины | `structure:reference/glossary.md#000-cadc2cf1` |
| 4 | 0.594 | `reference/terms.md` | Термины › Перед публикацией страницы; Термины › Связанные страницы | `structure:reference/terms.md#006-ddb70570` |
| 5 | 0.590 | `core-concepts/levels.md` | Уровни › Правило; Уровни › Почему; Уровни › Быстрый reference | `structure:core-concepts/levels.md#001-1060540c` |

### Ответ

Сообщение: 5835 символов · rewrite 1.4 с · поиск 0.1 с · генерация 2.7 с

> В FEOD на верхнем уровне используются ровно пять имён: `app`, `pages`, `modules`, `common`, `global` [1]. Все эти уровни перечислены как канонические [3], и правило прямо указывает, что используются только уровни `app`, `pages`, `modules`, `common`, `global` [5].
>
> Назначение уровней кратко: `app` — запуск приложения, роутинг, провайдеры, композиция верхнего уровня; `pages` — страницы и крупные сценарии входа; `modules` — самостоятельные модули с собственным public API; `common` — переиспользуемые FEOD-сущности без привязки к конкретному модулю; `global` — декларации окружения, shims, polyfills и редкие side-effect подключения, действующие на всё приложение [1].
>
> Источники:
> - [1] `get-started/overview.md` › FEOD: методология frontend-архитектуры › Верхние уровни FEOD · `structure:get-started/overview.md#004-debd75dc` · https://github.com/feod-architecture/feod-docs/blob/f00eaf533cfee37f67e118c96291d535b0895a6f/docs/get-started/overview.md
> - [3] `reference/glossary.md` › Глоссарий; Глоссарий › Термины · `structure:reference/glossary.md#000-cadc2cf1` · https://github.com/feod-architecture/feod-docs/blob/f00eaf533cfee37f67e118c96291d535b0895a6f/docs/reference/glossary.md
> - [5] `core-concepts/levels.md` › Уровни › Правило; Уровни › Почему; Уровни › Быстрый reference · `structure:core-concepts/levels.md#001-1060540c` · https://github.com/feod-architecture/feod-docs/blob/f00eaf533cfee37f67e118c96291d535b0895a6f/docs/core-concepts/levels.md
>
> Цитаты:
> - [1] «На верхнем уровне проекта FEOD использует только пять имён:» — найдена во фрагменте 1
> - [3] «Уровень | Верхняя структурная зона FEOD с собственной ролью и правилами зависимостей. Канонические уровни: `app`, `pages`, `modules`, `common`, `global`.» — найдена во фрагменте 3
> - [5] «В FEOD используются только уровни `app`, `pages`, `modules`, `common`, `global`.» — найдена во фрагменте 5

## q03. Что разрешено хранить на уровне global?

**Ожидание.** только инфраструктуру глобального действия — .d.ts, shims, polyfills, глобальные расширения типов, side-effect imports; нельзя бизнес-логику, UI, helpers и то, что импортируется как обычная зависимость.

**Ожидаемые источники:** `structure/global.md`

**Запрос поиска:** Что разрешено хранить на уровне global?

### Переданные фрагменты

| Фрагмент | Сходство | Файл | Разделы | chunk_id |
|---|---|---|---|---|
| 1 | 0.706 | `core-concepts/levels.md` | Уровни › Уровень global › Что нельзя хранить; Уровни › Уровень global › Good example; Уровни › Уровень global › Bad example | `structure:core-concepts/levels.md#013-d1e3079d` |
| 2 | 0.705 | `structure/global.md` | Global › Правило; Global › Почему | `structure:structure/global.md#001-5d719f07` |
| 3 | 0.670 | `core-concepts/levels.md` | Уровни › Уровень global; Уровни › Уровень global › Назначение; Уровни › Уровень global › Кто может импортировать; Уровни › Уровень global › Что может импортировать | `structure:core-concepts/levels.md#012-ae9f98df` |
| 4 | 0.636 | `structure/global.md` | Global › Что обычно лежит в global; Global › Что не должно лежать в global | `structure:structure/global.md#002-28f08b4c` |
| 5 | 0.635 | `reference/import-matrix.md` | Матрица импортов › global не импортируется напрямую | `structure:reference/import-matrix.md#006-4e1c6978` |

### Ответ

Сообщение: 4266 символов · rewrite 0.9 с · поиск 0.1 с · генерация 1.9 с

> На уровне `global` разрешено хранить только инфраструктурные сущности глобального действия: `.d.ts`, shims, polyfills, глобальные расширения типов и side-effect imports [2]. Обычно там находятся декларации окружения (`env.d.ts`, `vite-env.d.ts` и другие), shims для платформы или тестовой среды, polyfills, подключаемые до запуска приложения, `declare global` и другие расширения глобальных типов, а также side-effect imports вроде глобальных стилей или runtime setup, если проект подключает их через entrypoint или конфигурацию [4]. Назначение уровня — хранить код, действующий на всё приложение целиком: shims, polyfills, глобальные декларации окружения, runtime-инициализацию и редкие side-effect подключения [3].
>
> Источники:
> - [2] `structure/global.md` › Global › Правило; Global › Почему · `structure:structure/global.md#001-5d719f07` · https://github.com/feod-architecture/feod-docs/blob/f00eaf533cfee37f67e118c96291d535b0895a6f/docs/structure/global.md
> - [3] `core-concepts/levels.md` › Уровни › Уровень global; Уровни › Уровень global › Назначение; Уровни › Уровень global › Кто может импортировать; Уровни › Уровень global › Что может импортировать · `structure:core-concepts/levels.md#012-ae9f98df` · https://github.com/feod-architecture/feod-docs/blob/f00eaf533cfee37f67e118c96291d535b0895a6f/docs/core-concepts/levels.md
> - [4] `structure/global.md` › Global › Что обычно лежит в global; Global › Что не должно лежать в global · `structure:structure/global.md#002-28f08b4c` · https://github.com/feod-architecture/feod-docs/blob/f00eaf533cfee37f67e118c96291d535b0895a6f/docs/structure/global.md
>
> Цитаты:
> - [2] «В `global` разрешено хранить только инфраструктурные сущности глобального действия:» — найдена во фрагменте 2
> - [3] «`global` хранит код, который действует на всё приложение целиком: shims, polyfills, глобальные декларации окружения, runtime-инициализацию и редкие side-effect подключения.» — найдена во фрагменте 3
> - [4] «В `global` обычно находятся:» — найдена во фрагменте 4

## q04. Что может импортировать код на уровне pages и что ему запрещено?

**Ожидание.** можно modules и common; запрещены app, global, другие страницы, внутренности чужих модулей и deep imports.

**Ожидаемые источники:** `reference/import-matrix.md`, `core-concepts/levels.md`

**Запрос поиска:** импорт на уровне pages разрешённые и запрещённые зависимости

### Переданные фрагменты

| Фрагмент | Сходство | Файл | Разделы | chunk_id |
|---|---|---|---|---|
| 1 | 0.681 | `structure/modules.md` | Modules › Взаимодействие модулей | `structure:structure/modules.md#006-afe37b04` |
| 2 | 0.677 | `reference/import-matrix.md` | Матрица импортов; Матрица импортов › Базовое правило | `structure:reference/import-matrix.md#000-10737c77` |
| 3 | 0.660 | `reference/import-matrix.md` | Матрица импортов › Что может импортировать код на уровне | `structure:reference/import-matrix.md#001-4c12c71d` |
| 4 | 0.659 | `core-concepts/dependency-rules.md` | Правила зависимостей › Правило; Правила зависимостей › Почему; Правила зависимостей › Направление зависимостей | `structure:core-concepts/dependency-rules.md#001-316cac9f` |
| 5 | 0.655 | `structure/app.md` | App › Исключения; App › Углублённые паттерны; App › Связанные страницы | `structure:structure/app.md#005-9d2eff16` |

### Ответ

Сообщение: 5830 символов · rewrite 1.5 с · поиск 0.1 с · генерация 2.4 с

> Код на уровне `pages` может импортировать `modules` и `common`. Ему запрещено импортировать `app`, `global`, другие страницы, внутренности чужих модулей и deep imports [3]. Правила матрицы импортов применяются к frontend-приложению с каноническими уровнями `app`, `pages`, `modules`, `common`, `global` [2]. Также запрещено импортировать `app` из `modules`, а `pages` из `modules` [1], что согласуется с направлением зависимости: если страницы используют модули, это означает, что `pages` импортируют `modules`, а не наоборот [4].
>
> Источники:
> - [1] `structure/modules.md` › Modules › Взаимодействие модулей · `structure:structure/modules.md#006-afe37b04` · https://github.com/feod-architecture/feod-docs/blob/f00eaf533cfee37f67e118c96291d535b0895a6f/docs/structure/modules.md
> - [2] `reference/import-matrix.md` › Матрица импортов; Матрица импортов › Базовое правило · `structure:reference/import-matrix.md#000-10737c77` · https://github.com/feod-architecture/feod-docs/blob/f00eaf533cfee37f67e118c96291d535b0895a6f/docs/reference/import-matrix.md
> - [3] `reference/import-matrix.md` › Матрица импортов › Что может импортировать код на уровне · `structure:reference/import-matrix.md#001-4c12c71d` · https://github.com/feod-architecture/feod-docs/blob/f00eaf533cfee37f67e118c96291d535b0895a6f/docs/reference/import-matrix.md
> - [4] `core-concepts/dependency-rules.md` › Правила зависимостей › Правило; Правила зависимостей › Почему; Правила зависимостей › Направление зависимостей · `structure:core-concepts/dependency-rules.md#001-316cac9f` · https://github.com/feod-architecture/feod-docs/blob/f00eaf533cfee37f67e118c96291d535b0895a6f/docs/core-concepts/dependency-rules.md
>
> Цитаты:
> - [1] «Нарушение:» — найдена во фрагменте 1
> - [2] «Эта страница фиксирует разрешённые импорты между верхними уровнями FEOD. Правила применяются к frontend-приложению с каноническими уровнями `app`, `pages`, `modules`, `common`, `global`.» — найдена во фрагменте 2
> - [3] «| `pages` | `modules`, `common` | `app`, `global`, другие страницы, внутренности чужих модулей, deep imports |» — найдена во фрагменте 3
> - [4] «Обратная формулировка вроде "`B` используется из `A`" не меняет направление зависимости. Например, если страницы используют модули, это означает, что `pages` импортируют `modules`, а не наоборот.» — найдена во фрагменте 4
>
> Замечания:
> - цитата [1] короче 20 символов

## q05. Можно ли одному модулю импортировать другой модуль?

**Ожидание.** да, только через public API (корневой index.ts) и без циклических и скрытых зависимостей; импорт внутренних файлов (deep import) — нарушение.

**Ожидаемые источники:** `get-started/faq.md`, `reference/import-matrix.md`

**Запрос поиска:** импорт одного модуля другим

### Переданные фрагменты

| Фрагмент | Сходство | Файл | Разделы | chunk_id |
|---|---|---|---|---|
| 1 | 0.621 | `structure/modules.md` | Modules › Взаимодействие модулей | `structure:structure/modules.md#006-afe37b04` |
| 2 | 0.579 | `get-started/faq.md` | FAQ › Можно ли использовать FEOD без common?; FAQ › Можно ли модулю импортировать другой модуль? | `structure:get-started/faq.md#001-d645a78d` |
| 3 | 0.577 | `reference/import-matrix.md` | Матрица импортов; Матрица импортов › Базовое правило | `structure:reference/import-matrix.md#000-10737c77` |
| 4 | 0.572 | `get-started/faq.md` | FAQ › Что делать с legacy deep imports?; FAQ › Можно ли нарушить матрицу импортов? | `structure:get-started/faq.md#004-91350936` |
| 5 | 0.569 | `reference/import-matrix.md` | Матрица импортов › Public API обязателен для чужого модуля | `structure:reference/import-matrix.md#003-9e6159ad` |

### Ответ

Сообщение: 4331 символов · rewrite 1.0 с · поиск 0.1 с · генерация 2.4 с

> Да, модулю разрешено импортировать другой модуль, если импорт идёт через public API этого модуля и не создаёт циклическую или скрытую зависимость [2]. Модули могут импортировать другие модули только через их public API [1], а также на схеме матрицы импортов показано направление `modules` → `other modules` с пометкой «public API» [3]. Чужой модуль разрешено импортировать только через его public API, и это правило одинаково для `app`, `pages`, `modules` и `common` [5].
>
> При этом запрещён deep import во внутренности чужого модуля [1]; например, импорт `import { Money } from '@/modules/billing/model/money';` — плохой вариант, а `import { Money } from '@/modules/billing';` — хороший [2].
>
> Источники:
> - [1] `structure/modules.md` › Modules › Взаимодействие модулей · `structure:structure/modules.md#006-afe37b04` · https://github.com/feod-architecture/feod-docs/blob/f00eaf533cfee37f67e118c96291d535b0895a6f/docs/structure/modules.md
> - [2] `get-started/faq.md` › FAQ › Можно ли использовать FEOD без common?; FAQ › Можно ли модулю импортировать другой модуль? · `structure:get-started/faq.md#001-d645a78d` · https://github.com/feod-architecture/feod-docs/blob/f00eaf533cfee37f67e118c96291d535b0895a6f/docs/get-started/faq.md
> - [3] `reference/import-matrix.md` › Матрица импортов; Матрица импортов › Базовое правило · `structure:reference/import-matrix.md#000-10737c77` · https://github.com/feod-architecture/feod-docs/blob/f00eaf533cfee37f67e118c96291d535b0895a6f/docs/reference/import-matrix.md
> - [5] `reference/import-matrix.md` › Матрица импортов › Public API обязателен для чужого модуля · `structure:reference/import-matrix.md#003-9e6159ad` · https://github.com/feod-architecture/feod-docs/blob/f00eaf533cfee37f67e118c96291d535b0895a6f/docs/reference/import-matrix.md
>
> Цитаты:
> - [1] «Модули могут импортировать другие модули только через их public API.» — найдена во фрагменте 1
> - [2] «Да, если импорт идёт через public API другого модуля и не создаёт циклическую или скрытую зависимость.» — найдена во фрагменте 2
> - [3] «modules -->|"public API"| other["other modules"]» — найдена во фрагменте 3
> - [5] «Чужой модуль разрешено импортировать только через его public API.» — найдена во фрагменте 5

## q06. Из чего состоит минимальный контракт модуля?

**Ожидание.** название (имя директории в modules), ответственность (README или описание в review), public API (корневой index.ts), внутренние детали (ui, model, api, lib), ограничения зависимостей (README, чеклист review или FEOD config).

**Ожидаемые источники:** `reference/module-contract.md`

**Запрос поиска:** минимальный контракт модуля состав

### Переданные фрагменты

| Фрагмент | Сходство | Файл | Разделы | chunk_id |
|---|---|---|---|---|
| 1 | 0.564 | `reference/module-contract.md` | Контракт модуля › Минимальный контракт | `structure:reference/module-contract.md#001-67181b9f` |

### Ответ

Сообщение: 798 символов · rewrite 1.1 с · поиск 0.1 с · генерация 1.8 с

> Минимальный контракт модуля состоит из пяти частей: название модуля, ответственность, Public API, внутренние детали и ограничения зависимостей [1]. Название модуля фиксируется в имени директории в `modules`, ответственность — в README или коротком описании в review, Public API — в корневом `index.ts`, внутренние детали — в директориях `ui`, `model`, `api`, `lib` и других, а ограничения зависимостей — в README, review checklist или FEOD config [1].
>
> Источники:
> - [1] `reference/module-contract.md` › Контракт модуля › Минимальный контракт · `structure:reference/module-contract.md#001-67181b9f` · https://github.com/feod-architecture/feod-docs/blob/f00eaf533cfee37f67e118c96291d535b0895a6f/docs/reference/module-contract.md
>
> Цитаты:
> - [1] «| Часть контракта | Где фиксируется | Зачем нужна |» — найдена во фрагменте 1

## q07. Где хранить API-клиент?

**Ожидание.** API-клиент продуктовой области или сценария — внутри соответствующего модуля в modules; нейтральная HTTP-обёртка без доменных знаний — в common.

**Ожидаемые источники:** `get-started/faq.md`, `guides/where-to-place-code.md`

**Запрос поиска:** Где хранить API-клиент

### Переданные фрагменты

| Фрагмент | Сходство | Файл | Разделы | chunk_id |
|---|---|---|---|---|
| 1 | 0.710 | `get-started/faq.md` | FAQ › Где хранить API-клиент?; FAQ › Нужно ли всегда писать README модуля? | `structure:get-started/faq.md#003-6f83be8d` |

### Ответ

Сообщение: 794 символов · rewrite 1.1 с · поиск 0.1 с · генерация 1.8 с

> API-клиент конкретной продуктовой области обычно хранится внутри соответствующего модуля [1]. Нейтральная HTTP-обёртка без доменных знаний может храниться в `common` [1].
>
> Источники:
> - [1] `get-started/faq.md` › FAQ › Где хранить API-клиент?; FAQ › Нужно ли всегда писать README модуля? · `structure:get-started/faq.md#003-6f83be8d` · https://github.com/feod-architecture/feod-docs/blob/f00eaf533cfee37f67e118c96291d535b0895a6f/docs/get-started/faq.md
>
> Цитаты:
> - [1] «API-клиент конкретной продуктовой области обычно живёт внутри соответствующего модуля.» — найдена во фрагменте 1

## q08. Чем FEOD отличается от FSD?

**Ожидание.** это отдельная методология, а не переименование FSD; основной термин — уровень, а не слой; нет обязательных слоёв entities, features, widgets; главный строительный блок — модуль с public API и контролируемыми зависимостями.

**Ожидаемые источники:** `get-started/overview.md`, `get-started/faq.md`, `guides/migration-from-fsd.md`

**Запрос поиска:** Чем отличается FEOD от FSD

### Переданные фрагменты

| Фрагмент | Сходство | Файл | Разделы | chunk_id |
|---|---|---|---|---|
| 1 | 0.648 | `get-started/overview.md` | FEOD: методология frontend-архитектуры › Чем FEOD отличается от FSD | `structure:get-started/overview.md#003-8bb951b9` |
| 2 | 0.567 | `get-started/faq.md` | FAQ; FAQ › FEOD - это FSD? | `structure:get-started/faq.md#000-126c876e` |
| 3 | 0.556 | `get-started/overview.md` | FEOD: методология frontend-архитектуры | `structure:get-started/overview.md#000-41b04377` |
| 4 | 0.551 | `reference/terms.md` | Термины › FEOD-сущность и DDD entity | `structure:reference/terms.md#003-0bf4dadc` |

### Ответ

Сообщение: 3836 символов · rewrite 1.9 с · поиск 0.1 с · генерация 2.7 с

> FEOD и FSD решают близкую задачу — сделать архитектуру frontend-проекта понятной и устойчивой, но FEOD описывает её через уровни `app`, `pages`, `modules`, `common`, `global` и делает модуль главным строительным блоком [1]. Практическая разница: в FEOD основной термин — уровень, а не слой; нет обязательного набора FSD-слоёв вроде `entities`, `features`, `widgets`; методология концентрируется на модуле, его `public API` и границе зависимостей; она проще применяется там, где не нужна глубокая таксономия доменных типов, но нужны строгие правила импортов и масштабируемая структура [1]. Если знать FSD, о FEOD можно думать как о более прямом каркасе вокруг модулей и уровней, но это отдельная методология, а не переименование FSD-терминов [1]. В FAQ прямо указано: FEOD — не FSD, он использует меньше верхних уровней и строит проект вокруг `modules`, public API и контролируемых зависимостей [2]. При переходе с FSD команде предлагается сначала сопоставить текущие `entities`, `features` и `widgets` с будущими `modules`, а затем проверить public API каждого модуля [2].
>
> Источники:
> - [1] `get-started/overview.md` › FEOD: методология frontend-архитектуры › Чем FEOD отличается от FSD · `structure:get-started/overview.md#003-8bb951b9` · https://github.com/feod-architecture/feod-docs/blob/f00eaf533cfee37f67e118c96291d535b0895a6f/docs/get-started/overview.md
> - [2] `get-started/faq.md` › FAQ; FAQ › FEOD - это FSD? · `structure:get-started/faq.md#000-126c876e` · https://github.com/feod-architecture/feod-docs/blob/f00eaf533cfee37f67e118c96291d535b0895a6f/docs/get-started/faq.md
>
> Цитаты:
> - [1] «FEOD и FSD решают близкую задачу: сделать архитектуру frontend-проекта понятной и устойчивой.» — найдена во фрагменте 1
> - [1] «в FEOD нет обязательного набора FSD-слоёв вроде `entities`, `features`, `widgets`;» — найдена во фрагменте 1
> - [1] «Если вы знаете FSD, можно думать о FEOD как о более прямом каркасе вокруг модулей и уровней.» — найдена во фрагменте 1
> - [2] «Нет. FEOD использует меньше верхних уровней и строит проект вокруг `modules`, public API и контролируемых зависимостей.» — найдена во фрагменте 2
> - [2] «Если команда приходит из FSD, сначала сопоставьте текущие `entities`, `features` и `widgets` с будущими `modules`, а затем проверьте public API каждого модуля.» — найдена во фрагменте 2

## q10. Какой state-менеджер рекомендует FEOD?

**Ожидание.** документация не называет конкретный state-менеджер; хороший ответ прямо говорит об этом и не придумывает рекомендацию.

**Ожидаемые источники:** —

**Запрос поиска:** Какой state-менеджер рекомендует FEOD

### Переданные фрагменты

Контекст пуст: модель не вызывалась.

### Ответ

Сообщение: 0 символов · rewrite 1.2 с · поиск 0.1 с · генерация 0.0 с

> Не знаю: ни один фрагмент не достиг порога сходства 0.55 (лучшее 0.520).
> Уточните вопрос: назовите раздел, термин или пример, о котором идёт речь.
>
> Ближайшие разделы ниже порога:
> - `get-started/faq.md` › FAQ · 0.520
> - `get-started/overview.md` › FEOD: методология frontend-архитектуры · 0.516
> - `get-started/is-feod-for-my-project.md` › Подходит ли FEOD моему проекту · 0.515

## q14. Какую версию React требует FEOD?

**Ожидание.** корпус не задаёт требуемую версию React; ответ не придумывает номер версии.

**Ожидаемые источники:** —

**Запрос поиска:** Какая версия React требуется для FEOD?

### Переданные фрагменты

| Фрагмент | Сходство | Файл | Разделы | chunk_id |
|---|---|---|---|---|
| 1 | 0.607 | `get-started/overview.md` | FEOD: методология frontend-архитектуры | `structure:get-started/overview.md#000-41b04377` |
| 2 | 0.596 | `get-started/is-feod-for-my-project.md` | Подходит ли FEOD моему проекту; Подходит ли FEOD моему проекту › Когда использовать | `structure:get-started/is-feod-for-my-project.md#000-4f24d7af` |
| 3 | 0.595 | `get-started/faq.md` | FAQ; FAQ › FEOD - это FSD? | `structure:get-started/faq.md#000-126c876e` |
| 4 | 0.591 | `reference/glossary.md` | Глоссарий › Термины | `structure:reference/glossary.md#002-98ffd897` |
| 5 | 0.590 | `get-started/is-feod-for-my-project.md` | Подходит ли FEOD моему проекту › Good example; Подходит ли FEOD моему проекту › Bad example; Подходит ли FEOD моему проекту › Решение; Подходит ли FEOD моему проекту › Связанные страницы | `structure:get-started/is-feod-for-my-project.md#002-d41120c4` |

### Ответ

Сообщение: 6300 символов · rewrite 1.1 с · поиск 0.1 с · генерация 1.4 с

> Не знаю. Во фрагментах нет сведений о том, какую версию React требует FEOD: упоминаний React или требований к его версии в предоставленных фрагментах нет.
>
> Уточнение: Вас интересует совместимость FEOD с конкретной версией React или общие требования методологии к frontend-стеку?

## q15. Какой тестовый раннер рекомендует FEOD — Jest или Vitest?

**Ожидание.** корпус не рекомендует конкретный тестовый раннер; ответ не выбирает инструмент без основания.

**Ожидаемые источники:** —

**Запрос поиска:** Какой тестовый раннер рекомендует FEOD — Jest или Vitest?

### Переданные фрагменты

Контекст пуст: модель не вызывалась.

### Ответ

Сообщение: 0 символов · rewrite 1.1 с · поиск 0.1 с · генерация 0.0 с

> Не знаю: ни один фрагмент не достиг порога сходства 0.55 (лучшее 0.483).
> Уточните вопрос: назовите раздел, термин или пример, о котором идёт речь.
>
> Ближайшие разделы ниже порога:
> - `reference/glossary.md` › Глоссарий › Термины · 0.483
> - `get-started/is-feod-for-my-project.md` › Подходит ли FEOD моему проекту · 0.470
> - `get-started/faq.md` › FAQ · 0.467
