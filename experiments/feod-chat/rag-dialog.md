# RAG-чат: история, память задачи и источники

Прогон 2026-10-04T13:25:55.763Z. Сценарии: `experiments/feod-chat/scenarios.md` (2, реплик 25). Фактическая длительность прогона: 114.0 с.
Индекс создан 2026-09-30T14:27:30.045Z, модель эмбеддингов `bge-m3:latest` (digest 790764642607).
Модель ответов, памяти задачи и переписывания запроса: `deepseek-flash`. Поиск: стратегия structure, режим rewrite-filter, кандидатов 10, итоговый top-5, порог 0.55 (применяется). Окно истории: 6 ходов.

## Сводка

| Сценарий | Ходов | Ответы с источником | Ответы с дословной цитатой | Цитаты дословно | Цель сохранена | Ключи памяти | «Не знаю» | Память не разобрана | Ответы с замечаниями | Длительность, с |
|---|---|---|---|---|---|---|---|---|---|---|
| s1 | 13 | 12 из 13 | 12 из 13 | 28 из 29 | 13 из 13 | 20 из 20 | 1 (пустой контекст 0, моделью 1) | 0 | 1 | 56.9 |
| s2 | 12 | 12 из 12 | 11 из 12 | 30 из 31 | 12 из 12 | 17 из 17 | 0 (пустой контекст 0, моделью 0) | 0 | 1 | 57.1 |

Каждый сценарий идёт в новом пустом диалоге. «Цель сохранена» — число ходов, на которых каждый ключ цели сценария является подстрокой цели из памяти после хода. «Ключи памяти» — пары «ход — ключ», где ключ, заданный пользователем к этому ходу, найден в памяти после хода. Сравнение подстрок после нормализации регистра, «ё», пробелов и Markdown-символов; смысл не оценивается.
Источник засчитывается, если его номер есть среди переданных фрагментов; цитата — если после нормализации она является подстрокой текста указанного фрагмента. Смысл ответов здесь не оценивается — ручная оценка в README эксперимента. «—» — знаменатель равен нулю.
Измерено: время этапов хода (память, rewrite, поиск, ответ). Вычислено: разбор ответов, проверка ссылок и цитат, сравнение ключей с памятью.

## s1. Миграция проекта с FSD на FEOD

**Цель:** перевести существующий frontend-проект с FSD на FEOD. **Ключи цели:** FSD, FEOD. **Ключи памяти:** «TypeScript» с хода 2; «deep imports» с хода 6.

| Ход | Исход | Источники | Цитаты дословно | Цель сохранена | Ключи памяти | Строка поиска | мс |
|---|---|---|---|---|---|---|---|
| 1 | ответ | 2 из 2 | 2 из 2 | да | — | перевести frontend-проект с FSD на FEOD по шагам | 4 635 |
| 2 | ответ | 2 из 2 | 2 из 2 | да | 1 из 1 | проект на TypeScript около 40 страниц текущие слои FSD app pages widgets features entities shared | 3 964 |
| 3 | ответ | 3 из 3 | 3 из 3 | да | 1 из 1 | Какие верхние уровни есть в FEOD | 3 839 |
| 4 | ответ | 2 из 2 | 1 из 2 | да | 1 из 1 | При миграции с FSD на FEOD куда деть слой shared | 4 377 |
| 5 | ответ | 2 из 2 | 2 из 2 | да | 1 из 1 | Что может импортировать код страниц в FEOD и что ему запрещено | 3 628 |
| 6 | ответ | 3 из 3 | 3 из 3 | да | 2 из 2 | deep imports запрещены сразу без исключений в новом коде FEOD | 4 699 |
| 7 | ответ | 2 из 2 | 2 из 2 | да | 2 из 2 | Как поступить с legacy deep imports в FEOD-проекте при запрете deep imports в новом коде сразу без исключений | 4 634 |
| 8 | не знаю (модель) | — | — | да | 2 из 2 | Где хранить API-клиент в FEOD при переводе frontend-проекта с FSD на FEOD | 3 673 |
| 9 | ответ | 2 из 2 | 2 из 2 | да | 2 из 2 | Каким слоям FEOD соответствуют слои FSD entities, features и widgets | 4 376 |
| 10 | ответ | 3 из 3 | 3 из 3 | да | 2 из 2 | Можно ли одному модулю FEOD импортировать другой модуль | 4 075 |
| 11 | ответ | 2 из 2 | 2 из 2 | да | 2 из 2 | Чем FEOD отличается от FSD | 4 332 |
| 12 | ответ | 3 из 3 | 3 из 3 | да | 2 из 2 | Как на code review проверять соблюдение запрета deep imports в новом коде | 5 056 |
| 13 | ответ | 3 из 3 | 3 из 3 | да | 2 из 2 | итоговый план миграции из 5 шагов с FSD на FEOD с ограничением: deep imports в новом коде запрещены сразу, без исключений | 5 633 |

### s1 · ход 1

**Реплика.** Привет! Мы хотим перевести наш frontend-проект с FSD на FEOD. Помоги разобраться по шагам.

**Строка поиска:** перевести frontend-проект с FSD на FEOD по шагам

| Фрагмент | Сходство | Файл | Разделы | chunk_id |
|---|---|---|---|---|
| 1 | 0.701 | `guides/migration-from-fsd.md` | Миграция с FSD › Шаги | `structure:guides/migration-from-fsd.md#001-194472bd` |
| 2 | 0.690 | `get-started/overview.md` | FEOD: методология frontend-архитектуры | `structure:get-started/overview.md#000-41b04377` |
| 3 | 0.679 | `get-started/overview.md` | FEOD: методология frontend-архитектуры › Куда идти дальше; FEOD: методология frontend-архитектуры › Связанные страницы | `structure:get-started/overview.md#005-2d3aeb5b` |
| 4 | 0.676 | `guides/migration-from-fsd.md` | Миграция с FSD; Миграция с FSD › Когда использовать; Миграция с FSD › Входные условия | `structure:guides/migration-from-fsd.md#000-4693c314` |
| 5 | 0.676 | `get-started/overview.md` | FEOD: методология frontend-архитектуры › Чем FEOD отличается от FSD | `structure:get-started/overview.md#003-8bb951b9` |

Время этапов, с: память 1.0, rewrite 1.3, поиск 0.1, ответ 2.2

> Порядок перехода задан в guide по миграции: сначала опишите текущие FSD-слои и отметьте номинальные [1]. Затем `app` и `pages` переносятся почти напрямую [1]. Далее разберите `shared`: нейтральные примитивы и утилиты идут в `common`, а код с продуктовым смыслом там оставаться не должен [1]. После этого `entities`, `features` и `widgets` сводятся к `modules` — группировка идёт по ответственности, а не по старому названию слоя [1]. Затем перепроверьте public API каждого модуля и упростите спорные границы [1]. Отличия зафиксируйте в проектном README, а технические проверки отложите до стабилизации [1]. Целевой язык проекта — уровни FEOD: `app`, `pages`, `modules`, `common`, `global` [4].
>
> Источники:
> - [1] `guides/migration-from-fsd.md` › Миграция с FSD › Шаги · `structure:guides/migration-from-fsd.md#001-194472bd` · https://github.com/feod-architecture/feod-docs/blob/f00eaf533cfee37f67e118c96291d535b0895a6f/docs/guides/migration-from-fsd.md
> - [4] `guides/migration-from-fsd.md` › Миграция с FSD; Миграция с FSD › Когда использовать; Миграция с FSD › Входные условия · `structure:guides/migration-from-fsd.md#000-4693c314` · https://github.com/feod-architecture/feod-docs/blob/f00eaf533cfee37f67e118c96291d535b0895a6f/docs/guides/migration-from-fsd.md
>
> Цитаты:
> - [1] «Перенесите `app` почти напрямую.» — найдена во фрагменте 1
> - [4] «FSD-термины здесь используются только для сопоставления.» — найдена во фрагменте 4

**Память после хода.**

> ## Цель
>
> Перевести frontend-проект с FSD на FEOD.
>
> ## Уточнения
>
> —
>
> ## Ограничения и термины
>
> - FSD — текущая архитектура проекта.
> - FEOD — целевая архитектура проекта.

### s1 · ход 2

**Реплика.** Уточню: проект на TypeScript, около 40 страниц, сейчас слои FSD — app, pages, widgets, features, entities, shared.

**Строка поиска:** проект на TypeScript около 40 страниц текущие слои FSD app pages widgets features entities shared

| Фрагмент | Сходство | Файл | Разделы | chunk_id |
|---|---|---|---|---|
| 1 | 0.610 | `guides/migration-from-fsd.md` | Миграция с FSD › Шаги | `structure:guides/migration-from-fsd.md#001-194472bd` |
| 2 | 0.599 | `reference/terms.md` | Термины › Перед публикацией страницы; Термины › Связанные страницы | `structure:reference/terms.md#006-ddb70570` |
| 3 | 0.591 | `guides/migration-from-fsd.md` | Миграция с FSD › Пример сопоставления | `structure:guides/migration-from-fsd.md#002-9e662423` |
| 4 | 0.582 | `get-started/overview.md` | FEOD: методология frontend-архитектуры › Верхние уровни FEOD | `structure:get-started/overview.md#004-debd75dc` |
| 5 | 0.574 | `guides/migration-from-fsd.md` | Миграция с FSD › Good example; Миграция с FSD › Bad example | `structure:guides/migration-from-fsd.md#003-3253e9d3` |

Время этапов, с: память 1.0, rewrite 0.9, поиск 0.1, ответ 2.0

> С учётом условий проекта (TypeScript, около 40 страниц, слои FSD app, pages, widgets, features, entities, shared) шаги те же, что в guide по миграции [1]. Сначала зафиксируйте, какие папки реально используются, и отметьте слои, существующие только номинально [1]. `app` и `pages` переносятся почти напрямую [1]. `shared` разбирается: нейтральные UI-примитивы, utilities, framework helpers и общие типы идут в `common`, а код с продуктовым смыслом там оставаться не должен [1]. `entities`, `features` и `widgets` сводятся к `modules` с группировкой по ответственности, а не по старому названию слоя [1]. Целевые уровни — `app`, `pages`, `modules`, `common`, `global`, и основной термин для верхних структурных зон — «уровень» [2].
>
> Источники:
> - [1] `guides/migration-from-fsd.md` › Миграция с FSD › Шаги · `structure:guides/migration-from-fsd.md#001-194472bd` · https://github.com/feod-architecture/feod-docs/blob/f00eaf533cfee37f67e118c96291d535b0895a6f/docs/guides/migration-from-fsd.md
> - [2] `reference/terms.md` › Термины › Перед публикацией страницы; Термины › Связанные страницы · `structure:reference/terms.md#006-ddb70570` · https://github.com/feod-architecture/feod-docs/blob/f00eaf533cfee37f67e118c96291d535b0895a6f/docs/reference/terms.md
>
> Цитаты:
> - [1] «Сведите `entities`, `features`, `widgets` к `modules`, если это соответствует выбранной канонической FEOD-версии.» — найдена во фрагменте 1
> - [2] «Основной термин для верхних структурных зон - `уровень`.» — найдена во фрагменте 2

**Память после хода.**

> ## Цель
>
> Перевести frontend-проект с FSD на FEOD.
>
> ## Уточнения
>
> - Проект на TypeScript.
> - Около 40 страниц.
> - Текущие слои FSD: app, pages, widgets, features, entities, shared.
>
> ## Ограничения и термины
>
> - FSD — текущая архитектура проекта.
> - FEOD — целевая архитектура проекта.

### s1 · ход 3

**Реплика.** С чего начать: какие верхние уровни есть в FEOD?

**Строка поиска:** Какие верхние уровни есть в FEOD

| Фрагмент | Сходство | Файл | Разделы | chunk_id |
|---|---|---|---|---|
| 1 | 0.680 | `get-started/overview.md` | FEOD: методология frontend-архитектуры › Верхние уровни FEOD | `structure:get-started/overview.md#004-debd75dc` |
| 2 | 0.651 | `core-concepts/levels.md` | Уровни; Уровни › Короткое определение; Уровни › Какую проблему решает | `structure:core-concepts/levels.md#000-cdf97650` |
| 3 | 0.607 | `core-concepts/levels.md` | Уровни › Правило; Уровни › Почему; Уровни › Быстрый reference | `structure:core-concepts/levels.md#001-1060540c` |
| 4 | 0.600 | `reference/glossary.md` | Глоссарий; Глоссарий › Термины | `structure:reference/glossary.md#000-cadc2cf1` |
| 5 | 0.598 | `get-started/overview.md` | FEOD: методология frontend-архитектуры › Чем FEOD отличается от FSD | `structure:get-started/overview.md#003-8bb951b9` |

