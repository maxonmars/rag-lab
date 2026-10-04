# RAG-чат: история, память задачи и источники

Прогон 2026-10-02T14:58:08.794Z. Сценарии: `experiments/feod-chat/scenarios.md` (2, реплик 25). Фактическая длительность прогона: 113.3 с.
Индекс создан 2026-09-30T14:27:30.045Z, модель эмбеддингов `bge-m3:latest` (digest 790764642607).
Модель ответов, памяти задачи и переписывания запроса: `deepseek-flash`. Поиск: стратегия structure, режим rewrite-filter, кандидатов 10, итоговый top-5, порог 0.55 (применяется). Окно истории: 6 ходов.

## Сводка

| Сценарий | Ходов | Ответы с источником | Ответы с дословной цитатой | Цитаты дословно | Цель сохранена | Ключи памяти | «Не знаю» | Память не разобрана | Ответы с замечаниями | Длительность, с |
|---|---|---|---|---|---|---|---|---|---|---|
| s1 | 13 | 10 из 13 | 10 из 13 | 26 из 27 | 13 из 13 | 20 из 20 | 2 (пустой контекст 1, моделью 1) | 0 | 2 | 59.3 |
| s2 | 12 | 8 из 12 | 8 из 12 | 23 из 24 | 12 из 12 | 17 из 17 | 3 (пустой контекст 1, моделью 2) | 0 | 3 | 54.0 |

Каждый сценарий идёт в новом пустом диалоге. «Цель сохранена» — число ходов, на которых каждый ключ цели сценария является подстрокой цели из памяти после хода. «Ключи памяти» — пары «ход — ключ», где ключ, заданный пользователем к этому ходу, найден в памяти после хода. Сравнение подстрок после нормализации регистра, «ё», пробелов и Markdown-символов; смысл не оценивается.
Источник засчитывается, если его номер есть среди переданных фрагментов; цитата — если после нормализации она является подстрокой текста указанного фрагмента. Смысл ответов здесь не оценивается — ручная оценка в README эксперимента. «—» — знаменатель равен нулю.
Измерено: время этапов хода (память, rewrite, поиск, ответ). Вычислено: разбор ответов, проверка ссылок и цитат, сравнение ключей с памятью.

## s1. Миграция проекта с FSD на FEOD

**Цель:** перевести существующий frontend-проект с FSD на FEOD. **Ключи цели:** FSD, FEOD. **Ключи памяти:** «TypeScript» с хода 2; «deep imports» с хода 6.

| Ход | Исход | Источники | Цитаты дословно | Цель сохранена | Ключи памяти | Строка поиска | мс |
|---|---|---|---|---|---|---|---|
| 1 | ответ | 2 из 2 | 2 из 2 | да | — | перевести frontend-проект с FSD на FEOD по шагам | 5 148 |
| 2 | ответ | 3 из 3 | 3 из 3 | да | 1 из 1 | Проект на TypeScript около 40 страниц, текущие слои FSD app pages widgets features entities shared, миграция с FSD на FEOD | 5 173 |
| 3 | ответ | 3 из 3 | 3 из 3 | да | 1 из 1 | С чего начать миграцию frontend-проекта с FSD на FEOD и какие верхние уровни есть в FEOD | 4 270 |
| 4 | ответ | 3 из 3 | 3 из 3 | да | 1 из 1 | Куда при переезде с FSD на FEOD деть слой shared: нейтральные UI-примитивы, utilities, framework helpers и общие типы перенести в common; код с продуктовым смыслом перенести в modules; shared разбирается на common, global и продуктовые modules. | 4 709 |
| 5 | ответ | 3 из 3 | 2 из 3 | да | 1 из 1 | По FEOD что код страниц может импортировать и что ему запрещено | 5 020 |
| 6 | ответ | 3 из 3 | 3 из 3 | да | 2 из 2 | deep imports запрещены в новом коде сразу без исключений | 5 234 |
| 7 | ответ | — | — | да | 2 из 2 | Как поступить с legacy deep imports, которые уже есть в проекте при переходе с FSD на FEOD | 4 333 |
| 8 | не знаю (модель) | — | — | да | 2 из 2 | Где хранить API-клиент при переходе frontend-проекта на TypeScript с FSD на FEOD | 4 191 |
| 9 | не знаю (пустой контекст) | — | — | да | 2 из 2 | Какой state-менеджер рекомендует FEOD? | 2 176 |
| 10 | ответ | 2 из 2 | 2 из 2 | да | 2 из 2 | Можно ли одному модулю FEOD импортировать другой модуль при переводе frontend-проекта с FSD на FEOD | 4 582 |
| 11 | ответ | 3 из 3 | 3 из 3 | да | 2 из 2 | Чем FEOD отличается от FSD | 4 814 |
| 12 | ответ | 3 из 3 | 3 из 3 | да | 2 из 2 | Цель frontend-проекта на TypeScript: перевести проект с FSD на FEOD; ограничения: deep imports в новом коде запрещены сразу без исключений; слой shared при переезде разобрать на common, global и продуктовые modules; нейтральные UI-примитивы, utilities, framework helpers и общие типы переходят в common, декларации и polyfills — в global, код с продуктовым смыслом не должен оставаться в common; shared не является автоматическим common, доменный код из него должен уйти в продуктовые modules; технические UI primitives не оформлять как модули. | 4 767 |
| 13 | ответ | 2 из 2 | 2 из 2 | да | 2 из 2 | план миграции frontend-проекта на TypeScript с FSD на FEOD из 5 шагов с учётом ограничений: deep imports в новом коде запрещены сразу без исключений, shared разобрать на common global и продуктовые modules, shared не является автоматическим common, доменный код из shared уйти в продуктовые modules, технические UI primitives не оформлять как модули, сопоставить entities features widgets с будущими modules, проверить public API каждого модуля | 4 858 |

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

Время этапов, с: память 1.6, rewrite 1.1, поиск 0.1, ответ 2.3

> Начните с фиксации текущих FSD-слоёв: отметьте, какие папки реально используются (`app`, `pages`, `widgets`, `features`, `entities`, `shared`), и отдельно — где слой существует лишь номинально [1]. Затем `app` переносится почти напрямую, так как обычно соответствует FEOD `app` (entrypoints, providers, router, bootstrap, композиция верхнего уровня) [1]. `pages` тоже переносятся почти напрямую, но проверьте, что страницы не стали источником переиспользуемой бизнес-логики [1]. Далее разберите `shared`: нейтральные UI-примитивы, utilities, framework helpers и общие типы идут в `common`, а код с продуктовым смыслом не должен оставаться в `common` [1]. Слои `entities`, `features`, `widgets` сводятся к `modules`, если это соответствует выбранной канонической FEOD-версии, причём группировать нужно по ответственности, а не по старому названию слоя [1]. После этого перепроверьте public API каждого модуля, упростите спорные границы и зафиксируйте отличия в проектном README [1]. Технические проверки (lint rules, FEOD config, AI rules) отложите до стабилизации [1]. Входные условия для такой миграции: наличие текущей FSD-структуры и списка используемых слоёв, понимание самостоятельных продуктовых областей и возможность вводить public API и менять импорты постепенно [4].
>
> Источники:
> - [1] `guides/migration-from-fsd.md` › Миграция с FSD › Шаги · `structure:guides/migration-from-fsd.md#001-194472bd` · https://github.com/feod-architecture/feod-docs/blob/f00eaf533cfee37f67e118c96291d535b0895a6f/docs/guides/migration-from-fsd.md
> - [4] `guides/migration-from-fsd.md` › Миграция с FSD; Миграция с FSD › Когда использовать; Миграция с FSD › Входные условия · `structure:guides/migration-from-fsd.md#000-4693c314` · https://github.com/feod-architecture/feod-docs/blob/f00eaf533cfee37f67e118c96291d535b0895a6f/docs/guides/migration-from-fsd.md
>
> Цитаты:
> - [1] «Зафиксируйте, какие папки реально используются: `app`, `pages`, `widgets`, `features`, `entities`, `shared`.» — найдена во фрагменте 1
> - [4] «Есть возможность вводить public API и менять импорты постепенно.» — найдена во фрагменте 4

**Память после хода.**

> ## Цель
>
> Перевести frontend-проект с FSD на FEOD.
>
> ## Уточнения
>
> - Проект — frontend-проект, использующий архитектуру FSD; планируется переход на FEOD.
>
> ## Ограничения и термины
>
> —

### s1 · ход 2

**Реплика.** Уточню: проект на TypeScript, около 40 страниц, сейчас слои FSD — app, pages, widgets, features, entities, shared.

**Строка поиска:** Проект на TypeScript около 40 страниц, текущие слои FSD app pages widgets features entities shared, миграция с FSD на FEOD

| Фрагмент | Сходство | Файл | Разделы | chunk_id |
|---|---|---|---|---|
| 1 | 0.661 | `guides/migration-from-fsd.md` | Миграция с FSD; Миграция с FSD › Когда использовать; Миграция с FSD › Входные условия | `structure:guides/migration-from-fsd.md#000-4693c314` |
| 2 | 0.657 | `guides/migration-from-fsd.md` | Миграция с FSD › Шаги | `structure:guides/migration-from-fsd.md#001-194472bd` |
| 3 | 0.647 | `guides/migration-from-fsd.md` | Миграция с FSD › Чеклист; Миграция с FSD › Типичные ошибки; Миграция с FSD › Связанные страницы | `structure:guides/migration-from-fsd.md#004-4f9fc3f4` |
| 4 | 0.633 | `get-started/overview.md` | FEOD: методология frontend-архитектуры | `structure:get-started/overview.md#000-41b04377` |
| 5 | 0.631 | `guides/migration-from-fsd.md` | Миграция с FSD › Good example; Миграция с FSD › Bad example | `structure:guides/migration-from-fsd.md#003-3253e9d3` |

Время этапов, с: память 1.2, rewrite 1.3, поиск 0.1, ответ 2.6

> Для проекта с 40 страницами и слоями `app`, `pages`, `widgets`, `features`, `entities`, `shared` порядок шагов такой: зафиксировать реально используемые слои и пометить номинальные [2]; перенести `app` в FEOD `app` почти напрямую (entrypoints, providers, router, bootstrap, композиция верхнего уровня) [2]; перенести `pages` почти напрямую, проверив, что страницы не стали источником переиспользуемой бизнес-логики [2]; разобрать `shared` — нейтральные UI-примитивы, utilities, framework helpers и общие типы в `common`, а код с продуктовым смыслом не должен там оставаться [2]; свести `entities`, `features`, `widgets` к `modules`, группируя по ответственности, а не по старому названию слоя [2]; перепроверить public API каждого модуля, упростить спорные границы, зафиксировать отличия в README и только затем добавлять технические проверки [2]. Входные условия: наличие текущей FSD-структуры и списка слоёв, понимание самостоятельных продуктовых областей и возможность вводить public API и менять импорты постепенно [1]. Учтите чеклист: FSD-термины остаются только в migration guide и README, `shared` разбирается на `common`, `global` и продуктовые modules, у каждого модуля есть явный public API, deep imports заменяются поэтапно, технические проверки отложены [3].
>
> Источники:
> - [1] `guides/migration-from-fsd.md` › Миграция с FSD; Миграция с FSD › Когда использовать; Миграция с FSD › Входные условия · `structure:guides/migration-from-fsd.md#000-4693c314` · https://github.com/feod-architecture/feod-docs/blob/f00eaf533cfee37f67e118c96291d535b0895a6f/docs/guides/migration-from-fsd.md
> - [2] `guides/migration-from-fsd.md` › Миграция с FSD › Шаги · `structure:guides/migration-from-fsd.md#001-194472bd` · https://github.com/feod-architecture/feod-docs/blob/f00eaf533cfee37f67e118c96291d535b0895a6f/docs/guides/migration-from-fsd.md
> - [3] `guides/migration-from-fsd.md` › Миграция с FSD › Чеклист; Миграция с FSD › Типичные ошибки; Миграция с FSD › Связанные страницы · `structure:guides/migration-from-fsd.md#004-4f9fc3f4` · https://github.com/feod-architecture/feod-docs/blob/f00eaf533cfee37f67e118c96291d535b0895a6f/docs/guides/migration-from-fsd.md
>
> Цитаты:
> - [1] «Есть текущая FSD-структура и список используемых слоёв.» — найдена во фрагменте 1
> - [2] «FSD `app` обычно хорошо соответствует FEOD `app`: entrypoints, providers, router, bootstrap и композиция верхнего уровня.» — найдена во фрагменте 2
> - [3] «Сохранять FSD-слои внутри `modules` -> FEOD становится только внешним переименованием.» — найдена во фрагменте 3

