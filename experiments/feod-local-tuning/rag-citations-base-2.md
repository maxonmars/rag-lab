# Источники, цитаты и режим «не знаю»

Прогон 2026-10-09T06:14:45.141Z. Вопросы: `experiments/feod-citations/questions.md` (10). Фактическая длительность прогона: 120.3 с.
Индекс создан 2026-09-30T14:27:30.045Z, модель эмбеддингов `bge-m3:latest` (digest 790764642607).
Модель ответов и переписывания запроса: `local · rag-local`. Шаблон ответа: `default` (prompts/answer.md). Поиск: стратегия structure, режим rewrite-filter, кандидатов 10, итоговый top-5, порог 0.55 (применяется).

## Сводка

| Показатель | Значение |
|---|---|
| Положительные: ответ с источником из переданных фрагментов | 7 из 7 |
| Положительные: ответ с дословной цитатой | 6 из 7 |
| Положительные: ожидаемый файл среди источников | 7 из 7 |
| Положительные: «не знаю» | 0 из 7 |
| Отрицательные: «не знаю» | 3 из 3 (пустой контекст 1, моделью 2) |
| Цитаты, найденные дословно | 16 из 19 |
| Ответы без замечаний | 7 из 10 |
| Ошибки модели (вопрос без ответа) | 0 из 10 |

Положительный вопрос — с ожидаемыми источниками, отрицательный — без них; показатели считаются по своей группе вопросов.
Источник засчитывается, если его номер есть среди переданных фрагментов; цитата — если после нормализации пробелов, регистра, «ё», Markdown-символов, тире и кавычек она является подстрокой текста указанного фрагмента.
Измерено: время этапов, размер сообщения, ошибки модели. Вычислено: разбор ответа, проверка ссылок и цитат. Совпадение смысла ответа с цитатами здесь не оценивается — ручная оценка в README эксперимента. «—» — знаменатель равен нулю.

## Время этапов

| Этап | Вопросов | Медиана, с | Максимум, с |
|---|---|---|---|
| Переписывание запроса | 10 | 0.8 | 1.3 |
| Поиск | 10 | 0.0 | 0.3 |
| Генерация ответа | 9 | 12.7 | 19.0 |
| Все этапы | 10 | 13.7 | 19.9 |

Переписывание — вызов модели для запроса поиска (режимы с rewrite); поиск — эмбеддинг запроса в Ollama и косинусный перебор; генерация — вызов модели с фрагментами, отказы по пустому контексту не учитываются; все этапы — сумма по вопросу. Вопросы с ошибкой модели не учитываются.

## Вопросы

| Вопрос | Ожидаемые источники | Исход | Лучшее сходство | Источники в контексте | Цитаты дословно | Rewrite, с | Генерация, с | Замечания |
|---|---|---|---|---|---|---|---|---|
| q02 | `core-concepts/levels.md`, `get-started/overview.md` | ответ | 0.677 | 1 из 1 | 1 из 1 | 0.6 | 2.7 | цитата [1] короче 20 символов |
| q03 | `structure/global.md` | ответ | 0.696 | 5 из 5 | 2 из 4 | 1.0 | 12.7 | цитата [2] не найдена во фрагменте 2; цитата [4] не найдена во фрагменте 4; у источника [1] нет цитаты |
| q04 | `reference/import-matrix.md`, `core-concepts/levels.md` | ответ | 0.693 | 2 из 2 | 3 из 3 | 1.3 | 15.8 | — |
| q05 | `get-started/faq.md`, `reference/import-matrix.md` | ответ | 0.635 | 3 из 3 | 3 из 3 | 0.9 | 19.0 | — |
| q06 | `reference/module-contract.md` | ответ | 0.599 | 1 из 1 | 5 из 5 | 1.1 | 8.9 | — |
| q07 | `get-started/faq.md`, `guides/where-to-place-code.md` | ответ | 0.650 | 1 из 1 | 0 из 1 | 0.6 | 6.2 | цитата [1] не найдена во фрагменте 1 |
| q08 | `get-started/overview.md`, `get-started/faq.md`, `guides/migration-from-fsd.md` | ответ | 0.645 | 2 из 2 | 2 из 2 | 0.7 | 17.2 | — |
| q10 | — | не знаю (модель) | 0.562 | — | — | 0.9 | 12.7 | — |
| q14 | — | не знаю (модель) | 0.583 | — | — | 0.6 | 16.0 | — |
| q15 | — | не знаю (пустой контекст) | 0.525 | — | — | 0.8 | — | — |

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

