# Источники, цитаты и режим «не знаю»

Прогон 2026-10-07T13:34:59.222Z. Вопросы: `experiments/feod-citations/questions.md` (10). Фактическая длительность прогона: 30.2 с.
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
| Цитаты, найденные дословно | 29 из 29 |
| Ответы без замечаний | 10 из 10 |
| Ошибки модели (вопрос без ответа) | 0 из 10 |

Положительный вопрос — с ожидаемыми источниками, отрицательный — без них; показатели считаются по своей группе вопросов.
Источник засчитывается, если его номер есть среди переданных фрагментов; цитата — если после нормализации пробелов, регистра, «ё», Markdown-символов, тире и кавычек она является подстрокой текста указанного фрагмента.
Измерено: время этапов, размер сообщения, ошибки модели. Вычислено: разбор ответа, проверка ссылок и цитат. Совпадение смысла ответа с цитатами здесь не оценивается — ручная оценка в README эксперимента. «—» — знаменатель равен нулю.

## Время этапов

| Этап | Вопросов | Медиана, с | Максимум, с |
|---|---|---|---|
| Переписывание запроса | 10 | 1.4 | 1.7 |
| Поиск | 10 | 0.1 | 0.1 |
| Генерация ответа | 8 | 1.9 | 2.9 |
| Все этапы | 10 | 3.3 | 4.1 |

Переписывание — вызов модели для запроса поиска (режимы с rewrite); поиск — эмбеддинг запроса в Ollama и косинусный перебор; генерация — вызов модели с фрагментами, отказы по пустому контексту не учитываются; все этапы — сумма по вопросу. Вопросы с ошибкой модели не учитываются.

## Вопросы

| Вопрос | Ожидаемые источники | Исход | Лучшее сходство | Источники в контексте | Цитаты дословно | Rewrite, с | Генерация, с | Замечания |
|---|---|---|---|---|---|---|---|---|
| q02 | `core-concepts/levels.md`, `get-started/overview.md` | ответ | 0.677 | 4 из 4 | 4 из 4 | 1.4 | 1.9 | — |
| q03 | `structure/global.md` | ответ | 0.706 | 3 из 3 | 3 из 3 | 1.4 | 2.2 | — |
| q04 | `reference/import-matrix.md`, `core-concepts/levels.md` | ответ | 0.705 | 3 из 3 | 3 из 3 | 1.3 | 1.6 | — |
| q05 | `get-started/faq.md`, `reference/import-matrix.md` | ответ | 0.615 | 3 из 3 | 3 из 3 | 1.4 | 1.9 | — |
| q06 | `reference/module-contract.md` | ответ | 0.564 | 1 из 1 | 6 из 6 | 1.2 | 2.2 | — |
| q07 | `get-started/faq.md`, `guides/where-to-place-code.md` | ответ | 0.729 | 2 из 2 | 2 из 2 | 1.0 | 1.5 | — |
| q08 | `get-started/overview.md`, `get-started/faq.md`, `guides/migration-from-fsd.md` | ответ | 0.652 | 2 из 2 | 8 из 8 | 1.1 | 2.9 | — |
| q10 | — | не знаю (пустой контекст) | 0.536 | — | — | 1.7 | — | — |
| q14 | — | не знаю (модель) | 0.596 | — | — | 1.7 | 1.6 | — |
| q15 | — | не знаю (пустой контекст) | 0.483 | — | — | 1.5 | — | — |

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

Сообщение: 5835 символов · rewrite 1.4 с · поиск 0.1 с · генерация 1.9 с