Время этапов, с: память 1.2, rewrite 0.8, поиск 0.1, ответ 1.8

> В FEOD на верхнем уровне используются только пять имён: `app`, `pages`, `modules`, `common`, `global` [1]. Их роли: `app` — запуск приложения, роутинг, провайдеры и композиция верхнего уровня; `pages` — страницы и крупные сценарии входа; `modules` — самостоятельные модули с собственным `public API`; `common` — переиспользуемые FEOD-сущности без привязки к конкретному модулю; `global` — декларации окружения, shims, polyfills и редкие side-effect подключения [1]. Эти же пять уровней названы каноническими в глоссарии [4]. С учётом вашего ограничения — FSD сейчас является текущей архитектурой проекта — обратите внимание, что обязательного набора FSD-слоёв вроде `entities`, `features` и `widgets` в FEOD нет, а основной термин — «уровень», а не «слой» [5].
>
> Источники:
> - [1] `get-started/overview.md` › FEOD: методология frontend-архитектуры › Верхние уровни FEOD · `structure:get-started/overview.md#004-debd75dc` · https://github.com/feod-architecture/feod-docs/blob/f00eaf533cfee37f67e118c96291d535b0895a6f/docs/get-started/overview.md
> - [4] `reference/glossary.md` › Глоссарий; Глоссарий › Термины · `structure:reference/glossary.md#000-cadc2cf1` · https://github.com/feod-architecture/feod-docs/blob/f00eaf533cfee37f67e118c96291d535b0895a6f/docs/reference/glossary.md
> - [5] `get-started/overview.md` › FEOD: методология frontend-архитектуры › Чем FEOD отличается от FSD · `structure:get-started/overview.md#003-8bb951b9` · https://github.com/feod-architecture/feod-docs/blob/f00eaf533cfee37f67e118c96291d535b0895a6f/docs/get-started/overview.md
>
> Цитаты:
> - [1] «На верхнем уровне проекта FEOD использует только пять имён:» — найдена во фрагменте 1
> - [4] «Канонические уровни: `app`, `pages`, `modules`, `common`, `global`.» — найдена во фрагменте 4
> - [5] «в FEOD нет обязательного набора FSD-слоёв вроде `entities`, `features`, `widgets`;» — найдена во фрагменте 5

**Память после хода.**

> ## Цель
>
> Перевести frontend-проект с FSD на FEOD.
>
> ## Уточнения
>
> - Проект на TypeScript.
> - Около 40 страниц.
> - Текущие слои FSD: app, pages, widgets, features, entities, shared.
>
> ## Ограничения и термины
>
> - FSD — текущая архитектура проекта.
> - FEOD — целевая архитектура проекта.

### s1 · ход 4

**Реплика.** Куда при переезде деть наш слой shared?

**Строка поиска:** При миграции с FSD на FEOD куда деть слой shared

| Фрагмент | Сходство | Файл | Разделы | chunk_id |
|---|---|---|---|---|
| 1 | 0.711 | `guides/migration-from-fsd.md` | Миграция с FSD; Миграция с FSD › Когда использовать; Миграция с FSD › Входные условия | `structure:guides/migration-from-fsd.md#000-4693c314` |
| 2 | 0.655 | `guides/migration-from-fsd.md` | Миграция с FSD › Чеклист; Миграция с FSD › Типичные ошибки; Миграция с FSD › Связанные страницы | `structure:guides/migration-from-fsd.md#004-4f9fc3f4` |
| 3 | 0.637 | `guides/migration-from-fsd.md` | Миграция с FSD › Шаги | `structure:guides/migration-from-fsd.md#001-194472bd` |
| 4 | 0.608 | `get-started/faq.md` | FAQ; FAQ › FEOD - это FSD? | `structure:get-started/faq.md#000-126c876e` |
| 5 | 0.605 | `guides/migration-from-modular.md` | Миграция с обычной модульной архитектуры; Миграция с обычной модульной архитектуры › Когда использовать; Миграция с обычной модульной архитектуры › Входные условия | `structure:guides/migration-from-modular.md#000-636c8900` |

Время этапов, с: память 1.3, rewrite 1.2, поиск 0.1, ответ 1.8

> `shared` нужно разобрать, а не переносить целиком: нейтральные UI-примитивы, utilities, framework helpers и общие типы переходят в `common` [1]. Код с продуктовым смыслом не должен оставаться в `common` [1]. Общая формулировка чеклиста: `shared` разбирается на `common`, `global` и продуктовые modules [2]. Это прямо названо типичной ошибкой: считать `shared` автоматическим `common`, иначе доменный код попадает в общий уровень [2]. Для вашего проекта на TypeScript с текущими слоями app, pages, widgets, features, entities, shared порядок разбора описан в шагах guide [1].
>
> Источники:
> - [1] `guides/migration-from-fsd.md` › Миграция с FSD; Миграция с FSD › Когда использовать; Миграция с FSD › Входные условия · `structure:guides/migration-from-fsd.md#000-4693c314` · https://github.com/feod-architecture/feod-docs/blob/f00eaf533cfee37f67e118c96291d535b0895a6f/docs/guides/migration-from-fsd.md
> - [2] `guides/migration-from-fsd.md` › Миграция с FSD › Чеклист; Миграция с FSD › Типичные ошибки; Миграция с FSD › Связанные страницы · `structure:guides/migration-from-fsd.md#004-4f9fc3f4` · https://github.com/feod-architecture/feod-docs/blob/f00eaf533cfee37f67e118c96291d535b0895a6f/docs/guides/migration-from-fsd.md
>
> Цитаты:
> - [1] «Нейтральные UI-примитивы, utilities, framework helpers и общие типы переходят в `common`.» — не найдена во фрагменте 1
> - [2] «`shared` разобран на `common`, `global` и продуктовые modules.» — найдена во фрагменте 2
>
> Замечания:
> - цитата [1] не найдена во фрагменте 1

**Память после хода.**

> ## Цель
>
> Перевести frontend-проект с FSD на FEOD.
>
> ## Уточнения
>
> - Проект на TypeScript.
> - Около 40 страниц.
> - Текущие слои FSD: app, pages, widgets, features, entities, shared.
>
> ## Ограничения и термины
>
> - FSD — текущая архитектура проекта.
> - FEOD — целевая архитектура проекта.

Замечания к ответу: цитата [1] не найдена во фрагменте 1.

### s1 · ход 5

**Реплика.** А что код страниц может импортировать, а что ему запрещено?

**Строка поиска:** Что может импортировать код страниц в FEOD и что ему запрещено

| Фрагмент | Сходство | Файл | Разделы | chunk_id |
|---|---|---|---|---|
| 1 | 0.650 | `reference/terms.md` | Термины › Deep import; Термины › Нормативные формулировки | `structure:reference/terms.md#005-6dc27d31` |
| 2 | 0.649 | `core-concepts/dependency-rules.md` | Правила зависимостей › Нормативные правила; Правила зависимостей › Правило public API | `structure:core-concepts/dependency-rules.md#002-81f6b0b1` |
| 3 | 0.638 | `core-concepts/levels.md` | Уровни › Правило; Уровни › Почему; Уровни › Быстрый reference | `structure:core-concepts/levels.md#001-1060540c` |
| 4 | 0.631 | `reference/import-matrix.md` | Матрица импортов › Deep imports | `structure:reference/import-matrix.md#005-afa7012c` |
| 5 | 0.627 | `reference/glossary.md` | Глоссарий › Термины | `structure:reference/glossary.md#002-98ffd897` |

Время этапов, с: память 0.9, rewrite 0.6, поиск 0.1, ответ 2.1

> Страницы — это уровень `pages`, пользовательские экраны и маршруты; они могут импортировать `modules` и `common` [3]. Импортировать `pages` может только `app` [3]. То есть импорт других страниц или `app` страницам запрещён, поскольку код на каждом уровне импортирует только разрешённые матрицей уровни [2]. Кроме того, внешний импорт FEOD-сущности должен идти через её public API, а deep imports во внутренние файлы чужой сущности запрещены [2]. Для вашего проекта на TypeScript это существенно: type-only imports подчиняются тем же правилам, что и runtime imports [2].
>
> Источники:
> - [2] `core-concepts/dependency-rules.md` › Правила зависимостей › Нормативные правила; Правила зависимостей › Правило public API · `structure:core-concepts/dependency-rules.md#002-81f6b0b1` · https://github.com/feod-architecture/feod-docs/blob/f00eaf533cfee37f67e118c96291d535b0895a6f/docs/core-concepts/dependency-rules.md
> - [3] `core-concepts/levels.md` › Уровни › Правило; Уровни › Почему; Уровни › Быстрый reference · `structure:core-concepts/levels.md#001-1060540c` · https://github.com/feod-architecture/feod-docs/blob/f00eaf533cfee37f67e118c96291d535b0895a6f/docs/core-concepts/levels.md
>
> Цитаты:
> - [2] «Type-only imports подчиняются тем же правилам, что и runtime imports.» — найдена во фрагменте 2
> - [3] «`pages` | пользовательские экраны и маршруты | `app` | `modules`, `common`» — найдена во фрагменте 3

**Память после хода.**

> ## Цель
>
> Перевести frontend-проект с FSD на FEOD.
>
> ## Уточнения
>
> - Проект на TypeScript.
> - Около 40 страниц.
> - Текущие слои FSD: app, pages, widgets, features, entities, shared.
>
> ## Ограничения и термины
>
> - FSD — текущая архитектура проекта.
> - FEOD — целевая архитектура проекта.

### s1 · ход 6

**Реплика.** Важное ограничение: deep imports в новом коде мы запрещаем сразу, без исключений.

**Строка поиска:** deep imports запрещены сразу без исключений в новом коде FEOD

| Фрагмент | Сходство | Файл | Разделы | chunk_id |
|---|---|---|---|---|
| 1 | 0.674 | `reference/import-matrix.md` | Матрица импортов › Deep imports | `structure:reference/import-matrix.md#005-afa7012c` |
| 2 | 0.670 | `reference/terms.md` | Термины › Deep import; Термины › Нормативные формулировки | `structure:reference/terms.md#005-6dc27d31` |
| 3 | 0.626 | `reference/code-smells.md` | Code smells › Deep imports; Code smells › Deep imports › Симптом; Code smells › Deep imports › Почему проблема | `structure:reference/code-smells.md#001-1156e0c8` |
| 4 | 0.608 | `core-concepts/dependency-rules.md` | Правила зависимостей › Нормативные правила; Правила зависимостей › Правило public API | `structure:core-concepts/dependency-rules.md#002-81f6b0b1` |
| 5 | 0.608 | `core-concepts/dependency-rules.md` | Правила зависимостей › Правило public API › Почему; Правила зависимостей › Правило deep imports; Правила зависимостей › Good example | `structure:core-concepts/dependency-rules.md#003-48ab93b0` |

Время этапов, с: память 1.2, rewrite 1.2, поиск 0.1, ответ 2.2

> С учётом вашего ограничения — deep imports в новом коде запрещены сразу, без исключений — новый код должен импортировать чужую FEOD-сущность только из корня её public API [4]. Deep import — это импорт, который обходит public API FEOD-сущности и указывает на её внутренний файл или внутреннюю директорию [1]. Запрещены для чужих модулей, чужих сущностей `common`, чужих страниц и любых обращений к внутренностям уровня из другого уровня [5]. Практическое правило для линтера: внешний импорт должен заканчиваться на корень public API, а не на внутренний сегмент `ui`, `api`, `model`, `lib`, `config`, `types` или конкретный файл [1]. Рабочий TypeScript-import не делает путь допустимым по правилам FEOD [2]. Type-only imports подчиняются тем же правилам, что и runtime imports [4].
>
> Источники:
> - [1] `reference/import-matrix.md` › Матрица импортов › Deep imports · `structure:reference/import-matrix.md#005-afa7012c` · https://github.com/feod-architecture/feod-docs/blob/f00eaf533cfee37f67e118c96291d535b0895a6f/docs/reference/import-matrix.md
> - [2] `reference/terms.md` › Термины › Deep import; Термины › Нормативные формулировки · `structure:reference/terms.md#005-6dc27d31` · https://github.com/feod-architecture/feod-docs/blob/f00eaf533cfee37f67e118c96291d535b0895a6f/docs/reference/terms.md
> - [4] `core-concepts/dependency-rules.md` › Правила зависимостей › Нормативные правила; Правила зависимостей › Правило public API · `structure:core-concepts/dependency-rules.md#002-81f6b0b1` · https://github.com/feod-architecture/feod-docs/blob/f00eaf533cfee37f67e118c96291d535b0895a6f/docs/core-concepts/dependency-rules.md
>
> Цитаты:
> - [1] «Для линтера практическое правило такое: внешний импорт FEOD-сущности должен заканчиваться на корень её public API, а не на внутренний сегмент `ui`, `api`, `model`, `lib`, `config`, `types` или конкретный файл.» — найдена во фрагменте 1
> - [2] «Рабочий TypeScript-import не делает путь допустимым по правилам FEOD.» — найдена во фрагменте 2
> - [4] «Type-only imports подчиняются тем же правилам, что и runtime imports.» — найдена во фрагменте 4

