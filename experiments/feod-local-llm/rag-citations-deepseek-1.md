# Источники, цитаты и режим «не знаю»

Прогон 2026-10-07T13:34:29.218Z. Вопросы: `experiments/feod-citations/questions.md` (10). Фактическая длительность прогона: 29.6 с.
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
| Цитаты, найденные дословно | 20 из 20 |
| Ответы без замечаний | 10 из 10 |
| Ошибки модели (вопрос без ответа) | 0 из 10 |

Положительный вопрос — с ожидаемыми источниками, отрицательный — без них; показатели считаются по своей группе вопросов.
Источник засчитывается, если его номер есть среди переданных фрагментов; цитата — если после нормализации пробелов, регистра, «ё», Markdown-символов, тире и кавычек она является подстрокой текста указанного фрагмента.
Измерено: время этапов, размер сообщения, ошибки модели. Вычислено: разбор ответа, проверка ссылок и цитат. Совпадение смысла ответа с цитатами здесь не оценивается — ручная оценка в README эксперимента. «—» — знаменатель равен нулю.

## Время этапов

| Этап | Вопросов | Медиана, с | Максимум, с |
|---|---|---|---|
| Переписывание запроса | 10 | 1.3 | 1.8 |
| Поиск | 10 | 0.1 | 0.1 |
| Генерация ответа | 8 | 2.0 | 2.9 |
| Все этапы | 10 | 3.3 | 4.0 |

Переписывание — вызов модели для запроса поиска (режимы с rewrite); поиск — эмбеддинг запроса в Ollama и косинусный перебор; генерация — вызов модели с фрагментами, отказы по пустому контексту не учитываются; все этапы — сумма по вопросу. Вопросы с ошибкой модели не учитываются.

## Вопросы

| Вопрос | Ожидаемые источники | Исход | Лучшее сходство | Источники в контексте | Цитаты дословно | Rewrite, с | Генерация, с | Замечания |
|---|---|---|---|---|---|---|---|---|
| q02 | `core-concepts/levels.md`, `get-started/overview.md` | ответ | 0.677 | 4 из 4 | 4 из 4 | 1.4 | 1.8 | — |
| q03 | `structure/global.md` | ответ | 0.706 | 3 из 3 | 3 из 3 | 1.2 | 2.1 | — |
| q04 | `reference/import-matrix.md`, `core-concepts/levels.md` | ответ | 0.726 | 3 из 3 | 3 из 3 | 1.7 | 2.0 | — |
| q05 | `get-started/faq.md`, `reference/import-matrix.md` | ответ | 0.689 | 3 из 3 | 3 из 3 | 1.4 | 2.0 | — |
| q06 | `reference/module-contract.md` | ответ | 0.564 | 1 из 1 | 1 из 1 | 1.8 | 1.9 | — |
| q07 | `get-started/faq.md`, `guides/where-to-place-code.md` | ответ | 0.705 | 1 из 1 | 1 из 1 | 1.1 | 1.6 | — |
| q08 | `get-started/overview.md`, `get-started/faq.md`, `guides/migration-from-fsd.md` | ответ | 0.662 | 2 из 2 | 5 из 5 | 1.1 | 2.9 | — |
| q10 | — | не знаю (пустой контекст) | 0.520 | — | — | 0.8 | — | — |
| q14 | — | не знаю (модель) | 0.583 | — | — | 1.1 | 1.6 | — |
| q15 | — | не знаю (пустой контекст) | 0.478 | — | — | 1.6 | — | — |

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

Сообщение: 5835 символов · rewrite 1.4 с · поиск 0.1 с · генерация 1.8 с