> В FEOD используются пять верхних уровней: `app`, `pages`, `modules`, `common`, `global` [1][5]. Они задают верхнюю структуру приложения и допустимые зависимости между её частями, при этом каждый уровень имеет свою роль, набор разрешённых импортов и запреты [2]. Каноническими уровнями названы `app`, `pages`, `modules`, `common`, `global` [3].
>
> Источники:
> - [1] `get-started/overview.md` › FEOD: методология frontend-архитектуры › Верхние уровни FEOD · `structure:get-started/overview.md#004-debd75dc` · https://github.com/feod-architecture/feod-docs/blob/f00eaf533cfee37f67e118c96291d535b0895a6f/docs/get-started/overview.md
> - [2] `core-concepts/levels.md` › Уровни; Уровни › Короткое определение; Уровни › Какую проблему решает · `structure:core-concepts/levels.md#000-cdf97650` · https://github.com/feod-architecture/feod-docs/blob/f00eaf533cfee37f67e118c96291d535b0895a6f/docs/core-concepts/levels.md
> - [3] `reference/glossary.md` › Глоссарий; Глоссарий › Термины · `structure:reference/glossary.md#000-cadc2cf1` · https://github.com/feod-architecture/feod-docs/blob/f00eaf533cfee37f67e118c96291d535b0895a6f/docs/reference/glossary.md
> - [5] `core-concepts/levels.md` › Уровни › Правило; Уровни › Почему; Уровни › Быстрый reference · `structure:core-concepts/levels.md#001-1060540c` · https://github.com/feod-architecture/feod-docs/blob/f00eaf533cfee37f67e118c96291d535b0895a6f/docs/core-concepts/levels.md
>
> Цитаты:
> - [1] «- `app` — запуск приложения, роутинг, провайдеры, композиция верхнего уровня.» — найдена во фрагменте 1
> - [2] «Уровни FEOD задают верхнюю структуру приложения и допустимые зависимости между её частями.» — найдена во фрагменте 2
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

Сообщение: 4266 символов · rewrite 1.4 с · поиск 0.1 с · генерация 2.2 с

> На уровне `global` разрешено хранить только инфраструктурные сущности глобального действия: `.d.ts`, shims, polyfills, глобальные расширения типов и side-effect imports [2]. Обычно там лежат декларации окружения вроде `env.d.ts` и `vite-env.d.ts`, shims для платформы или тестовой среды, polyfills, подключаемые до запуска приложения, `declare global` и другие расширения глобальных типов, а также side-effect imports вроде глобальных стилей или runtime setup [4]. Назначение уровня — хранить код, действующий на всё приложение целиком: shims, polyfills, глобальные декларации окружения, runtime-инициализацию и редкие side-effect подключения [3].
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

**Запрос поиска:** импорт в pages что разрешено и что запрещено

### Переданные фрагменты

| Фрагмент | Сходство | Файл | Разделы | chunk_id |
|---|---|---|---|---|
| 1 | 0.705 | `core-concepts/levels.md` | Уровни › Уровень pages › Что может импортировать; Уровни › Уровень pages › Что нельзя хранить; Уровни › Уровень pages › Good example | `structure:core-concepts/levels.md#005-4270107b` |
| 2 | 0.660 | `core-concepts/levels.md` | Уровни › Уровень common › Кто может импортировать; Уровни › Уровень common › Что может импортировать; Уровни › Уровень common › Что нельзя хранить | `structure:core-concepts/levels.md#010-2620092b` |
| 3 | 0.657 | `reference/import-matrix.md` | Матрица импортов; Матрица импортов › Базовое правило | `structure:reference/import-matrix.md#000-10737c77` |
| 4 | 0.644 | `structure/modules.md` | Modules › Взаимодействие модулей | `structure:structure/modules.md#006-afe37b04` |
| 5 | 0.633 | `reference/import-matrix.md` | Матрица импортов › Что может импортировать код на уровне | `structure:reference/import-matrix.md#001-4c12c71d` |

### Ответ

Сообщение: 5294 символов · rewrite 1.3 с · поиск 0.1 с · генерация 1.6 с

> Код на уровне `pages` может импортировать `modules` и `common` [1][5]. Ему запрещено импортировать `app`, `global`, другие страницы, внутренности чужих модулей и deep imports [1][5]. Уровень `pages` может импортироваться из `app`, но сам `app` не импортирует [2][5].
>
> Источники:
> - [1] `core-concepts/levels.md` › Уровни › Уровень pages › Что может импортировать; Уровни › Уровень pages › Что нельзя хранить; Уровни › Уровень pages › Good example · `structure:core-concepts/levels.md#005-4270107b` · https://github.com/feod-architecture/feod-docs/blob/f00eaf533cfee37f67e118c96291d535b0895a6f/docs/core-concepts/levels.md
> - [2] `core-concepts/levels.md` › Уровни › Уровень common › Кто может импортировать; Уровни › Уровень common › Что может импортировать; Уровни › Уровень common › Что нельзя хранить · `structure:core-concepts/levels.md#010-2620092b` · https://github.com/feod-architecture/feod-docs/blob/f00eaf533cfee37f67e118c96291d535b0895a6f/docs/core-concepts/levels.md
> - [5] `reference/import-matrix.md` › Матрица импортов › Что может импортировать код на уровне · `structure:reference/import-matrix.md#001-4c12c71d` · https://github.com/feod-architecture/feod-docs/blob/f00eaf533cfee37f67e118c96291d535b0895a6f/docs/reference/import-matrix.md
>
> Цитаты:
> - [1] «Код на уровне `pages` может импортировать `modules`, `common`.» — найдена во фрагменте 1
> - [2] «Уровень `common` может импортироваться из `app`, `pages`, `modules` и других сущностей `common`.» — найдена во фрагменте 2
> - [5] «| `pages` | `modules`, `common` | `app`, `global`, другие страницы, внутренности чужих модулей, deep imports |» — найдена во фрагменте 5