**Память после хода.**

> ## Цель
>
> Перевести frontend-проект с FSD на FEOD.
>
> ## Уточнения
>
> - Проект на TypeScript.
> - Около 40 страниц.
> - Текущие слои FSD: app, pages, widgets, features, entities, shared.
>
> ## Ограничения и термины
>
> - FSD — текущая архитектура проекта.
> - FEOD — целевая архитектура проекта.
> - Deep imports в новом коде запрещены сразу, без исключений.

### s1 · ход 7

**Реплика.** Как тогда поступить с legacy deep imports, которые уже есть в проекте?

**Строка поиска:** Как поступить с legacy deep imports в FEOD-проекте при запрете deep imports в новом коде сразу без исключений

| Фрагмент | Сходство | Файл | Разделы | chunk_id |
|---|---|---|---|---|
| 1 | 0.643 | `reference/terms.md` | Термины › Deep import; Термины › Нормативные формулировки | `structure:reference/terms.md#005-6dc27d31` |
| 2 | 0.642 | `reference/import-matrix.md` | Матрица импортов › Deep imports | `structure:reference/import-matrix.md#005-afa7012c` |
| 3 | 0.625 | `core-concepts/dependency-rules.md` | Правила зависимостей › Правило public API › Почему; Правила зависимостей › Правило deep imports; Правила зависимостей › Good example | `structure:core-concepts/dependency-rules.md#003-48ab93b0` |
| 4 | 0.618 | `get-started/is-feod-for-my-project.md` | Подходит ли FEOD моему проекту › Когда не начинать с FEOD; Подходит ли FEOD моему проекту › Быстрая диагностика | `structure:get-started/is-feod-for-my-project.md#001-4e1e3ed6` |
| 5 | 0.616 | `core-concepts/dependency-rules.md` | Правила зависимостей › Нормативные правила; Правила зависимостей › Правило public API | `structure:core-concepts/dependency-rules.md#002-81f6b0b1` |

Время этапов, с: память 1.3, rewrite 1.1, поиск 0.1, ответ 2.2

> Во фрагментах нет указаний по обращению именно с уже существующими legacy deep imports: описан только запрет и практическое правило для линтера [2]. С учётом вашего ограничения («deep imports в новом коде запрещены сразу, без исключений») оно сформулировано для нового кода, поэтому не отменяет отдельного решения по старому. Нормативно запрещены deep imports для чужих модулей, чужих сущностей `common`, чужих страниц и любых обращений к внутренностям уровня из другого уровня [3]. При этом внешний импорт должен идти через public API, а правило линтера — требовать окончания пути на корень public API, а не на внутренний сегмент `ui`, `api`, `model`, `lib`, `config`, `types` или конкретный файл [2].
>
> Источники:
> - [2] `reference/import-matrix.md` › Матрица импортов › Deep imports · `structure:reference/import-matrix.md#005-afa7012c` · https://github.com/feod-architecture/feod-docs/blob/f00eaf533cfee37f67e118c96291d535b0895a6f/docs/reference/import-matrix.md
> - [3] `core-concepts/dependency-rules.md` › Правила зависимостей › Правило public API › Почему; Правила зависимостей › Правило deep imports; Правила зависимостей › Good example · `structure:core-concepts/dependency-rules.md#003-48ab93b0` · https://github.com/feod-architecture/feod-docs/blob/f00eaf533cfee37f67e118c96291d535b0895a6f/docs/core-concepts/dependency-rules.md
>
> Цитаты:
> - [2] «Для линтера практическое правило такое: внешний импорт FEOD-сущности должен заканчиваться на корень её public API, а не на внутренний сегмент `ui`, `api`, `model`, `lib`, `config`, `types` или конкретный файл.» — найдена во фрагменте 2
> - [3] «Deep imports запрещены для:» — найдена во фрагменте 3

**Память после хода.**

> ## Цель
>
> Перевести frontend-проект с FSD на FEOD.
>
> ## Уточнения
>
> - Проект на TypeScript.
> - Около 40 страниц.
> - Текущие слои FSD: app, pages, widgets, features, entities, shared.
>
> ## Ограничения и термины
>
> - FSD — текущая архитектура проекта.
> - FEOD — целевая архитектура проекта.
> - Deep imports в новом коде запрещены сразу, без исключений.

### s1 · ход 8

**Реплика.** Где хранить API-клиент?

**Строка поиска:** Где хранить API-клиент в FEOD при переводе frontend-проекта с FSD на FEOD

| Фрагмент | Сходство | Файл | Разделы | chunk_id |
|---|---|---|---|---|
| 1 | 0.649 | `get-started/overview.md` | FEOD: методология frontend-архитектуры | `structure:get-started/overview.md#000-41b04377` |
| 2 | 0.617 | `core-concepts/public-api.md` | Публичный API; Публичный API › Короткое определение; Публичный API › Какую проблему решает | `structure:core-concepts/public-api.md#000-f01af1d3` |
| 3 | 0.613 | `get-started/is-feod-for-my-project.md` | Подходит ли FEOD моему проекту › Когда не начинать с FEOD; Подходит ли FEOD моему проекту › Быстрая диагностика | `structure:get-started/is-feod-for-my-project.md#001-4e1e3ed6` |
| 4 | 0.612 | `guides/migration-from-fsd.md` | Миграция с FSD; Миграция с FSD › Когда использовать; Миграция с FSD › Входные условия | `structure:guides/migration-from-fsd.md#000-4693c314` |
| 5 | 0.610 | `get-started/faq.md` | FAQ; FAQ › FEOD - это FSD? | `structure:get-started/faq.md#000-126c876e` |

Время этапов, с: память 0.9, rewrite 0.9, поиск 0.0, ответ 1.8

> Не знаю. Во фрагментах нет сведений о том, где хранить API-клиент: ни один из них не описывает размещение HTTP-клиента, сгенерированных SDK или слоя работы с сетью.
>
> Уточнение: Уточните, пожалуйста, о каком именно API-клиенте речь — например, о низкоуровневом HTTP-клиенте без продуктового смысла или о клиенте конкретной продуктовой области (одного модуля)?

**Память после хода.**

> ## Цель
>
> Перевести frontend-проект с FSD на FEOD.
>
> ## Уточнения
>
> - Проект на TypeScript.
> - Около 40 страниц.
> - Текущие слои FSD: app, pages, widgets, features, entities, shared.
>
> ## Ограничения и термины
>
> - FSD — текущая архитектура проекта.
> - FEOD — целевая архитектура проекта.
> - Deep imports в новом коде запрещены сразу, без исключений.

### s1 · ход 9

**Реплика.** Во что превратятся наши слои entities, features и widgets?

**Строка поиска:** Каким слоям FEOD соответствуют слои FSD entities, features и widgets

| Фрагмент | Сходство | Файл | Разделы | chunk_id |
|---|---|---|---|---|
| 1 | 0.648 | `get-started/overview.md` | FEOD: методология frontend-архитектуры › Чем FEOD отличается от FSD | `structure:get-started/overview.md#003-8bb951b9` |
| 2 | 0.638 | `get-started/overview.md` | FEOD: методология frontend-архитектуры | `structure:get-started/overview.md#000-41b04377` |
| 3 | 0.624 | `reference/terms.md` | Термины › Перед публикацией страницы; Термины › Связанные страницы | `structure:reference/terms.md#006-ddb70570` |
| 4 | 0.620 | `reference/glossary.md` | Глоссарий; Глоссарий › Термины | `structure:reference/glossary.md#000-cadc2cf1` |
| 5 | 0.614 | `core-concepts/levels.md` | Уровни; Уровни › Короткое определение; Уровни › Какую проблему решает | `structure:core-concepts/levels.md#000-cdf97650` |

Время этапов, с: память 1.2, rewrite 0.9, поиск 0.0, ответ 2.2

> Однозначного сопоставления один-к-одному во фрагментах нет: в FEOD нет обязательного набора FSD-слоёв вроде `entities`, `features`, `widgets` [1]. Главный строительный блок в FEOD — модуль: самостоятельная продуктовая ответственность на уровне `modules`, которая скрывает внутреннюю структуру и открывает наружу явный public API [4]. Модуль, его public API и граница зависимостей — то, вокруг чего FEOD концентрируется [1]. Поэтому код этих слоёв следует не «переименовывать», а раскладывать в модули с public API [4].
>
> Источники:
> - [1] `get-started/overview.md` › FEOD: методология frontend-архитектуры › Чем FEOD отличается от FSD · `structure:get-started/overview.md#003-8bb951b9` · https://github.com/feod-architecture/feod-docs/blob/f00eaf533cfee37f67e118c96291d535b0895a6f/docs/get-started/overview.md
> - [4] `reference/glossary.md` › Глоссарий; Глоссарий › Термины · `structure:reference/glossary.md#000-cadc2cf1` · https://github.com/feod-architecture/feod-docs/blob/f00eaf533cfee37f67e118c96291d535b0895a6f/docs/reference/glossary.md
>
> Цитаты:
> - [1] «в FEOD нет обязательного набора FSD-слоёв вроде `entities`, `features`, `widgets`;» — найдена во фрагменте 1
> - [4] «Самостоятельная продуктовая ответственность на уровне `modules`, которая скрывает внутреннюю структуру и открывает наружу явный public API.» — найдена во фрагменте 4

**Память после хода.**

> ## Цель
>
> Перевести frontend-проект с FSD на FEOD.
>
> ## Уточнения
>
> - Проект на TypeScript.
> - Около 40 страниц.
> - Текущие слои FSD: app, pages, widgets, features, entities, shared.
>
> ## Ограничения и термины
>
> - FSD — текущая архитектура проекта.
> - FEOD — целевая архитектура проекта.
> - Deep imports в новом коде запрещены сразу, без исключений.

### s1 · ход 10

**Реплика.** Можно ли одному модулю импортировать другой модуль?

**Строка поиска:** Можно ли одному модулю FEOD импортировать другой модуль

| Фрагмент | Сходство | Файл | Разделы | chunk_id |
|---|---|---|---|---|
| 1 | 0.734 | `get-started/faq.md` | FAQ › Можно ли использовать FEOD без common?; FAQ › Можно ли модулю импортировать другой модуль? | `structure:get-started/faq.md#001-d645a78d` |
| 2 | 0.687 | `get-started/overview.md` | FEOD: методология frontend-архитектуры › Чем FEOD отличается от обычной модульной архитектуры | `structure:get-started/overview.md#002-62c15755` |
| 3 | 0.652 | `core-concepts/levels.md` | Уровни › Уровень modules; Уровни › Уровень modules › Назначение; Уровни › Уровень modules › Кто может импортировать; Уровни › Уровень modules › Что может импортировать | `structure:core-concepts/levels.md#007-2adcd648` |
| 4 | 0.648 | `core-concepts/dependency-rules.md` | Правила зависимостей › Нормативные правила; Правила зависимостей › Правило public API | `structure:core-concepts/dependency-rules.md#002-81f6b0b1` |
| 5 | 0.633 | `reference/import-matrix.md` | Матрица импортов › Смежные правила | `structure:reference/import-matrix.md#008-359edc40` |

Время этапов, с: память 0.9, rewrite 1.0, поиск 0.1, ответ 2.0

