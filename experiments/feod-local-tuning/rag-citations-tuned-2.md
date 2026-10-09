# Источники, цитаты и режим «не знаю»

Прогон 2026-10-09T06:29:06.087Z. Вопросы: `experiments/feod-citations/questions.md` (10). Фактическая длительность прогона: 134.2 с.
Индекс создан 2026-09-30T14:27:30.045Z, модель эмбеддингов `bge-m3:latest` (digest 790764642607).
Модель ответов и переписывания запроса: `local · rag-local-opt`. Шаблон ответа: `compact` (prompts/answer-compact.md). Поиск: стратегия structure, режим rewrite-filter, кандидатов 10, итоговый top-5, порог 0.55 (применяется).

## Сводка

| Показатель | Значение |
|---|---|
| Положительные: ответ с источником из переданных фрагментов | 7 из 7 |
| Положительные: ответ с дословной цитатой | 7 из 7 |
| Положительные: ожидаемый файл среди источников | 7 из 7 |
| Положительные: «не знаю» | 0 из 7 |
| Отрицательные: «не знаю» | 3 из 3 (пустой контекст 1, моделью 2) |
| Цитаты, найденные дословно | 25 из 27 |
| Ответы без замечаний | 9 из 10 |
| Ошибки модели (вопрос без ответа) | 0 из 10 |

Положительный вопрос — с ожидаемыми источниками, отрицательный — без них; показатели считаются по своей группе вопросов.
Источник засчитывается, если его номер есть среди переданных фрагментов; цитата — если после нормализации пробелов, регистра, «ё», Markdown-символов, тире и кавычек она является подстрокой текста указанного фрагмента.
Измерено: время этапов, размер сообщения, ошибки модели. Вычислено: разбор ответа, проверка ссылок и цитат. Совпадение смысла ответа с цитатами здесь не оценивается — ручная оценка в README эксперимента. «—» — знаменатель равен нулю.

## Время этапов

| Этап | Вопросов | Медиана, с | Максимум, с |
|---|---|---|---|
| Переписывание запроса | 10 | 0.6 | 1.7 |
| Поиск | 10 | 0.0 | 0.1 |
| Генерация ответа | 9 | 11.0 | 29.7 |
| Все этапы | 10 | 11.7 | 30.9 |

Переписывание — вызов модели для запроса поиска (режимы с rewrite); поиск — эмбеддинг запроса в Ollama и косинусный перебор; генерация — вызов модели с фрагментами, отказы по пустому контексту не учитываются; все этапы — сумма по вопросу. Вопросы с ошибкой модели не учитываются.

## Вопросы

| Вопрос | Ожидаемые источники | Исход | Лучшее сходство | Источники в контексте | Цитаты дословно | Rewrite, с | Генерация, с | Замечания |
|---|---|---|---|---|---|---|---|---|
| q02 | `core-concepts/levels.md`, `get-started/overview.md` | ответ | 0.677 | 4 из 4 | 4 из 4 | 0.5 | 4.7 | — |
| q03 | `structure/global.md` | ответ | 0.696 | 5 из 5 | 5 из 5 | 0.5 | 21.9 | — |
| q04 | `reference/import-matrix.md`, `core-concepts/levels.md` | ответ | 0.682 | 4 из 4 | 3 из 5 | 1.1 | 29.7 | лишний раздел «Ответ»; лишний раздел «Источники»; лишний раздел «Цитаты»; цитата [3] не найдена во фрагменте 3; цитата [5] не найдена во фрагменте 5 |
| q05 | `get-started/faq.md`, `reference/import-matrix.md` | ответ | 0.640 | 2 из 2 | 2 из 2 | 0.6 | 18.5 | — |
| q06 | `reference/module-contract.md` | ответ | 0.599 | 1 из 1 | 5 из 5 | 1.7 | 10.1 | — |
| q07 | `get-started/faq.md`, `guides/where-to-place-code.md` | ответ | 0.650 | 2 из 2 | 2 из 2 | 0.4 | 7.0 | — |
| q08 | `get-started/overview.md`, `get-started/faq.md`, `guides/migration-from-fsd.md` | ответ | 0.663 | 2 из 2 | 4 из 4 | 0.6 | 14.3 | — |
| q10 | — | не знаю (пустой контекст) | 0.453 | — | — | 0.5 | — | — |
| q14 | — | не знаю (модель) | 0.563 | — | — | 0.6 | 11.0 | — |
| q15 | — | не знаю (модель) | 0.559 | — | — | 0.8 | 9.5 | — |

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

