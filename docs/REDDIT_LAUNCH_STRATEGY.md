# 🚀 Стратегия и Готовые Посты для Reddit (StickerFit)

## ⚠️ Почему посты удаляет Reddit Automoderator и как этого избежать:

1. **НЕ используйте тип "Link Post" (прямая ссылка)**!
   - Если при создании поста выбрать "Link", фильтры Reddit мгновенно отправляют посты с неизвестными доменами в спам.
   - **Всегда выбирайте "Post" (Text / Rich Text)**, куда вставляется текст, а внизу или в кнопке прикрепляется картинка.
2. **Не ставьте ссылку в первой строке**:
   - Начните пост с проблемы, личной истории и описания пользы. Ссылку ставьте в самом конце.
3. **Обязательно выбирайте Flair (метку)**:
   - В каждом сабреддите бот удаляет посты без флейра (`Showcase`, `Tool`, `Free`, `Open Source`).
4. **Не используйте сокращатели ссылок** (bit.ly, t.co) — они в черном списке Reddit.

---

## 🎯 Топ-5 Сабреддитов с Готовыми Текстами

### 1. r/SideProject (230k участников) — САМАЯ ЛУЧШАЯ ВЕТКА
- **Прямая ссылка:** https://www.reddit.com/r/SideProject/
- **Почему здесь:** Сабреддит создан специально для разработчиков, которые показывают свои пет-проекты. Здесь обожают бесплатные и полезные утилиты без рекламы.
- **Flair:** `Free Tool` или `Side Project`
- **Тип поста:** Text Post + прикрепить картинку `promo-artist-merch.jpg` или скриншот интерфейса.

#### 📝 Заголовок (Title):
> I built a free, open-source tool to auto-layout stickers on an A4 sheet with 100% scale and bleed marks (zero accounts, client-side only)

#### 📄 Текст поста (Body):
Hi everyone! 👋

I was always frustrated whenever I needed to print a sheet of stickers or packaging labels:
- Duplicating 30 layers manually in Photoshop or Illustrator takes forever.
- Doing it in Microsoft Word distorts the aspect ratio and ruins the physical millimeter dimensions.
- Printing software often auto-shrinks pages ("Fit to page"), destroying 1:1 scale.

So I built **StickerFit** – a lightweight, web-based A4 sticker layout generator.

**Key features:**
- 📐 **True physical dimensions in mm**: Set exact width & height (e.g. 50×50 mm) and get exact 1:1 scale when printing.
- 🔄 **Smart 90° auto-rotation**: Automatically checks whether rotating stickers packs more copies onto the A4 page (saves up to 20% of expensive vinyl paper).
- ✂️ **Vector cut marks & bleed options (1-3mm)**: Clean alignment for manual knife cutting or plotter blades.
- 🔒 **100% Client-side privacy**: All image processing, cropping and PDF rendering happen locally in your browser. Nothing is uploaded to any server.
- ⚡ **Zero signup, zero ads, completely free & MIT open-source**.

Tech stack: TypeScript, Vite, PDF-Lib, Cropper.js.

I'd love to hear your feedback or feature ideas!

🔗 **Try it live:** https://stickerfit.vercel.app  
⭐ **GitHub (MIT):** https://github.com/sefga/stickerfit

---

### 2. r/stickers (125k участников) — ЦЕЛЕВАЯ АУДИТОРИЯ
- **Прямая ссылка:** https://www.reddit.com/r/stickers/
- **Почему здесь:** Художники, стикермейкеры и любители наклеек. Постоянно обсуждают печать наклеек дома на виниле.
- **Flair:** `Discussion` или `Advice/Help` / `Resource`
- **Тип поста:** Text Post + фото `promo-artist-merch.jpg`

#### 📝 Заголовок (Title):
> Made a free web tool to pack stickers on an A4 sheet without wasting vinyl (auto-rotates, adds bleed & cut marks)

#### 📄 Текст поста (Body):
Hey sticker friends! 🎨

If you print your own stickers at home, you probably know the pain of arranging multiple copies on an A4 vinyl sheet while trying to squeeze in as many as possible without wasting expensive paper.

I got tired of manually calculating grid columns and rows, so I made a free web tool called **StickerFit**.

**What it does:**
1. You upload your artwork (PNG/JPG).
2. Enter target millimeter dimensions (e.g., 50x50 mm).
3. It instantly calculates the maximum capacity and tests 90° rotation to fit more stickers.
4. Adds optional bleed (1–3 mm) and vector cut marks for easy cutting.
5. Generates a print-ready 1:1 vector PDF.