> Да, модулю можно импортировать другой модуль, если импорт идёт через public API другого модуля и не создаёт циклическую или скрытую зависимость [1]. Уровень `modules` может импортироваться из `app`, `pages` и других `modules` [3]. Код на уровне `modules` может импортировать `common`, public API других модулей и public API собственных подмодулей, но не импортирует `app`, `pages`, `global` и внутренности чужих модулей [3]. С учётом вашего ограничения — deep imports в новом коде запрещены сразу, без исключений — в новом коде допустим только импорт из корня public API, например `@/modules/billing` [3]. Type-only imports подчиняются тем же правилам, что и runtime imports [4].
>
> Источники:
> - [1] `get-started/faq.md` › FAQ › Можно ли использовать FEOD без common?; FAQ › Можно ли модулю импортировать другой модуль? · `structure:get-started/faq.md#001-d645a78d` · https://github.com/feod-architecture/feod-docs/blob/f00eaf533cfee37f67e118c96291d535b0895a6f/docs/get-started/faq.md
> - [3] `core-concepts/levels.md` › Уровни › Уровень modules; Уровни › Уровень modules › Назначение; Уровни › Уровень modules › Кто может импортировать; Уровни › Уровень modules › Что может импортировать · `structure:core-concepts/levels.md#007-2adcd648` · https://github.com/feod-architecture/feod-docs/blob/f00eaf533cfee37f67e118c96291d535b0895a6f/docs/core-concepts/levels.md
> - [4] `core-concepts/dependency-rules.md` › Правила зависимостей › Нормативные правила; Правила зависимостей › Правило public API · `structure:core-concepts/dependency-rules.md#002-81f6b0b1` · https://github.com/feod-architecture/feod-docs/blob/f00eaf533cfee37f67e118c96291d535b0895a6f/docs/core-concepts/dependency-rules.md
>
> Цитаты:
> - [1] «Да, если импорт идёт через public API другого модуля и не создаёт циклическую или скрытую зависимость.» — найдена во фрагменте 1
> - [3] «Код на уровне `modules` может импортировать `common`, public API других модулей и public API собственных подмодулей.» — найдена во фрагменте 3
> - [4] «Type-only imports подчиняются тем же правилам, что и runtime imports.» — найдена во фрагменте 4

**Память после хода.**

> ## Цель
>
> Перевести frontend-проект с FSD на FEOD.
>
> ## Уточнения
>
> - Проект на TypeScript.
> - Около 40 страниц.
> - Текущие слои FSD: app, pages, widgets, features, entities, shared.
>
> ## Ограничения и термины
>
> - FSD — текущая архитектура проекта.
> - FEOD — целевая архитектура проекта.
> - Deep imports в новом коде запрещены сразу, без исключений.

### s1 · ход 11

**Реплика.** Чем вообще FEOD отличается от FSD — коротко, чтобы объяснить команде?

**Строка поиска:** Чем FEOD отличается от FSD

| Фрагмент | Сходство | Файл | Разделы | chunk_id |
|---|---|---|---|---|
| 1 | 0.652 | `get-started/overview.md` | FEOD: методология frontend-архитектуры › Чем FEOD отличается от FSD | `structure:get-started/overview.md#003-8bb951b9` |
| 2 | 0.568 | `get-started/faq.md` | FAQ; FAQ › FEOD - это FSD? | `structure:get-started/faq.md#000-126c876e` |
| 3 | 0.560 | `get-started/overview.md` | FEOD: методология frontend-архитектуры | `structure:get-started/overview.md#000-41b04377` |
| 4 | 0.553 | `reference/terms.md` | Термины › FEOD-сущность и DDD entity | `structure:reference/terms.md#003-0bf4dadc` |

Время этапов, с: память 1.0, rewrite 0.9, поиск 0.1, ответ 2.4

> FEOD и FSD решают близкую задачу — сделать архитектуру понятной и устойчивой, но описывают её по-разному [1]. Ключевое отличие: в FEOD основной термин — уровень, а не слой, и нет обязательного набора FSD-слоёв вроде `entities`, `features`, `widgets` [1]. FEOD использует меньше верхних уровней и строит проект вокруг `modules`, public API и контролируемых зависимостей [2]. Для команды, приходящей из FSD, предлагается сначала сопоставить текущие `entities`, `features` и `widgets` с будущими `modules`, а затем проверить public API каждого модуля [2]. При этом FEOD — отдельная методология, а не переименование FSD-терминов [1]. С учётом вашего ограничения: deep imports в новом коде запрещены сразу, без исключений.
>
> Источники:
> - [1] `get-started/overview.md` › FEOD: методология frontend-архитектуры › Чем FEOD отличается от FSD · `structure:get-started/overview.md#003-8bb951b9` · https://github.com/feod-architecture/feod-docs/blob/f00eaf533cfee37f67e118c96291d535b0895a6f/docs/get-started/overview.md
> - [2] `get-started/faq.md` › FAQ; FAQ › FEOD - это FSD? · `structure:get-started/faq.md#000-126c876e` · https://github.com/feod-architecture/feod-docs/blob/f00eaf533cfee37f67e118c96291d535b0895a6f/docs/get-started/faq.md
>
> Цитаты:
> - [1] «в FEOD нет обязательного набора FSD-слоёв вроде `entities`, `features`, `widgets`;» — найдена во фрагменте 1
> - [2] «Если команда приходит из FSD, сначала сопоставьте текущие `entities`, `features` и `widgets` с будущими `modules`, а затем проверьте public API каждого модуля.» — найдена во фрагменте 2

**Память после хода.**

> ## Цель
>
> Перевести frontend-проект с FSD на FEOD.
>
> ## Уточнения
>
> - Проект на TypeScript.
> - Около 40 страниц.
> - Текущие слои FSD: app, pages, widgets, features, entities, shared.
>
> ## Ограничения и термины
>
> - FSD — текущая архитектура проекта.
> - FEOD — целевая архитектура проекта.
> - Deep imports в новом коде запрещены сразу, без исключений.

### s1 · ход 12

**Реплика.** Как на code review проверять, что наше ограничение соблюдается?

**Строка поиска:** Как на code review проверять соблюдение запрета deep imports в новом коде

| Фрагмент | Сходство | Файл | Разделы | chunk_id |
|---|---|---|---|---|
| 1 | 0.619 | `guides/code-review.md` | Code review checklist; Code review checklist › Когда использовать | `structure:guides/code-review.md#000-9bd7e726` |
| 2 | 0.612 | `reference/terms.md` | Термины › Deep import; Термины › Нормативные формулировки | `structure:reference/terms.md#005-6dc27d31` |
| 3 | 0.594 | `guides/where-to-place-code.md` | Где хранить код › Входные условия; Где хранить код › Шаги | `structure:guides/where-to-place-code.md#001-98101a72` |
| 4 | 0.593 | `core-concepts/dependency-rules.md` | Правила зависимостей › Правило global › Почему; Правила зависимостей › Правило для code review | `structure:core-concepts/dependency-rules.md#005-891d1375` |
| 5 | 0.592 | `reference/code-smells.md` | Code smells › Deep imports; Code smells › Deep imports › Симптом; Code smells › Deep imports › Почему проблема | `structure:reference/code-smells.md#001-1156e0c8` |

Время этапов, с: память 1.4, rewrite 1.1, поиск 0.1, ответ 2.5

> С учётом вашего ограничения — deep imports в новом коде запрещены сразу, без исключений — на review импортов задайте четыре вопроса: разрешает ли матрица импортов зависимость между этими уровнями, идёт ли импорт через public API целевой сущности, не является ли путь deep import-ом во внутренности, не пытается ли код импортировать `global` как прикладной контракт; если хотя бы на один вопрос ответ «нет», импорт нарушает FEOD [4]. Checklist применяйте к изменениям, которые затрагивают структуру `app`, `pages`, `modules`, `common`, `global` или меняют импорты между ними [1]. Симптом нарушения — импорт внутреннего файла или внутренней директории чужой FEOD-сущности, например `@/modules/order/ui/OrderCard` или `@/common/format/lib/formatMoney` [5]. Отдельно проверяйте `app`: он не должен делать deep import во внутренности модуля [3]. Термин для обсуждения — `deep import`, а не «прямой импорт», если смысл неоднозначен [2].
>
> Источники:
> - [4] `core-concepts/dependency-rules.md` › Правила зависимостей › Правило global › Почему; Правила зависимостей › Правило для code review · `structure:core-concepts/dependency-rules.md#005-891d1375` · https://github.com/feod-architecture/feod-docs/blob/f00eaf533cfee37f67e118c96291d535b0895a6f/docs/core-concepts/dependency-rules.md
> - [1] `guides/code-review.md` › Code review checklist; Code review checklist › Когда использовать · `structure:guides/code-review.md#000-9bd7e726` · https://github.com/feod-architecture/feod-docs/blob/f00eaf533cfee37f67e118c96291d535b0895a6f/docs/guides/code-review.md
> - [3] `guides/where-to-place-code.md` › Где хранить код › Входные условия; Где хранить код › Шаги · `structure:guides/where-to-place-code.md#001-98101a72` · https://github.com/feod-architecture/feod-docs/blob/f00eaf533cfee37f67e118c96291d535b0895a6f/docs/guides/where-to-place-code.md
>
> Цитаты:
> - [4] «Если хотя бы на один вопрос ответ "нет", импорт нарушает FEOD.» — найдена во фрагменте 4
> - [1] «Используйте checklist при review изменений, которые затрагивают структуру `app`, `pages`, `modules`, `common`, `global` или меняют импорты между ними.» — найдена во фрагменте 1
> - [3] «Нарушение: `app` не должен делать deep import во внутренности модуля.» — найдена во фрагменте 3

**Память после хода.**

> ## Цель
>
> Перевести frontend-проект с FSD на FEOD.
>
> ## Уточнения
>
> - Проект на TypeScript.
> - Около 40 страниц.
> - Текущие слои FSD: app, pages, widgets, features, entities, shared.
>
> ## Ограничения и термины
>
> - FSD — текущая архитектура проекта.
> - FEOD — целевая архитектура проекта.
> - Deep imports в новом коде запрещены сразу, без исключений.

### s1 · ход 13

**Реплика.** Составь итоговый план миграции из 5 шагов с учётом наших ограничений.

**Строка поиска:** итоговый план миграции из 5 шагов с FSD на FEOD с ограничением: deep imports в новом коде запрещены сразу, без исключений

| Фрагмент | Сходство | Файл | Разделы | chunk_id |
|---|---|---|---|---|
| 1 | 0.637 | `guides/migration-from-modular.md` | Миграция с обычной модульной архитектуры; Миграция с обычной модульной архитектуры › Когда использовать; Миграция с обычной модульной архитектуры › Входные условия | `structure:guides/migration-from-modular.md#000-636c8900` |
| 2 | 0.634 | `reference/terms.md` | Термины › Deep import; Термины › Нормативные формулировки | `structure:reference/terms.md#005-6dc27d31` |
| 3 | 0.629 | `guides/migration-from-fsd.md` | Миграция с FSD › Чеклист; Миграция с FSD › Типичные ошибки; Миграция с FSD › Связанные страницы | `structure:guides/migration-from-fsd.md#004-4f9fc3f4` |
| 4 | 0.626 | `guides/migration-from-fsd.md` | Миграция с FSD; Миграция с FSD › Когда использовать; Миграция с FSD › Входные условия | `structure:guides/migration-from-fsd.md#000-4693c314` |
| 5 | 0.621 | `reference/import-matrix.md` | Матрица импортов › Deep imports | `structure:reference/import-matrix.md#005-afa7012c` |

Время этапов, с: память 1.2, rewrite 0.9, поиск 0.1, ответ 3.4