Сообщение: 5835 символов · rewrite 0.5 с · поиск 0.0 с · генерация 4.7 с

> В FEOD используются только пять верхних уровней: `app`, `pages`, `modules`, `common` и `global` [1][3][4][5].
>
> Источники:
> - [1] `get-started/overview.md` › FEOD: методология frontend-архитектуры › Верхние уровни FEOD · `structure:get-started/overview.md#004-debd75dc` · https://github.com/feod-architecture/feod-docs/blob/f00eaf533cfee37f67e118c96291d535b0895a6f/docs/get-started/overview.md
> - [3] `reference/glossary.md` › Глоссарий; Глоссарий › Термины · `structure:reference/glossary.md#000-cadc2cf1` · https://github.com/feod-architecture/feod-docs/blob/f00eaf533cfee37f67e118c96291d535b0895a6f/docs/reference/glossary.md
> - [4] `reference/terms.md` › Термины › Перед публикацией страницы; Термины › Связанные страницы · `structure:reference/terms.md#006-ddb70570` · https://github.com/feod-architecture/feod-docs/blob/f00eaf533cfee37f67e118c96291d535b0895a6f/docs/reference/terms.md
> - [5] `core-concepts/levels.md` › Уровни › Правило; Уровни › Почему; Уровни › Быстрый reference · `structure:core-concepts/levels.md#001-1060540c` · https://github.com/feod-architecture/feod-docs/blob/f00eaf533cfee37f67e118c96291d535b0895a6f/docs/core-concepts/levels.md
>
> Цитаты:
> - [1] «На верхнем уровне проекта FEOD использует только пять имён» — найдена во фрагменте 1
> - [3] «Верхняя структурная зона FEOD с собственной ролью и правилами зависимостей» — найдена во фрагменте 3
> - [4] «Верхние уровни названы как `app`, `pages`, `modules`, `common`, `global`» — найдена во фрагменте 4
> - [5] «В FEOD используются только уровни `app`, `pages`, `modules`, `common`, `global`» — найдена во фрагменте 5

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

Сообщение: 4266 символов · rewrite 0.5 с · поиск 0.0 с · генерация 21.9 с