> В FEOD используются только пять верхних уровней: `app`, `pages`, `modules`, `common`, `global` [1][3][5]. Основной термин для верхних структурных зон — `уровень` [3][4].
>
> Источники:
> - [1] `get-started/overview.md` › FEOD: методология frontend-архитектуры › Верхние уровни FEOD · `structure:get-started/overview.md#004-debd75dc` · https://github.com/feod-architecture/feod-docs/blob/f00eaf533cfee37f67e118c96291d535b0895a6f/docs/get-started/overview.md
> - [3] `reference/glossary.md` › Глоссарий; Глоссарий › Термины · `structure:reference/glossary.md#000-cadc2cf1` · https://github.com/feod-architecture/feod-docs/blob/f00eaf533cfee37f67e118c96291d535b0895a6f/docs/reference/glossary.md
> - [4] `reference/terms.md` › Термины › Перед публикацией страницы; Термины › Связанные страницы · `structure:reference/terms.md#006-ddb70570` · https://github.com/feod-architecture/feod-docs/blob/f00eaf533cfee37f67e118c96291d535b0895a6f/docs/reference/terms.md
> - [5] `core-concepts/levels.md` › Уровни › Правило; Уровни › Почему; Уровни › Быстрый reference · `structure:core-concepts/levels.md#001-1060540c` · https://github.com/feod-architecture/feod-docs/blob/f00eaf533cfee37f67e118c96291d535b0895a6f/docs/core-concepts/levels.md
>
> Цитаты:
> - [1] «На верхнем уровне проекта FEOD использует только пять имён:» — найдена во фрагменте 1
> - [3] «Уровень | Верхняя структурная зона FEOD с собственной ролью и правилами зависимостей. Канонические уровни: `app`, `pages`, `modules`, `common`, `global`.» — найдена во фрагменте 3
> - [4] «Верхние уровни названы как `app`, `pages`, `modules`, `common`, `global`.» — найдена во фрагменте 4
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

Сообщение: 4266 символов · rewrite 1.2 с · поиск 0.1 с · генерация 2.1 с

> На уровне `global` разрешено хранить только инфраструктурные сущности глобального действия: `.d.ts`, shims, polyfills, глобальные расширения типов и side-effect imports [2]. Назначение уровня — код, действующий на всё приложение целиком: shims, polyfills, глобальные декларации окружения, runtime-инициализацию и редкие side-effect подключения [3]. Обычно там находятся `env.d.ts`, `vite-env.d.ts` и другие декларации окружения, shims для платформы или тестовой среды, polyfills, подключаемые до запуска приложения, `declare global` и другие расширения глобальных типов, а также side-effect imports вроде глобальных стилей или runtime setup, если проект подключает их через entrypoint или конфигурацию [4]. При этом `global` не импортирует ничего из уровней FEOD [3].
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

**Запрос поиска:** что может импортировать код на уровне pages и что запрещено

### Переданные фрагменты

| Фрагмент | Сходство | Файл | Разделы | chunk_id |
|---|---|---|---|---|
| 1 | 0.726 | `core-concepts/levels.md` | Уровни › Уровень pages › Что может импортировать; Уровни › Уровень pages › Что нельзя хранить; Уровни › Уровень pages › Good example | `structure:core-concepts/levels.md#005-4270107b` |
| 2 | 0.693 | `reference/import-matrix.md` | Матрица импортов › Что может импортировать код на уровне | `structure:reference/import-matrix.md#001-4c12c71d` |
| 3 | 0.692 | `core-concepts/levels.md` | Уровни › Уровень common › Кто может импортировать; Уровни › Уровень common › Что может импортировать; Уровни › Уровень common › Что нельзя хранить | `structure:core-concepts/levels.md#010-2620092b` |
| 4 | 0.646 | `core-concepts/levels.md` | Уровни › Уровень app › Типовые ошибки; Уровни › Уровень pages; Уровни › Уровень pages › Назначение; Уровни › Уровень pages › Кто может импортировать | `structure:core-concepts/levels.md#004-efd05f11` |
| 5 | 0.638 | `structure/modules.md` | Modules › Взаимодействие модулей | `structure:structure/modules.md#006-afe37b04` |

### Ответ