> План из 5 шагов по фрагментам, с учётом ограничения памяти («deep imports в новом коде запрещены сразу, без исключений»).
>
> 1. Зафиксировать входные условия миграции: текущую FSD-структуру и список используемых слоёв, понимание того, какие `entities`, `features`, `widgets` — самостоятельные продуктовые области, и возможность постепенно вводить public API и менять импорты [4].
> 2. Сопоставить FSD с FEOD: `app` и `pages` перенести без смешения с бизнес-логикой, `shared` разобрать на `common`, `global` и продуктовые `modules`, а `entities`, `features`, `widgets` сгруппировать по ответственности в `modules` [3].
> 3. Обеспечить явный public API у каждого модуля: нельзя переписать структуру без обновления public API, иначе потребители продолжат зависеть от внутренних файлов [3].
> 4. Заменять deep imports поэтапно: обход public API указывает на внутренний файл или директорию и запрещён, допустим импорт из корня public API [5]. «Поэтапно» относится к легаси-коду; новое сразу пишется без исключений по вашему ограничению. Не сохранять FSD-слои внутри `modules`, иначе FEOD станет лишь внешним переименованием [3].
> 5. Технические проверки (lint) отложить до стабилизации структуры, чтобы не получать ошибки на переходных состояниях, а помощь [3]. FSD-термины оставить только в migration guide и README, не как основной язык FEOD [3]. Попутно: не считать `shared` автоматическим `common` — доменный код не должен попадать в общий уровень, и не переносить `widgets` в `pages`, если они нужны в нескольких сценариях [3].
>
> Для спорных мест на переходе можно временно оставить migration aliases или совместимые exports [1]. Верхние структурные зоны называйте `уровень`, а не «слой» как основной термин; канонический глобальный уровень — `global`, а не `globals` [2].
>
> Источники:
> - [3] `guides/migration-from-fsd.md` › Миграция с FSD › Чеклист; Миграция с FSD › Типичные ошибки; Миграция с FSD › Связанные страницы · `structure:guides/migration-from-fsd.md#004-4f9fc3f4` · https://github.com/feod-architecture/feod-docs/blob/f00eaf533cfee37f67e118c96291d535b0895a6f/docs/guides/migration-from-fsd.md
> - [4] `guides/migration-from-fsd.md` › Миграция с FSD; Миграция с FSD › Когда использовать; Миграция с FSD › Входные условия · `structure:guides/migration-from-fsd.md#000-4693c314` · https://github.com/feod-architecture/feod-docs/blob/f00eaf533cfee37f67e118c96291d535b0895a6f/docs/guides/migration-from-fsd.md
> - [5] `reference/import-matrix.md` › Матрица импортов › Deep imports · `structure:reference/import-matrix.md#005-afa7012c` · https://github.com/feod-architecture/feod-docs/blob/f00eaf533cfee37f67e118c96291d535b0895a6f/docs/reference/import-matrix.md
>
> Цитаты:
> - [3] «Переносить `widgets` в `pages`, хотя они используются в нескольких сценариях -> reusable product unit теряет владельца.» — найдена во фрагменте 3
> - [4] «Есть возможность вводить public API и менять импорты постепенно.» — найдена во фрагменте 4
> - [5] «Для линтера практическое правило такое: внешний импорт FEOD-сущности должен заканчиваться на корень её public API, а не на внутренний сегмент `ui`, `api`, `model`, `lib`, `config`, `types` или конкретный файл.» — найдена во фрагменте 5

**Память после хода.**

> ## Цель
>
> Перевести frontend-проект с FSD на FEOD.
>
> ## Уточнения
>
> - Проект на TypeScript.
> - Около 40 страниц.
> - Текущие слои FSD: app, pages, widgets, features, entities, shared.
>
> ## Ограничения и термины
>
> - FSD — текущая архитектура проекта.
> - FEOD — целевая архитектура проекта.
> - Deep imports в новом коде запрещены сразу, без исключений.

## s2. Проектирование модуля корзины

**Цель:** спроектировать модуль корзины cart по правилам FEOD. **Ключи цели:** корзин, FEOD. **Ключи памяти:** «public API» с хода 3; «global» с хода 6.

| Ход | Исход | Источники | Цитаты дословно | Цель сохранена | Ключи памяти | Строка поиска | мс |
|---|---|---|---|---|---|---|---|
| 1 | ответ | 3 из 3 | 3 из 3 | да | — | Проектирование нового модуля корзины cart для интернет-магазина по FEOD шаг за шагом | 5 154 |
| 2 | ответ | 1 из 1 | 0 из 1 | да | — | Из чего должен состоять минимальный контракт модуля корзины (cart) по FEOD, включая файл index.ts, public API и README модуля | 4 028 |
| 3 | ответ | 3 из 3 | 3 из 3 | да | 1 из 1 | public API модуля — только файл index.ts | 4 436 |
| 4 | ответ | 3 из 3 | 3 из 3 | да | 1 из 1 | Что модуль корзины должен экспортировать через index.ts наружу, а что оставить внутри модуля | 5 294 |
| 5 | ответ | 2 из 2 | 2 из 2 | да | 1 из 1 | Корзине нужны данные товара из модуля catalog: можно ли импортировать catalog напрямую? | 4 637 |
| 6 | ответ | 3 из 3 | 3 из 3 | да | 2 из 2 | Ограничение: общий код корзины и каталога не кладём в global | 4 459 |
| 7 | ответ | 3 из 3 | 3 из 3 | да | 2 из 2 | что можно хранить на уровне global | 4 759 |
| 8 | ответ | 3 из 3 | 3 из 3 | да | 2 из 2 | Куда положить общие типы цены и форматирование цены, если общий код корзины и каталога не кладём в global | 5 554 |
| 9 | ответ | 1 из 1 | 1 из 1 | да | 2 из 2 | Где хранить API-клиент для запросов корзины | 4 400 |
| 10 | ответ | 2 из 2 | 2 из 2 | да | 2 из 2 | по правилам именования FEOD как назвать модуль корзины и его публичные exports в index.ts | 4 377 |
| 11 | ответ | 3 из 3 | 3 из 3 | да | 2 из 2 | Как страницы будут импортировать модуль корзины, если public API — только файл index.ts модуля | 4 616 |
| 12 | ответ | 4 из 4 | 4 из 4 | да | 2 из 2 | структура модуля cart по FEOD с public API только в index.ts и явными экспортами без export * из внутренних директорий | 5 345 |

### s2 · ход 1

**Реплика.** Я проектирую новый модуль корзины (cart) для интернет-магазина по FEOD. Помоги шаг за шагом.

**Строка поиска:** Проектирование нового модуля корзины cart для интернет-магазина по FEOD шаг за шагом

| Фрагмент | Сходство | Файл | Разделы | chunk_id |
|---|---|---|---|---|
| 1 | 0.599 | `get-started/is-feod-for-my-project.md` | Подходит ли FEOD моему проекту › Good example; Подходит ли FEOD моему проекту › Bad example; Подходит ли FEOD моему проекту › Решение; Подходит ли FEOD моему проекту › Связанные страницы | `structure:get-started/is-feod-for-my-project.md#002-d41120c4` |
| 2 | 0.598 | `get-started/feod-in-5-minutes.md` | FEOD за 5 минут › 2. Начинайте с модуля; FEOD за 5 минут › 3. Не обходите public API | `structure:get-started/feod-in-5-minutes.md#001-89a659fb` |
| 3 | 0.583 | `get-started/overview.md` | FEOD: методология frontend-архитектуры › Куда идти дальше; FEOD: методология frontend-архитектуры › Связанные страницы | `structure:get-started/overview.md#005-2d3aeb5b` |
| 4 | 0.561 | `get-started/overview.md` | FEOD: методология frontend-архитектуры | `structure:get-started/overview.md#000-41b04377` |
| 5 | 0.556 | `reference/glossary.md` | Глоссарий › Термины | `structure:reference/glossary.md#002-98ffd897` |

Время этапов, с: память 1.1, rewrite 1.3, поиск 0.1, ответ 2.7

> Модуль — основная единица FEOD: он хранит продуктовую ответственность и открывает наружу только явный контракт [2]. Для корзины каркас задан так: `src/modules/cart/` с `ui/cart-summary.tsx`, `model/use-cart.ts` и `index.ts` [2]. В `index.ts` публикуйте public API, например `export { CartSummary } from './ui/cart-summary';` и `export { useCart } from './model/use-cart';` [2]. Внешний код должен использовать только `@/modules/cart`, а импорт из `@/modules/cart/ui/cart-summary` — нарушение, потому что внешний код зависит от внутреннего файла модуля [2]. В структуре проекта корзина соседствует с каталогом и оформлением заказа на уровне `modules`, чтобы эти области не смешивались [1]. Также полезно вести README модуля с ответственностью, потребителями, public API и ограничениями [5]. Для дальнейшего закрепления правил смотрите матрицу импортов и Public API [3].
>
> Источники:
> - [1] `get-started/is-feod-for-my-project.md` › Подходит ли FEOD моему проекту › Good example; Подходит ли FEOD моему проекту › Bad example; Подходит ли FEOD моему проекту › Решение; Подходит ли FEOD моему проекту › Связанные страницы · `structure:get-started/is-feod-for-my-project.md#002-d41120c4` · https://github.com/feod-architecture/feod-docs/blob/f00eaf533cfee37f67e118c96291d535b0895a6f/docs/get-started/is-feod-for-my-project.md
> - [2] `get-started/feod-in-5-minutes.md` › FEOD за 5 минут › 2. Начинайте с модуля; FEOD за 5 минут › 3. Не обходите public API · `structure:get-started/feod-in-5-minutes.md#001-89a659fb` · https://github.com/feod-architecture/feod-docs/blob/f00eaf533cfee37f67e118c96291d535b0895a6f/docs/get-started/feod-in-5-minutes.md
> - [5] `reference/glossary.md` › Глоссарий › Термины · `structure:reference/glossary.md#002-98ffd897` · https://github.com/feod-architecture/feod-docs/blob/f00eaf533cfee37f67e118c96291d535b0895a6f/docs/reference/glossary.md
>
> Цитаты:
> - [1] «Проект содержит несколько устойчивых сценариев. FEOD помогает не смешивать каталог, корзину и оформление заказа.» — найдена во фрагменте 1
> - [2] «Модуль - основная единица FEOD. Он хранит продуктовую ответственность и открывает наружу только явный контракт.» — найдена во фрагменте 2
> - [5] «README модуля | Документ внутри модуля, который описывает ответственность, потребителей, public API и ограничения.» — найдена во фрагменте 5

**Память после хода.**

> ## Цель
>
> Спроектировать новый модуль корзины (cart) для интернет-магазина по FEOD.
>
> ## Уточнения
>
> - Модуль корзины (cart) — новый.
> - Проектирование ведётся по FEOD.
>
> ## Ограничения и термины
>
> —

### s2 · ход 2

**Реплика.** Из чего должен состоять минимальный контракт модуля?

**Строка поиска:** Из чего должен состоять минимальный контракт модуля корзины (cart) по FEOD, включая файл index.ts, public API и README модуля

| Фрагмент | Сходство | Файл | Разделы | chunk_id |
|---|---|---|---|---|
| 1 | 0.706 | `get-started/feod-in-5-minutes.md` | FEOD за 5 минут › 2. Начинайте с модуля; FEOD за 5 минут › 3. Не обходите public API | `structure:get-started/feod-in-5-minutes.md#001-89a659fb` |
| 2 | 0.685 | `reference/module-contract.md` | Контракт модуля › Минимальный контракт | `structure:reference/module-contract.md#001-67181b9f` |
| 3 | 0.679 | `reference/module-contract.md` | Контракт модуля › Good example; Контракт модуля › Bad example; Контракт модуля › Исключения; Контракт модуля › Смежные правила | `structure:reference/module-contract.md#002-1eb9edcc` |
| 4 | 0.651 | `reference/public-api.md` | Public API › Подмодули и public API | `structure:reference/public-api.md#007-46b1cfa7` |
| 5 | 0.649 | `core-concepts/public-api.md` | Публичный API › Bad example; Публичный API › Частые ошибки; Публичный API › Исключения; Публичный API › Связанные страницы | `structure:core-concepts/public-api.md#002-efcd99f6` |

Время этапов, с: память 1.1, rewrite 1.0, поиск 0.1, ответ 1.9

> Минимальный контракт модуля состоит из пяти частей: название модуля, ответственность, public API, внутренние детали и ограничения зависимостей [1]. Название модуля фиксируется в имени директории в `modules` и показывает продуктовую область [1]. Ответственность фиксируется в README или коротком описании в review и ограничивает рост модуля [1]. Public API фиксируется в корневом `index.ts` и даёт поддерживаемую поверхность импорта [1]. Внутренние детали — директории `ui`, `model`, `api`, `lib` и другие — могут меняться без внешнего контракта, а ограничения зависимостей фиксируются в README, review checklist или FEOD config [1].
>
> Источники:
> - [1] `get-started/feod-in-5-minutes.md` › FEOD за 5 минут › 2. Начинайте с модуля; FEOD за 5 минут › 3. Не обходите public API · `structure:get-started/feod-in-5-minutes.md#001-89a659fb` · https://github.com/feod-architecture/feod-docs/blob/f00eaf533cfee37f67e118c96291d535b0895a6f/docs/get-started/feod-in-5-minutes.md
>
> Цитаты:
> - [1] «| Название модуля | имя директории в `modules` | Показывает продуктовую область |» — не найдена во фрагменте 1
>
> Замечания:
> - цитата [1] не найдена во фрагменте 1

**Память после хода.**