> На уровне `global` разрешено хранить только инфраструктурные сущности глобального действия [2]. К ним относятся:
> - `.d.ts` [2];
> - shims [2];
> - polyfills [2];
> - глобальные расширения типов [2];
> - side-effect imports [2].
>
> Более детально уровень `global` может содержать:
> - `env.d.ts`, `vite-env.d.ts` и другие декларации окружения [4];
> - shims для платформы или тестовой среды [4];
> - polyfills, которые подключаются до запуска приложения [4];
> - `declare global` и другие расширения глобальных типов [4];
> - side-effect imports вроде глобальных стилей или runtime setup [4].
>
> Кроме того, по другим фрагментам, уровень хранит код, который действует на всё приложение целиком: shims, polyfills, глобальные декларации окружения, runtime-инициализацию и редкие side-effect подключения [3]. Это инфраструктурная точка подключения, а не public API для прикладного кода [5]. Также упоминаются глобальные объявления и конфигурации, связанные с загрузкой ресурсов (например, CSS и плагины вроде `focus-visible`) через side-effect imports [1].
>
> Источники:
> - [1] `core-concepts/levels.md` › Уровни › Уровень global › Что нельзя хранить; Уровни › Уровень global › Good example; Уровни › Уровень global › Bad example · `structure:core-concepts/levels.md#013-d1e3079d` · https://github.com/feod-architecture/feod-docs/blob/f00eaf533cfee37f67e118c96291d535b0895a6f/docs/core-concepts/levels.md
> - [2] `structure/global.md` › Global › Правило; Global › Почему · `structure:structure/global.md#001-5d719f07` · https://github.com/feod-architecture/feod-docs/blob/f00eaf533cfee37f67e118c96291d535b0895a6f/docs/structure/global.md
> - [3] `core-concepts/levels.md` › Уровни › Уровень global; Уровни › Уровень global › Назначение; Уровни › Уровень global › Кто может импортировать; Уровни › Уровень global › Что может импортировать · `structure:core-concepts/levels.md#012-ae9f98df` · https://github.com/feod-architecture/feod-docs/blob/f00eaf533cfee37f67e118c96291d535b0895a6f/docs/core-concepts/levels.md
> - [4] `structure/global.md` › Global › Что обычно лежит в global; Global › Что не должно лежать в global · `structure:structure/global.md#002-28f08b4c` · https://github.com/feod-architecture/feod-docs/blob/f00eaf533cfee37f67e118c96291d535b0895a6f/docs/structure/global.md
> - [5] `reference/import-matrix.md` › Матрица импортов › global не импортируется напрямую · `structure:reference/import-matrix.md#006-4e1c6978` · https://github.com/feod-architecture/feod-docs/blob/f00eaf533cfee37f67e118c96291d535b0895a6f/docs/reference/import-matrix.md
>
> Цитаты:
> - [1] «`import "focus-visible"; import "./styles.css";`» — найдена во фрагменте 1
> - [2] «`В global разрешено хранить только инфраструктурные сущности глобального действия:`» — найдена во фрагменте 2
> - [3] «`global хранит код, который действует на всё приложение целиком: shims, polyfills, глобальные декларации окружения, runtime-инициализацию и редкие side-effect подключения.`» — найдена во фрагменте 3
> - [4] «`env.d.ts, vite-env.d.ts и другие декларации окружения;`» — найдена во фрагменте 4
> - [5] «`Уровень global хранит код, который действует на всё приложение: декларации окружения, shims, polyfills, runtime-инициализацию и редкие side-effect подключения.`» — найдена во фрагменте 5

## q04. Что может импортировать код на уровне pages и что ему запрещено?

**Ожидание.** можно modules и common; запрещены app, global, другие страницы, внутренности чужих модулей и deep imports.

**Ожидаемые источники:** `reference/import-matrix.md`, `core-concepts/levels.md`

**Запрос поиска:** импорт в код на уровне pages разрешенные и запрещенные модули или сущности

### Переданные фрагменты

| Фрагмент | Сходство | Файл | Разделы | chunk_id |
|---|---|---|---|---|
| 1 | 0.682 | `reference/import-matrix.md` | Матрица импортов › Что может импортировать код на уровне | `structure:reference/import-matrix.md#001-4c12c71d` |
| 2 | 0.679 | `core-concepts/levels.md` | Уровни › Уровень pages › Что может импортировать; Уровни › Уровень pages › Что нельзя хранить; Уровни › Уровень pages › Good example | `structure:core-concepts/levels.md#005-4270107b` |
| 3 | 0.673 | `structure/modules.md` | Modules › Взаимодействие модулей | `structure:structure/modules.md#006-afe37b04` |
| 4 | 0.669 | `core-concepts/levels.md` | Уровни › Уровень common › Кто может импортировать; Уровни › Уровень common › Что может импортировать; Уровни › Уровень common › Что нельзя хранить | `structure:core-concepts/levels.md#010-2620092b` |
| 5 | 0.646 | `core-concepts/levels.md` | Уровни › Уровень modules; Уровни › Уровень modules › Назначение; Уровни › Уровень modules › Кто может импортировать; Уровни › Уровень modules › Что может импортировать | `structure:core-concepts/levels.md#007-2adcd648` |