Сообщение: 4869 символов · rewrite 1.7 с · поиск 0.1 с · генерация 2.0 с

> Код на уровне `pages` может импортировать `modules` и `common` [1][2]. Ему запрещено импортировать `app`, `global`, другие страницы, внутренности чужих модулей и deep imports [2]. Уровень `pages` может импортироваться только из `app` [4].
>
> Источники:
> - [1] `core-concepts/levels.md` › Уровни › Уровень pages › Что может импортировать; Уровни › Уровень pages › Что нельзя хранить; Уровни › Уровень pages › Good example · `structure:core-concepts/levels.md#005-4270107b` · https://github.com/feod-architecture/feod-docs/blob/f00eaf533cfee37f67e118c96291d535b0895a6f/docs/core-concepts/levels.md
> - [2] `reference/import-matrix.md` › Матрица импортов › Что может импортировать код на уровне · `structure:reference/import-matrix.md#001-4c12c71d` · https://github.com/feod-architecture/feod-docs/blob/f00eaf533cfee37f67e118c96291d535b0895a6f/docs/reference/import-matrix.md
> - [4] `core-concepts/levels.md` › Уровни › Уровень app › Типовые ошибки; Уровни › Уровень pages; Уровни › Уровень pages › Назначение; Уровни › Уровень pages › Кто может импортировать · `structure:core-concepts/levels.md#004-efd05f11` · https://github.com/feod-architecture/feod-docs/blob/f00eaf533cfee37f67e118c96291d535b0895a6f/docs/core-concepts/levels.md
>
> Цитаты:
> - [1] «Код на уровне `pages` может импортировать `modules`, `common`.» — найдена во фрагменте 1
> - [2] «| `pages` | `modules`, `common` | `app`, `global`, другие страницы, внутренности чужих модулей, deep imports |» — найдена во фрагменте 2
> - [4] «Уровень `pages` может импортироваться только из `app`.» — найдена во фрагменте 4

## q05. Можно ли одному модулю импортировать другой модуль?

**Ожидание.** да, только через public API (корневой index.ts) и без циклических и скрытых зависимостей; импорт внутренних файлов (deep import) — нарушение.

**Ожидаемые источники:** `get-started/faq.md`, `reference/import-matrix.md`

**Запрос поиска:** Можно ли одному модулю импортировать другой модуль

### Переданные фрагменты

| Фрагмент | Сходство | Файл | Разделы | chunk_id |
|---|---|---|---|---|
| 1 | 0.689 | `structure/modules.md` | Modules › Взаимодействие модулей | `structure:structure/modules.md#006-afe37b04` |
| 2 | 0.658 | `get-started/faq.md` | FAQ › Можно ли использовать FEOD без common?; FAQ › Можно ли модулю импортировать другой модуль? | `structure:get-started/faq.md#001-d645a78d` |
| 3 | 0.635 | `reference/import-matrix.md` | Матрица импортов › Public API обязателен для чужого модуля | `structure:reference/import-matrix.md#003-9e6159ad` |
| 4 | 0.633 | `get-started/faq.md` | FAQ › Что делать с legacy deep imports?; FAQ › Можно ли нарушить матрицу импортов? | `structure:get-started/faq.md#004-91350936` |
| 5 | 0.623 | `core-concepts/levels.md` | Уровни › Уровень common › Кто может импортировать; Уровни › Уровень common › Что может импортировать; Уровни › Уровень common › Что нельзя хранить | `structure:core-concepts/levels.md#010-2620092b` |

### Ответ

Сообщение: 3983 символов · rewrite 1.4 с · поиск 0.1 с · генерация 2.0 с