> ## Цель
>
> Спроектировать новый модуль корзины (cart) для интернет-магазина по FEOD.
>
> ## Уточнения
>
> - Модуль корзины (cart) — новый.
> - Проектирование ведётся по FEOD.
>
> ## Ограничения и термины
>
> —

Замечания к ответу: цитата [1] не найдена во фрагменте 1.

### s2 · ход 3

**Реплика.** Договоримся о термине: под public API будем понимать только файл index.ts модуля.

**Строка поиска:** public API модуля — только файл index.ts

| Фрагмент | Сходство | Файл | Разделы | chunk_id |
|---|---|---|---|---|
| 1 | 0.737 | `reference/public-api.md` | Public API › Роль index.ts | `structure:reference/public-api.md#002-72f338c0` |
| 2 | 0.727 | `reference/naming.md` | Правила именования › index.ts | `structure:reference/naming.md#003-597362e8` |
| 3 | 0.718 | `reference/code-smells.md` | Code smells › Over-nested submodules › Связанные правила; Code smells › Accidental public API; Code smells › Accidental public API › Симптом; Code smells › Accidental public API › Почему проблема | `structure:reference/code-smells.md#010-1071d3ca` |
| 4 | 0.718 | `reference/code-smells.md` | Code smells › Module internals leaking › Как исправить; Code smells › Module internals leaking › Связанные правила | `structure:reference/code-smells.md#004-b54e699e` |
| 5 | 0.692 | `reference/public-api.md` | Public API › Что экспортировать | `structure:reference/public-api.md#003-4f2f9e82` |

Время этапов, с: память 1.3, rewrite 1.1, поиск 0.0, ответ 2.0

> Да, договоримся: под public API понимаем только файл `index.ts` модуля. Это согласуется с документацией: файл `index.ts` в корне модуля является точкой public API модуля [1]. Корневой `index.ts` модуля содержит только явные публичные exports [2]. Внешний код импортирует модуль из корня модуля, а не из его внутренних файлов [1]. Из `index.ts` экспортируются только стабильные элементы внешнего контракта [5]. При этом `index.ts` не обязан экспортировать всё, что есть внутри модуля: его задача — оставить публичным только поддерживаемый контракт и скрыть детали реализации [1]. Также важно, что отсутствие символа в `index.ts` означает, что внешний код не должен импортировать этот символ [2].
>
> Источники:
> - [1] `reference/public-api.md` › Public API › Роль index.ts · `structure:reference/public-api.md#002-72f338c0` · https://github.com/feod-architecture/feod-docs/blob/f00eaf533cfee37f67e118c96291d535b0895a6f/docs/reference/public-api.md
> - [2] `reference/naming.md` › Правила именования › index.ts · `structure:reference/naming.md#003-597362e8` · https://github.com/feod-architecture/feod-docs/blob/f00eaf533cfee37f67e118c96291d535b0895a6f/docs/reference/naming.md
> - [5] `reference/public-api.md` › Public API › Что экспортировать · `structure:reference/public-api.md#003-4f2f9e82` · https://github.com/feod-architecture/feod-docs/blob/f00eaf533cfee37f67e118c96291d535b0895a6f/docs/reference/public-api.md
>
> Цитаты:
> - [1] «Файл `index.ts` в корне модуля является точкой public API модуля.» — найдена во фрагменте 1
> - [2] «`index.ts` в корне FEOD-сущности обозначает её public API.» — найдена во фрагменте 2
> - [5] «Из `index.ts` экспортируются только стабильные элементы внешнего контракта.» — найдена во фрагменте 5

**Память после хода.**

> ## Цель
>
> Спроектировать новый модуль корзины (cart) для интернет-магазина по FEOD.
>
> ## Уточнения
>
> - Модуль корзины (cart) — новый.
> - Проектирование ведётся по FEOD.
>
> ## Ограничения и термины
>
> - Под public API понимаем только файл index.ts модуля.

### s2 · ход 4

**Реплика.** Что модуль корзины должен экспортировать наружу, а что оставить внутри?

**Строка поиска:** Что модуль корзины должен экспортировать через index.ts наружу, а что оставить внутри модуля

| Фрагмент | Сходство | Файл | Разделы | chunk_id |
|---|---|---|---|---|
| 1 | 0.714 | `reference/public-api.md` | Public API › Что экспортировать | `structure:reference/public-api.md#003-4f2f9e82` |
| 2 | 0.686 | `reference/public-api.md` | Public API › Роль index.ts | `structure:reference/public-api.md#002-72f338c0` |
| 3 | 0.672 | `reference/naming.md` | Правила именования › index.ts | `structure:reference/naming.md#003-597362e8` |
| 4 | 0.655 | `guides/design-module.md` | Как проектировать модуль › Шаги | `structure:guides/design-module.md#003-f871c9a6` |
| 5 | 0.651 | `guides/split-large-module.md` | Как разбивать большой модуль › Шаги | `structure:guides/split-large-module.md#002-56fb0181` |

Время этапов, с: память 1.3, rewrite 1.1, поиск 0.1, ответ 2.8

> С учётом нашего ограничения — под public API понимаем только файл `index.ts` модуля — из `index.ts` корзины экспортируйте только стабильные элементы внешнего контракта [1]. Допустимо экспортировать компоненты и функции, реально нужные потребителям, типы публичных props, параметров, результатов и событий, публичные hooks как официальный способ работы с модулем, а также минимальные domain-specific constants, без которых потребитель не сможет корректно использовать модуль [1]. То, что вы не готовы поддерживать как внешний контракт, остаётся внутри: `index.ts` не обязан экспортировать всё, что есть внутри модуля, его задача — оставить публичным только поддерживаемый контракт и скрыть детали реализации [2]. Внутренние `ui`, `model`, `api`, `lib`, `config`, `types` — это роли для раскладки внутренностей, а не обязательные к публикации части, и они не должны копироваться механически [4]. Не используйте `export *` из внутренних директорий: это превращает внутреннюю структуру в неявный контракт и выпускает наружу лишние детали [4]. Отсутствие символа в `index.ts` означает, что внешний код не должен импортировать этот символ [3].
>
> Источники:
> - [1] `reference/public-api.md` › Public API › Что экспортировать · `structure:reference/public-api.md#003-4f2f9e82` · https://github.com/feod-architecture/feod-docs/blob/f00eaf533cfee37f67e118c96291d535b0895a6f/docs/reference/public-api.md
> - [2] `reference/public-api.md` › Public API › Роль index.ts · `structure:reference/public-api.md#002-72f338c0` · https://github.com/feod-architecture/feod-docs/blob/f00eaf533cfee37f67e118c96291d535b0895a6f/docs/reference/public-api.md
> - [4] `guides/design-module.md` › Как проектировать модуль › Шаги · `structure:guides/design-module.md#003-f871c9a6` · https://github.com/feod-architecture/feod-docs/blob/f00eaf533cfee37f67e118c96291d535b0895a6f/docs/guides/design-module.md
>
> Цитаты:
> - [1] «Из `index.ts` экспортируются только стабильные элементы внешнего контракта.» — найдена во фрагменте 1
> - [2] «`index.ts` не обязан экспортировать всё, что есть внутри модуля. Его задача обратная: оставить публичным только поддерживаемый контракт и скрыть детали реализации.» — найдена во фрагменте 2
> - [4] «Нарушение: `export *` превращает внутреннюю структуру в неявный контракт и выпускает наружу лишние детали.» — найдена во фрагменте 4

**Память после хода.**

> ## Цель
>
> Спроектировать новый модуль корзины (cart) для интернет-магазина по FEOD.
>
> ## Уточнения
>
> - Модуль корзины (cart) — новый.
> - Проектирование ведётся по FEOD.
>
> ## Ограничения и термины
>
> - Под public API понимаем только файл index.ts модуля.

### s2 · ход 5

**Реплика.** Корзине нужны данные товара из модуля catalog. Можно ли импортировать его напрямую?

**Строка поиска:** Корзине нужны данные товара из модуля catalog: можно ли импортировать catalog напрямую?

| Фрагмент | Сходство | Файл | Разделы | chunk_id |
|---|---|---|---|---|
| 1 | 0.604 | `core-concepts/levels.md` | Уровни › Уровень pages › Что может импортировать; Уровни › Уровень pages › Что нельзя хранить; Уровни › Уровень pages › Good example | `structure:core-concepts/levels.md#005-4270107b` |
| 2 | 0.581 | `core-concepts/dependency-rules.md` | Правила зависимостей › Good example; Правила зависимостей › Bad example | `structure:core-concepts/dependency-rules.md#006-866221ec` |
| 3 | 0.574 | `structure/modules.md` | Modules › Взаимодействие модулей | `structure:structure/modules.md#006-afe37b04` |
| 4 | 0.565 | `reference/import-matrix.md` | Матрица импортов › Что может импортировать код на уровне | `structure:reference/import-matrix.md#001-4c12c71d` |
| 5 | 0.560 | `guides/migration-from-modular.md` | Миграция с обычной модульной архитектуры › Bad example; Миграция с обычной модульной архитектуры › Чеклист | `structure:guides/migration-from-modular.md#003-149e1f55` |

Время этапов, с: память 1.0, rewrite 1.0, поиск 0.1, ответ 2.6

> Да, корзина может импортировать данные товара из модуля catalog, но только через его public API [3]. Модули могут импортировать другие модули лишь через их public API, и направление зависимости задаёт матрица импортов, а не «важность» модуля [3]. С учётом нашего ограничения — под public API понимаем только файл `index.ts` модуля — импорт должен идти из `@/modules/catalog`, а не во внутренности вроде `@/modules/catalog/model/...` [3]. Матрица импортов для уровня `modules` разрешает `common`, public API других модулей и public API собственных подмодулей [4]. Запрещены `app`, `pages`, `global`, внутренности чужих модулей и deep imports [4]. Например, корректно `import { getViewer } from "@/modules/viewer";`, а `import { getViewer } from "@/modules/viewer/model/getViewer";` — нарушение [3].
>
> Источники:
> - [3] `structure/modules.md` › Modules › Взаимодействие модулей · `structure:structure/modules.md#006-afe37b04` · https://github.com/feod-architecture/feod-docs/blob/f00eaf533cfee37f67e118c96291d535b0895a6f/docs/structure/modules.md
> - [4] `reference/import-matrix.md` › Матрица импортов › Что может импортировать код на уровне · `structure:reference/import-matrix.md#001-4c12c71d` · https://github.com/feod-architecture/feod-docs/blob/f00eaf533cfee37f67e118c96291d535b0895a6f/docs/reference/import-matrix.md
>
> Цитаты:
> - [3] «Модули могут импортировать другие модули только через их public API.» — найдена во фрагменте 3
> - [4] «| `modules` | `common`, public API других модулей, public API собственных подмодулей | `app`, `pages`, `global`, внутренности чужих модулей, deep imports |» — найдена во фрагменте 4

**Память после хода.**

> ## Цель
>
> Спроектировать новый модуль корзины (cart) для интернет-магазина по FEOD.
>
> ## Уточнения
>
> - Модуль корзины (cart) — новый.
> - Проектирование ведётся по FEOD.
> - Корзине нужны данные товара из модуля catalog.
>
> ## Ограничения и термины
>
> - Под public API понимаем только файл index.ts модуля.

### s2 · ход 6

**Реплика.** Ограничение: общий код корзины и каталога мы не кладём в global.

**Строка поиска:** Ограничение: общий код корзины и каталога не кладём в global

| Фрагмент | Сходство | Файл | Разделы | chunk_id |
|---|---|---|---|---|
| 1 | 0.664 | `core-concepts/levels.md` | Уровни › Уровень global › Что нельзя хранить; Уровни › Уровень global › Good example; Уровни › Уровень global › Bad example | `structure:core-concepts/levels.md#013-d1e3079d` |
| 2 | 0.622 | `reference/import-matrix.md` | Матрица импортов › global не импортируется напрямую | `structure:reference/import-matrix.md#006-4e1c6978` |
| 3 | 0.613 | `structure/global.md` | Global › Правило; Global › Почему | `structure:structure/global.md#001-5d719f07` |
| 4 | 0.597 | `structure/global.md` | Global; Global › Короткое определение; Global › Какую проблему решает | `structure:structure/global.md#000-831dd514` |
| 5 | 0.595 | `core-concepts/levels.md` | Уровни › Уровень pages › Что может импортировать; Уровни › Уровень pages › Что нельзя хранить; Уровни › Уровень pages › Good example | `structure:core-concepts/levels.md#005-4270107b` |

Время этапов, с: память 1.1, rewrite 1.1, поиск 0.0, ответ 2.2