It's completely free, open-source, runs 100% in your browser (no images sent to servers), and requires no login.

Hope this saves you time and vinyl paper for your next sticker drop!

Link: https://stickerfit.vercel.app  
(Open source code on GitHub: https://github.com/sefga/stickerfit)

---

### 3. r/cricut (160k участников) — ВЛАДЕЛЬЦЫ ПЛОТТЕРОВ
- **Прямая ссылка:** https://www.reddit.com/r/cricut/
- **Почему здесь:** Сообщество пользователей режущих плоттеров Cricut, которые постоянно жалуются на баги масштаба и трату бумаги.
- **Flair:** `Resource` или `Tips & Tricks`
- **Тип поста:** Text Post

#### 📝 Заголовок (Title):
> Free tool to maximize sticker copies on an A4 sheet with true millimeter sizing and bleed margins

#### 📄 Текст поста (Body):
Hey fellow crafters!

One of the biggest headaches when preparing sticker sheets is maximizing paper yield and ensuring dimensions don't get warped or downscaled.

I built a free browser tool called **StickerFit** to help prepare print layouts quickly:
- Sets exact millimeter dimensions.
- Compares normal vs 90° rotated layout to see which packs more copies per sheet.
- Adds adjustable bleed (1–3 mm) so knife offsets don't show white borders.
- Vector cut marks for clean manual slicing.
- Exports a 1:1 PDF that respects physical millimeter size.

Free to use, client-side only (images stay on your device), no signup needed.

Web: https://stickerfit.vercel.app  
GitHub: https://github.com/sefga/stickerfit

Let me know if this is helpful for your workflow!

---

### 4. r/opensource (180k участников) — УВАЖЕНИЕ К ОТКРЫТОМУ КОДУ
- **Прямая ссылка:** https://www.reddit.com/r/opensource/
- **Почему здесь:** Аудитория ценит открытый код под лицензией MIT, защиту приватности и отсутствие бэкенда/трекинга.
- **Flair:** `Project`
- **Тип поста:** Text Post + ссылка на GitHub

#### 📝 Заголовок (Title):
> StickerFit – An open-source, client-side A4 sticker sheet generator (MIT)

#### 📄 Текст поста (Body):
Hi everyone,

I created **StickerFit**, an open-source web application designed to prepare print-ready A4 sticker sheets with physical millimeter accuracy.

**Highlights:**
- 🛡️ **100% Client-Side:** Zero servers, zero cookies, zero tracking of user files. Everything runs in-browser with Canvas & WebAssembly.
- 📐 **Vector 1:1 PDF Generation:** Using `pdf-lib` to preserve full 300+ DPI artwork without pixelation.
- 🔄 **Layout Optimization:** Automatically calculates optimal grid packing and tests 90° orientation.
- 📜 **License:** MIT.
- 💻 **Stack:** TypeScript, Vite, Vitest.

Repo: https://github.com/sefga/stickerfit  
Live demo: https://stickerfit.vercel.app

Contributions and PRs are welcome!

---

### 5. r/webdev (2.5M участников) — ТОЛЬКО ПО СУББОТАМ!
- **Прямая ссылка:** https://www.reddit.com/r/webdev/
- **ВАЖНОЕ ПРАВИЛО:** В `r/webdev` показывать свои проекты разрешено **ТОЛЬКО ПО СУББОТАМ** с префиксом в заголовке `[Showoff Saturday]`. В любой другой день пост удалят.
- **Flair:** `Showoff Saturday`

#### 📝 Заголовок (Title):
> [Showoff Saturday] I built StickerFit: a fast client-side A4 sticker packing engine & PDF generator with TypeScript and pdf-lib

#### 📄 Текст поста (Body):
Hey r/webdev!

For this Showoff Saturday, I wanted to share a weekend project I built called **StickerFit**.

**The problem:**
People printing custom stickers or packaging labels often struggle with Microsoft Word or Canva scaling issues. Standard print dialogs shrink layouts by 3-7% by default.

**Technical implementation:**
- Pure TypeScript architecture with zero backend server dependencies.
- Grid layout algorithm calculating usable paper margins, dynamic gap spacing, and 90° auto-rotation comparison in <5ms.
- 1:1 scale vector PDF generation in the browser using `pdf-lib` and standard prepress crop mark geometry.
- 100% client-side privacy.

Live Demo: https://stickerfit.vercel.app  
GitHub: https://github.com/sefga/stickerfit

Feedback on UX/architecture is appreciated!