> Да, модулю разрешено импортировать другой модуль, но только через его public API и при условии, что это не создаёт циклическую или скрытую зависимость [2]. Чужой модуль разрешено импортировать только через public API [1][3]. Deep import во внутренности чужого модуля считается нарушением [1], и импорт вида `@/modules/billing/model/money` приводится как bad-пример [2].
>
> Источники:
> - [1] `structure/modules.md` › Modules › Взаимодействие модулей · `structure:structure/modules.md#006-afe37b04` · https://github.com/feod-architecture/feod-docs/blob/f00eaf533cfee37f67e118c96291d535b0895a6f/docs/structure/modules.md
> - [2] `get-started/faq.md` › FAQ › Можно ли использовать FEOD без common?; FAQ › Можно ли модулю импортировать другой модуль? · `structure:get-started/faq.md#001-d645a78d` · https://github.com/feod-architecture/feod-docs/blob/f00eaf533cfee37f67e118c96291d535b0895a6f/docs/get-started/faq.md
> - [3] `reference/import-matrix.md` › Матрица импортов › Public API обязателен для чужого модуля · `structure:reference/import-matrix.md#003-9e6159ad` · https://github.com/feod-architecture/feod-docs/blob/f00eaf533cfee37f67e118c96291d535b0895a6f/docs/reference/import-matrix.md
>
> Цитаты:
> - [1] «Модули могут импортировать другие модули только через их public API.» — найдена во фрагменте 1
> - [2] «Да, если импорт идёт через public API другого модуля и не создаёт циклическую или скрытую зависимость.» — найдена во фрагменте 2
> - [3] «Чужой модуль разрешено импортировать только через его public API.» — найдена во фрагменте 3

## q06. Из чего состоит минимальный контракт модуля?

**Ожидание.** название (имя директории в modules), ответственность (README или описание в review), public API (корневой index.ts), внутренние детали (ui, model, api, lib), ограничения зависимостей (README, чеклист review или FEOD config).

**Ожидаемые источники:** `reference/module-contract.md`

**Запрос поиска:** минимальный контракт модуля состав

### Переданные фрагменты

| Фрагмент | Сходство | Файл | Разделы | chunk_id |
|---|---|---|---|---|
| 1 | 0.564 | `reference/module-contract.md` | Контракт модуля › Минимальный контракт | `structure:reference/module-contract.md#001-67181b9f` |

### Ответ

Сообщение: 798 символов · rewrite 1.8 с · поиск 0.1 с · генерация 1.9 с

> Минимальный контракт модуля состоит из пяти частей: название модуля, ответственность, Public API, внутренние детали и ограничения зависимостей [1]. Название модуля фиксируется в имени директории в `modules` [1]. Ответственность фиксируется в README или коротком описании в review [1]. Public API фиксируется в корневом `index.ts` [1]. Внутренние детали — это директории `ui`, `model`, `api`, `lib` и другие [1]. Ограничения зависимостей фиксируются в README, review checklist или FEOD config [1].
>
> Источники:
> - [1] `reference/module-contract.md` › Контракт модуля › Минимальный контракт · `structure:reference/module-contract.md#001-67181b9f` · https://github.com/feod-architecture/feod-docs/blob/f00eaf533cfee37f67e118c96291d535b0895a6f/docs/reference/module-contract.md
>
> Цитаты:
> - [1] «| Название модуля | имя директории в `modules` | Показывает продуктовую область |» — найдена во фрагменте 1

## q07. Где хранить API-клиент?

**Ожидание.** API-клиент продуктовой области или сценария — внутри соответствующего модуля в modules; нейтральная HTTP-обёртка без доменных знаний — в common.

**Ожидаемые источники:** `get-started/faq.md`, `guides/where-to-place-code.md`

**Запрос поиска:** где хранить API-клиент

### Переданные фрагменты

| Фрагмент | Сходство | Файл | Разделы | chunk_id |
|---|---|---|---|---|
| 1 | 0.705 | `get-started/faq.md` | FAQ › Где хранить API-клиент?; FAQ › Нужно ли всегда писать README модуля? | `structure:get-started/faq.md#003-6f83be8d` |

### Ответ

Сообщение: 794 символов · rewrite 1.1 с · поиск 0.1 с · генерация 1.6 с