Сообщение: 5835 символов · rewrite 0.6 с · поиск 0.0 с · генерация 2.7 с

> В FEOD на верхнем уровне используются пять имён: `app`, `pages`, `modules`, `common` и `global` [1].
>
> Источники:
> - [1] `get-started/overview.md` › FEOD: методология frontend-архитектуры › Верхние уровни FEOD · `structure:get-started/overview.md#004-debd75dc` · https://github.com/feod-architecture/feod-docs/blob/f00eaf533cfee37f67e118c96291d535b0895a6f/docs/get-started/overview.md
>
> Цитаты:
> - [1] «src/» — найдена во фрагменте 1
>
> Замечания:
> - цитата [1] короче 20 символов

## q03. Что разрешено хранить на уровне global?

**Ожидание.** только инфраструктуру глобального действия — .d.ts, shims, polyfills, глобальные расширения типов, side-effect imports; нельзя бизнес-логику, UI, helpers и то, что импортируется как обычная зависимость.

**Ожидаемые источники:** `structure/global.md`

**Запрос поиска:** что разрешено хранить на уровне global

### Переданные фрагменты

| Фрагмент | Сходство | Файл | Разделы | chunk_id |
|---|---|---|---|---|
| 1 | 0.696 | `core-concepts/levels.md` | Уровни › Уровень global › Что нельзя хранить; Уровни › Уровень global › Good example; Уровни › Уровень global › Bad example | `structure:core-concepts/levels.md#013-d1e3079d` |
| 2 | 0.692 | `structure/global.md` | Global › Правило; Global › Почему | `structure:structure/global.md#001-5d719f07` |
| 3 | 0.652 | `core-concepts/levels.md` | Уровни › Уровень global; Уровни › Уровень global › Назначение; Уровни › Уровень global › Кто может импортировать; Уровни › Уровень global › Что может импортировать | `structure:core-concepts/levels.md#012-ae9f98df` |
| 4 | 0.622 | `structure/global.md` | Global › Что обычно лежит в global; Global › Что не должно лежать в global | `structure:structure/global.md#002-28f08b4c` |
| 5 | 0.619 | `reference/import-matrix.md` | Матрица импортов › global не импортируется напрямую | `structure:reference/import-matrix.md#006-4e1c6978` |

### Ответ

Сообщение: 4266 символов · rewrite 1.0 с · поиск 0.0 с · генерация 12.7 с