### Ответ

Сообщение: 4873 символов · rewrite 1.1 с · поиск 0.0 с · генерация 29.7 с

> Код на уровне `pages` может импортировать уровни `modules` и `common` [2][5].
> Коду на уровне `pages` запрещено импортировать:
> - уровень `app`;
> - уровень `global`;
> - другие страницы (внутренности чужих страниц);
> - внутренности чужих модулей (в том числе deep imports) [1][2][3].
>
> Источники:
> - [1] `reference/import-matrix.md` › Матрица импортов › Что может импортировать код на уровне · `structure:reference/import-matrix.md#001-4c12c71d` · https://github.com/feod-architecture/feod-docs/blob/f00eaf533cfee37f67e118c96291d535b0895a6f/docs/reference/import-matrix.md
> - [2] `core-concepts/levels.md` › Уровни › Уровень pages › Что может импортировать; Уровни › Уровень pages › Что нельзя хранить; Уровни › Уровень pages › Good example · `structure:core-concepts/levels.md#005-4270107b` · https://github.com/feod-architecture/feod-docs/blob/f00eaf533cfee37f67e118c96291d535b0895a6f/docs/core-concepts/levels.md
> - [3] `structure/modules.md` › Modules › Взаимодействие модулей · `structure:structure/modules.md#006-afe37b04` · https://github.com/feod-architecture/feod-docs/blob/f00eaf533cfee37f67e118c96291d535b0895a6f/docs/structure/modules.md
> - [5] `core-concepts/levels.md` › Уровни › Уровень modules; Уровни › Уровень modules › Назначение; Уровни › Уровень modules › Кто может импортировать; Уровни › Уровень modules › Что может импортировать · `structure:core-concepts/levels.md#007-2adcd648` · https://github.com/feod-architecture/feod-docs/blob/f00eaf533cfee37f67e118c96291d535b0895a6f/docs/core-concepts/levels.md
>
> Цитаты:
> - [1] «`pages` | `modules`, `common` | `app`, `global`, другие страницы, внутренности чужих модулей, deep imports» — найдена во фрагменте 1
> - [2] «Код на уровне `pages` может импортировать `modules`, `common`.» — найдена во фрагменте 2
> - [2] «`pages` не импортирует `app`, `global`, другие страницы и внутренности чужих модулей.» — найдена во фрагменте 2
> - [3] «импорт `pages` из `modules`" (как контекст к запрету cross-imports, но в вопросе про pages, лучше использовать прямую цитату из фрагмента 2 или 1, цитата из 3 здесь не совсем по делу, уберу ее из мыслей. В выводе использую только релевантное).» — не найдена во фрагменте 3
> - [5] «`modules` не импортирует `app`, `pages`, `global` и внутренности чужих модулей." (Это про modules, а не pages, так что в разделе "Цитаты" использую только [1] и [2]].» — не найдена во фрагменте 5
>
> Замечания:
> - лишний раздел «Ответ»
> - лишний раздел «Источники»
> - лишний раздел «Цитаты»
> - цитата [3] не найдена во фрагменте 3
> - цитата [5] не найдена во фрагменте 5

## q05. Можно ли одному модулю импортировать другой модуль?

**Ожидание.** да, только через public API (корневой index.ts) и без циклических и скрытых зависимостей; импорт внутренних файлов (deep import) — нарушение.

**Ожидаемые источники:** `get-started/faq.md`, `reference/import-matrix.md`

**Запрос поиска:** возможность импорта одного модуля другим модулем

### Переданные фрагменты