## q05. Можно ли одному модулю импортировать другой модуль?

**Ожидание.** да, только через public API (корневой index.ts) и без циклических и скрытых зависимостей; импорт внутренних файлов (deep import) — нарушение.

**Ожидаемые источники:** `get-started/faq.md`, `reference/import-matrix.md`

**Запрос поиска:** импорт одного модуля другим модулем

### Переданные фрагменты

| Фрагмент | Сходство | Файл | Разделы | chunk_id |
|---|---|---|---|---|
| 1 | 0.615 | `structure/modules.md` | Modules › Взаимодействие модулей | `structure:structure/modules.md#006-afe37b04` |
| 2 | 0.587 | `get-started/faq.md` | FAQ › Можно ли использовать FEOD без common?; FAQ › Можно ли модулю импортировать другой модуль? | `structure:get-started/faq.md#001-d645a78d` |
| 3 | 0.579 | `get-started/faq.md` | FAQ › Что делать с legacy deep imports?; FAQ › Можно ли нарушить матрицу импортов? | `structure:get-started/faq.md#004-91350936` |
| 4 | 0.578 | `reference/import-matrix.md` | Матрица импортов › Public API обязателен для чужого модуля | `structure:reference/import-matrix.md#003-9e6159ad` |
| 5 | 0.571 | `guides/design-module.md` | Как проектировать модуль › Шаги | `structure:guides/design-module.md#002-54949f50` |

### Ответ

Сообщение: 5062 символов · rewrite 1.4 с · поиск 0.1 с · генерация 1.9 с

> Да, можно, если импорт идёт через public API другого модуля и не создаёт циклическую или скрытую зависимость [2]. Модули могут импортировать другие модули только через их public API, а направление зависимости определяется матрицей импортов [1]. Чужой модуль разрешено импортировать только через его public API, и это правило одинаково для `app`, `pages`, `modules` и `common` [4]. При этом deep import во внутренности чужого модуля является нарушением [1].
>
> Источники:
> - [1] `structure/modules.md` › Modules › Взаимодействие модулей · `structure:structure/modules.md#006-afe37b04` · https://github.com/feod-architecture/feod-docs/blob/f00eaf533cfee37f67e118c96291d535b0895a6f/docs/structure/modules.md
> - [2] `get-started/faq.md` › FAQ › Можно ли использовать FEOD без common?; FAQ › Можно ли модулю импортировать другой модуль? · `structure:get-started/faq.md#001-d645a78d` · https://github.com/feod-architecture/feod-docs/blob/f00eaf533cfee37f67e118c96291d535b0895a6f/docs/get-started/faq.md
> - [4] `reference/import-matrix.md` › Матрица импортов › Public API обязателен для чужого модуля · `structure:reference/import-matrix.md#003-9e6159ad` · https://github.com/feod-architecture/feod-docs/blob/f00eaf533cfee37f67e118c96291d535b0895a6f/docs/reference/import-matrix.md
>
> Цитаты:
> - [1] «Модули могут импортировать другие модули только через их public API.» — найдена во фрагменте 1
> - [2] «Да, если импорт идёт через public API другого модуля и не создаёт циклическую или скрытую зависимость.» — найдена во фрагменте 2
> - [4] «Чужой модуль разрешено импортировать только через его public API.» — найдена во фрагменте 4

## q06. Из чего состоит минимальный контракт модуля?