**Память после хода.**

> ## Цель
>
> Перевести frontend-проект с FSD на FEOD.
>
> ## Уточнения
>
> - Проект — frontend-проект на TypeScript, использующий архитектуру FSD; планируется переход на FEOD.
> - В проекте около 40 страниц.
> - Текущие слои FSD: app, pages, widgets, features, entities, shared.
>
> ## Ограничения и термины
>
> —

### s1 · ход 3

**Реплика.** С чего начать: какие верхние уровни есть в FEOD?

**Строка поиска:** С чего начать миграцию frontend-проекта с FSD на FEOD и какие верхние уровни есть в FEOD

| Фрагмент | Сходство | Файл | Разделы | chunk_id |
|---|---|---|---|---|
| 1 | 0.689 | `guides/migration-from-fsd.md` | Миграция с FSD; Миграция с FSD › Когда использовать; Миграция с FSD › Входные условия | `structure:guides/migration-from-fsd.md#000-4693c314` |
| 2 | 0.673 | `get-started/overview.md` | FEOD: методология frontend-архитектуры › Чем FEOD отличается от FSD | `structure:get-started/overview.md#003-8bb951b9` |
| 3 | 0.664 | `get-started/overview.md` | FEOD: методология frontend-архитектуры › Куда идти дальше; FEOD: методология frontend-архитектуры › Связанные страницы | `structure:get-started/overview.md#005-2d3aeb5b` |
| 4 | 0.655 | `get-started/faq.md` | FAQ; FAQ › FEOD - это FSD? | `structure:get-started/faq.md#000-126c876e` |
| 5 | 0.650 | `get-started/overview.md` | FEOD: методология frontend-архитектуры › Верхние уровни FEOD | `structure:get-started/overview.md#004-debd75dc` |

Время этапов, с: память 1.3, rewrite 0.8, поиск 0.1, ответ 2.1

> В FEOD на верхнем уровне используются только пять имён: `app`, `pages`, `modules`, `common`, `global` [5]. Роли такие: `app` — запуск приложения, роутинг, провайдеры и композиция верхнего уровня; `pages` — страницы и крупные сценарии входа; `modules` — самостоятельные модули с собственным `public API`; `common` — переиспользуемые FEOD-сущности без привязки к конкретному модулю; `global` — декларации окружения, shims, polyfills и редкие side-effect подключения для всего приложения [5]. При переходе с FSD текущие `entities`, `features` и `widgets` сначала сопоставляются с будущими `modules`, а затем проверяется public API каждого модуля [4]. FEOD — не переименование FSD: в нём нет обязательного набора FSD-слоёв вроде `entities`, `features`, `widgets`, а основной термин — «уровень», а не «слой» [2]. FSD-термины в guide используются только для сопоставления, а после миграции основной язык проекта — уровни FEOD: `app`, `pages`, `modules`, `common`, `global` [1].
>
> Источники:
> - [5] `get-started/overview.md` › FEOD: методология frontend-архитектуры › Верхние уровни FEOD · `structure:get-started/overview.md#004-debd75dc` · https://github.com/feod-architecture/feod-docs/blob/f00eaf533cfee37f67e118c96291d535b0895a6f/docs/get-started/overview.md
> - [4] `get-started/faq.md` › FAQ; FAQ › FEOD - это FSD? · `structure:get-started/faq.md#000-126c876e` · https://github.com/feod-architecture/feod-docs/blob/f00eaf533cfee37f67e118c96291d535b0895a6f/docs/get-started/faq.md
> - [2] `get-started/overview.md` › FEOD: методология frontend-архитектуры › Чем FEOD отличается от FSD · `structure:get-started/overview.md#003-8bb951b9` · https://github.com/feod-architecture/feod-docs/blob/f00eaf533cfee37f67e118c96291d535b0895a6f/docs/get-started/overview.md
>
> Цитаты:
> - [5] «На верхнем уровне проекта FEOD использует только пять имён:» — найдена во фрагменте 5
> - [4] «Если команда приходит из FSD, сначала сопоставьте текущие `entities`, `features` и `widgets` с будущими `modules`, а затем проверьте public API каждого модуля.» — найдена во фрагменте 4
> - [2] «в FEOD нет обязательного набора FSD-слоёв вроде `entities`, `features`, `widgets`;» — найдена во фрагменте 2

**Память после хода.**

> ## Цель
>
> Перевести frontend-проект с FSD на FEOD.
>
> ## Уточнения
>
> - Проект — frontend-проект на TypeScript, использующий архитектуру FSD; планируется переход на FEOD.
> - В проекте около 40 страниц.
> - Текущие слои FSD: app, pages, widgets, features, entities, shared.
>
> ## Ограничения и термины
>
> —

### s1 · ход 4

**Реплика.** Куда при переезде деть наш слой shared?

**Строка поиска:** Куда при переезде с FSD на FEOD деть слой shared: нейтральные UI-примитивы, utilities, framework helpers и общие типы перенести в common; код с продуктовым смыслом перенести в modules; shared разбирается на common, global и продуктовые modules.

| Фрагмент | Сходство | Файл | Разделы | chunk_id |
|---|---|---|---|---|
| 1 | 0.774 | `guides/migration-from-fsd.md` | Миграция с FSD › Пример сопоставления | `structure:guides/migration-from-fsd.md#002-9e662423` |
| 2 | 0.766 | `guides/migration-from-fsd.md` | Миграция с FSD › Чеклист; Миграция с FSD › Типичные ошибки; Миграция с FSD › Связанные страницы | `structure:guides/migration-from-fsd.md#004-4f9fc3f4` |
| 3 | 0.760 | `get-started/is-feod-for-my-project.md` | Подходит ли FEOD моему проекту › Good example; Подходит ли FEOD моему проекту › Bad example; Подходит ли FEOD моему проекту › Решение; Подходит ли FEOD моему проекту › Связанные страницы | `structure:get-started/is-feod-for-my-project.md#002-d41120c4` |
| 4 | 0.756 | `get-started/overview.md` | FEOD: методология frontend-архитектуры › Чем FEOD отличается от FSD | `structure:get-started/overview.md#003-8bb951b9` |
| 5 | 0.749 | `guides/migration-from-fsd.md` | Миграция с FSD › Шаги | `structure:guides/migration-from-fsd.md#001-194472bd` |

Время этапов, с: память 1.3, rewrite 1.3, поиск 0.1, ответ 2.1

> `shared` нужно разобрать на `common`, `global` и продуктовые modules: нейтральные UI-примитивы, utilities, framework helpers и общие типы переходят в `common`, декларации и polyfills — в `global`, а код с продуктовым смыслом не должен оставаться в `common` [1][5]. При этом `shared` не является автоматическим `common`: если туда попал доменный код, он должен уйти в продуктовые modules [2]. Технические UI primitives при этом не стоит оформлять как модули, так как у них нет продуктовой ответственности [3].
>
> Источники:
> - [1] `guides/migration-from-fsd.md` › Миграция с FSD › Пример сопоставления · `structure:guides/migration-from-fsd.md#002-9e662423` · https://github.com/feod-architecture/feod-docs/blob/f00eaf533cfee37f67e118c96291d535b0895a6f/docs/guides/migration-from-fsd.md
> - [5] `guides/migration-from-fsd.md` › Миграция с FSD › Шаги · `structure:guides/migration-from-fsd.md#001-194472bd` · https://github.com/feod-architecture/feod-docs/blob/f00eaf533cfee37f67e118c96291d535b0895a6f/docs/guides/migration-from-fsd.md
> - [2] `guides/migration-from-fsd.md` › Миграция с FSD › Чеклист; Миграция с FSD › Типичные ошибки; Миграция с FSD › Связанные страницы · `structure:guides/migration-from-fsd.md#004-4f9fc3f4` · https://github.com/feod-architecture/feod-docs/blob/f00eaf533cfee37f67e118c96291d535b0895a6f/docs/guides/migration-from-fsd.md
>
> Цитаты:
> - [1] «`shared` | `common` или `global` | Только нейтральные сущности идут в `common`; декларации и polyfills - в `global`.» — найдена во фрагменте 1
> - [5] «Нейтральные UI-примитивы, utilities, framework helpers и общие типы переходят в `common`. Код с продуктовым смыслом не должен оставаться в `common`.» — найдена во фрагменте 5
> - [2] «Считать `shared` автоматическим `common` -> доменный код попадает в общий уровень.» — найдена во фрагменте 2

**Память после хода.**

> ## Цель
>
> Перевести frontend-проект с FSD на FEOD.
>
> ## Уточнения
>
> - Проект — frontend-проект на TypeScript, использующий архитектуру FSD; планируется переход на FEOD.
> - В проекте около 40 страниц.
> - Текущие слои FSD: app, pages, widgets, features, entities, shared.
>
> ## Ограничения и термины
>
> —

### s1 · ход 5

**Реплика.** А что код страниц может импортировать, а что ему запрещено?

**Строка поиска:** По FEOD что код страниц может импортировать и что ему запрещено

| Фрагмент | Сходство | Файл | Разделы | chunk_id |
|---|---|---|---|---|
| 1 | 0.669 | `core-concepts/dependency-rules.md` | Правила зависимостей › Нормативные правила; Правила зависимостей › Правило public API | `structure:core-concepts/dependency-rules.md#002-81f6b0b1` |
| 2 | 0.663 | `reference/terms.md` | Термины › Deep import; Термины › Нормативные формулировки | `structure:reference/terms.md#005-6dc27d31` |
| 3 | 0.662 | `core-concepts/levels.md` | Уровни › Правило; Уровни › Почему; Уровни › Быстрый reference | `structure:core-concepts/levels.md#001-1060540c` |
| 4 | 0.652 | `reference/glossary.md` | Глоссарий › Термины | `structure:reference/glossary.md#002-98ffd897` |
| 5 | 0.647 | `core-concepts/dependency-rules.md` | Правила зависимостей › Правило public API › Почему; Правила зависимостей › Правило deep imports; Правила зависимостей › Good example | `structure:core-concepts/dependency-rules.md#003-48ab93b0` |

Время этапов, с: память 1.8, rewrite 1.0, поиск 0.1, ответ 2.2

> Страницы (`pages`) могут импортировать только `modules` и `common` — то есть обращаться к своим экранам может `app`, а сами страницы ограничены продуктовыми модулями и общими техническими сущностями [3]. Импортировать `app` или `global` страницам нельзя: `global` вообще не импортируется как обычная прикладная зависимость [1], а `app` — это уровень-композиция, который сам импортирует `pages`, а не наоборот [3]. Внешние обращения к чужому модулю или чужой сущности `common` должны идти только через их `public API` [1]. `Deep imports` во внутренние файлы или директории чужой сущности запрещены — в том числе для чужих модулей, чужих сущностей `common` и чужих страниц [5]. Type-only imports подчиняются тем же правилам, что и runtime imports [1].
>
> Источники:
> - [3] `core-concepts/levels.md` › Уровни › Правило; Уровни › Почему; Уровни › Быстрый reference · `structure:core-concepts/levels.md#001-1060540c` · https://github.com/feod-architecture/feod-docs/blob/f00eaf533cfee37f67e118c96291d535b0895a6f/docs/core-concepts/levels.md
> - [1] `core-concepts/dependency-rules.md` › Правила зависимостей › Нормативные правила; Правила зависимостей › Правило public API · `structure:core-concepts/dependency-rules.md#002-81f6b0b1` · https://github.com/feod-architecture/feod-docs/blob/f00eaf533cfee37f67e118c96291d535b0895a6f/docs/core-concepts/dependency-rules.md
> - [5] `core-concepts/dependency-rules.md` › Правила зависимостей › Правило public API › Почему; Правила зависимостей › Правило deep imports; Правила зависимостей › Good example · `structure:core-concepts/dependency-rules.md#003-48ab93b0` · https://github.com/feod-architecture/feod-docs/blob/f00eaf533cfee37f67e118c96291d535b0895a6f/docs/core-concepts/dependency-rules.md
>
> Цитаты:
> - [3] «| `pages` | пользовательские экраны и маршруты | `app` | `modules`, `common` |» — найдена во фрагменте 3
> - [1] «Внешний импорт FEOD-сущности должен идти через её public API.» — найдена во фрагменте 1
> - [5] «Deep imports запрещены для: чужих модулей; чужих сущностей `common`; чужих страниц; любых обращений к внутренностям уровня из другого уровня.» — не найдена во фрагменте 5
>
> Замечания:
> - цитата [5] не найдена во фрагменте 5

**Память после хода.**