> С учётом нашего ограничения — общий код корзины и каталога не кладём в `global` — это согласуется с документацией: в `global` нельзя хранить обычные прикладные helpers и продуктовые сценарии, UI и бизнес-логику [1]. `global` — редкий и опасный уровень, он не должен содержать бизнес-логику, UI, helpers, скрытый общий каталог и любые импортируемые сущности [3]. В `global` разрешены только `.d.ts`, shims, polyfills, глобальные расширения типов и side-effect imports [3]. Прикладной код не импортирует `global` как зависимость, и подключение глобальных эффектов идёт через инфраструктурную точку входа [2]. `global` не является обычным прикладным уровнем и не должен использоваться как место для импортируемого общего кода [4].
>
> Источники:
> - [1] `core-concepts/levels.md` › Уровни › Уровень global › Что нельзя хранить; Уровни › Уровень global › Good example; Уровни › Уровень global › Bad example · `structure:core-concepts/levels.md#013-d1e3079d` · https://github.com/feod-architecture/feod-docs/blob/f00eaf533cfee37f67e118c96291d535b0895a6f/docs/core-concepts/levels.md
> - [2] `reference/import-matrix.md` › Матрица импортов › global не импортируется напрямую · `structure:reference/import-matrix.md#006-4e1c6978` · https://github.com/feod-architecture/feod-docs/blob/f00eaf533cfee37f67e118c96291d535b0895a6f/docs/reference/import-matrix.md
> - [3] `structure/global.md` › Global › Правило; Global › Почему · `structure:structure/global.md#001-5d719f07` · https://github.com/feod-architecture/feod-docs/blob/f00eaf533cfee37f67e118c96291d535b0895a6f/docs/structure/global.md
>
> Цитаты:
> - [1] «В `global` нельзя хранить:» — найдена во фрагменте 1
> - [2] «Прикладной код не импортирует `global` как зависимость:» — найдена во фрагменте 2
> - [3] «`global` - редкий и опасный уровень. Он не должен содержать бизнес-логику, UI, helpers, скрытый общий каталог и любые импортируемые сущности.» — найдена во фрагменте 3

**Память после хода.**

> ## Цель
>
> Спроектировать новый модуль корзины (cart) для интернет-магазина по FEOD.
>
> ## Уточнения
>
> - Модуль корзины (cart) — новый.
> - Проектирование ведётся по FEOD.
> - Корзине нужны данные товара из модуля catalog.
>
> ## Ограничения и термины
>
> - Под public API понимаем только файл index.ts модуля.
> - Общий код корзины и каталога не кладём в global.

### s2 · ход 7

**Реплика.** Тогда что вообще можно хранить на уровне global?

**Строка поиска:** что можно хранить на уровне global

| Фрагмент | Сходство | Файл | Разделы | chunk_id |
|---|---|---|---|---|
| 1 | 0.689 | `core-concepts/levels.md` | Уровни › Уровень global › Что нельзя хранить; Уровни › Уровень global › Good example; Уровни › Уровень global › Bad example | `structure:core-concepts/levels.md#013-d1e3079d` |
| 2 | 0.682 | `structure/global.md` | Global › Правило; Global › Почему | `structure:structure/global.md#001-5d719f07` |
| 3 | 0.665 | `core-concepts/levels.md` | Уровни › Уровень global; Уровни › Уровень global › Назначение; Уровни › Уровень global › Кто может импортировать; Уровни › Уровень global › Что может импортировать | `structure:core-concepts/levels.md#012-ae9f98df` |
| 4 | 0.632 | `structure/global.md` | Global › Что обычно лежит в global; Global › Что не должно лежать в global | `structure:structure/global.md#002-28f08b4c` |
| 5 | 0.622 | `reference/import-matrix.md` | Матрица импортов › global не импортируется напрямую | `structure:reference/import-matrix.md#006-4e1c6978` |

Время этапов, с: память 0.9, rewrite 0.9, поиск 0.1, ответ 2.9

> С учётом нашего ограничения — общий код корзины и каталога в `global` не кладём — на уровне `global` хранится только инфраструктура глобального действия: `.d.ts`, shims, polyfills, глобальные расширения типов и side-effect imports [2]. Обычно это декларации окружения вроде `env.d.ts` и `vite-env.d.ts`, shims для платформы или тестовой среды, polyfills до запуска приложения, `declare global` и другие расширения глобальных типов, а также side-effect imports глобальных стилей или runtime setup, если они подключаются через entrypoint или конфигурацию [4]. При этом в `global` нельзя хранить обычные прикладные helpers, публичный API для модулей и страниц, код, зависящий от `app`, `pages`, `modules` или `common`, а также продуктовые сценарии, UI и бизнес-логику [1]. Сюда же не должны попадать компоненты, helpers и composables, продуктовые константы, типы и модели, API-клиенты, stores и сценарная логика [4]. Если сущность должны импортировать из `app`, `pages`, `modules` или `common`, ей не место в `global` [4]. `global` — редкий и опасный уровень, он должен быть маленьким, явным и подключаться только через инфраструктурную точку входа, а не через обычные импорты из продуктового кода [2].
>
> Источники:
> - [1] `core-concepts/levels.md` › Уровни › Уровень global › Что нельзя хранить; Уровни › Уровень global › Good example; Уровни › Уровень global › Bad example · `structure:core-concepts/levels.md#013-d1e3079d` · https://github.com/feod-architecture/feod-docs/blob/f00eaf533cfee37f67e118c96291d535b0895a6f/docs/core-concepts/levels.md
> - [2] `structure/global.md` › Global › Правило; Global › Почему · `structure:structure/global.md#001-5d719f07` · https://github.com/feod-architecture/feod-docs/blob/f00eaf533cfee37f67e118c96291d535b0895a6f/docs/structure/global.md
> - [4] `structure/global.md` › Global › Что обычно лежит в global; Global › Что не должно лежать в global · `structure:structure/global.md#002-28f08b4c` · https://github.com/feod-architecture/feod-docs/blob/f00eaf533cfee37f67e118c96291d535b0895a6f/docs/structure/global.md
>
> Цитаты:
> - [1] «В `global` нельзя хранить:» — найдена во фрагменте 1
> - [2] «`global` - редкий и опасный уровень. Он не должен содержать бизнес-логику, UI, helpers, скрытый общий каталог и любые импортируемые сущности.» — найдена во фрагменте 2
> - [4] «Если сущность должна импортироваться из `app`, `pages`, `modules` или `common`, ей не место в `global`.» — найдена во фрагменте 4

**Память после хода.**

> ## Цель
>
> Спроектировать новый модуль корзины (cart) для интернет-магазина по FEOD.
>
> ## Уточнения
>
> - Модуль корзины (cart) — новый.
> - Проектирование ведётся по FEOD.
> - Корзине нужны данные товара из модуля catalog.
>
> ## Ограничения и термины
>
> - Под public API понимаем только файл index.ts модуля.
> - Общий код корзины и каталога не кладём в global.

### s2 · ход 8

**Реплика.** А куда положить общие типы цены и форматирование цены?

**Строка поиска:** Куда положить общие типы цены и форматирование цены, если общий код корзины и каталога не кладём в global

| Фрагмент | Сходство | Файл | Разделы | chunk_id |
|---|---|---|---|---|
| 1 | 0.591 | `guides/where-to-place-code.md` | Где хранить код; Где хранить код › Когда использовать | `structure:guides/where-to-place-code.md#000-72573b7e` |
| 2 | 0.580 | `core-concepts/levels.md` | Уровни › Уровень global › Что нельзя хранить; Уровни › Уровень global › Good example; Уровни › Уровень global › Bad example | `structure:core-concepts/levels.md#013-d1e3079d` |
| 3 | 0.575 | `reference/code-smells.md` | Code smells › common as dumping ground › Как исправить; Code smells › common as dumping ground › Связанные правила; Code smells › Business logic in pages, app, common or global | `structure:reference/code-smells.md#006-09b4ee0c` |
| 4 | 0.561 | `structure/global.md` | Global › Что обычно лежит в global; Global › Что не должно лежать в global | `structure:structure/global.md#002-28f08b4c` |
| 5 | 0.555 | `structure/common.md` | Common › Что обычно лежит в common; Common › Что не должно лежать в common | `structure:structure/common.md#002-757b2484` |

Время этапов, с: память 1.3, rewrite 1.2, поиск 0.1, ответ 3.0

> Общие типы цены и форматирование цены зависят от доменного смысла: в `common` обычно лежат форматтеры чисел и строк без доменного смысла, а также общие типы UI или инфраструктуры [5]. Если форматирование цены — нейтральный технический форматтер, понятный без знания продукта, и общий тип не относится к конкретному продукту, их место в `common` [3]. Но если тип цены или форматирование описывает правила предметной области, это уже не `common`: в `common` не должно быть правил предметной области и сущностей, относящихся к конкретному продукту [5]. Тогда общий код должен жить в модуле-владельце или в самостоятельном сквозном модуле [3]. С учётом нашего ограничения — общий код корзины и каталога не кладём в `global` — в `global` это размещать нельзя: в `global` не должно быть helpers, utilities и composables, которые можно импортировать по месту, продуктовых констант, типов и моделей, а также файлов, которые другие уровни импортируют как обычную зависимость [4]. При выборе уровня начинайте с ответственности кода, а не с удобной папки [1].
>
> Источники:
> - [3] `reference/code-smells.md` › Code smells › common as dumping ground › Как исправить; Code smells › common as dumping ground › Связанные правила; Code smells › Business logic in pages, app, common or global · `structure:reference/code-smells.md#006-09b4ee0c` · https://github.com/feod-architecture/feod-docs/blob/f00eaf533cfee37f67e118c96291d535b0895a6f/docs/reference/code-smells.md
> - [4] `structure/global.md` › Global › Что обычно лежит в global; Global › Что не должно лежать в global · `structure:structure/global.md#002-28f08b4c` · https://github.com/feod-architecture/feod-docs/blob/f00eaf533cfee37f67e118c96291d535b0895a6f/docs/structure/global.md
> - [5] `structure/common.md` › Common › Что обычно лежит в common; Common › Что не должно лежать в common · `structure:structure/common.md#002-757b2484` · https://github.com/feod-architecture/feod-docs/blob/f00eaf533cfee37f67e118c96291d535b0895a6f/docs/structure/common.md
>
> Цитаты:
> - [3] «Оставляйте в `common` только нейтральные технические сущности, которые понятны без знания продукта.» — найдена во фрагменте 3
> - [4] «Если сущность должна импортироваться из `app`, `pages`, `modules` или `common`, ей не место в `global`.» — найдена во фрагменте 4
> - [5] «Если сущность нужна одному модулю или описывает один продуктовый сценарий, её место в `modules`, а не в `common`.» — найдена во фрагменте 5

**Память после хода.**

> ## Цель
>
> Спроектировать новый модуль корзины (cart) для интернет-магазина по FEOD.
>
> ## Уточнения
>
> - Модуль корзины (cart) — новый.
> - Проектирование ведётся по FEOD.
> - Корзине нужны данные товара из модуля catalog.
>
> ## Ограничения и термины
>
> - Под public API понимаем только файл index.ts модуля.
> - Общий код корзины и каталога не кладём в global.

### s2 · ход 9

**Реплика.** Где хранить API-клиент для запросов корзины?

**Строка поиска:** Где хранить API-клиент для запросов корзины

| Фрагмент | Сходство | Файл | Разделы | chunk_id |
|---|---|---|---|---|
| 1 | 0.634 | `get-started/faq.md` | FAQ › Где хранить API-клиент?; FAQ › Нужно ли всегда писать README модуля? | `structure:get-started/faq.md#003-6f83be8d` |

Время этапов, с: память 1.5, rewrite 1.0, поиск 0.1, ответ 1.8

> Корзина — это продуктовая область, поэтому API-клиент для её запросов обычно живёт внутри модуля корзины [1]. Нейтральная HTTP-обёртка без доменных знаний может жить в `common` [1]. С учётом нашего ограничения — общий код корзины и каталога не кладём в `global` — это дополнительно подтверждается тем, что `global` не предназначен для helpers и файлов, которые другие уровни импортируют как обычную зависимость.
>
> Источники:
> - [1] `get-started/faq.md` › FAQ › Где хранить API-клиент?; FAQ › Нужно ли всегда писать README модуля? · `structure:get-started/faq.md#003-6f83be8d` · https://github.com/feod-architecture/feod-docs/blob/f00eaf533cfee37f67e118c96291d535b0895a6f/docs/get-started/faq.md
>
> Цитаты:
> - [1] «API-клиент конкретной продуктовой области обычно живёт внутри соответствующего модуля. Нейтральная HTTP-обёртка без доменных знаний может жить в `common`.» — найдена во фрагменте 1