**Ожидание.** название (имя директории в modules), ответственность (README или описание в review), public API (корневой index.ts), внутренние детали (ui, model, api, lib), ограничения зависимостей (README, чеклист review или FEOD config).

**Ожидаемые источники:** `reference/module-contract.md`

**Запрос поиска:** минимальный контракт модуля состав

### Переданные фрагменты

| Фрагмент | Сходство | Файл | Разделы | chunk_id |
|---|---|---|---|---|
| 1 | 0.564 | `reference/module-contract.md` | Контракт модуля › Минимальный контракт | `structure:reference/module-contract.md#001-67181b9f` |

### Ответ

Сообщение: 798 символов · rewrite 1.2 с · поиск 0.1 с · генерация 2.2 с

> Минимальный контракт модуля состоит из пяти частей: название модуля, ответственность, public API, внутренние детали и ограничения зависимостей [1]. Название модуля фиксируется в имени директории в `modules` и показывает продуктовую область; ответственность фиксируется в README или коротком описании в review и ограничивает рост модуля; public API фиксируется в корневом `index.ts` и даёт поддерживаемую поверхность импорта; внутренние детали — это директории `ui`, `model`, `api`, `lib` и другие, которые могут меняться без внешнего контракта; ограничения зависимостей фиксируются в README, review checklist или FEOD config и помогают не создать скрытые связи [1].
>
> Источники:
> - [1] `reference/module-contract.md` › Контракт модуля › Минимальный контракт · `structure:reference/module-contract.md#001-67181b9f` · https://github.com/feod-architecture/feod-docs/blob/f00eaf533cfee37f67e118c96291d535b0895a6f/docs/reference/module-contract.md
>
> Цитаты:
> - [1] «| Часть контракта | Где фиксируется | Зачем нужна |» — найдена во фрагменте 1
> - [1] «| Название модуля | имя директории в `modules` | Показывает продуктовую область |» — найдена во фрагменте 1
> - [1] «| Ответственность | README или короткое описание в review | Ограничивает рост модуля |» — найдена во фрагменте 1
> - [1] «| Public API | корневой `index.ts` | Даёт поддерживаемую поверхность импорта |» — найдена во фрагменте 1
> - [1] «| Внутренние детали | директории `ui`, `model`, `api`, `lib` и другие | Могут меняться без внешнего контракта |» — найдена во фрагменте 1
> - [1] «| Ограничения зависимостей | README, review checklist или FEOD config | Помогают не создать скрытые связи |» — найдена во фрагменте 1

## q07. Где хранить API-клиент?

**Ожидание.** API-клиент продуктовой области или сценария — внутри соответствующего модуля в modules; нейтральная HTTP-обёртка без доменных знаний — в common.

**Ожидаемые источники:** `get-started/faq.md`, `guides/where-to-place-code.md`

**Запрос поиска:** Где хранить API-клиент?

### Переданные фрагменты

| Фрагмент | Сходство | Файл | Разделы | chunk_id |
|---|---|---|---|---|
| 1 | 0.729 | `get-started/faq.md` | FAQ › Где хранить API-клиент?; FAQ › Нужно ли всегда писать README модуля? | `structure:get-started/faq.md#003-6f83be8d` |
| 2 | 0.554 | `guides/design-module.md` | Как проектировать модуль › Шаги | `structure:guides/design-module.md#003-f871c9a6` |
| 3 | 0.554 | `core-concepts/public-api.md` | Публичный API; Публичный API › Короткое определение; Публичный API › Какую проблему решает | `structure:core-concepts/public-api.md#000-f01af1d3` |

### Ответ

Сообщение: 3615 символов · rewrite 1.0 с · поиск 0.1 с · генерация 1.5 с

> API-клиент конкретной продуктовой области обычно живёт внутри соответствующего модуля, а нейтральная HTTP-обёртка без доменных знаний может жить в `common` [1]. Внутри модуля для API предусмотрена папка `api` — transport и адаптеры сценария [2].
>
> Источники:
> - [1] `get-started/faq.md` › FAQ › Где хранить API-клиент?; FAQ › Нужно ли всегда писать README модуля? · `structure:get-started/faq.md#003-6f83be8d` · https://github.com/feod-architecture/feod-docs/blob/f00eaf533cfee37f67e118c96291d535b0895a6f/docs/get-started/faq.md
> - [2] `guides/design-module.md` › Как проектировать модуль › Шаги · `structure:guides/design-module.md#003-f871c9a6` · https://github.com/feod-architecture/feod-docs/blob/f00eaf533cfee37f67e118c96291d535b0895a6f/docs/guides/design-module.md
>
> Цитаты:
> - [1] «API-клиент конкретной продуктовой области обычно живёт внутри соответствующего модуля.» — найдена во фрагменте 1
> - [2] «- `api` -> transport и адаптеры сценария;» — найдена во фрагменте 2