> ## Цель
>
> Перевести frontend-проект с FSD на FEOD.
>
> ## Уточнения
>
> - Проект — frontend-проект на TypeScript, использующий архитектуру FSD; планируется переход на FEOD.
> - В проекте около 40 страниц.
> - Текущие слои FSD: app, pages, widgets, features, entities, shared.
> - Слой `shared` при переезде нужно разобрать на `common`, `global` и продуктовые modules: нейтральные UI-примитивы, utilities, framework helpers и общие типы переходят в `common`, декларации и polyfills — в `global`, а код с продуктовым смыслом не должен оставаться в `common`.
> - `shared` не является автоматическим `common`: доменный код из него должен уйти в продуктовые modules.
> - Технические UI primitives не стоит оформлять как модули, так как у них нет продуктовой ответственности.
>
> ## Ограничения и термины
>
> —

Замечания к ответу: цитата [5] не найдена во фрагменте 5.

### s1 · ход 6

**Реплика.** Важное ограничение: deep imports в новом коде мы запрещаем сразу, без исключений.

**Строка поиска:** deep imports запрещены в новом коде сразу без исключений

| Фрагмент | Сходство | Файл | Разделы | chunk_id |
|---|---|---|---|---|
| 1 | 0.632 | `reference/import-matrix.md` | Матрица импортов › Deep imports | `structure:reference/import-matrix.md#005-afa7012c` |
| 2 | 0.632 | `reference/terms.md` | Термины › Deep import; Термины › Нормативные формулировки | `structure:reference/terms.md#005-6dc27d31` |
| 3 | 0.614 | `reference/code-smells.md` | Code smells › Deep imports; Code smells › Deep imports › Симптом; Code smells › Deep imports › Почему проблема | `structure:reference/code-smells.md#001-1156e0c8` |
| 4 | 0.597 | `core-concepts/dependency-rules.md` | Правила зависимостей › Правило public API › Почему; Правила зависимостей › Правило deep imports; Правила зависимостей › Good example | `structure:core-concepts/dependency-rules.md#003-48ab93b0` |
| 5 | 0.579 | `core-concepts/dependency-rules.md` | Правила зависимостей › Bad example; Правила зависимостей › Bad example › Почему; Правила зависимостей › Правило global | `structure:core-concepts/dependency-rules.md#004-b07a1503` |

Время этапов, с: память 1.9, rewrite 0.8, поиск 0.1, ответ 2.4

> Это ограничение совпадает с правилами FEOD: `deep import` — это импорт, который обходит public API FEOD-сущности и указывает на её внутренний файл или внутреннюю директорию, и такие импорты запрещены [1]. Запрет действует для чужих модулей, чужих сущностей `common`, чужих страниц и любых обращений к внутренностям уровня из другого уровня [4]. Вместо внутренних путей импортируйте корень public API: `import { getOrder, OrderCard } from "@/modules/order";` и `import { formatMoney } from "@/common/format";` [1]. Практическое правило для линтера: внешний импорт FEOD-сущности должен заканчиваться на корень её public API, а не на внутренний сегмент `ui`, `api`, `model`, `lib`, `config`, `types` или конкретный файл [1]. То, что путь работает в TypeScript, не делает его допустимым по правилам FEOD [2]. Причина запрета: deep import делает внутреннюю структуру внешним контрактом, после чего нельзя безопасно переносить файлы и переименовывать helpers [3].
>
> Источники:
> - [1] `reference/import-matrix.md` › Матрица импортов › Deep imports · `structure:reference/import-matrix.md#005-afa7012c` · https://github.com/feod-architecture/feod-docs/blob/f00eaf533cfee37f67e118c96291d535b0895a6f/docs/reference/import-matrix.md
> - [4] `core-concepts/dependency-rules.md` › Правила зависимостей › Правило public API › Почему; Правила зависимостей › Правило deep imports; Правила зависимостей › Good example · `structure:core-concepts/dependency-rules.md#003-48ab93b0` · https://github.com/feod-architecture/feod-docs/blob/f00eaf533cfee37f67e118c96291d535b0895a6f/docs/core-concepts/dependency-rules.md
> - [2] `reference/terms.md` › Термины › Deep import; Термины › Нормативные формулировки · `structure:reference/terms.md#005-6dc27d31` · https://github.com/feod-architecture/feod-docs/blob/f00eaf533cfee37f67e118c96291d535b0895a6f/docs/reference/terms.md
>
> Цитаты:
> - [1] «Deep import - это импорт, который обходит public API FEOD-сущности и указывает на её внутренний файл или внутреннюю директорию.» — найдена во фрагменте 1
> - [4] «Deep imports запрещены для:» — найдена во фрагменте 4
> - [2] «Рабочий TypeScript-import не делает путь допустимым по правилам FEOD.» — найдена во фрагменте 2

**Память после хода.**

> ## Цель
>
> Перевести frontend-проект с FSD на FEOD.
>
> ## Уточнения
>
> - Проект — frontend-проект на TypeScript, использующий архитектуру FSD; планируется переход на FEOD.
> - В проекте около 40 страниц.
> - Текущие слои FSD: app, pages, widgets, features, entities, shared.
> - Слой `shared` при переезде нужно разобрать на `common`, `global` и продуктовые modules: нейтральные UI-примитивы, utilities, framework helpers и общие типы переходят в `common`, декларации и polyfills — в `global`, а код с продуктовым смыслом не должен оставаться в `common`.
> - `shared` не является автоматическим `common`: доменный код из него должен уйти в продуктовые modules.
> - Технические UI primitives не стоит оформлять как модули, так как у них нет продуктовой ответственности.
>
> ## Ограничения и термины
>
> - Deep imports в новом коде запрещены сразу, без исключений.

### s1 · ход 7

**Реплика.** Как тогда поступить с legacy deep imports, которые уже есть в проекте?

**Строка поиска:** Как поступить с legacy deep imports, которые уже есть в проекте при переходе с FSD на FEOD

| Фрагмент | Сходство | Файл | Разделы | chunk_id |
|---|---|---|---|---|
| 1 | 0.641 | `guides/migration-from-fsd.md` | Миграция с FSD; Миграция с FSD › Когда использовать; Миграция с FSD › Входные условия | `structure:guides/migration-from-fsd.md#000-4693c314` |
| 2 | 0.638 | `guides/migration-from-fsd.md` | Миграция с FSD › Чеклист; Миграция с FSD › Типичные ошибки; Миграция с FSD › Связанные страницы | `structure:guides/migration-from-fsd.md#004-4f9fc3f4` |
| 3 | 0.628 | `get-started/overview.md` | FEOD: методология frontend-архитектуры › Куда идти дальше; FEOD: методология frontend-архитектуры › Связанные страницы | `structure:get-started/overview.md#005-2d3aeb5b` |
| 4 | 0.626 | `reference/import-matrix.md` | Матрица импортов › Deep imports | `structure:reference/import-matrix.md#005-afa7012c` |
| 5 | 0.614 | `reference/terms.md` | Термины › Deep import; Термины › Нормативные формулировки | `structure:reference/terms.md#005-6dc27d31` |

Время этапов, с: память 1.4, rewrite 1.2, поиск 0.1, ответ 1.7

> Во фрагментах нет отдельной инструкции, как именно поступать с уже существующими legacy deep imports при миграции. Есть только общие ориентиры: deep imports запрещены [4], а в чеклисте миграции указано, что deep imports заменяются поэтапно [2]. Также нужна возможность менять импорты постепенно [4] и вводить public API [1]; сначала обновляется public API, иначе потребители продолжают зависеть от внутренних файлов [2].
>
> ## Источники
>
> - [1]
> - [2]
> - [4]
>
> ## Цитаты
>
> - [1] «Есть возможность вводить public API и менять импорты постепенно.»
> - [2] «- [ ] Deep imports заменяются поэтапно.»
> - [4] «Deep import - это импорт, который обходит public API FEOD-сущности и указывает на её внутренний файл или внутреннюю директорию.»
>
> Источники: нет
>
> Цитаты: нет
>
> Замечания:
> - ответ не разбит на разделы «Ответ», «Источники», «Цитаты» или «Не знаю», «Уточнение»

**Память после хода.**

> ## Цель
>
> Перевести frontend-проект с FSD на FEOD.
>
> ## Уточнения
>
> - Проект — frontend-проект на TypeScript, использующий архитектуру FSD; планируется переход на FEOD.
> - В проекте около 40 страниц.
> - Текущие слои FSD: app, pages, widgets, features, entities, shared.
> - Слой `shared` при переезде нужно разобрать на `common`, `global` и продуктовые modules: нейтральные UI-примитивы, utilities, framework helpers и общие типы переходят в `common`, декларации и polyfills — в `global`, а код с продуктовым смыслом не должен оставаться в `common`.
> - `shared` не является автоматическим `common`: доменный код из него должен уйти в продуктовые modules.
> - Технические UI primitives не стоит оформлять как модули, так как у них нет продуктовой ответственности.
>
> ## Ограничения и термины
>
> - Deep imports в новом коде запрещены сразу, без исключений.

Замечания к ответу: ответ не разбит на разделы «Ответ», «Источники», «Цитаты» или «Не знаю», «Уточнение».

### s1 · ход 8

**Реплика.** Где хранить API-клиент?

**Строка поиска:** Где хранить API-клиент при переходе frontend-проекта на TypeScript с FSD на FEOD

| Фрагмент | Сходство | Файл | Разделы | chunk_id |
|---|---|---|---|---|
| 1 | 0.617 | `get-started/overview.md` | FEOD: методология frontend-архитектуры | `structure:get-started/overview.md#000-41b04377` |
| 2 | 0.610 | `core-concepts/public-api.md` | Публичный API; Публичный API › Короткое определение; Публичный API › Какую проблему решает | `structure:core-concepts/public-api.md#000-f01af1d3` |
| 3 | 0.597 | `guides/migration-from-fsd.md` | Миграция с FSD; Миграция с FSD › Когда использовать; Миграция с FSD › Входные условия | `structure:guides/migration-from-fsd.md#000-4693c314` |
| 4 | 0.592 | `get-started/is-feod-for-my-project.md` | Подходит ли FEOD моему проекту › Когда не начинать с FEOD; Подходит ли FEOD моему проекту › Быстрая диагностика | `structure:get-started/is-feod-for-my-project.md#001-4e1e3ed6` |
| 5 | 0.587 | `get-started/faq.md` | FAQ; FAQ › FEOD - это FSD? | `structure:get-started/faq.md#000-126c876e` |

Время этапов, с: память 1.4, rewrite 1.1, поиск 0.1, ответ 1.7

> Не знаю. Во фрагментах нет сведений о том, на каком уровне или в какой FEOD-сущности хранить API-клиент.
>
> Уточнение: Уточните, имеется ли в виду общий HTTP-клиент без привязки к продуктовой области или клиент с запросами конкретного домена, — это поможет понять, что именно требуется разместить?

**Память после хода.**

> ## Цель
>
> Перевести frontend-проект с FSD на FEOD.
>
> ## Уточнения
>
> - Проект — frontend-проект на TypeScript, использующий архитектуру FSD; планируется переход на FEOD.
> - В проекте около 40 страниц.
> - Текущие слои FSD: app, pages, widgets, features, entities, shared.
> - Слой `shared` при переезде нужно разобрать на `common`, `global` и продуктовые modules: нейтральные UI-примитивы, utilities, framework helpers и общие типы переходят в `common`, декларации и polyfills — в `global`, а код с продуктовым смыслом не должен оставаться в `common`.
> - `shared` не является автоматическим `common`: доменный код из него должен уйти в продуктовые modules.
> - Технические UI primitives не стоит оформлять как модули, так как у них нет продуктовой ответственности.
>
> ## Ограничения и термины
>
> - Deep imports в новом коде запрещены сразу, без исключений.

### s1 · ход 9

**Реплика.** Кстати, какой state-менеджер рекомендует FEOD?

**Строка поиска:** Какой state-менеджер рекомендует FEOD?

Контекст пуст: модель не вызывалась.

Время этапов, с: память 1.3, rewrite 0.8, поиск 0.1, ответ 0.0

> Не знаю: ни один фрагмент не достиг порога сходства 0.55 (лучшее 0.536).
> Уточните вопрос: назовите раздел, термин или пример, о котором идёт речь.
>
> Ближайшие разделы ниже порога:
> - `get-started/faq.md` › FAQ · 0.536
> - `get-started/overview.md` › FEOD: методология frontend-архитектуры · 0.534
> - `get-started/is-feod-for-my-project.md` › Подходит ли FEOD моему проекту · 0.519

**Память после хода.**