| Фрагмент | Сходство | Файл | Разделы | chunk_id |
|---|---|---|---|---|
| 1 | 0.640 | `structure/modules.md` | Modules › Взаимодействие модулей | `structure:structure/modules.md#006-afe37b04` |
| 2 | 0.613 | `get-started/faq.md` | FAQ › Можно ли использовать FEOD без common?; FAQ › Можно ли модулю импортировать другой модуль? | `structure:get-started/faq.md#001-d645a78d` |
| 3 | 0.593 | `get-started/faq.md` | FAQ › Что делать с legacy deep imports?; FAQ › Можно ли нарушить матрицу импортов? | `structure:get-started/faq.md#004-91350936` |
| 4 | 0.583 | `reference/import-matrix.md` | Матрица импортов; Матрица импортов › Базовое правило | `structure:reference/import-matrix.md#000-10737c77` |
| 5 | 0.578 | `guides/design-module.md` | Как проектировать модуль › Шаги | `structure:guides/design-module.md#002-54949f50` |

### Ответ

Сообщение: 5589 символов · rewrite 0.6 с · поиск 0.1 с · генерация 18.5 с

> Да, модуль может импортировать другой модуль, если импорт выполняется через public API целевого модуля, направление зависимости определяется матрицей импортов, и при этом не создаётся циклическая или скрытая зависимость [1] [2]. Запрещается выполнять deep import во внутренние файлы (например, путь к конкретной модели вместо корня модуля), а также импортировать уровни `app` или `pages` из `modules` [1] [2].
>
> Источники:
> - [1] `structure/modules.md` › Modules › Взаимодействие модулей · `structure:structure/modules.md#006-afe37b04` · https://github.com/feod-architecture/feod-docs/blob/f00eaf533cfee37f67e118c96291d535b0895a6f/docs/structure/modules.md
> - [2] `get-started/faq.md` › FAQ › Можно ли использовать FEOD без common?; FAQ › Можно ли модулю импортировать другой модуль? · `structure:get-started/faq.md#001-d645a78d` · https://github.com/feod-architecture/feod-docs/blob/f00eaf533cfee37f67e118c96291d535b0895a6f/docs/get-started/faq.md
>
> Цитаты:
> - [1] «Модули могут импортировать другие модули только через их public API.» — найдена во фрагменте 1
> - [2] «Да, если импорт идёт через public API другого модуля и не создаёт циклическую или скрытую зависимость.» — найдена во фрагменте 2

## q06. Из чего состоит минимальный контракт модуля?

**Ожидание.** название (имя директории в modules), ответственность (README или описание в review), public API (корневой index.ts), внутренние детали (ui, model, api, lib), ограничения зависимостей (README, чеклист review или FEOD config).

**Ожидаемые источники:** `reference/module-contract.md`

**Запрос поиска:** состав минимального контракта модуля

### Переданные фрагменты

| Фрагмент | Сходство | Файл | Разделы | chunk_id |
|---|---|---|---|---|
| 1 | 0.599 | `reference/module-contract.md` | Контракт модуля › Минимальный контракт | `structure:reference/module-contract.md#001-67181b9f` |

### Ответ

Сообщение: 798 символов · rewrite 1.7 с · поиск 0.0 с · генерация 10.1 с

> Минимальный контракт модуля состоит из следующих частей:
> 1. Название модуля, которое фиксируется в имени директории в `modules` и показывает продуктовую область [1].
> 2. Ответственность, которая фиксируется в README или коротком описании в review и ограничивает рост модуля [1].
> 3. Public API, который находится в корневом `index.ts` и даёт поддерживаемую поверхность импорта [1].
> 4. Внутренние детали, расположенные в директориях `ui`, `model`, `api`, `lib` и других, которые могут меняться без внешнего контракта [1].
> 5. Ограничения зависимостей, зафиксированные в README, review checklist или FEOD config, которые помогают не создать скрытые связи [1].
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

Сообщение: 1535 символов · rewrite 0.4 с · поиск 0.0 с · генерация 7.0 с