**Память после хода.**

> ## Цель
>
> Спроектировать новый модуль корзины (cart) для интернет-магазина по FEOD.
>
> ## Уточнения
>
> - Модуль корзины (cart) — новый.
> - Проектирование ведётся по FEOD.
> - Корзине нужны данные товара из модуля catalog.
>
> ## Ограничения и термины
>
> - Под public API понимаем только файл index.ts модуля.
> - Общий код корзины и каталога не кладём в global.

### s2 · ход 10

**Реплика.** Как по правилам именования FEOD назвать модуль корзины и его публичные exports?

**Строка поиска:** по правилам именования FEOD как назвать модуль корзины и его публичные exports в index.ts

| Фрагмент | Сходство | Файл | Разделы | chunk_id |
|---|---|---|---|---|
| 1 | 0.714 | `reference/naming.md` | Правила именования › index.ts | `structure:reference/naming.md#003-597362e8` |
| 2 | 0.679 | `get-started/feod-in-5-minutes.md` | FEOD за 5 минут › 2. Начинайте с модуля; FEOD за 5 минут › 3. Не обходите public API | `structure:get-started/feod-in-5-minutes.md#001-89a659fb` |
| 3 | 0.638 | `reference/public-api.md` | Public API | `structure:reference/public-api.md#000-9492fcf3` |
| 4 | 0.634 | `core-concepts/fractality.md` | Фрактальность › Good example | `structure:core-concepts/fractality.md#003-989c39d3` |
| 5 | 0.633 | `core-concepts/public-api.md` | Публичный API › Bad example; Публичный API › Частые ошибки; Публичный API › Исключения; Публичный API › Связанные страницы | `structure:core-concepts/public-api.md#002-efcd99f6` |

Время этапов, с: память 1.1, rewrite 1.1, поиск 0.1, ответ 2.2

> По правилам именования корневой `index.ts` модуля cart обозначает его public API и содержит только явные публичные exports [1]. Внешний код импортирует чужую FEOD-сущность из её корня, то есть корзину — из `@/modules/cart` [1]. С учётом нашего ограничения — под public API понимаем только файл `index.ts` модуля. В модуле cart не должно быть `export *` из внутренних директорий: это некорректно по правилам `index.ts` [1]. Отсутствие символа в `index.ts` означает, что внешний код не должен импортировать этот символ [1]. Внутренний `index.ts` подмодуля служит для локальной организации, но не становится внешним public API автоматически [1]. Документация показывает для модуля `cart` экспорт компонента и хука через явные именованные exports: `export { CartSummary } ...` и `export { useCart } ...` [2].
>
> Источники:
> - [1] `reference/naming.md` › Правила именования › index.ts · `structure:reference/naming.md#003-597362e8` · https://github.com/feod-architecture/feod-docs/blob/f00eaf533cfee37f67e118c96291d535b0895a6f/docs/reference/naming.md
> - [2] `get-started/feod-in-5-minutes.md` › FEOD за 5 минут › 2. Начинайте с модуля; FEOD за 5 минут › 3. Не обходите public API · `structure:get-started/feod-in-5-minutes.md#001-89a659fb` · https://github.com/feod-architecture/feod-docs/blob/f00eaf533cfee37f67e118c96291d535b0895a6f/docs/get-started/feod-in-5-minutes.md
>
> Цитаты:
> - [1] «корневой `index.ts` модуля или сущности `common` содержит только явные публичные exports;» — найдена во фрагменте 1
> - [2] «export { CartSummary } from './ui/cart-summary';» — найдена во фрагменте 2

**Память после хода.**

> ## Цель
>
> Спроектировать новый модуль корзины (cart) для интернет-магазина по FEOD.
>
> ## Уточнения
>
> - Модуль корзины (cart) — новый.
> - Проектирование ведётся по FEOD.
> - Корзине нужны данные товара из модуля catalog.
>
> ## Ограничения и термины
>
> - Под public API понимаем только файл index.ts модуля.
> - Общий код корзины и каталога не кладём в global.

### s2 · ход 11

**Реплика.** Как страницы будут импортировать корзину с учётом нашего термина?

**Строка поиска:** Как страницы будут импортировать модуль корзины, если public API — только файл index.ts модуля

| Фрагмент | Сходство | Файл | Разделы | chunk_id |
|---|---|---|---|---|
| 1 | 0.683 | `reference/public-api.md` | Public API › Роль index.ts | `structure:reference/public-api.md#002-72f338c0` |
| 2 | 0.678 | `reference/naming.md` | Правила именования › index.ts | `structure:reference/naming.md#003-597362e8` |
| 3 | 0.653 | `reference/code-smells.md` | Code smells › Accidental public API › Как исправить; Code smells › Accidental public API › Связанные правила; Code smells › Page as reusable source; Code smells › Page as reusable source › Симптом | `structure:reference/code-smells.md#011-e8b0e65e` |
| 4 | 0.651 | `get-started/quick-start.md` | Быстрый старт › Пример страницы; Быстрый старт › Пример модуля | `structure:get-started/quick-start.md#001-86869f97` |
| 5 | 0.649 | `reference/public-api.md` | Public API › Что экспортировать | `structure:reference/public-api.md#003-4f2f9e82` |

Время этапов, с: память 1.4, rewrite 0.9, поиск 0.1, ответ 2.2

> С учётом нашего термина — под public API понимаем только файл `index.ts` модуля — страницы импортируют корзину из корня модуля, то есть из `@/modules/cart` [1]. Внешний код импортирует модуль из корня модуля, и это нормативное правило [1]. Импорт из внутренних файлов, например `@/modules/cart/ui/...`, некорректен [1]. `index.ts` при этом не обязан экспортировать всё содержимое модуля: его задача — оставить публичным только поддерживаемый контракт и скрыть детали реализации [1]. В примере страницы страница зависит от модуля именно через его public API, а не от внутренних файлов [4]. Экспорты в корневом `index.ts` перечисляются явно [2].
>
> Источники:
> - [1] `reference/public-api.md` › Public API › Роль index.ts · `structure:reference/public-api.md#002-72f338c0` · https://github.com/feod-architecture/feod-docs/blob/f00eaf533cfee37f67e118c96291d535b0895a6f/docs/reference/public-api.md
> - [2] `reference/naming.md` › Правила именования › index.ts · `structure:reference/naming.md#003-597362e8` · https://github.com/feod-architecture/feod-docs/blob/f00eaf533cfee37f67e118c96291d535b0895a6f/docs/reference/naming.md
> - [4] `get-started/quick-start.md` › Быстрый старт › Пример страницы; Быстрый старт › Пример модуля · `structure:get-started/quick-start.md#001-86869f97` · https://github.com/feod-architecture/feod-docs/blob/f00eaf533cfee37f67e118c96291d535b0895a6f/docs/get-started/quick-start.md
>
> Цитаты:
> - [1] «Внешний код импортирует модуль из корня модуля.» — найдена во фрагменте 1
> - [2] «корневой `index.ts` модуля или сущности `common` содержит только явные публичные exports;» — найдена во фрагменте 2
> - [4] «Страница зависит от модуля через его `public API`, а не от внутренних файлов.» — найдена во фрагменте 4

**Память после хода.**

> ## Цель
>
> Спроектировать новый модуль корзины (cart) для интернет-магазина по FEOD.
>
> ## Уточнения
>
> - Модуль корзины (cart) — новый.
> - Проектирование ведётся по FEOD.
> - Корзине нужны данные товара из модуля catalog.
>
> ## Ограничения и термины
>
> - Под public API понимаем только файл index.ts модуля.
> - Общий код корзины и каталога не кладём в global.

### s2 · ход 12

**Реплика.** Подведи итог: структура модуля cart с учётом всех наших договорённостей.

**Строка поиска:** структура модуля cart по FEOD с public API только в index.ts и явными экспортами без export * из внутренних директорий

| Фрагмент | Сходство | Файл | Разделы | chunk_id |
|---|---|---|---|---|
| 1 | 0.769 | `get-started/feod-in-5-minutes.md` | FEOD за 5 минут › 2. Начинайте с модуля; FEOD за 5 минут › 3. Не обходите public API | `structure:get-started/feod-in-5-minutes.md#001-89a659fb` |
| 2 | 0.750 | `reference/naming.md` | Правила именования › index.ts | `structure:reference/naming.md#003-597362e8` |
| 3 | 0.704 | `core-concepts/public-api.md` | Публичный API › Bad example; Публичный API › Частые ошибки; Публичный API › Исключения; Публичный API › Связанные страницы | `structure:core-concepts/public-api.md#002-efcd99f6` |
| 4 | 0.690 | `reference/public-api.md` | Public API | `structure:reference/public-api.md#000-9492fcf3` |
| 5 | 0.668 | `guides/design-module.md` | Как проектировать модуль › Шаги | `structure:guides/design-module.md#003-f871c9a6` |

Время этапов, с: память 1.3, rewrite 1.3, поиск 0.1, ответ 2.7

> Модуль `cart` — новый, по FEOD начинаем с модуля: он хранит продуктовую ответственность и открывает наружу только явный контракт [1]. Внутри модуля допустимы папки по роли: `ui`, `model`, `api`, `lib`, `config`, `types` и другие, если они помогают держать одну ответственность, и они не обязательны [5]. Пример структуры `cart` из документации: `ui/cart-summary.tsx`, `model/use-cart.ts`, `index.ts` [1]. С учётом нашего термина — под public API понимаем только файл `index.ts` модуля: корневой `index.ts` содержит только явные публичные exports [2], без `export *` из внутренних директорий [2], а внешний код использует только `@/modules/cart` [1]. С учётом нашего ограничения — общий код корзины и каталога не кладём в `global` — данные товара из модуля `catalog` используются как внешняя FEOD-сущность: внешний код импортирует её из корня. Внутри модуля файлы могут импортировать друг друга напрямую, если это не выходит за границу модуля [3].
>
> Источники:
> - [1] `get-started/feod-in-5-minutes.md` › FEOD за 5 минут › 2. Начинайте с модуля; FEOD за 5 минут › 3. Не обходите public API · `structure:get-started/feod-in-5-minutes.md#001-89a659fb` · https://github.com/feod-architecture/feod-docs/blob/f00eaf533cfee37f67e118c96291d535b0895a6f/docs/get-started/feod-in-5-minutes.md
> - [2] `reference/naming.md` › Правила именования › index.ts · `structure:reference/naming.md#003-597362e8` · https://github.com/feod-architecture/feod-docs/blob/f00eaf533cfee37f67e118c96291d535b0895a6f/docs/reference/naming.md
> - [3] `core-concepts/public-api.md` › Публичный API › Bad example; Публичный API › Частые ошибки; Публичный API › Исключения; Публичный API › Связанные страницы · `structure:core-concepts/public-api.md#002-efcd99f6` · https://github.com/feod-architecture/feod-docs/blob/f00eaf533cfee37f67e118c96291d535b0895a6f/docs/core-concepts/public-api.md
> - [5] `guides/design-module.md` › Как проектировать модуль › Шаги · `structure:guides/design-module.md#003-f871c9a6` · https://github.com/feod-architecture/feod-docs/blob/f00eaf533cfee37f67e118c96291d535b0895a6f/docs/guides/design-module.md
>
> Цитаты:
> - [1] «Модуль - основная единица FEOD. Он хранит продуктовую ответственность и открывает наружу только явный контракт.» — найдена во фрагменте 1
> - [2] «корневой `index.ts` модуля или сущности `common` содержит только явные публичные exports;» — найдена во фрагменте 2
> - [3] «Исключения допустимы только внутри самой FEOD-сущности.» — найдена во фрагменте 3
> - [5] «Внутри модуля допустимы `ui`, `model`, `api`, `lib`, `config`, `types` и другие папки, если они помогают держать одну ответственность.» — найдена во фрагменте 5

**Память после хода.**

> ## Цель
>
> Спроектировать новый модуль корзины (cart) для интернет-магазина по FEOD.
>
> ## Уточнения
>
> - Модуль корзины (cart) — новый.
> - Проектирование ведётся по FEOD.
> - Корзине нужны данные товара из модуля catalog.
>
> ## Ограничения и термины
>
> - Под public API понимаем только файл index.ts модуля.
> - Общий код корзины и каталога не кладём в global.