> API-клиент конкретной продуктовой области обычно живёт внутри соответствующего модуля [1]. Нейтральная HTTP-обёртка без доменных знаний может жить в `common` [1].
>
> Источники:
> - [1] `get-started/faq.md` › FAQ › Где хранить API-клиент?; FAQ › Нужно ли всегда писать README модуля? · `structure:get-started/faq.md#003-6f83be8d` · https://github.com/feod-architecture/feod-docs/blob/f00eaf533cfee37f67e118c96291d535b0895a6f/docs/get-started/faq.md
>
> Цитаты:
> - [1] «API-клиент конкретной продуктовой области обычно живёт внутри соответствующего модуля.» — найдена во фрагменте 1

## q08. Чем FEOD отличается от FSD?

**Ожидание.** это отдельная методология, а не переименование FSD; основной термин — уровень, а не слой; нет обязательных слоёв entities, features, widgets; главный строительный блок — модуль с public API и контролируемыми зависимостями.

**Ожидаемые источники:** `get-started/overview.md`, `get-started/faq.md`, `guides/migration-from-fsd.md`

**Запрос поиска:** Чем FEOD отличается от FSD?

### Переданные фрагменты

| Фрагмент | Сходство | Файл | Разделы | chunk_id |
|---|---|---|---|---|
| 1 | 0.662 | `get-started/overview.md` | FEOD: методология frontend-архитектуры › Чем FEOD отличается от FSD | `structure:get-started/overview.md#003-8bb951b9` |
| 2 | 0.587 | `get-started/faq.md` | FAQ; FAQ › FEOD - это FSD? | `structure:get-started/faq.md#000-126c876e` |
| 3 | 0.580 | `get-started/overview.md` | FEOD: методология frontend-архитектуры | `structure:get-started/overview.md#000-41b04377` |
| 4 | 0.563 | `reference/terms.md` | Термины › FEOD-сущность и DDD entity | `structure:reference/terms.md#003-0bf4dadc` |

### Ответ

Сообщение: 3836 символов · rewrite 1.1 с · поиск 0.1 с · генерация 2.9 с

> FEOD и FSD решают близкую задачу — сделать архитектуру frontend-проекта понятной и устойчивой, но FEOD описывает её через уровни `app`, `pages`, `modules`, `common`, `global` и делает модуль главным строительным блоком [1]. Практическая разница в том, что в FEOD основной термин — уровень, а не слой; в FEOD нет обязательного набора FSD-слоёв вроде `entities`, `features`, `widgets`; FEOD концентрируется на модуле, его `public API` и границе зависимостей; FEOD проще применять там, где не нужна глубокая таксономия доменных типов, но нужны строгие правила импортов и масштабируемая структура [1]. FEOD — это отдельная методология, а не переименование FSD-терминов, хотя при знании FSD о FEOD можно думать как о более прямом каркасе вокруг модулей и уровней [1]. Подтверждается и в FAQ: FEOD — не FSD, он использует меньше верхних уровней и строит проект вокруг `modules`, public API и контролируемых зависимостей [2]. Команде, приходящей из FSD, рекомендуется сначала сопоставить текущие `entities`, `features` и `widgets` с будущими `modules`, а затем проверить public API каждого модуля [2].
>
> Источники:
> - [1] `get-started/overview.md` › FEOD: методология frontend-архитектуры › Чем FEOD отличается от FSD · `structure:get-started/overview.md#003-8bb951b9` · https://github.com/feod-architecture/feod-docs/blob/f00eaf533cfee37f67e118c96291d535b0895a6f/docs/get-started/overview.md
> - [2] `get-started/faq.md` › FAQ; FAQ › FEOD - это FSD? · `structure:get-started/faq.md#000-126c876e` · https://github.com/feod-architecture/feod-docs/blob/f00eaf533cfee37f67e118c96291d535b0895a6f/docs/get-started/faq.md
>
> Цитаты:
> - [1] «FEOD и FSD решают близкую задачу: сделать архитектуру frontend-проекта понятной и устойчивой.» — найдена во фрагменте 1
> - [1] «в FEOD нет обязательного набора FSD-слоёв вроде `entities`, `features`, `widgets`;» — найдена во фрагменте 1
> - [1] «Если вы знаете FSD, можно думать о FEOD как о более прямом каркасе вокруг модулей и уровней.» — найдена во фрагменте 1
> - [2] «FEOD использует меньше верхних уровней и строит проект вокруг `modules`, public API и контролируемых зависимостей.» — найдена во фрагменте 2
> - [2] «Если команда приходит из FSD, сначала сопоставьте текущие `entities`, `features` и `widgets` с будущими `modules`, а затем проверьте public API каждого модуля.» — найдена во фрагменте 2