> API-клиент конкретной продуктовой области обычно живёт внутри соответствующего модуля. Нейтральная HTTP-обёртка без доменных знаний может жить в `common` [1]. Для внешнего кода рекомендуется открывать устойчивую функцию, hook, компонент или adapter вместо внутреннего store, raw client или cache shape [2].
>
> Источники:
> - [1] `get-started/faq.md` › FAQ › Где хранить API-клиент?; FAQ › Нужно ли всегда писать README модуля? · `structure:get-started/faq.md#003-6f83be8d` · https://github.com/feod-architecture/feod-docs/blob/f00eaf533cfee37f67e118c96291d535b0895a6f/docs/get-started/faq.md
> - [2] `reference/code-smells.md` › Code smells › Module internals leaking › Как исправить; Code smells › Module internals leaking › Связанные правила · `structure:reference/code-smells.md#004-b54e699e` · https://github.com/feod-architecture/feod-docs/blob/f00eaf533cfee37f67e118c96291d535b0895a6f/docs/reference/code-smells.md
>
> Цитаты:
> - [1] «API-клиент конкретной продуктовой области обычно живёт внутри соответствующего модуля» — найдена во фрагменте 1
> - [2] «Для внешнего кода открывайте устойчивую функцию, hook, компонент или adapter вместо внутреннего store, raw client или cache shape» — найдена во фрагменте 2

## q08. Чем FEOD отличается от FSD?

**Ожидание.** это отдельная методология, а не переименование FSD; основной термин — уровень, а не слой; нет обязательных слоёв entities, features, widgets; главный строительный блок — модуль с public API и контролируемыми зависимостями.

**Ожидаемые источники:** `get-started/overview.md`, `get-started/faq.md`, `guides/migration-from-fsd.md`

**Запрос поиска:** FEOD FSD разница отличия

### Переданные фрагменты

| Фрагмент | Сходство | Файл | Разделы | chunk_id |
|---|---|---|---|---|
| 1 | 0.663 | `get-started/overview.md` | FEOD: методология frontend-архитектуры › Чем FEOD отличается от FSD | `structure:get-started/overview.md#003-8bb951b9` |
| 2 | 0.568 | `get-started/faq.md` | FAQ; FAQ › FEOD - это FSD? | `structure:get-started/faq.md#000-126c876e` |

### Ответ

Сообщение: 1884 символов · rewrite 0.6 с · поиск 0.0 с · генерация 14.3 с

> FEOD и FSD решают схожую задачу, но FEOD описывает архитектуру через уровни `app`, `pages`, `modules`, `common`, `global`, выделяя модуль как главный строительный блок [1]. Практические отличия FEOD от FSD состоят в следующих пунктах:
> - Основной термин в FEOD — это **уровень**, тогда как в FSD используется термин **слой** [1].
> - В FEOD отсутствует обязательный набор слоёв, характерный для FSD (таких как `entities`, `features`, `widgets`) [1].
> - FEOD сосредоточен на модуле, его `public API` и границе зависимостей [1].
> - FEOD проще применять в проектах, которым не требуется глубокая таксономия доменных типов, но нужны строгие правила импортов и масштабируемая структура [1].
> - FEOD использует меньшее число верхних уровней и строит проект вокруг `modules`, public API и контролируемых зависимостей, что отличает его от FSD [2].
>
> Источники:
> - [1] `get-started/overview.md` › FEOD: методология frontend-архитектуры › Чем FEOD отличается от FSD · `structure:get-started/overview.md#003-8bb951b9` · https://github.com/feod-architecture/feod-docs/blob/f00eaf533cfee37f67e118c96291d535b0895a6f/docs/get-started/overview.md
> - [2] `get-started/faq.md` › FAQ; FAQ › FEOD - это FSD? · `structure:get-started/faq.md#000-126c876e` · https://github.com/feod-architecture/feod-docs/blob/f00eaf533cfee37f67e118c96291d535b0895a6f/docs/get-started/faq.md
>
> Цитаты:
> - [1] «Но FEOD описывает её через уровни `app`, `pages`, `modules`, `common`, `global` и делает модуль главным строительным блоком.» — найдена во фрагменте 1
> - [1] «в FEOD основной термин — **уровень**, а не слой» — найдена во фрагменте 1
> - [1] «в FEOD нет обязательного набора FSD-слоёв вроде `entities`, `features`, `widgets`» — найдена во фрагменте 1
> - [2] «FEOD использует меньше верхних уровней и строит проект вокруг `modules`, public API и контролируемых зависимостей.» — найдена во фрагменте 2