> На уровне `global` разрешено хранить только инфраструктурные сущности глобального действия [2]. К ним относятся:
>
> - файлы деклараций окружения (`.d.ts`), shims и polyfills [2];
> - глобальные расширения типов (`declare global`) [2];
> - side-effect imports (например, глобальные стили или runtime setup), если они подключаются через entrypoint или конфигурацию сборки [2];
> - runtime-инициализацию и редкие side-effect подключения [3].
>
> Этот уровень предназначен для кода, который действует на всё приложение целиком, и не должен содержать бизнес-логику, UI или обычные помощники, которые могли бы импортироваться прикладным кодом [2, 3].
>
> Источники:
> - [1] `core-concepts/levels.md` › Уровни › Уровень global › Что нельзя хранить; Уровни › Уровень global › Good example; Уровни › Уровень global › Bad example · `structure:core-concepts/levels.md#013-d1e3079d` · https://github.com/feod-architecture/feod-docs/blob/f00eaf533cfee37f67e118c96291d535b0895a6f/docs/core-concepts/levels.md
> - [2] `structure/global.md` › Global › Правило; Global › Почему · `structure:structure/global.md#001-5d719f07` · https://github.com/feod-architecture/feod-docs/blob/f00eaf533cfee37f67e118c96291d535b0895a6f/docs/structure/global.md
> - [3] `core-concepts/levels.md` › Уровни › Уровень global; Уровни › Уровень global › Назначение; Уровни › Уровень global › Кто может импортировать; Уровни › Уровень global › Что может импортировать · `structure:core-concepts/levels.md#012-ae9f98df` · https://github.com/feod-architecture/feod-docs/blob/f00eaf533cfee37f67e118c96291d535b0895a6f/docs/core-concepts/levels.md
> - [4] `structure/global.md` › Global › Что обычно лежит в global; Global › Что не должно лежать в global · `structure:structure/global.md#002-28f08b4c` · https://github.com/feod-architecture/feod-docs/blob/f00eaf533cfee37f67e118c96291d535b0895a6f/docs/structure/global.md
> - [5] `reference/import-matrix.md` › Матрица импортов › global не импортируется напрямую · `structure:reference/import-matrix.md#006-4e1c6978` · https://github.com/feod-architecture/feod-docs/blob/f00eaf533cfee37f67e118c96291d535b0895a6f/docs/reference/import-matrix.md
>
> Цитаты:
> - [2] «В `global` разрешено хранить только инфраструктурные сущности глобального действия: `.d.ts`; shims; polyfills; глобальные расширения типов; side-effect imports.» — не найдена во фрагменте 2
> - [3] «`global` хранит код, который действует на всё приложение целиком: shims, polyfills, глобальные декларации окружения, runtime-инициализацию и редкие side-effect подключения.» — найдена во фрагменте 3
> - [4] «В `global` обычно находятся: `env.d.ts`, `vite-env.d.ts` и другие декларации окружения; shims для платформы или тестовой среды; polyfills, которые подключаются до запуска приложения; `declare global` и другие расширения глобальных типов; side-effect imports вроде глобальных стилей или runtime setup, если проект подключает их через entrypoint или конфигурацию.» — не найдена во фрагменте 4
> - [5] «Уровень `global` хранит код, который действует на всё приложение: декларации окружения, shims, polyfills, runtime-инициализацию и редкие side-effect подключения.» — найдена во фрагменте 5
>
> Замечания:
> - цитата [2] не найдена во фрагменте 2
> - цитата [4] не найдена во фрагменте 4
> - у источника [1] нет цитаты

## q04. Что может импортировать код на уровне pages и что ему запрещено?

**Ожидание.** можно modules и common; запрещены app, global, другие страницы, внутренности чужих модулей и deep imports.

**Ожидаемые источники:** `reference/import-matrix.md`, `core-concepts/levels.md`

**Запрос поиска:** правила импорта кода на уровне pages ограничения на импортируемые модули запрещенные ресурсы

### Переданные фрагменты

| Фрагмент | Сходство | Файл | Разделы | chunk_id |
|---|---|---|---|---|
| 1 | 0.693 | `reference/import-matrix.md` | Матрица импортов › Что может импортировать код на уровне | `structure:reference/import-matrix.md#001-4c12c71d` |
| 2 | 0.683 | `core-concepts/levels.md` | Уровни › Уровень pages › Что может импортировать; Уровни › Уровень pages › Что нельзя хранить; Уровни › Уровень pages › Good example | `structure:core-concepts/levels.md#005-4270107b` |
| 3 | 0.672 | `structure/modules.md` | Modules › Взаимодействие модулей | `structure:structure/modules.md#006-afe37b04` |
| 4 | 0.652 | `core-concepts/levels.md` | Уровни › Уровень common › Кто может импортировать; Уровни › Уровень common › Что может импортировать; Уровни › Уровень common › Что нельзя хранить | `structure:core-concepts/levels.md#010-2620092b` |
| 5 | 0.648 | `core-concepts/levels.md` | Уровни › Уровень app › Типовые ошибки; Уровни › Уровень pages; Уровни › Уровень pages › Назначение; Уровни › Уровень pages › Кто может импортировать | `structure:core-concepts/levels.md#004-efd05f11` |

### Ответ

Сообщение: 4869 символов · rewrite 1.3 с · поиск 0.3 с · генерация 15.8 с