> ## Цель
>
> Перевести frontend-проект с FSD на FEOD.
>
> ## Уточнения
>
> - Проект — frontend-проект на TypeScript, использующий архитектуру FSD; планируется переход на FEOD.
> - В проекте около 40 страниц.
> - Текущие слои FSD: app, pages, widgets, features, entities, shared.
> - Слой `shared` при переезде нужно разобрать на `common`, `global` и продуктовые modules: нейтральные UI-примитивы, utilities, framework helpers и общие типы переходят в `common`, декларации и polyfills — в `global`, а код с продуктовым смыслом не должен оставаться в `common`.
> - `shared` не является автоматическим `common`: доменный код из него должен уйти в продуктовые modules.
> - Технические UI primitives не стоит оформлять как модули, так как у них нет продуктовой ответственности.
>
> ## Ограничения и термины
>
> - Deep imports в новом коде запрещены сразу, без исключений.

### s1 · ход 10

**Реплика.** Ладно, вернёмся. Можно ли одному модулю импортировать другой модуль?

**Строка поиска:** Можно ли одному модулю FEOD импортировать другой модуль при переводе frontend-проекта с FSD на FEOD

| Фрагмент | Сходство | Файл | Разделы | chunk_id |
|---|---|---|---|---|
| 1 | 0.701 | `get-started/faq.md` | FAQ › Можно ли использовать FEOD без common?; FAQ › Можно ли модулю импортировать другой модуль? | `structure:get-started/faq.md#001-d645a78d` |
| 2 | 0.683 | `get-started/overview.md` | FEOD: методология frontend-архитектуры › Чем FEOD отличается от FSD | `structure:get-started/overview.md#003-8bb951b9` |
| 3 | 0.674 | `get-started/overview.md` | FEOD: методология frontend-архитектуры › Чем FEOD отличается от обычной модульной архитектуры | `structure:get-started/overview.md#002-62c15755` |
| 4 | 0.655 | `guides/migration-from-fsd.md` | Миграция с FSD › Чеклист; Миграция с FSD › Типичные ошибки; Миграция с FSD › Связанные страницы | `structure:guides/migration-from-fsd.md#004-4f9fc3f4` |
| 5 | 0.654 | `guides/migration-from-fsd.md` | Миграция с FSD; Миграция с FSD › Когда использовать; Миграция с FSD › Входные условия | `structure:guides/migration-from-fsd.md#000-4693c314` |

Время этапов, с: память 1.7, rewrite 1.1, поиск 0.1, ответ 1.7

> Да, модуль может импортировать другой модуль, если импорт идёт через public API другого модуля и не создаёт циклическую или скрытую зависимость [1]. Импорт внутренностей чужого модуля при этом считается нарушением [3]. В примере допустимым показан импорт из корня модуля, а не из его внутренней директории [1].
>
> Источники:
> - [1] `get-started/faq.md` › FAQ › Можно ли использовать FEOD без common?; FAQ › Можно ли модулю импортировать другой модуль? · `structure:get-started/faq.md#001-d645a78d` · https://github.com/feod-architecture/feod-docs/blob/f00eaf533cfee37f67e118c96291d535b0895a6f/docs/get-started/faq.md
> - [3] `get-started/overview.md` › FEOD: методология frontend-архитектуры › Чем FEOD отличается от обычной модульной архитектуры · `structure:get-started/overview.md#002-62c15755` · https://github.com/feod-architecture/feod-docs/blob/f00eaf533cfee37f67e118c96291d535b0895a6f/docs/get-started/overview.md
>
> Цитаты:
> - [1] «Да, если импорт идёт через public API другого модуля и не создаёт циклическую или скрытую зависимость.» — найдена во фрагменте 1
> - [3] «глубокие импорты во внутренности чужого модуля считаются нарушением;» — найдена во фрагменте 3

**Память после хода.**

> ## Цель
>
> Перевести frontend-проект с FSD на FEOD.
>
> ## Уточнения
>
> - Проект — frontend-проект на TypeScript, использующий архитектуру FSD; планируется переход на FEOD.
> - В проекте около 40 страниц.
> - Текущие слои FSD: app, pages, widgets, features, entities, shared.
> - Слой `shared` при переезде нужно разобрать на `common`, `global` и продуктовые modules: нейтральные UI-примитивы, utilities, framework helpers и общие типы переходят в `common`, декларации и polyfills — в `global`, а код с продуктовым смыслом не должен оставаться в `common`.
> - `shared` не является автоматическим `common`: доменный код из него должен уйти в продуктовые modules.
> - Технические UI primitives не стоит оформлять как модули, так как у них нет продуктовой ответственности.
>
> ## Ограничения и термины
>
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

Время этапов, с: память 1.6, rewrite 0.9, поиск 0.1, ответ 2.2

> FEOD — отдельная методология, а не переименование FSD-терминов: она описывает архитектуру через уровни `app`, `pages`, `modules`, `common`, `global` и делает модуль главным строительным блоком [1]. В FEOD основной термин — «уровень», а не слой, и нет обязательного набора FSD-слоёв вроде `entities`, `features`, `widgets` [1]. Ключевой акцент — на модуле, его `public API` и границе зависимостей, а также на строгих правилах импортов [1]. FEOD использует меньше верхних уровней и строит проект вокруг `modules`, public API и контролируемых зависимостей [2]. Команде из FSD предлагается сначала сопоставить текущие `entities`, `features` и `widgets` с будущими `modules`, а затем проверить public API каждого модуля [2]. Верхние уровни имеют понятные роли, модуль публикует наружу только свой `public API`, зависимости между уровнями ограничены [3]. Дополнительно стоит развести термины: FEOD-сущность — это файл или директория с ролью в структуре проекта, а не DDD entity [4].
>
> Источники:
> - [1] `get-started/overview.md` › FEOD: методология frontend-архитектуры › Чем FEOD отличается от FSD · `structure:get-started/overview.md#003-8bb951b9` · https://github.com/feod-architecture/feod-docs/blob/f00eaf533cfee37f67e118c96291d535b0895a6f/docs/get-started/overview.md
> - [2] `get-started/faq.md` › FAQ; FAQ › FEOD - это FSD? · `structure:get-started/faq.md#000-126c876e` · https://github.com/feod-architecture/feod-docs/blob/f00eaf533cfee37f67e118c96291d535b0895a6f/docs/get-started/faq.md
> - [4] `reference/terms.md` › Термины › FEOD-сущность и DDD entity · `structure:reference/terms.md#003-0bf4dadc` · https://github.com/feod-architecture/feod-docs/blob/f00eaf533cfee37f67e118c96291d535b0895a6f/docs/reference/terms.md
>
> Цитаты:
> - [1] «FEOD и FSD решают близкую задачу: сделать архитектуру frontend-проекта понятной и устойчивой.» — найдена во фрагменте 1
> - [2] «Нет. FEOD использует меньше верхних уровней и строит проект вокруг `modules`, public API и контролируемых зависимостей.» — найдена во фрагменте 2
> - [4] «`FEOD-сущность` и `DDD entity` не являются синонимами.» — найдена во фрагменте 4

**Память после хода.**

> ## Цель
>
> Перевести frontend-проект с FSD на FEOD.
>
> ## Уточнения
>
> - Проект — frontend-проект на TypeScript, использующий архитектуру FSD; планируется переход на FEOD.
> - В проекте около 40 страниц.
> - Текущие слои FSD: app, pages, widgets, features, entities, shared.
> - Слой `shared` при переезде нужно разобрать на `common`, `global` и продуктовые modules: нейтральные UI-примитивы, utilities, framework helpers и общие типы переходят в `common`, декларации и polyfills — в `global`, а код с продуктовым смыслом не должен оставаться в `common`.
> - `shared` не является автоматическим `common`: доменный код из него должен уйти в продуктовые modules.
> - Технические UI primitives не стоит оформлять как модули, так как у них нет продуктовой ответственности.
>
> ## Ограничения и термины
>
> - Deep imports в новом коде запрещены сразу, без исключений.

### s1 · ход 12

**Реплика.** Напомни, какая у нас цель и какие ограничения мы зафиксировали?

**Строка поиска:** Цель frontend-проекта на TypeScript: перевести проект с FSD на FEOD; ограничения: deep imports в новом коде запрещены сразу без исключений; слой shared при переезде разобрать на common, global и продуктовые modules; нейтральные UI-примитивы, utilities, framework helpers и общие типы переходят в common, декларации и polyfills — в global, код с продуктовым смыслом не должен оставаться в common; shared не является автоматическим common, доменный код из него должен уйти в продуктовые modules; технические UI primitives не оформлять как модули.

| Фрагмент | Сходство | Файл | Разделы | chunk_id |
|---|---|---|---|---|
| 1 | 0.768 | `get-started/overview.md` | FEOD: методология frontend-архитектуры › Какую боль решает FEOD | `structure:get-started/overview.md#001-5adcb875` |
| 2 | 0.742 | `get-started/is-feod-for-my-project.md` | Подходит ли FEOD моему проекту › Good example; Подходит ли FEOD моему проекту › Bad example; Подходит ли FEOD моему проекту › Решение; Подходит ли FEOD моему проекту › Связанные страницы | `structure:get-started/is-feod-for-my-project.md#002-d41120c4` |
| 3 | 0.737 | `get-started/overview.md` | FEOD: методология frontend-архитектуры › Чем FEOD отличается от FSD | `structure:get-started/overview.md#003-8bb951b9` |
| 4 | 0.736 | `reference/terms.md` | Термины › Deep import; Термины › Нормативные формулировки | `structure:reference/terms.md#005-6dc27d31` |
| 5 | 0.733 | `get-started/is-feod-for-my-project.md` | Подходит ли FEOD моему проекту › Когда не начинать с FEOD; Подходит ли FEOD моему проекту › Быстрая диагностика | `structure:get-started/is-feod-for-my-project.md#001-4e1e3ed6` |

Время этапов, с: память 1.4, rewrite 1.4, поиск 0.1, ответ 1.9

> Цель: перевести frontend-проект на TypeScript с архитектуры FSD на FEOD. Ограничения и договорённости: deep imports в новом коде запрещены сразу, без исключений; слой `shared` нужно разобрать на `common`, `global` и продуктовые modules; `shared` не является автоматическим `common`, доменный код из него должен уйти в продуктовые modules; технические UI primitives не стоит оформлять как модули, так как у них нет продуктовой ответственности. FEOD вводит `public API` модулей и позволяет менять внутренности без поломки потребителей. При нарушениях зависимостей следует сверяться с матрицей импортов, а спорные места размещения кода решать по guide «Где хранить код».
>
> Источники:
> - [1] `get-started/overview.md` › FEOD: методология frontend-архитектуры › Какую боль решает FEOD · `structure:get-started/overview.md#001-5adcb875` · https://github.com/feod-architecture/feod-docs/blob/f00eaf533cfee37f67e118c96291d535b0895a6f/docs/get-started/overview.md
> - [3] `get-started/overview.md` › FEOD: методология frontend-архитектуры › Чем FEOD отличается от FSD · `structure:get-started/overview.md#003-8bb951b9` · https://github.com/feod-architecture/feod-docs/blob/f00eaf533cfee37f67e118c96291d535b0895a6f/docs/get-started/overview.md
> - [5] `get-started/is-feod-for-my-project.md` › Подходит ли FEOD моему проекту › Когда не начинать с FEOD; Подходит ли FEOD моему проекту › Быстрая диагностика · `structure:get-started/is-feod-for-my-project.md#001-4e1e3ed6` · https://github.com/feod-architecture/feod-docs/blob/f00eaf533cfee37f67e118c96291d535b0895a6f/docs/get-started/is-feod-for-my-project.md
>
> Цитаты:
> - [1] «внутреннее устройство модуля становится частью внешнего контракта;» — найдена во фрагменте 1
> - [3] «в FEOD нет обязательного набора FSD-слоёв вроде `entities`, `features`, `widgets`;» — найдена во фрагменте 3
> - [5] «Нужно ли менять внутренности без поломки потребителей?» — найдена во фрагменте 5

**Память после хода.**

> ## Цель
>
> Перевести frontend-проект с FSD на FEOD.
>
> ## Уточнения
>
> - Проект — frontend-проект на TypeScript, использующий архитектуру FSD; планируется переход на FEOD.
> - В проекте около 40 страниц.
> - Текущие слои FSD: app, pages, widgets, features, entities, shared.
> - Слой `shared` при переезде нужно разобрать на `common`, `global` и продуктовые modules: нейтральные UI-примитивы, utilities, framework helpers и общие типы переходят в `common`, декларации и polyfills — в `global`, а код с продуктовым смыслом не должен оставаться в `common`.
> - `shared` не является автоматическим `common`: доменный код из него должен уйти в продуктовые modules.
> - Технические UI primitives не стоит оформлять как модули, так как у них нет продуктовой ответственности.
>
> ## Ограничения и термины
>
> - Deep imports в новом коде запрещены сразу, без исключений.

