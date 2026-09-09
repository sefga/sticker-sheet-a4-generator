# 🚀 StickerFit: Пакет материалов для публикации и дистрибуции (Distribution Launch Pack)

> **Назначение**: Готовые к публикации посты для целевых сообществ (Reddit, Хабр, Пикабу, VC.ru, Telegram, Twitter/X, Product Hunt).  
> **Принцип**: Никакого навязчивого спама. В каждом посте — решение реальной проблемы (печать стикеров в масштабе 1:1 без PhotoShop), честная демонстрация открытого продукта и полезная инструкция.

---

## 📑 Навигация по площадкам

1. [Reddit r/stickers & r/cricut](#1-reddit-rstickers--rcricut)
2. [Reddit r/SideProject & r/webdev](#2-reddit-rsideproject--rwebdev)
3. [Хабр (Habr) & VC.ru](#3-хабр-habr--vcru)
4. [Пикабу (Pikabu)](#4-пикабу-pikabu)
5. [Telegram (Пост для каналов и чатов)](#5-telegram-пост-для-каналов)
6. [Twitter / X (Тред запуска)](#6-twitter--x-тред)
7. [Product Hunt (Материалы запуска)](#7-product-hunt)

---

## 1. Reddit r/stickers & r/cricut

* **Ссылка для публикации**: [https://www.reddit.com/r/stickers/submit](https://www.reddit.com/r/stickers/submit) / [https://www.reddit.com/r/cricut/submit](https://www.reddit.com/r/cricut/submit)
* **Flair**: `Resource` / `Tool` / `Discussion`
* **Прикрепить**: Скриншот [`docs/screenshots/desktop-ui.png`](https://raw.githubusercontent.com/sefga/stickerfit/main/docs/screenshots/desktop-ui.png)

### Заголовок (Title):
> **I built a free, privacy-first web tool to arrange stickers on A4 sheets with exact 1:1 mm print sizes (no Photoshop needed)**

### Текст поста (Body):
```markdown
Hey everyone! 👋

If you've ever designed stickers in Canva/Procreate and tried to print a sheet of 50x50 mm stickers at home, you've probably faced this frustrating issue: you print the sheet, pull out a physical ruler, and find the stickers are ~47 mm instead of 50 mm.

I got tired of manually arranging grids in Photoshop or Illustrator just to print decals, so I built **StickerFit** — a completely free, browser-based sticker sheet generator:

🔗 **Try it live**: https://stickerfit.vercel.app  
📦 **Open-Source (MIT)**: https://github.com/sefga/stickerfit

### What it does:
- 📏 **Exact Millimeter Precision**: Enter width & height in mm (0.1 mm step) — the PDF is generated with exact 1:1 MediaBox coordinates.
- 📐 **Intelligent 90° Auto-Rotation**: Automatically compares 0° and 90° layouts to squeeze more stickers onto an A4 page.
- ✂️ **Fill (Crop) vs Fit (Whole image)**: Choose whether your artwork covers the full sticker area or stays 100% visible.
- 🎯 **Bleed & Cut Marks**: Add 1–3 mm bleed and vector corner trim marks for manual ruler cutting or plotter registration.
- 🔍 **Real DPI Inspector**: Instantly warns you if your source image is below 300 DPI for your chosen dimensions.
- 🛡️ **100% Client-Side Privacy**: All processing (Canvas crop & PDF generation) happens entirely inside your browser. Your pictures and artwork are **never uploaded to any server**.
- 📐 **Built-in Calibration Sheet**: Download a test page with 50 mm & 100 mm reference squares to verify that your printer driver isn't auto-shrinking your sheets.

No accounts, no paywalls, no watermark. Hope this helps anyone printing stickers at home! Would love to hear your feedback or ideas for what to add next.
```

---

## 2. Reddit r/SideProject & r/webdev

* **Ссылка для публикации**: [https://www.reddit.com/r/SideProject/submit](https://www.reddit.com/r/SideProject/submit) / [https://www.reddit.com/r/webdev/submit](https://www.reddit.com/r/webdev/submit)
* **Прикрепить**: Скриншот `desktop-ui.png`

### Заголовок (Title):
> **StickerFit: A 100% client-side A4 sticker sheet generator written in TypeScript ($0 server costs, exact 1:1 PDF MediaBox)**

### Текст поста (Body):
```markdown
Hey r/SideProject!

I wanted to share a tool I recently launched: **StickerFit** — an open-source web app that calculates the densest layout of stickers on A4 paper and exports print-ready 1:1 PDFs.

- **Live URL**: https://stickerfit.vercel.app
- **GitHub**: https://github.com/sefga/stickerfit (MIT License)

### 🛠️ The Technical Challenge
Printing physical stickers with exact geometry from the web is surprisingly tricky:
1. **DTP Points vs Millimeters**: PDF specifies geometry in points ($72\text{ pt} = 1\text{ inch} = 25.4\text{ mm}$). Rounding errors between floats can accumulate into 1–2 mm drift by row 10. We built a zero-drift layout engine tested with Vitest.
2. **The "Fit to Printable Area" trap**: Most OS print dialogs default to "shrink to fit" to respect physical printer margins, shrinking artwork by 4–6%. We included a built-in calibration page with reference squares (50 mm & 100 mm) and a millimeter ruler.
3. **Client-side only**: Using HTML5 Canvas + `pdf-lib`, all resizing, bleed rendering, and vector PDF compilation happen 100% in the user's browser. Server cost is literally $0 (hosted on Vercel/Netlify edge).
4. **Performance & HIG**: Debounced input (450ms) to ensure 0 Long Tasks during rapid typing, and touch targets $\ge 42$ px for mobile.

Stack: Vite + TypeScript + pdf-lib + cropperjs + Vitest + Puppeteer critics.

Feedback and PRs are warmly welcome!
```

---

## 3. Хабр (Habr) & VC.ru

* **Ссылка для публикации**: [https://vc.ru/new](https://vc.ru/new) / [https://habr.com/ru/sandbox/](https://habr.com/ru/sandbox/)
* **Теги**: `web-разработка`, `типография`, `печать`, `typescript`, `открытый код`, `дизайн`

### Заголовок:
> **Как я устал раскладывать наклейки в Фотошопе и написал открытый генератор листов A4 с физической точностью 1:1**

### Текст статьи:
```markdown
Каждый, кто хоть раз пробовал распечатать пачку собственных наклеек на самоклеящейся бумаге формата А4 дома или в небольшом офисе, сталкивался с одной и той же раздражающей рутиной:

1. Открываешь Photoshop / Illustrator / CorelDraw;
2. Вбиваешь размер документа 210 × 297 мм;
3. Вручную создаешь сетку с нужными полями и зазорами;
4. Копируешь картинку 20 раз, пытаясь понять, влезет ли еще один ряд, если повернуть стикер на 90 градусов;
5. Отправляешь на печать, берешь металлическую линейку... и видишь, что наклейка 50 × 50 мм напечаталась как 47 × 47 мм!

Я решил закрыть эту боль раз и навсегда и создал **StickerFit** — бесплатный браузерный инструмент для автоматической раскладки стикеров с физической точностью в миллиметрах.

🌐 **Попробовать сервис**: [stickerfit.vercel.app](https://stickerfit.vercel.app)  
📦 **Исходный код (MIT)**: [github.com/sefga/stickerfit](https://github.com/sefga/stickerfit)

---

### Почему принтеры уменьшают наклейки?

В полиграфии и спецификации Adobe PDF размер задается в типографских пунктах (DTP points):
$$1\text{ дюйм} = 25.4\text{ мм} = 72\text{ pt} \implies 1\text{ мм} \approx 2.83464567\text{ pt}$$

Лист А4 ($210 \times 297$ мм) в PDF равен ровно $595.28 \times 841.89$ pt.

Однако 90% домашних принтеров не могут печатать в край листа (им нужны технологические поля протяжки 3–5 мм). Поэтому драйвер принтера в Windows/macOS/Chrome по умолчанию включает коварную галочку:
> ❌ **«Подогнать под область печати» (Fit to printable area)**

В итоге драйвер тихо сжимает макет на 4–6%, превращая круг 50 мм в 47 мм.

**Решение**: при печати нужно **всегда выбирать «Реальный размер / 100%»**. А чтобы пользователи могли моментально проверить свой принтер, в StickerFit встроен генератор калибровочного листа с эталонными квадратами 50 мм и 100 мм и миллиметровой шкалой.

---

### Что умеет StickerFit:

1. **Мгновенный расчет сетки**: вводите ширину и высоту в мм — алгоритм рассчитывает колонки, строки и показывает, сколько штук влезет на лист.
2. **Умный автоповорот (90°)**: сравнивает раскладки и автоматически поворачивает стикеры, если так на лист поместится больше копий.
3. **Кадрирование**:
   - *«Заполнить (обрезка)»* — фото растягивается на всю область наклейки без белых полос;
   - *«Вписать целиком»* — картинка помещается на 100% без обрезки краев.
4. **Полиграфические метки и вылеты**:
   - Вылеты под обрез (Bleed: 0, 1, 2, 3 мм);
   - Тонкие векторные метки реза (Cut marks: 0.2 pt) под нож или плоттер.
5. **Инспектор DPI**: динамически оценивает плотность пикселей и предупреждает, если разрешение исходника ниже 300 DPI.
6. **100% приватность**: вся нарезка и сборка векторного PDF выполняются на клиенте через Canvas и `pdf-lib`. Изображения **вообще не отправляются на сервер**.
7. **Работает везде**: адаптивный интерфейс оптимизирован под смартфоны (сенсорные зоны $\ge 42$ px, нативные цифровые клавиатуры).

---

### Исходный код и сообщество

Проект полностью открыт под лицензией **MIT**. В репозитории настроен CI с 33 регрессионными тестами физической точности и браузерными агентами-критиками на Puppeteer.

Буду рад вашей обратной связи, отзывам и идеям в комментариях!
```

---

## 4. Пикабу (Pikabu)

* **Ссылка для публикации**: [https://pikabu.ru/add_story](https://pikabu.ru/add_story)
* **Сообщество**: «Рукодельники», «Сделай сам» или «Полезные сайты»
* **Теги**: `наклейки`, `печать`, `своими руками`, `полезное`, `лайфхак`, `бесплатно`

### Заголовок:
> **Сделал бесплатную утилиту для ровной раскладки и печати наклеек на обычном принтере (без Фотошопа и смс)**

### Текст поста:
```markdown
Привет, Пикабу!

Периодически мне нужно было распечатать наклейки — то для банок с заготовками, то сыну на тетради, то для упаковки посылок.

Каждый раз это превращалось в квест:
- Открыть тяжелый Фотошоп или Word;
- Мучительно тыкать картинку, копируя по листу;
- Пытаться выровнять интервалы линейкой на глаз;
- А после печати обнаружить, что принтер сожрал масштаб и наклейки получились меньше, чем надо.

В итоге я психанул и написал простую бесплатную веб-утилитку: **StickerFit** ([stickerfit.vercel.app](https://stickerfit.vercel.app)).

### Как это работает:
1. Заходите с компьютера или телефона.
2. Перетаскиваете картинку (PNG, JPEG, WebP).
3. Вбиваете нужный размер в миллиметрах (например, 50 на 50 мм).
4. Программа сама считает, сколько штук влезет на лист A4, при необходимости сама поворачивает на 90°, чтобы сэкономить бумагу, рисует метки для ножа и отдает готовый векторный PDF со 100% масштабом.

### Что важно:
- **Никаких регистраций, подписок и водяных знаков.**
- **Полная приватность**: ваши картинки не грузятся в интернет — все рассчитывается прямо внутри вашего браузера.
- Встроен **калибровочный лист**, чтобы проверить, не врет ли ваш принтер при печати.

Пользуйтесь на здоровье! Надеюсь, сбережет вам кучу времени и нервов.
```

---

## 5. Telegram (Пост для каналов)

* **Формат**: Иллюстрированный пост со скриншотом `desktop-ui.png`

```text
🏷️ StickerFit — бесплатный генератор раскладки наклеек на листе A4

Полезная находка для иллюстраторов, мейкеров и всех, кто печатает стикеры и этикетки дома или в типографии.

Сервис решает главную головную боль — как быстро разложить картинку на лист А4 в точных физических миллиметрах без возни в Фотошопе:

⚡️ Что умеет:
• Точные размеры в мм (шаг 0.1 мм) и расчет максимального количества на листе;
• Автоповорот на 90° для экономии самоклейки;
• Вылеты под обрез (Bleed) и тонкие векторные метки реза под линейку;
• Индикатор качества DPI (подскажет, если картинка мыльная);
• Встроенный тест калибровки принтера;
• 100% Client-Side — файлы обрабатываются локально в браузере и никуда не улетают.

Без регистраций, без рекламы и без водяных знаков:
👉 https://stickerfit.vercel.app

Открытый исходный код (MIT):
👉 https://github.com/sefga/stickerfit
```

---

## 6. Twitter / X (Тред)

* **Tweet 1 (Hook)**:
> Need to print custom stickers at home? 🏷️  
> Most people spend 20 minutes arranging grids in Photoshop, only to find their printer scaled 50mm stickers down to 47mm.
> 
> I built **StickerFit** — a free, browser-based A4 sticker sheet maker with exact 1:1 scale:  
> 🔗 https://stickerfit.vercel.app  
> 🧵👇 *(Attach video/GIF or desktop-ui.png)*

* **Tweet 2 (Features)**:
> Features:  
> 📐 Exact millimeter inputs with 0.1 mm step  
> 🔄 Smart 90° auto-rotation to maximize paper capacity  
> ✂️ Bleed margins (1–3mm) & vector cut marks  
> 🔍 Real DPI quality indicator (>= 300 DPI)  
> 📏 Built-in calibration ruler sheet

* **Tweet 3 (Privacy & Open Source)**:
> Best part: 100% Client-Side Privacy.  
> Your artwork is rendered using HTML5 Canvas & `pdf-lib` directly in your browser. Zero server uploads.
> 
> Open-source under MIT:  
> https://github.com/sefga/stickerfit
> 
> Feedback is warmly appreciated! ❤️

---

## 7. Product Hunt

* **Product Name**: StickerFit
* **Tagline**: Free A4 sticker sheet maker with exact 1:1 print precision
* **Short Description**: Auto-layout custom stickers onto A4 paper sheets at exact millimeter dimensions and export print-ready 1:1 vector PDFs with cut marks and bleed. 100% client-side, privacy-first.
* **Pricing**: Free / Open Source (MIT)
* **Categories**: Design Tools, Productivity, Developer Tools
* **First Maker Comment**:
```markdown
Hello Product Hunt! 👋

I created StickerFit to solve a problem every maker, artist, and small business owner runs into: printing stickers at home with exact physical dimensions.

Most people either struggle with complex design software or get distorted prints because printer drivers sneakily enable "Fit to printable area", shrinking stickers by 4–6%.

StickerFit is:
- Free & open-source (MIT)
- 100% client-side (your artwork never touches any remote server)
- Accurate down to 0.001 mm with zero layout drift
- Equipped with intelligent 90° auto-rotation and trim marks

I'd love to hear your feedback, feature ideas, or printing setups!
```