> Код на уровне `pages` может импортировать `modules` и `common` [2]. Ему запрещено импортировать `app`, `global`, другие страницы, а также внутренности чужих модулей и выполнять deep imports [1, 2].
>
> Источники:
> - [1] `reference/import-matrix.md` › Матрица импортов › Что может импортировать код на уровне · `structure:reference/import-matrix.md#001-4c12c71d` · https://github.com/feod-architecture/feod-docs/blob/f00eaf533cfee37f67e118c96291d535b0895a6f/docs/reference/import-matrix.md
> - [2] `core-concepts/levels.md` › Уровни › Уровень pages › Что может импортировать; Уровни › Уровень pages › Что нельзя хранить; Уровни › Уровень pages › Good example · `structure:core-concepts/levels.md#005-4270107b` · https://github.com/feod-architecture/feod-docs/blob/f00eaf533cfee37f67e118c96291d535b0895a6f/docs/core-concepts/levels.md
>
> Цитаты:
> - [1] «| `pages` | `modules`, `common` | `app`, `global`, другие страницы, внутренности чужих модулей, deep imports |» — найдена во фрагменте 1
> - [2] «Код на уровне `pages` может импортировать `modules`, `common`.» — найдена во фрагменте 2
> - [2] «`pages` не импортирует `app`, `global`, другие страницы и внутренности чужих модулей.» — найдена во фрагменте 2

## q05. Можно ли одному модулю импортировать другой модуль?

**Ожидание.** да, только через public API (корневой index.ts) и без циклических и скрытых зависимостей; импорт внутренних файлов (deep import) — нарушение.

**Ожидаемые источники:** `get-started/faq.md`, `reference/import-matrix.md`

**Запрос поиска:** модуль импорт модуль допустимость ограничений

### Переданные фрагменты

| Фрагмент | Сходство | Файл | Разделы | chunk_id |
|---|---|---|---|---|
| 1 | 0.635 | `structure/modules.md` | Modules › Взаимодействие модулей | `structure:structure/modules.md#006-afe37b04` |
| 2 | 0.613 | `core-concepts/modularity.md` | Модульность › Исключения; Модульность › Связанные страницы | `structure:core-concepts/modularity.md#005-c384f459` |
| 3 | 0.607 | `reference/import-matrix.md` | Матрица импортов › Что может импортировать код на уровне | `structure:reference/import-matrix.md#001-4c12c71d` |
| 4 | 0.600 | `guides/design-module.md` | Как проектировать модуль › Шаги | `structure:guides/design-module.md#005-26644456` |
| 5 | 0.591 | `get-started/faq.md` | FAQ › Что делать с legacy deep imports?; FAQ › Можно ли нарушить матрицу импортов? | `structure:get-started/faq.md#004-91350936` |

### Ответ

Сообщение: 4959 символов · rewrite 0.9 с · поиск 0.0 с · генерация 19.0 с

> Да, один модуль может импортировать другой, но только через его public API [1]. В матрице импортов для кода на уровне `modules` прямо указано, что разрешены зависимости к public API других модулей [3]. При этом запрещены deep imports во внутренности чужого модуля, а также импорт файлов из уровней `app` и `pages` [1, 3]. Исключение из этого правила должно быть явным и локальным; систематическое нарушение указывает на ошибку в проектировании границ модулей [5].
>
> Источники:
> - [1] `structure/modules.md` › Modules › Взаимодействие модулей · `structure:structure/modules.md#006-afe37b04` · https://github.com/feod-architecture/feod-docs/blob/f00eaf533cfee37f67e118c96291d535b0895a6f/docs/structure/modules.md
> - [3] `reference/import-matrix.md` › Матрица импортов › Что может импортировать код на уровне · `structure:reference/import-matrix.md#001-4c12c71d` · https://github.com/feod-architecture/feod-docs/blob/f00eaf533cfee37f67e118c96291d535b0895a6f/docs/reference/import-matrix.md
> - [5] `get-started/faq.md` › FAQ › Что делать с legacy deep imports?; FAQ › Можно ли нарушить матрицу импортов? · `structure:get-started/faq.md#004-91350936` · https://github.com/feod-architecture/feod-docs/blob/f00eaf533cfee37f67e118c96291d535b0895a6f/docs/get-started/faq.md
>
> Цитаты:
> - [1] «Модули могут импортировать другие модули только через их public API» — найдена во фрагменте 1
> - [3] «`modules` | `common`, public API других модулей, public API собственных подмодулей | `app`, `pages`, `global`, внутренности чужих модулей, deep imports» — найдена во фрагменте 3
> - [5] «Исключение должно быть явным и локальным. Если нарушение повторяется, это не исключение, а признак неверной границы модуля или уровня.» — найдена во фрагменте 5