## q08. Чем FEOD отличается от FSD?

**Ожидание.** это отдельная методология, а не переименование FSD; основной термин — уровень, а не слой; нет обязательных слоёв entities, features, widgets; главный строительный блок — модуль с public API и контролируемыми зависимостями.

**Ожидаемые источники:** `get-started/overview.md`, `get-started/faq.md`, `guides/migration-from-fsd.md`

**Запрос поиска:** Чем FEOD отличается от FSD

### Переданные фрагменты

| Фрагмент | Сходство | Файл | Разделы | chunk_id |
|---|---|---|---|---|
| 1 | 0.652 | `get-started/overview.md` | FEOD: методология frontend-архитектуры › Чем FEOD отличается от FSD | `structure:get-started/overview.md#003-8bb951b9` |
| 2 | 0.568 | `get-started/faq.md` | FAQ; FAQ › FEOD - это FSD? | `structure:get-started/faq.md#000-126c876e` |
| 3 | 0.560 | `get-started/overview.md` | FEOD: методология frontend-архитектуры | `structure:get-started/overview.md#000-41b04377` |
| 4 | 0.553 | `reference/terms.md` | Термины › FEOD-сущность и DDD entity | `structure:reference/terms.md#003-0bf4dadc` |

### Ответ

Сообщение: 3836 символов · rewrite 1.1 с · поиск 0.1 с · генерация 2.9 с

> FEOD и FSD решают близкую задачу — сделать архитектуру frontend-проекта понятной и устойчивой, — но FEOD описывает её через уровни `app`, `pages`, `modules`, `common`, `global` и делает модуль главным строительным блоком [1]. Практическая разница: в FEOD основной термин — уровень, а не слой [1]. В FEOD нет обязательного набора FSD-слоёв вроде `entities`, `features`, `widgets` [1]. FEOD концентрируется на модуле, его `public API` и границе зависимостей [1]. FEOD проще применять в проектах, где не нужна глубокая таксономия доменных типов, но нужны строгие правила импортов и масштабируемая структура [1]. FEOD — это отдельная методология, а не переименование FSD-терминов [1]. FEOD не является FSD: он использует меньше верхних уровней и строит проект вокруг `modules`, public API и контролируемых зависимостей [2]. Если команда приходит из FSD, сначала сопоставьте текущие `entities`, `features` и `widgets` с будущими `modules`, а затем проверьте public API каждого модуля [2].
>
> Источники:
> - [1] `get-started/overview.md` › FEOD: методология frontend-архитектуры › Чем FEOD отличается от FSD · `structure:get-started/overview.md#003-8bb951b9` · https://github.com/feod-architecture/feod-docs/blob/f00eaf533cfee37f67e118c96291d535b0895a6f/docs/get-started/overview.md
> - [2] `get-started/faq.md` › FAQ; FAQ › FEOD - это FSD? · `structure:get-started/faq.md#000-126c876e` · https://github.com/feod-architecture/feod-docs/blob/f00eaf533cfee37f67e118c96291d535b0895a6f/docs/get-started/faq.md
>
> Цитаты:
> - [1] «FEOD и FSD решают близкую задачу: сделать архитектуру frontend-проекта понятной и устойчивой.» — найдена во фрагменте 1
> - [1] «в FEOD основной термин — **уровень**, а не слой;» — найдена во фрагменте 1
> - [1] «в FEOD нет обязательного набора FSD-слоёв вроде `entities`, `features`, `widgets`;» — найдена во фрагменте 1
> - [1] «FEOD концентрируется на модуле, его `public API` и границе зависимостей;» — найдена во фрагменте 1
> - [1] «FEOD проще применять в проектах, где не нужна глубокая таксономия доменных типов, но нужны строгие правила импортов и масштабируемая структура.» — найдена во фрагменте 1
> - [1] «Но это отдельная методология, а не переименование FSD-терминов.» — найдена во фрагменте 1
> - [2] «Нет. FEOD использует меньше верхних уровней и строит проект вокруг `modules`, public API и контролируемых зависимостей.» — найдена во фрагменте 2
> - [2] «Если команда приходит из FSD, сначала сопоставьте текущие `entities`, `features` и `widgets` с будущими `modules`, а затем проверьте public API каждого модуля.» — найдена во фрагменте 2