## q10. Какой state-менеджер рекомендует FEOD?

**Ожидание.** документация не называет конкретный state-менеджер; хороший ответ прямо говорит об этом и не придумывает рекомендацию.

**Ожидаемые источники:** —

**Запрос поиска:** Какой state-менеджер рекомендует FEOD

### Переданные фрагменты

Контекст пуст: модель не вызывалась.

### Ответ

Сообщение: 0 символов · rewrite 0.8 с · поиск 0.1 с · генерация 0.0 с

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

**Запрос поиска:** Какая версия React требуется для FEOD

### Переданные фрагменты

| Фрагмент | Сходство | Файл | Разделы | chunk_id |
|---|---|---|---|---|
| 1 | 0.583 | `get-started/overview.md` | FEOD: методология frontend-архитектуры | `structure:get-started/overview.md#000-41b04377` |
| 2 | 0.578 | `reference/glossary.md` | Глоссарий › Термины | `structure:reference/glossary.md#002-98ffd897` |
| 3 | 0.574 | `get-started/faq.md` | FAQ; FAQ › FEOD - это FSD? | `structure:get-started/faq.md#000-126c876e` |
| 4 | 0.574 | `get-started/is-feod-for-my-project.md` | Подходит ли FEOD моему проекту; Подходит ли FEOD моему проекту › Когда использовать | `structure:get-started/is-feod-for-my-project.md#000-4f24d7af` |
| 5 | 0.573 | `get-started/is-feod-for-my-project.md` | Подходит ли FEOD моему проекту › Good example; Подходит ли FEOD моему проекту › Bad example; Подходит ли FEOD моему проекту › Решение; Подходит ли FEOD моему проекту › Связанные страницы | `structure:get-started/is-feod-for-my-project.md#002-d41120c4` |

### Ответ

Сообщение: 6300 символов · rewrite 1.1 с · поиск 0.1 с · генерация 1.6 с

> Не знаю. Во фрагментах нет сведений о требуемой версии React для FEOD.
>
> Уточнение: Возможно, вас интересует применение FEOD в конкретном framework — уточните, какой framework или версию React вы имеете в виду?

## q15. Какой тестовый раннер рекомендует FEOD — Jest или Vitest?

**Ожидание.** корпус не рекомендует конкретный тестовый раннер; ответ не выбирает инструмент без основания.

**Ожидаемые источники:** —

**Запрос поиска:** Какой тестовый раннер рекомендует FEOD Jest или Vitest

### Переданные фрагменты

Контекст пуст: модель не вызывалась.

### Ответ

Сообщение: 0 символов · rewrite 1.6 с · поиск 0.1 с · генерация 0.0 с

> Не знаю: ни один фрагмент не достиг порога сходства 0.55 (лучшее 0.478).
> Уточните вопрос: назовите раздел, термин или пример, о котором идёт речь.
>
> Ближайшие разделы ниже порога:
> - `reference/glossary.md` › Глоссарий › Термины · 0.478
> - `get-started/is-feod-for-my-project.md` › Подходит ли FEOD моему проекту · 0.465
> - `get-started/faq.md` › FAQ · 0.460