### s1 · ход 13

**Реплика.** Составь итоговый план миграции из 5 шагов с учётом наших ограничений.

**Строка поиска:** план миграции frontend-проекта на TypeScript с FSD на FEOD из 5 шагов с учётом ограничений: deep imports в новом коде запрещены сразу без исключений, shared разобрать на common global и продуктовые modules, shared не является автоматическим common, доменный код из shared уйти в продуктовые modules, технические UI primitives не оформлять как модули, сопоставить entities features widgets с будущими modules, проверить public API каждого модуля

| Фрагмент | Сходство | Файл | Разделы | chunk_id |
|---|---|---|---|---|
| 1 | 0.769 | `guides/migration-from-fsd.md` | Миграция с FSD › Шаги | `structure:guides/migration-from-fsd.md#001-194472bd` |
| 2 | 0.757 | `guides/migration-from-fsd.md` | Миграция с FSD › Чеклист; Миграция с FSD › Типичные ошибки; Миграция с FSD › Связанные страницы | `structure:guides/migration-from-fsd.md#004-4f9fc3f4` |
| 3 | 0.735 | `guides/migration-from-fsd.md` | Миграция с FSD; Миграция с FSD › Когда использовать; Миграция с FSD › Входные условия | `structure:guides/migration-from-fsd.md#000-4693c314` |
| 4 | 0.735 | `get-started/overview.md` | FEOD: методология frontend-архитектуры › Какую боль решает FEOD | `structure:get-started/overview.md#001-5adcb875` |
| 5 | 0.729 | `get-started/is-feod-for-my-project.md` | Подходит ли FEOD моему проекту › Good example; Подходит ли FEOD моему проекту › Bad example; Подходит ли FEOD моему проекту › Решение; Подходит ли FEOD моему проекту › Связанные страницы | `structure:get-started/is-feod-for-my-project.md#002-d41120c4` |

Время этапов, с: память 1.7, rewrite 1.0, поиск 0.1, ответ 2.0

> 1. Опишите текущие FSD-слои и отметьте номинальные слои [1]. 2. Перенесите `app` и `pages` почти напрямую, без смешения с бизнес-логикой [1][2]. 3. Разберите `shared`: нейтральные UI-примитивы, utilities, framework helpers и общие типы — в `common`, декларации и polyfills — в `global`, доменный код — в продуктовые modules [1][2]. 4. Сгруппируйте `entities`, `features`, `widgets` по ответственности в `modules` и перепроверьте public API каждого модуля [1]. 5. Введите public API и меняйте импорты постепенно: deep imports в новом коде запрещены сразу, а lint rules, FEOD config и AI rules добавьте после стабилизации структуры [1][2].
>
> Источники:
> - [1] `guides/migration-from-fsd.md` › Миграция с FSD › Шаги · `structure:guides/migration-from-fsd.md#001-194472bd` · https://github.com/feod-architecture/feod-docs/blob/f00eaf533cfee37f67e118c96291d535b0895a6f/docs/guides/migration-from-fsd.md
> - [2] `guides/migration-from-fsd.md` › Миграция с FSD › Чеклист; Миграция с FSD › Типичные ошибки; Миграция с FSD › Связанные страницы · `structure:guides/migration-from-fsd.md#004-4f9fc3f4` · https://github.com/feod-architecture/feod-docs/blob/f00eaf533cfee37f67e118c96291d535b0895a6f/docs/guides/migration-from-fsd.md
>
> Цитаты:
> - [1] «Группируйте не по старому названию слоя, а по ответственности.» — найдена во фрагменте 1
> - [2] «- [ ] У каждого модуля есть явный public API.» — найдена во фрагменте 2

**Память после хода.**

> ## Цель
>
> Перевести frontend-проект с FSD на FEOD.
>
> ## Уточнения
>
> - Проект — frontend-проект на TypeScript, использующий архитектуру FSD; планируется переход на FEOD.
> - В проекте около 40 страниц.
> - Текущие слои FSD: app, pages, widgets, features, entities, shared.
> - Слой `shared` при переезде нужно разобрать на `common`, `global` и продуктовые modules: нейтральные UI-примитивы, utilities, framework helpers и общие типы переходят в `common`, декларации и polyfills — в `global`, а код с продуктовым смыслом не должен оставаться в `common`.
> - `shared` не является автоматическим `common`: доменный код из него должен уйти в продуктовые modules.
> - Технические UI primitives не стоит оформлять как модули, так как у них нет продуктовой ответственности.
>
> ## Ограничения и термины
>
> - Deep imports в новом коде запрещены сразу, без исключений.

## s2. Проектирование модуля корзины

**Цель:** спроектировать модуль корзины cart по правилам FEOD. **Ключи цели:** корзин, FEOD. **Ключи памяти:** «public API» с хода 3; «global» с хода 6.

| Ход | Исход | Источники | Цитаты дословно | Цель сохранена | Ключи памяти | Строка поиска | мс |
|---|---|---|---|---|---|---|---|
| 1 | ответ | 2 из 2 | 2 из 2 | да | — | проектирование нового модуля корзины cart для интернет-магазина по FEOD шаг за шагом | 4 607 |
| 2 | ответ | 1 из 1 | 1 из 1 | да | — | минимальный контракт нового модуля корзины cart по FEOD | 3 788 |
| 3 | ответ | 4 из 4 | 4 из 4 | да | 1 из 1 | public API модуля cart по FEOD только файл index.ts | 4 088 |
| 4 | ответ | 5 из 5 | 5 из 5 | да | 1 из 1 | Что модуль корзины должен экспортировать наружу через корневой index.ts и что оставить внутри модуля, при public API как только файл index.ts модуля cart по FEOD | 5 067 |
| 5 | ответ | 3 из 3 | 3 из 3 | да | 1 из 1 | Можно ли модулю корзины импортировать данные товара из модуля catalog напрямую по FEOD при условии что public API модуля — только файл index.ts | 4 873 |
| 6 | ответ | 3 из 3 | 3 из 3 | да | 2 из 2 | Какие ограничения по размещению общего кода корзины и каталога при проектировании модуля корзины по FEOD, если общий код не кладётся в global | 5 014 |
| 7 | ответ | — | — | да | 2 из 2 | какие файлы и код допустимо хранить на уровне global по FEOD | 4 932 |
| 8 | не знаю (модель) | — | — | да | 2 из 2 | куда положить общие типы цены и форматирование цены для модуля cart и catalog по FEOD, если общий код корзины и каталога не кладётся в global, public API модуля — только index.ts | 4 692 |
| 9 | не знаю (модель) | — | — | да | 2 из 2 | Где хранить API-клиент для запросов корзины в новом модуле cart по FEOD при ограничении что public API модуля это только index.ts и общий код корзины и каталога не кладётся в global | 3 827 |
| 10 | не знаю (пустой контекст) | — | — | да | 2 из 2 | Какую версию React выбрать для модуля корзины | 2 370 |
| 11 | ответ | 3 из 3 | 2 из 3 | да | 2 из 2 | импорт корзины страницами через public API index.ts модуля корзины | 5 490 |
| 12 | ответ | 3 из 3 | 3 из 3 | да | 2 из 2 | Итог структура модуля cart по FEOD: новый модуль корзины; данные товара из модуля catalog; общие типы цены и форматирование цены не в global; public API только index.ts модуля; внешний код и pages импортируют модуль из корня через public API, не через внутренние сегменты; в корневом index.ts только явные публичные exports; импорт вида import { CheckoutSummary } from "@/pages/checkout/ui/CheckoutSummary" — deep import, страница не источник переиспользования. | 5 251 |

### s2 · ход 1

**Реплика.** Я проектирую новый модуль корзины (cart) для интернет-магазина по FEOD. Помоги шаг за шагом.

**Строка поиска:** проектирование нового модуля корзины cart для интернет-магазина по FEOD шаг за шагом

| Фрагмент | Сходство | Файл | Разделы | chunk_id |
|---|---|---|---|---|
| 1 | 0.595 | `get-started/feod-in-5-minutes.md` | FEOD за 5 минут › 2. Начинайте с модуля; FEOD за 5 минут › 3. Не обходите public API | `structure:get-started/feod-in-5-minutes.md#001-89a659fb` |
| 2 | 0.595 | `get-started/is-feod-for-my-project.md` | Подходит ли FEOD моему проекту › Good example; Подходит ли FEOD моему проекту › Bad example; Подходит ли FEOD моему проекту › Решение; Подходит ли FEOD моему проекту › Связанные страницы | `structure:get-started/is-feod-for-my-project.md#002-d41120c4` |
| 3 | 0.579 | `get-started/overview.md` | FEOD: методология frontend-архитектуры › Куда идти дальше; FEOD: методология frontend-архитектуры › Связанные страницы | `structure:get-started/overview.md#005-2d3aeb5b` |
| 4 | 0.558 | `get-started/overview.md` | FEOD: методология frontend-архитектуры | `structure:get-started/overview.md#000-41b04377` |
| 5 | 0.550 | `reference/glossary.md` | Глоссарий › Термины | `structure:reference/glossary.md#002-98ffd897` |

Время этапов, с: память 1.6, rewrite 0.9, поиск 0.1, ответ 2.1

> Начните с модуля: модуль — основная единица FEOD, он хранит продуктовую ответственность и открывает наружу только явный контракт [1]. Структуру нового модуля корзины можно взять из примера: `src/modules/cart/` с папками `ui/` и `model/` и файлом `index.ts` [1]. В `index.ts` публикуйте только то, что нужно потребителям, — например `CartSummary` и `useCart` — так, чтобы внешний код использовал только `@/modules/cart` [1]. Не обходите public API: импорт вида `import { CartSummary } from '@/modules/cart/ui/cart-summary'` — нарушение, потому что внешний код зависит от внутреннего файла модуля [1]. Корзину имеет смысл держать среди продуктовых модулей рядом с каталогом и оформлением заказа, чтобы не смешивать эти сценарии [2]. Если проект уже имеет продуктовые области, начинайте с минимального каркаса FEOD и public API модулей, а не создавайте пустые уровни ради соответствия [2].
>
> Источники:
> - [1] `get-started/feod-in-5-minutes.md` › FEOD за 5 минут › 2. Начинайте с модуля; FEOD за 5 минут › 3. Не обходите public API · `structure:get-started/feod-in-5-minutes.md#001-89a659fb` · https://github.com/feod-architecture/feod-docs/blob/f00eaf533cfee37f67e118c96291d535b0895a6f/docs/get-started/feod-in-5-minutes.md
> - [2] `get-started/is-feod-for-my-project.md` › Подходит ли FEOD моему проекту › Good example; Подходит ли FEOD моему проекту › Bad example; Подходит ли FEOD моему проекту › Решение; Подходит ли FEOD моему проекту › Связанные страницы · `structure:get-started/is-feod-for-my-project.md#002-d41120c4` · https://github.com/feod-architecture/feod-docs/blob/f00eaf533cfee37f67e118c96291d535b0895a6f/docs/get-started/is-feod-for-my-project.md
>
> Цитаты:
> - [1] «Модуль - основная единица FEOD. Он хранит продуктовую ответственность и открывает наружу только явный контракт.» — найдена во фрагменте 1
> - [2] «Если проект уже имеет продуктовые области, начинайте с минимального каркаса FEOD и public API модулей.» — найдена во фрагменте 2

**Память после хода.**

> ## Цель
>
> Пользователь проектирует новый модуль корзины (cart) для интернет-магазина по FEOD.
>
> ## Уточнения
>
> - Модуль корзины — новый.
> - Проектирование ведётся по FEOD.
>
> ## Ограничения и термины
>
> —

### s2 · ход 2

**Реплика.** Из чего должен состоять минимальный контракт модуля?

**Строка поиска:** минимальный контракт нового модуля корзины cart по FEOD

| Фрагмент | Сходство | Файл | Разделы | chunk_id |
|---|---|---|---|---|
| 1 | 0.574 | `get-started/feod-in-5-minutes.md` | FEOD за 5 минут › 2. Начинайте с модуля; FEOD за 5 минут › 3. Не обходите public API | `structure:get-started/feod-in-5-minutes.md#001-89a659fb` |
| 2 | 0.557 | `reference/module-contract.md` | Контракт модуля › Минимальный контракт | `structure:reference/module-contract.md#001-67181b9f` |

Время этапов, с: память 1.2, rewrite 1.0, поиск 0.1, ответ 1.5