## q10. Какой state-менеджер рекомендует FEOD?

**Ожидание.** документация не называет конкретный state-менеджер; хороший ответ прямо говорит об этом и не придумывает рекомендацию.

**Ожидаемые источники:** —

**Запрос поиска:** Какой state-менеджер рекомендует FEOD?

### Переданные фрагменты

Контекст пуст: модель не вызывалась.

### Ответ

Сообщение: 0 символов · rewrite 1.7 с · поиск 0.1 с · генерация 0.0 с

> Не знаю: ни один фрагмент не достиг порога сходства 0.55 (лучшее 0.536).
> Уточните вопрос: назовите раздел, термин или пример, о котором идёт речь.
>
> Ближайшие разделы ниже порога:
> - `get-started/faq.md` › FAQ · 0.536
> - `get-started/overview.md` › FEOD: методология frontend-архитектуры · 0.534
> - `get-started/is-feod-for-my-project.md` › Подходит ли FEOD моему проекту · 0.519

## q14. Какую версию React требует FEOD?

**Ожидание.** корпус не задаёт требуемую версию React; ответ не придумывает номер версии.

**Ожидаемые источники:** —

**Запрос поиска:** Какая версия React требуется в FEOD?

### Переданные фрагменты

| Фрагмент | Сходство | Файл | Разделы | chunk_id |
|---|---|---|---|---|
| 1 | 0.596 | `get-started/overview.md` | FEOD: методология frontend-архитектуры | `structure:get-started/overview.md#000-41b04377` |
| 2 | 0.591 | `get-started/faq.md` | FAQ; FAQ › FEOD - это FSD? | `structure:get-started/faq.md#000-126c876e` |
| 3 | 0.589 | `get-started/is-feod-for-my-project.md` | Подходит ли FEOD моему проекту; Подходит ли FEOD моему проекту › Когда использовать | `structure:get-started/is-feod-for-my-project.md#000-4f24d7af` |
| 4 | 0.584 | `reference/glossary.md` | Глоссарий › Термины | `structure:reference/glossary.md#002-98ffd897` |
| 5 | 0.580 | `get-started/is-feod-for-my-project.md` | Подходит ли FEOD моему проекту › Good example; Подходит ли FEOD моему проекту › Bad example; Подходит ли FEOD моему проекту › Решение; Подходит ли FEOD моему проекту › Связанные страницы | `structure:get-started/is-feod-for-my-project.md#002-d41120c4` |

### Ответ

Сообщение: 6300 символов · rewrite 1.7 с · поиск 0.1 с · генерация 1.6 с

> Не знаю. Во фрагментах нет сведений о том, какую версию React требует FEOD: упоминаются только методология, уровни, модули, public API, tooling и примеры структуры, но не требования к React.
>
> Уточнение: Вас интересует именно требование к версии React или общие требования FEOD к frontend-проекту?

## q15. Какой тестовый раннер рекомендует FEOD — Jest или Vitest?

**Ожидание.** корпус не рекомендует конкретный тестовый раннер; ответ не выбирает инструмент без основания.

**Ожидаемые источники:** —

**Запрос поиска:** Какой тестовый раннер рекомендует FEOD — Jest или Vitest?

### Переданные фрагменты

Контекст пуст: модель не вызывалась.

### Ответ

Сообщение: 0 символов · rewrite 1.5 с · поиск 0.1 с · генерация 0.0 с

> Не знаю: ни один фрагмент не достиг порога сходства 0.55 (лучшее 0.483).
> Уточните вопрос: назовите раздел, термин или пример, о котором идёт речь.
>
> Ближайшие разделы ниже порога:
> - `reference/glossary.md` › Глоссарий › Термины · 0.483
> - `get-started/is-feod-for-my-project.md` › Подходит ли FEOD моему проекту · 0.470
> - `get-started/faq.md` › FAQ · 0.467