## q10. Какой state-менеджер рекомендует FEOD?

**Ожидание.** документация не называет конкретный state-менеджер; хороший ответ прямо говорит об этом и не придумывает рекомендацию.

**Ожидаемые источники:** —

**Запрос поиска:** RECOMMENDED STATE MANAGER FEOD

### Переданные фрагменты

Контекст пуст: модель не вызывалась.

### Ответ

Сообщение: 0 символов · rewrite 0.5 с · поиск 0.1 с · генерация 0.0 с

> Не знаю: ни один фрагмент не достиг порога сходства 0.55 (лучшее 0.453).
> Уточните вопрос: назовите раздел, термин или пример, о котором идёт речь.
>
> Ближайшие разделы ниже порога:
> - `reference/code-smells.md` › Code smells · 0.453
> - `get-started/faq.md` › FAQ · 0.450
> - `reference/glossary.md` › Глоссарий › Термины · 0.446

## q14. Какую версию React требует FEOD?

**Ожидание.** корпус не задаёт требуемую версию React; ответ не придумывает номер версии.

**Ожидаемые источники:** —

**Запрос поиска:** версия React FEOD

### Переданные фрагменты

| Фрагмент | Сходство | Файл | Разделы | chunk_id |
|---|---|---|---|---|
| 1 | 0.563 | `reference/glossary.md` | Глоссарий › Термины | `structure:reference/glossary.md#002-98ffd897` |
| 2 | 0.562 | `get-started/faq.md` | FAQ; FAQ › FEOD - это FSD? | `structure:get-started/faq.md#000-126c876e` |
| 3 | 0.560 | `get-started/overview.md` | FEOD: методология frontend-архитектуры | `structure:get-started/overview.md#000-41b04377` |

### Ответ

Сообщение: 3957 символов · rewrite 0.6 с · поиск 0.0 с · генерация 11.0 с

> Не знаю. В предоставленных фрагментах отсутствует информация о том, какую версию React требует методология FEOD.
>
> Уточнение: Указана ли поддержка конкретной версии React в других разделах документации, таких как `Core Concepts` или `Structure`?

## q15. Какой тестовый раннер рекомендует FEOD — Jest или Vitest?

**Ожидание.** корпус не рекомендует конкретный тестовый раннер; ответ не выбирает инструмент без основания.

**Ожидаемые источники:** —

**Запрос поиска:** тестовый раннер FEOD рекомендация Jest Vitest

### Переданные фрагменты

| Фрагмент | Сходство | Файл | Разделы | chunk_id |
|---|---|---|---|---|
| 1 | 0.559 | `get-started/is-feod-for-my-project.md` | Подходит ли FEOD моему проекту; Подходит ли FEOD моему проекту › Когда использовать | `structure:get-started/is-feod-for-my-project.md#000-4f24d7af` |
| 2 | 0.554 | `reference/glossary.md` | Глоссарий › Термины | `structure:reference/glossary.md#002-98ffd897` |

### Ответ

Сообщение: 3153 символов · rewrite 0.8 с · поиск 0.0 с · генерация 9.5 с

> Не знаю. В предоставленных фрагментах документации отсутствуют сведения о рекомендуемых тестовых раннерах (Jest или Vitest).
>
> Уточнение: Какой из инструментов для тестирования упоминается в других разделах документации или каких ещё тестовых решений вы ожидали найти по данному вопросу?