> Минимальный контракт модуля состоит из пяти частей: название модуля, ответственность, public API, внутренние детали и ограничения зависимостей. Название модуля фиксируется в имени директории в `modules` и показывает продуктовую область. Ответственность фиксируется в README или коротком описании в review и ограничивает рост модуля. Public API фиксируется в корневом `index.ts` и даёт поддерживаемую поверхность импорта. Внутренние детали — это директории `ui`, `model`, `api`, `lib` и другие; они могут меняться без внешнего контракта. Ограничения зависимостей фиксируются в README, review checklist или FEOD config и помогают не создать скрытые связи.
>
> Источники:
> - [2] `reference/module-contract.md` › Контракт модуля › Минимальный контракт · `structure:reference/module-contract.md#001-67181b9f` · https://github.com/feod-architecture/feod-docs/blob/f00eaf533cfee37f67e118c96291d535b0895a6f/docs/reference/module-contract.md
>
> Цитаты:
> - [2] «| Название модуля | имя директории в `modules` | Показывает продуктовую область |» — найдена во фрагменте 2

**Память после хода.**

> ## Цель
>
> Пользователь проектирует новый модуль корзины (cart) для интернет-магазина по FEOD.
>
> ## Уточнения
>
> - Модуль корзины — новый.
> - Проектирование ведётся по FEOD.
>
> ## Ограничения и термины
>
> —

### s2 · ход 3

**Реплика.** Договоримся о термине: под public API будем понимать только файл index.ts модуля.

**Строка поиска:** public API модуля cart по FEOD только файл index.ts

| Фрагмент | Сходство | Файл | Разделы | chunk_id |
|---|---|---|---|---|
| 1 | 0.739 | `get-started/feod-in-5-minutes.md` | FEOD за 5 минут › 2. Начинайте с модуля; FEOD за 5 минут › 3. Не обходите public API | `structure:get-started/feod-in-5-minutes.md#001-89a659fb` |
| 2 | 0.736 | `reference/naming.md` | Правила именования › index.ts | `structure:reference/naming.md#003-597362e8` |
| 3 | 0.700 | `core-concepts/public-api.md` | Публичный API › Bad example; Публичный API › Частые ошибки; Публичный API › Исключения; Публичный API › Связанные страницы | `structure:core-concepts/public-api.md#002-efcd99f6` |
| 4 | 0.683 | `reference/public-api.md` | Public API | `structure:reference/public-api.md#000-9492fcf3` |
| 5 | 0.666 | `core-concepts/public-api.md` | Публичный API; Публичный API › Короткое определение; Публичный API › Какую проблему решает | `structure:core-concepts/public-api.md#000-f01af1d3` |

Время этапов, с: память 1.1, rewrite 1.1, поиск 0.1, ответ 1.9

> Термин принят: под public API договоримся понимать только файл `index.ts` модуля. Это согласуется с документацией: для модуля таким входом обычно является корневой `index.ts` [5], а `index.ts` в корне FEOD-сущности обозначает её public API [2]. Ограничение тоже важно: не любой `index.ts` считается публичным для всего проекта — `index.ts` подмодуля может быть локальным входом внутри родителя [3]. Поэтому в нашем модуле корзины публичным API будет только корневой `src/modules/cart/index.ts` [1].
>
> Источники:
> - [5] `core-concepts/public-api.md` › Публичный API; Публичный API › Короткое определение; Публичный API › Какую проблему решает · `structure:core-concepts/public-api.md#000-f01af1d3` · https://github.com/feod-architecture/feod-docs/blob/f00eaf533cfee37f67e118c96291d535b0895a6f/docs/core-concepts/public-api.md
> - [2] `reference/naming.md` › Правила именования › index.ts · `structure:reference/naming.md#003-597362e8` · https://github.com/feod-architecture/feod-docs/blob/f00eaf533cfee37f67e118c96291d535b0895a6f/docs/reference/naming.md
> - [3] `core-concepts/public-api.md` › Публичный API › Bad example; Публичный API › Частые ошибки; Публичный API › Исключения; Публичный API › Связанные страницы · `structure:core-concepts/public-api.md#002-efcd99f6` · https://github.com/feod-architecture/feod-docs/blob/f00eaf533cfee37f67e118c96291d535b0895a6f/docs/core-concepts/public-api.md
> - [1] `get-started/feod-in-5-minutes.md` › FEOD за 5 минут › 2. Начинайте с модуля; FEOD за 5 минут › 3. Не обходите public API · `structure:get-started/feod-in-5-minutes.md#001-89a659fb` · https://github.com/feod-architecture/feod-docs/blob/f00eaf533cfee37f67e118c96291d535b0895a6f/docs/get-started/feod-in-5-minutes.md
>
> Цитаты:
> - [5] «Публичный API FEOD-сущности - это явный поддерживаемый вход, через который внешний код может использовать эту сущность. Для модуля таким входом обычно является корневой `index.ts`.» — найдена во фрагменте 5
> - [2] «`index.ts` в корне FEOD-сущности обозначает её public API.» — найдена во фрагменте 2
> - [3] «Считать любой `index.ts` публичным для всего проекта -> `index.ts` подмодуля может быть локальным входом внутри родителя.» — найдена во фрагменте 3
> - [1] «Внешний код использует только `@/modules/cart`.» — найдена во фрагменте 1

**Память после хода.**

> ## Цель
>
> Пользователь проектирует новый модуль корзины (cart) для интернет-магазина по FEOD.
>
> ## Уточнения
>
> - Модуль корзины — новый.
> - Проектирование ведётся по FEOD.
>
> ## Ограничения и термины
>
> - Под public API понимается только файл `index.ts` модуля.

### s2 · ход 4

**Реплика.** Что модуль корзины должен экспортировать наружу, а что оставить внутри?

**Строка поиска:** Что модуль корзины должен экспортировать наружу через корневой index.ts и что оставить внутри модуля, при public API как только файл index.ts модуля cart по FEOD

| Фрагмент | Сходство | Файл | Разделы | chunk_id |
|---|---|---|---|---|
| 1 | 0.768 | `reference/naming.md` | Правила именования › index.ts | `structure:reference/naming.md#003-597362e8` |
| 2 | 0.765 | `get-started/feod-in-5-minutes.md` | FEOD за 5 минут › 2. Начинайте с модуля; FEOD за 5 минут › 3. Не обходите public API | `structure:get-started/feod-in-5-minutes.md#001-89a659fb` |
| 3 | 0.706 | `reference/public-api.md` | Public API › Роль index.ts | `structure:reference/public-api.md#002-72f338c0` |
| 4 | 0.701 | `reference/public-api.md` | Public API › Что экспортировать | `structure:reference/public-api.md#003-4f2f9e82` |
| 5 | 0.699 | `reference/public-api.md` | Public API | `structure:reference/public-api.md#000-9492fcf3` |

Время этапов, с: память 1.0, rewrite 1.2, поиск 0.1, ответ 2.7

> Наружу из `index.ts` экспортируйте только стабильные элементы внешнего контракта: компоненты и функции, реально нужные потребителям, типы публичных props, параметров, результатов и событий, публичные hooks (для корзины — например `CartSummary` и `useCart`), а также минимальные domain-specific constants, без которых потребитель не сможет корректно использовать модуль [4]. Внутри остаётся всё, что не входит в этот поддерживаемый контракт: `index.ts` не обязан экспортировать всё содержимое модуля, его задача — оставить публичным только поддерживаемый контракт и скрыть детали реализации [3]. Внутренние директории `ui`, `api`, `model`, `lib` извне не импортируются [5]. Практически это значит: файлы вроде `ui/cart-summary.tsx` и `model/use-cart.ts` доступны потребителю только через корневой `index.ts`, а прямой импорт из внутренних файлов запрещён [2]. Корневой `index.ts` модуля содержит только явные публичные exports, без `export *` из внутренних директорий [1].
>
> Источники:
> - [4] `reference/public-api.md` › Public API › Что экспортировать · `structure:reference/public-api.md#003-4f2f9e82` · https://github.com/feod-architecture/feod-docs/blob/f00eaf533cfee37f67e118c96291d535b0895a6f/docs/reference/public-api.md
> - [3] `reference/public-api.md` › Public API › Роль index.ts · `structure:reference/public-api.md#002-72f338c0` · https://github.com/feod-architecture/feod-docs/blob/f00eaf533cfee37f67e118c96291d535b0895a6f/docs/reference/public-api.md
> - [5] `reference/public-api.md` › Public API · `structure:reference/public-api.md#000-9492fcf3` · https://github.com/feod-architecture/feod-docs/blob/f00eaf533cfee37f67e118c96291d535b0895a6f/docs/reference/public-api.md
> - [2] `get-started/feod-in-5-minutes.md` › FEOD за 5 минут › 2. Начинайте с модуля; FEOD за 5 минут › 3. Не обходите public API · `structure:get-started/feod-in-5-minutes.md#001-89a659fb` · https://github.com/feod-architecture/feod-docs/blob/f00eaf533cfee37f67e118c96291d535b0895a6f/docs/get-started/feod-in-5-minutes.md
> - [1] `reference/naming.md` › Правила именования › index.ts · `structure:reference/naming.md#003-597362e8` · https://github.com/feod-architecture/feod-docs/blob/f00eaf533cfee37f67e118c96291d535b0895a6f/docs/reference/naming.md
>
> Цитаты:
> - [4] «Из `index.ts` экспортируются только стабильные элементы внешнего контракта.» — найдена во фрагменте 4
> - [3] «`index.ts` не обязан экспортировать всё, что есть внутри модуля. Его задача обратная: оставить публичным только поддерживаемый контракт и скрыть детали реализации.» — найдена во фрагменте 3
> - [5] «`public API` модуля - это явный публичный контракт, через который модуль разрешено использовать извне.» — найдена во фрагменте 5
> - [2] «Нарушение: внешний код зависит от внутреннего файла модуля.» — найдена во фрагменте 2
> - [1] «корневой `index.ts` модуля или сущности `common` содержит только явные публичные exports;» — найдена во фрагменте 1

**Память после хода.**

> ## Цель
>
> Пользователь проектирует новый модуль корзины (cart) для интернет-магазина по FEOD.
>
> ## Уточнения
>
> - Модуль корзины — новый.
> - Проектирование ведётся по FEOD.
>
> ## Ограничения и термины
>
> - Под public API понимается только файл `index.ts` модуля.

### s2 · ход 5

**Реплика.** Корзине нужны данные товара из модуля catalog. Можно ли импортировать его напрямую?

**Строка поиска:** Можно ли модулю корзины импортировать данные товара из модуля catalog напрямую по FEOD при условии что public API модуля — только файл index.ts

| Фрагмент | Сходство | Файл | Разделы | chunk_id |
|---|---|---|---|---|
| 1 | 0.716 | `reference/naming.md` | Правила именования › index.ts | `structure:reference/naming.md#003-597362e8` |
| 2 | 0.712 | `get-started/feod-in-5-minutes.md` | FEOD за 5 минут › 2. Начинайте с модуля; FEOD за 5 минут › 3. Не обходите public API | `structure:get-started/feod-in-5-minutes.md#001-89a659fb` |
| 3 | 0.682 | `reference/code-smells.md` | Code smells › Deep imports › Как исправить; Code smells › Deep imports › Связанные правила | `structure:reference/code-smells.md#002-81809d5d` |
| 4 | 0.679 | `core-concepts/public-api.md` | Публичный API › Bad example; Публичный API › Частые ошибки; Публичный API › Исключения; Публичный API › Связанные страницы | `structure:core-concepts/public-api.md#002-efcd99f6` |
| 5 | 0.678 | `reference/public-api.md` | Public API | `structure:reference/public-api.md#000-9492fcf3` |

Время этапов, с: память 1.3, rewrite 1.4, поиск 0.1, ответ 2.1

