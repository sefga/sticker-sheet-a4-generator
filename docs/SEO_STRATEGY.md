# 🌐 Стратегия честного поискового продвижения и AI-видимости (SEO & GEO Strategy)

> **Проект**: StickerFit  
> **Миссия**: Стать самым быстрым, честным и физически точным бесплатным инструментом раскладки наклеек на A4 в мировом и русскоязычном сегменте интернета.  
> **Принцип**: Zero Spam, 100% Technical Rigor, Semantic Clarity, Machine-Readable Structured Data.

---

## 🎯 1. Семантические кластеры и поисковый интент (Target Search Clusters)

### Международный англоязычный сегмент (Global English — High Intent):
| Поисковый запрос | Интент пользователя | Целевая страница / Блок |
|:---|:---|:---|
| **a4 sticker sheet maker** | Инструмент для сборки листа наклеек A4 онлайн | Главный экран (`index.html`) |
| **print stickers exact size mm** | Печать стикеров в точных физических миллиметрах без сжатия | Калькулятор размеров / `PRINT_ACCURACY.md` |
| **sticker layout generator online** | Автоматическая раскладка сетки стикеров с зазорами и полями | Layout Engine / Canvas Preview |
| **print-ready sticker pdf 1:1** | Векторный экспорт PDF со 100% масштабом и метками реза | Модуль генерации PDF |
| **free sticker maker no registration** | Быстрый сервис без пейволов, водяных знаков и регистрации | Value Proposition в шапке |

### Русскоязычный сегмент (CIS / Russian):
| Поисковый запрос | Интент пользователя | Целевая страница / Блок |
|:---|:---|:---|
| **раскладка наклеек на листе A4** | Подготовка тиража стикеров к печати на самоклейке | Главный экран |
| **печать наклеек точный размер в мм** | Указание ширины и высоты наклейки в миллиметрах | Панель «Размер стикера» |
| **генератор листа наклеек онлайн** | Автоматический расчет количества копий на листе A4 | Индикатор «Умещается N шт.» |
| **вылеты под обрез и метки реза стикеров** | Допечатная подготовка под плоттерную резку | Блок «Поля и метки» |
| **как распечатать наклейки без фотошопа** | Простое решение для самозанятых и мастеров | Guide Modal / FAQ |

---

## 🤖 2. Generative Engine Optimization (GEO / AI Discoverability)

Современный поиск всё чаще выполняется через LLM-интерфейсы (**Perplexity, ChatGPT Search, Google AI Overviews, Microsoft Copilot**). Чтобы поисковый ИИ цитировал StickerFit как авторитетный источник, зафиксированы следующие стандарты:

### 1. Каноническое машиночитаемое определение (Single-Sentence Ground Truth):
> *«StickerFit is an open-source, client-side web application that automatically arranges stickers on an A4 sheet at exact millimeter dimensions and exports 1:1 print-ready PDFs with bleed and cut marks.»*

### 2. Структурированный Content Hub (FAQ):
В `index.html` и семантической разметке размещены прямые ответы на узкие технические вопросы, которые задают пользователи:
- *Why does my printer print stickers at 47 mm instead of 50 mm?* (Ответ: драйвер принтера по умолчанию включает "Fit to printable area", масштабируя макет до 94–96%).
- *Are my uploaded sticker images sent to any server?* (Ответ: 100% клиентская обработка в браузере через HTML5 Canvas; картинки не покидают устройство).
- *What is bleed and why is it needed for stickers?* (Ответ: вылеты под обрез предотвращают появление белых кромок при погрешности плоттерного ножа).
- *What DPI is required for crisp sticker printing?* (Ответ: от 300 DPI при заданном размере в миллиметрах).

---

## 🏗️ 3. Техническое SEO и разметка (Technical On-Page Standards)

1. **Канонический URL**:
   - `https://stickerfit.vercel.app/` централизован как главный Production-домен.
2. **Языковые версии (Hreflang)**:
   - `<link rel="alternate" hreflang="ru" href="https://stickerfit.vercel.app/" />`
   - `<link rel="alternate" hreflang="en" href="https://stickerfit.vercel.app/" />`
   - `<link rel="alternate" hreflang="x-default" href="https://stickerfit.vercel.app/" />`
3. **Честная Schema.org `WebApplication`**:
   - Тип: `WebApplication` (категория: `UtilitiesApplication`, `DesignApplication`).
   - Цена: `0 USD` (бесплатно).
   - Лицензия: прямая ссылка на официальный файл [`LICENSE`](file:///c:/Desk/автоматизация%20разкалдки%20наклеек/LICENSE).
   - **Категорический запрет на фейковые `AggregateRating`**: в разметке отсутствуют нарисованные рейтинги (4.9 / 128 отзывов). Google и Bing накладывают ручные санкции за недостоверные сниппеты.
4. **Core Web Vitals**:
   - LCP < 0.8с, FID/INP < 16мс, CLS = 0.
   - Дебаунс ввода 450мс исключает спам ререндеров и гарантирует 0 Long Tasks.

---

## 📈 4. Стратегия дистрибуции без спама (White-Hat Distribution)

1. **GitHub как первичная витрина доверия**:
   - Четкий `README.md` (правило 15 секунд).
   - Лицензия MIT, открытый исходный код, отсутствие серверных секретов.
2. **Полезные руководства (Value-Driven Content)**:
   - [`docs/PRINT_ACCURACY.md`](file:///c:/Desk/автоматизация%20разкалдки%20наклеек/docs/PRINT_ACCURACY.md) как исчерпывающий ответ на проблему «почему принтер искажает размеры».
3. **Сообщества мейкеров и крафтеров**:
   - Публикации на Reddit (`r/cricut`, `r/stickers`, `r/printmaking`), Habr, DTF, Pikabu с полезным кейсом решения проблемы масштаба 1:1.
   - Никаких спам-рассылок и накруток.