## q06. Из чего состоит минимальный контракт модуля?

**Ожидание.** название (имя директории в modules), ответственность (README или описание в review), public API (корневой index.ts), внутренние детали (ui, model, api, lib), ограничения зависимостей (README, чеклист review или FEOD config).

**Ожидаемые источники:** `reference/module-contract.md`

**Запрос поиска:** состав минимальный контракт модуля структура элементы

### Переданные фрагменты

| Фрагмент | Сходство | Файл | Разделы | chunk_id |
|---|---|---|---|---|
| 1 | 0.599 | `reference/module-contract.md` | Контракт модуля › Минимальный контракт | `structure:reference/module-contract.md#001-67181b9f` |

### Ответ

Сообщение: 798 символов · rewrite 1.1 с · поиск 0.0 с · генерация 8.9 с

> Минимальный контракт модуля состоит из следующих частей: название модуля (фиксируется в имени директории в `modules`), ответственность (описывается в README или коротком описании в review), Public API (определяется в корневом `index.ts`), внутренние детали (расположены в директориях `ui`, `model`, `api`, `lib` и других) и ограничения зависимостей (документируются в README, review checklist или FEOD config) [1].
>
> Источники:
> - [1] `reference/module-contract.md` › Контракт модуля › Минимальный контракт · `structure:reference/module-contract.md#001-67181b9f` · https://github.com/feod-architecture/feod-docs/blob/f00eaf533cfee37f67e118c96291d535b0895a6f/docs/reference/module-contract.md
>
> Цитаты:
> - [1] «Название модуля | имя директории в `modules` | Показывает продуктовую область» — найдена во фрагменте 1
> - [1] «Ответственность | README или короткое описание в review | Ограничивает рост модуля» — найдена во фрагменте 1
> - [1] «Public API | корневой `index.ts` | Даёт поддерживаемую поверхность импорта» — найдена во фрагменте 1
> - [1] «Внутренние детали | директории `ui`, `model`, `api`, `lib` и другие | Могут меняться без внешнего контракта» — найдена во фрагменте 1
> - [1] «Ограничения зависимостей | README, review checklist или FEOD config | Помогают не создать скрытые связи» — найдена во фрагменте 1

## q07. Где хранить API-клиент?

**Ожидание.** API-клиент продуктовой области или сценария — внутри соответствующего модуля в modules; нейтральная HTTP-обёртка без доменных знаний — в common.

**Ожидаемые источники:** `get-started/faq.md`, `guides/where-to-place-code.md`

**Запрос поиска:** хранение API-клиента

### Переданные фрагменты

| Фрагмент | Сходство | Файл | Разделы | chunk_id |
|---|---|---|---|---|
| 1 | 0.650 | `get-started/faq.md` | FAQ › Где хранить API-клиент?; FAQ › Нужно ли всегда писать README модуля? | `structure:get-started/faq.md#003-6f83be8d` |
| 2 | 0.552 | `reference/code-smells.md` | Code smells › Module internals leaking › Как исправить; Code smells › Module internals leaking › Связанные правила | `structure:reference/code-smells.md#004-b54e699e` |

### Ответ

Сообщение: 1535 символов · rewrite 0.6 с · поиск 0.1 с · генерация 6.2 с