> Да, но только через public API модуля catalog: внешний код импортирует чужую FEOD-сущность из её корня [1]. То есть корзина должна импортировать не `@/modules/catalog/ui/product-card` и не внутренние файлы, а символ из корневого `index.ts` модуля catalog [2]. Если нужного символа в public API catalog нет, сначала решите, должен ли он быть публичным контрактом: если да — добавьте явный export в корневой `index.ts`, если нет — перепишите потребителя через существующий публичный сценарий [3]. Прямой импорт внутреннего файла — это deep import, и он закрепляет внутренние пути модуля как внешний контракт [4]. При этом внутри самой FEOD-сущности внутренние файлы могут импортировать друг друга напрямую, если это не выходит за границу модуля [4].
>
> Источники:
> - [1] `reference/naming.md` › Правила именования › index.ts · `structure:reference/naming.md#003-597362e8` · https://github.com/feod-architecture/feod-docs/blob/f00eaf533cfee37f67e118c96291d535b0895a6f/docs/reference/naming.md
> - [2] `get-started/feod-in-5-minutes.md` › FEOD за 5 минут › 2. Начинайте с модуля; FEOD за 5 минут › 3. Не обходите public API · `structure:get-started/feod-in-5-minutes.md#001-89a659fb` · https://github.com/feod-architecture/feod-docs/blob/f00eaf533cfee37f67e118c96291d535b0895a6f/docs/get-started/feod-in-5-minutes.md
> - [3] `reference/code-smells.md` › Code smells › Deep imports › Как исправить; Code smells › Deep imports › Связанные правила · `structure:reference/code-smells.md#002-81809d5d` · https://github.com/feod-architecture/feod-docs/blob/f00eaf533cfee37f67e118c96291d535b0895a6f/docs/reference/code-smells.md
>
> Цитаты:
> - [1] «внешний код импортирует чужую FEOD-сущность из её корня» — найдена во фрагменте 1
> - [2] «Плохо:» — найдена во фрагменте 2
> - [3] «Если нужного символа нет в public API, сначала решите, должен ли он быть публичным контрактом.» — найдена во фрагменте 3
>
> Замечания:
> - цитата [2] короче 20 символов

**Память после хода.**

> ## Цель
>
> Пользователь проектирует новый модуль корзины (cart) для интернет-магазина по FEOD.
>
> ## Уточнения
>
> - Модуль корзины — новый.
> - Проектирование ведётся по FEOD.
> - Корзине нужны данные товара из модуля catalog.
>
> ## Ограничения и термины
>
> - Под public API понимается только файл `index.ts` модуля.

Замечания к ответу: цитата [2] короче 20 символов.

### s2 · ход 6

**Реплика.** Ограничение: общий код корзины и каталога мы не кладём в global.

**Строка поиска:** Какие ограничения по размещению общего кода корзины и каталога при проектировании модуля корзины по FEOD, если общий код не кладётся в global

| Фрагмент | Сходство | Файл | Разделы | chunk_id |
|---|---|---|---|---|
| 1 | 0.655 | `get-started/overview.md` | FEOD: методология frontend-архитектуры › Чем FEOD отличается от обычной модульной архитектуры | `structure:get-started/overview.md#002-62c15755` |
| 2 | 0.654 | `get-started/faq.md` | FAQ › Можно ли использовать FEOD без common?; FAQ › Можно ли модулю импортировать другой модуль? | `structure:get-started/faq.md#001-d645a78d` |
| 3 | 0.652 | `get-started/is-feod-for-my-project.md` | Подходит ли FEOD моему проекту › Good example; Подходит ли FEOD моему проекту › Bad example; Подходит ли FEOD моему проекту › Решение; Подходит ли FEOD моему проекту › Связанные страницы | `structure:get-started/is-feod-for-my-project.md#002-d41120c4` |
| 4 | 0.634 | `core-concepts/levels.md` | Уровни › Уровень global; Уровни › Уровень global › Назначение; Уровни › Уровень global › Кто может импортировать; Уровни › Уровень global › Что может импортировать | `structure:core-concepts/levels.md#012-ae9f98df` |
| 5 | 0.634 | `get-started/feod-in-5-minutes.md` | FEOD за 5 минут › 2. Начинайте с модуля; FEOD за 5 минут › 3. Не обходите public API | `structure:get-started/feod-in-5-minutes.md#001-89a659fb` |

Время этапов, с: память 1.4, rewrite 1.0, поиск 0.1, ответ 2.6

> Зафиксировано: общий код корзины и каталога не кладём в `global`. Это согласуется с ролью `global`: он хранит код, действующий на всё приложение целиком — shims, polyfills, глобальные декларации окружения, runtime-инициализацию и редкие side-effect подключения [4]. Более того, `global` не импортируется напрямую из `app`, `pages`, `modules`, `common` и сам не импортирует ничего из уровней FEOD [4], поэтому общий код корзины и каталога там не может быть использован продуктовыми модулями. Импорт между корзиной и каталогом при этом допустим, если идёт через public API другого модуля и не создаёт циклическую или скрытую зависимость [2]; с учётом вашего термина — через корневой `index.ts` модуля catalog [5]. Общий код двух модулей ищите в нейтральном месте с явной ролью, а не в продуктовых модулях случайно [2], при этом `global` для этой роли не подходит [4].
>
> Источники:
> - [4] `core-concepts/levels.md` › Уровни › Уровень global; Уровни › Уровень global › Назначение; Уровни › Уровень global › Кто может импортировать; Уровни › Уровень global › Что может импортировать · `structure:core-concepts/levels.md#012-ae9f98df` · https://github.com/feod-architecture/feod-docs/blob/f00eaf533cfee37f67e118c96291d535b0895a6f/docs/core-concepts/levels.md
> - [2] `get-started/faq.md` › FAQ › Можно ли использовать FEOD без common?; FAQ › Можно ли модулю импортировать другой модуль? · `structure:get-started/faq.md#001-d645a78d` · https://github.com/feod-architecture/feod-docs/blob/f00eaf533cfee37f67e118c96291d535b0895a6f/docs/get-started/faq.md
> - [5] `get-started/feod-in-5-minutes.md` › FEOD за 5 минут › 2. Начинайте с модуля; FEOD за 5 минут › 3. Не обходите public API · `structure:get-started/feod-in-5-minutes.md#001-89a659fb` · https://github.com/feod-architecture/feod-docs/blob/f00eaf533cfee37f67e118c96291d535b0895a6f/docs/get-started/feod-in-5-minutes.md
>
> Цитаты:
> - [4] «`global` не импортируется напрямую из `app`, `pages`, `modules`, `common`.» — найдена во фрагменте 4
> - [2] «Да, если импорт идёт через public API другого модуля и не создаёт циклическую или скрытую зависимость.» — найдена во фрагменте 2
> - [5] «Внешний код использует только `@/modules/cart`.» — найдена во фрагменте 5

**Память после хода.**

> ## Цель
>
> Пользователь проектирует новый модуль корзины (cart) для интернет-магазина по FEOD.
>
> ## Уточнения
>
> - Модуль корзины — новый.
> - Проектирование ведётся по FEOD.
> - Корзине нужны данные товара из модуля catalog.
>
> ## Ограничения и термины
>
> - Под public API понимается только файл `index.ts` модуля.
> - Общий код корзины и каталога не кладётся в global.

### s2 · ход 7

**Реплика.** Тогда что вообще можно хранить на уровне global?

**Строка поиска:** какие файлы и код допустимо хранить на уровне global по FEOD

| Фрагмент | Сходство | Файл | Разделы | chunk_id |
|---|---|---|---|---|
| 1 | 0.666 | `core-concepts/levels.md` | Уровни › Уровень global; Уровни › Уровень global › Назначение; Уровни › Уровень global › Кто может импортировать; Уровни › Уровень global › Что может импортировать | `structure:core-concepts/levels.md#012-ae9f98df` |
| 2 | 0.643 | `structure/global.md` | Global › Bad example; Global › Частые ошибки; Global › Исключения; Global › Связанные страницы | `structure:structure/global.md#004-27d5e9b1` |
| 3 | 0.640 | `core-concepts/levels.md` | Уровни › Правило; Уровни › Почему; Уровни › Быстрый reference | `structure:core-concepts/levels.md#001-1060540c` |
| 4 | 0.621 | `get-started/overview.md` | FEOD: методология frontend-архитектуры › Верхние уровни FEOD | `structure:get-started/overview.md#004-debd75dc` |
| 5 | 0.619 | `core-concepts/levels.md` | Уровни › Уровень global › Что нельзя хранить; Уровни › Уровень global › Good example; Уровни › Уровень global › Bad example | `structure:core-concepts/levels.md#013-d1e3079d` |

Время этапов, с: память 1.4, rewrite 0.9, поиск 0.1, ответ 2.6

> На уровне `global` хранится только код, действующий на всё приложение целиком: shims, polyfills, глобальные декларации окружения, runtime-инициализацию и редкие side-effect подключения [1]. Из примеров это подключение вроде `import "focus-visible"` и `import "./styles.css"` [5]. С `global` нельзя импортировать ничего из уровней FEOD [1], и он не импортируется напрямую из `app`, `pages`, `modules`, `common` — подключение идёт через entrypoint, конфигурацию сборщика, HTML-шаблон или другой инфраструктурный механизм [1]. Поэтому в `global` нельзя хранить обычные прикладные helpers, публичный API для модулей и страниц, код, зависящий от `app`, `pages`, `modules` или `common`, а также продуктовые сценарии, UI и бизнес-логику [5]. Исключения допускаются только для инфраструктурного подключения, например entrypoint, test setup или build-time конфигурация [2].
>
> ## Источники
>
> - [1]
> - [5]
> - [2]
>
> ## Цитаты
>
> - [1] «`global` хранит код, который действует на всё приложение целиком: shims, polyfills, глобальные декларации окружения, runtime-инициализацию и редкие side-effect подключения.»
> - [5] «В `global` нельзя хранить:»
> - [2] «Исключения допускаются только для инфраструктурного подключения.»
>
> Источники: нет
>
> Цитаты: нет
>
> Замечания:
> - ответ не разбит на разделы «Ответ», «Источники», «Цитаты» или «Не знаю», «Уточнение»

**Память после хода.**

> ## Цель
>
> Пользователь проектирует новый модуль корзины (cart) для интернет-магазина по FEOD.
>
> ## Уточнения
>
> - Модуль корзины — новый.
> - Проектирование ведётся по FEOD.
> - Корзине нужны данные товара из модуля catalog.
>
> ## Ограничения и термины
>
> - Под public API понимается только файл `index.ts` модуля.
> - Общий код корзины и каталога не кладётся в global.

Замечания к ответу: ответ не разбит на разделы «Ответ», «Источники», «Цитаты» или «Не знаю», «Уточнение».

### s2 · ход 8

**Реплика.** А куда положить общие типы цены и форматирование цены?

**Строка поиска:** куда положить общие типы цены и форматирование цены для модуля cart и catalog по FEOD, если общий код корзины и каталога не кладётся в global, public API модуля — только index.ts

| Фрагмент | Сходство | Файл | Разделы | chunk_id |
|---|---|---|---|---|
| 1 | 0.694 | `get-started/feod-in-5-minutes.md` | FEOD за 5 минут › 2. Начинайте с модуля; FEOD за 5 минут › 3. Не обходите public API | `structure:get-started/feod-in-5-minutes.md#001-89a659fb` |
| 2 | 0.682 | `reference/naming.md` | Правила именования › index.ts | `structure:reference/naming.md#003-597362e8` |
| 3 | 0.659 | `reference/code-smells.md` | Code smells › Deep imports › Как исправить; Code smells › Deep imports › Связанные правила | `structure:reference/code-smells.md#002-81809d5d` |
| 4 | 0.645 | `reference/code-smells.md` | Code smells › Business logic in pages, app, common or global › Симптом; Code smells › Business logic in pages, app, common or global › Почему проблема | `structure:reference/code-smells.md#007-af5c023b` |
| 5 | 0.644 | `structure/modules.md` | Modules; Modules › Короткое определение; Modules › Какую проблему решает | `structure:structure/modules.md#000-c49b0d06` |

Время этапов, с: память 1.5, rewrite 1.3, поиск 0.1, ответ 1.9

> Не знаю. Во фрагментах нет сведений о том, куда именно следует помещать общие типы цены и форматирование цены: упоминается только пример импорта `formatMoney` из `@/common/format` [3], но правила размещения таких общих сущностей по фрагментам не выводятся. Также во фрагментах нет сведений о нейтральном месте для общего кода корзины и каталога при ограничении, что в `global` его класть нельзя.
>
> Уточнение: Что именно вы хотите уточнить по этим фрагментам: подойдёт ли уровень `common` для общих типов цены и форматирования цены, учитывая ваш запрет на `global`?

**Память после хода.**

> ## Цель
>
> Пользователь проектирует новый модуль корзины (cart) для интернет-магазина по FEOD.
>
> ## Уточнения
>
> - Модуль корзины — новый.
> - Проектирование ведётся по FEOD.
> - Корзине нужны данные товара из модуля catalog.
> - Есть общие типы цены и форматирование цены, которые нужно куда-то положить.
>
> ## Ограничения и термины
>
> - Под public API понимается только файл `index.ts` модуля.
> - Общий код корзины и каталога не кладётся в global.

### s2 · ход 9

**Реплика.** Где хранить API-клиент для запросов корзины?