> API-клиент конкретной продуктовой области обычно хранится внутри соответствующего модуля. Нейтральная HTTP-обёртка без доменных знаний может храниться в папке `common` [1].
>
> Источники:
> - [1] `get-started/faq.md` › FAQ › Где хранить API-клиент?; FAQ › Нужно ли всегда писать README модуля? · `structure:get-started/faq.md#003-6f83be8d` · https://github.com/feod-architecture/feod-docs/blob/f00eaf533cfee37f67e118c96291d535b0895a6f/docs/get-started/faq.md
>
> Цитаты:
> - [1] «API-клиент конкретной продуктовой области обычно живёт внутри соответствующего модуля. Нейтральная HTTP-обёртка без доменных знаний может жить в `common».» — не найдена во фрагменте 1
>
> Замечания:
> - цитата [1] не найдена во фрагменте 1

## q08. Чем FEOD отличается от FSD?

**Ожидание.** это отдельная методология, а не переименование FSD; основной термин — уровень, а не слой; нет обязательных слоёв entities, features, widgets; главный строительный блок — модуль с public API и контролируемыми зависимостями.

**Ожидаемые источники:** `get-started/overview.md`, `get-started/faq.md`, `guides/migration-from-fsd.md`

**Запрос поиска:** отличие FEOD от FSD

### Переданные фрагменты

| Фрагмент | Сходство | Файл | Разделы | chunk_id |
|---|---|---|---|---|
| 1 | 0.645 | `get-started/overview.md` | FEOD: методология frontend-архитектуры › Чем FEOD отличается от FSD | `structure:get-started/overview.md#003-8bb951b9` |
| 2 | 0.574 | `get-started/faq.md` | FAQ; FAQ › FEOD - это FSD? | `structure:get-started/faq.md#000-126c876e` |
| 3 | 0.551 | `get-started/overview.md` | FEOD: методология frontend-архитектуры | `structure:get-started/overview.md#000-41b04377` |
| 4 | 0.550 | `reference/terms.md` | Термины › FEOD-сущность и DDD entity | `structure:reference/terms.md#003-0bf4dadc` |

### Ответ

Сообщение: 3836 символов · rewrite 0.7 с · поиск 0.1 с · генерация 17.2 с

> FEOD отличается от FSD тем, что использует термин «уровень» вместо «слой», не включает обязательные слои `entities`, `features` и `widgets`, а также концентрируется на модуле, его `public API` и границах зависимостей [1]. В FEOD используется меньше верхних уровней, и проект строится вокруг `modules` и контролируемых зависимостей, тогда как FSD предполагает более глубокую таксономию доменных типов [1, 2]. FEOD подходит для проектов, где не требуется детальная классификация доменных сущностей, но важны строгие правила импортов и масштабируемая структура [1].
>
> Источники:
> - [1] `get-started/overview.md` › FEOD: методология frontend-архитектуры › Чем FEOD отличается от FSD · `structure:get-started/overview.md#003-8bb951b9` · https://github.com/feod-architecture/feod-docs/blob/f00eaf533cfee37f67e118c96291d535b0895a6f/docs/get-started/overview.md
> - [2] `get-started/faq.md` › FAQ; FAQ › FEOD - это FSD? · `structure:get-started/faq.md#000-126c876e` · https://github.com/feod-architecture/feod-docs/blob/f00eaf533cfee37f67e118c96291d535b0895a6f/docs/get-started/faq.md
>
> Цитаты:
> - [1] «- в FEOD основной термин — **уровень**, а не слой;» — найдена во фрагменте 1
> - [2] «Нет. FEOD использует меньше верхних уровней и строит проект вокруг `modules`, public API и контролируемых зависимостей.» — найдена во фрагменте 2

## q10. Какой state-менеджер рекомендует FEOD?

**Ожидание.** документация не называет конкретный state-менеджер; хороший ответ прямо говорит об этом и не придумывает рекомендацию.

**Ожидаемые источники:** —

**Запрос поиска:** FEOD рекомендация state менеджер рекомендация

### Переданные фрагменты

| Фрагмент | Сходство | Файл | Разделы | chunk_id |
|---|---|---|---|---|
| 1 | 0.562 | `get-started/is-feod-for-my-project.md` | Подходит ли FEOD моему проекту; Подходит ли FEOD моему проекту › Когда использовать | `structure:get-started/is-feod-for-my-project.md#000-4f24d7af` |
| 2 | 0.559 | `get-started/overview.md` | FEOD: методология frontend-архитектуры | `structure:get-started/overview.md#000-41b04377` |
| 3 | 0.558 | `get-started/faq.md` | FAQ; FAQ › FEOD - это FSD? | `structure:get-started/faq.md#000-126c876e` |
| 4 | 0.557 | `get-started/is-feod-for-my-project.md` | Подходит ли FEOD моему проекту › Good example; Подходит ли FEOD моему проекту › Bad example; Подходит ли FEOD моему проекту › Решение; Подходит ли FEOD моему проекту › Связанные страницы | `structure:get-started/is-feod-for-my-project.md#002-d41120c4` |

### Ответ

Сообщение: 4386 символов · rewrite 0.9 с · поиск 0.0 с · генерация 12.7 с

> Не знаю. В предоставленных фрагментах документации отсутствуют сведения о рекомендациях по выбору state-менеджера.
>
> Уточнение: Уточните, пожалуйста, ищете ли вы информацию о конкретных инструментах управления состоянием приложений, так как в текущих фрагментах описывается только общая методология архитектуры и границы модулей.

## q14. Какую версию React требует FEOD?

**Ожидание.** корпус не задаёт требуемую версию React; ответ не придумывает номер версии.

**Ожидаемые источники:** —

**Запрос поиска:** версия React FEOD требования

### Переданные фрагменты

| Фрагмент | Сходство | Файл | Разделы | chunk_id |
|---|---|---|---|---|
| 1 | 0.583 | `reference/glossary.md` | Глоссарий › Термины | `structure:reference/glossary.md#002-98ffd897` |
| 2 | 0.576 | `get-started/faq.md` | FAQ; FAQ › FEOD - это FSD? | `structure:get-started/faq.md#000-126c876e` |
| 3 | 0.571 | `get-started/is-feod-for-my-project.md` | Подходит ли FEOD моему проекту; Подходит ли FEOD моему проекту › Когда использовать | `structure:get-started/is-feod-for-my-project.md#000-4f24d7af` |
| 4 | 0.569 | `get-started/overview.md` | FEOD: методология frontend-архитектуры | `structure:get-started/overview.md#000-41b04377` |
| 5 | 0.563 | `get-started/overview.md` | FEOD: методология frontend-архитектуры › Верхние уровни FEOD | `structure:get-started/overview.md#004-debd75dc` |

### Ответ

Сообщение: 5957 символов · rewrite 0.6 с · поиск 0.0 с · генерация 16.0 с

> Не знаю. Во предоставленных фрагментах отсутствуют сведения о требованиях к конкретной версии библиотек, включая React.
>
> Уточнение: Уточните, пожалуйста, в каком разделе документации может содержаться информация о версиях зависимостей, или предоставьте дополнительные фрагменты, относящиеся к настройке окружения или требованиям к технологиям.

## q15. Какой тестовый раннер рекомендует FEOD — Jest или Vitest?

**Ожидание.** корпус не рекомендует конкретный тестовый раннер; ответ не выбирает инструмент без основания.

**Ожидаемые источники:** —

**Запрос поиска:** рекомендуемый тестовый раннер FEOD Jest или Vitest

### Переданные фрагменты

Контекст пуст: модель не вызывалась.

### Ответ

Сообщение: 0 символов · rewrite 0.8 с · поиск 0.0 с · генерация 0.0 с

> Не знаю: ни один фрагмент не достиг порога сходства 0.55 (лучшее 0.525).
> Уточните вопрос: назовите раздел, термин или пример, о котором идёт речь.
>
> Ближайшие разделы ниже порога:
> - `reference/glossary.md` › Глоссарий › Термины · 0.525
> - `get-started/is-feod-for-my-project.md` › Подходит ли FEOD моему проекту › Когда не начинать с FEOD · 0.514
> - `get-started/is-feod-for-my-project.md` › Подходит ли FEOD моему проекту · 0.508