**Строка поиска:** Где хранить API-клиент для запросов корзины в новом модуле cart по FEOD при ограничении что public API модуля это только index.ts и общий код корзины и каталога не кладётся в global

| Фрагмент | Сходство | Файл | Разделы | chunk_id |
|---|---|---|---|---|
| 1 | 0.710 | `get-started/feod-in-5-minutes.md` | FEOD за 5 минут › 2. Начинайте с модуля; FEOD за 5 минут › 3. Не обходите public API | `structure:get-started/feod-in-5-minutes.md#001-89a659fb` |
| 2 | 0.707 | `reference/naming.md` | Правила именования › index.ts | `structure:reference/naming.md#003-597362e8` |
| 3 | 0.671 | `reference/public-api.md` | Public API | `structure:reference/public-api.md#000-9492fcf3` |
| 4 | 0.665 | `core-concepts/public-api.md` | Публичный API › Bad example; Публичный API › Частые ошибки; Публичный API › Исключения; Публичный API › Связанные страницы | `structure:core-concepts/public-api.md#002-efcd99f6` |
| 5 | 0.664 | `core-concepts/public-api.md` | Публичный API; Публичный API › Короткое определение; Публичный API › Какую проблему решает | `structure:core-concepts/public-api.md#000-f01af1d3` |

Время этапов, с: память 1.1, rewrite 1.0, поиск 0.1, ответ 1.6

> Не знаю. Во фрагментах нет сведений о том, где хранить API-клиент для запросов корзины: упоминается только директория `model` внутри модуля [1], но правила размещения API-клиента по фрагментам не описаны. Нет также указаний, должен ли API-клиент быть публичным контрактом модуля.
>
> Уточнение: Нужно ли считать API-клиент частью внутренней реализации модуля корзины, или он должен быть доступен другим FEOD-сущностям через публичный API?

**Память после хода.**

> ## Цель
>
> Пользователь проектирует новый модуль корзины (cart) для интернет-магазина по FEOD.
>
> ## Уточнения
>
> - Модуль корзины — новый.
> - Проектирование ведётся по FEOD.
> - Корзине нужны данные товара из модуля catalog.
> - Есть общие типы цены и форматирование цены, которые нужно куда-то положить.
>
> ## Ограничения и термины
>
> - Под public API понимается только файл `index.ts` модуля.
> - Общий код корзины и каталога не кладётся в global.

### s2 · ход 10

**Реплика.** Какую версию React нам выбрать для корзины?

**Строка поиска:** Какую версию React выбрать для модуля корзины

Контекст пуст: модель не вызывалась.

Время этапов, с: память 1.4, rewrite 0.9, поиск 0.1, ответ 0.0

> Не знаю: ни один фрагмент не достиг порога сходства 0.55 (лучшее 0.474).
> Уточните вопрос: назовите раздел, термин или пример, о котором идёт речь.
>
> Ближайшие разделы ниже порога:
> - `get-started/is-feod-for-my-project.md` › Подходит ли FEOD моему проекту › Good example · 0.474
> - `guides/where-to-place-code.md` › Где хранить код › Шаги · 0.472
> - `guides/design-module.md` › Как проектировать модуль › Шаги · 0.462

**Память после хода.**

> ## Цель
>
> Пользователь проектирует новый модуль корзины (cart) для интернет-магазина по FEOD.
>
> ## Уточнения
>
> - Модуль корзины — новый.
> - Проектирование ведётся по FEOD.
> - Корзине нужны данные товара из модуля catalog.
> - Есть общие типы цены и форматирование цены, которые нужно куда-то положить.
>
> ## Ограничения и термины
>
> - Под public API понимается только файл `index.ts` модуля.
> - Общий код корзины и каталога не кладётся в global.

### s2 · ход 11

**Реплика.** Вернёмся к корзине: как страницы будут её импортировать?

**Строка поиска:** импорт корзины страницами через public API index.ts модуля корзины

| Фрагмент | Сходство | Файл | Разделы | chunk_id |
|---|---|---|---|---|
| 1 | 0.638 | `reference/public-api.md` | Public API › Роль index.ts | `structure:reference/public-api.md#002-72f338c0` |
| 2 | 0.629 | `reference/code-smells.md` | Code smells › Accidental public API › Как исправить; Code smells › Accidental public API › Связанные правила; Code smells › Page as reusable source; Code smells › Page as reusable source › Симптом | `structure:reference/code-smells.md#011-e8b0e65e` |
| 3 | 0.624 | `reference/naming.md` | Правила именования › index.ts | `structure:reference/naming.md#003-597362e8` |
| 4 | 0.623 | `core-concepts/dependency-rules.md` | Правила зависимостей › Good example; Правила зависимостей › Bad example | `structure:core-concepts/dependency-rules.md#006-866221ec` |
| 5 | 0.623 | `reference/code-smells.md` | Code smells › Over-nested submodules › Связанные правила; Code smells › Accidental public API; Code smells › Accidental public API › Симптом; Code smells › Accidental public API › Почему проблема | `structure:reference/code-smells.md#010-1071d3ca` |

Время этапов, с: память 1.3, rewrite 1.7, поиск 0.1, ответ 2.5

> Страницы импортируют корзину по тем же правилам, что и любую FEOD-сущность: внешний код импортирует модуль из его корня, то есть из точкой public API является файл `index.ts` в корне модуля [1]. `pages` может импортировать `modules` и `common`, и оба импорта должны идти через public API, а путь не должен указывать на внутренние сегменты [4]. Пример корректного импорта из модуля: `import { ProductList } from "@/modules/catalog";` [4]. Соответственно корзина должна оставить в своём корневом `index.ts` только явные публичные exports [3], и если символ нужен только внутри модуля, экспортировать его не следует [2]. Импорт вида `import { CheckoutSummary } from "@/pages/checkout/ui/CheckoutSummary";` — это deep import, а страница не должна быть источником переиспользования [2].
>
> Источники:
> - [1] `reference/public-api.md` › Public API › Роль index.ts · `structure:reference/public-api.md#002-72f338c0` · https://github.com/feod-architecture/feod-docs/blob/f00eaf533cfee37f67e118c96291d535b0895a6f/docs/reference/public-api.md
> - [4] `core-concepts/dependency-rules.md` › Правила зависимостей › Good example; Правила зависимостей › Bad example · `structure:core-concepts/dependency-rules.md#006-866221ec` · https://github.com/feod-architecture/feod-docs/blob/f00eaf533cfee37f67e118c96291d535b0895a6f/docs/core-concepts/dependency-rules.md
> - [3] `reference/naming.md` › Правила именования › index.ts · `structure:reference/naming.md#003-597362e8` · https://github.com/feod-architecture/feod-docs/blob/f00eaf533cfee37f67e118c96291d535b0895a6f/docs/reference/naming.md
>
> Цитаты:
> - [1] «Файл `index.ts` в корне модуля является точкой public API модуля.» — найдена во фрагменте 1
> - [4] «```ts // pages/catalog/ui/CatalogPage.tsx import { ProductList } from "@/modules/catalog"; import { PageLayout } from "@/common/page-layout"; ```» — найдена во фрагменте 4
> - [3] «Внешний код импортирует чужую FEOD-сущность из её корня.» — не найдена во фрагменте 3
>
> Замечания:
> - цитата [3] не найдена во фрагменте 3

**Память после хода.**

> ## Цель
>
> Пользователь проектирует новый модуль корзины (cart) для интернет-магазина по FEOD.
>
> ## Уточнения
>
> - Модуль корзины — новый.
> - Проектирование ведётся по FEOD.
> - Корзине нужны данные товара из модуля catalog.
> - Есть общие типы цены и форматирование цены, которые нужно куда-то положить.
>
> ## Ограничения и термины
>
> - Под public API понимается только файл `index.ts` модуля.
> - Общий код корзины и каталога не кладётся в global.

Замечания к ответу: цитата [3] не найдена во фрагменте 3.

### s2 · ход 12

**Реплика.** Подведи итог: структура модуля cart с учётом всех наших договорённостей.

**Строка поиска:** Итог структура модуля cart по FEOD: новый модуль корзины; данные товара из модуля catalog; общие типы цены и форматирование цены не в global; public API только index.ts модуля; внешний код и pages импортируют модуль из корня через public API, не через внутренние сегменты; в корневом index.ts только явные публичные exports; импорт вида import { CheckoutSummary } from "@/pages/checkout/ui/CheckoutSummary" — deep import, страница не источник переиспользования.

| Фрагмент | Сходство | Файл | Разделы | chunk_id |
|---|---|---|---|---|
| 1 | 0.792 | `get-started/feod-in-5-minutes.md` | FEOD за 5 минут › 2. Начинайте с модуля; FEOD за 5 минут › 3. Не обходите public API | `structure:get-started/feod-in-5-minutes.md#001-89a659fb` |
| 2 | 0.735 | `core-concepts/dependency-rules.md` | Правила зависимостей › Good example; Правила зависимостей › Bad example | `structure:core-concepts/dependency-rules.md#006-866221ec` |
| 3 | 0.725 | `core-concepts/public-api.md` | Публичный API › Bad example; Публичный API › Частые ошибки; Публичный API › Исключения; Публичный API › Связанные страницы | `structure:core-concepts/public-api.md#002-efcd99f6` |
| 4 | 0.717 | `guides/split-large-module.md` | Как разбивать большой модуль › Шаги | `structure:guides/split-large-module.md#002-56fb0181` |
| 5 | 0.716 | `reference/naming.md` | Правила именования › index.ts | `structure:reference/naming.md#003-597362e8` |

Время этапов, с: память 1.6, rewrite 1.2, поиск 0.1, ответ 2.4

> Модуль корзины начинайте как основную единицу FEOD с внутренними сегментами и корневым `index.ts` [1]: например `src/modules/cart/` с `ui/cart-summary.tsx`, `model/use-cart.ts` и `index.ts` [1]. В корневом `index.ts` держите только явные публичные exports, например `export { CartSummary } from './ui/cart-summary';` и `export { useCart } from './model/use-cart';` [1], без `export *` из внутренних директорий [5]. Внешний код использует только `@/modules/cart`, поэтому страницы будут импортировать корзину из её корня, а не из внутренних файлов [1]; `pages` может импортировать `modules`, и импорт идёт через public API без указания на внутренние сегменты [2]. Данные товара из `catalog` корзина тоже получает через public API каталога, а не через внутренние файлы, поскольку импорт чужой FEOD-сущности идёт из её корня [5]. Внутренние файлы модуля могут импортировать друг друга напрямую, если это не выходит за границу модуля [3], но внутри модуля не должно быть импорта из `pages` [2]. Общий код корзины и каталога не кладите в `global`: прикладной код не должен импортировать `global` [2], а в `common` можно выносить только нейтральный технический код — окончание фрагмента обрывается, полного условия по `common` во фрагментах нет [4].
>
> Источники:
> - [1] `get-started/feod-in-5-minutes.md` › FEOD за 5 минут › 2. Начинайте с модуля; FEOD за 5 минут › 3. Не обходите public API · `structure:get-started/feod-in-5-minutes.md#001-89a659fb` · https://github.com/feod-architecture/feod-docs/blob/f00eaf533cfee37f67e118c96291d535b0895a6f/docs/get-started/feod-in-5-minutes.md
> - [2] `core-concepts/dependency-rules.md` › Правила зависимостей › Good example; Правила зависимостей › Bad example · `structure:core-concepts/dependency-rules.md#006-866221ec` · https://github.com/feod-architecture/feod-docs/blob/f00eaf533cfee37f67e118c96291d535b0895a6f/docs/core-concepts/dependency-rules.md
> - [5] `reference/naming.md` › Правила именования › index.ts · `structure:reference/naming.md#003-597362e8` · https://github.com/feod-architecture/feod-docs/blob/f00eaf533cfee37f67e118c96291d535b0895a6f/docs/reference/naming.md
>
> Цитаты:
> - [1] «Внешний код использует только `@/modules/cart`.» — найдена во фрагменте 1
> - [2] «оба импорта идут через public API» — найдена во фрагменте 2
> - [5] «внешний код импортирует чужую FEOD-сущность из её корня» — найдена во фрагменте 5

**Память после хода.**

> ## Цель
>
> Пользователь проектирует новый модуль корзины (cart) для интернет-магазина по FEOD.
>
> ## Уточнения
>
> - Модуль корзины — новый.
> - Проектирование ведётся по FEOD.
> - Корзине нужны данные товара из модуля catalog.
> - Есть общие типы цены и форматирование цены, которые нужно куда-то положить.
>
> ## Ограничения и термины
>
> - Под public API понимается только файл `index.ts` модуля.
> - Общий код корзины и каталога не кладётся в global.
