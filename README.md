# Sticker Sheet A4 Generator (Генератор раскладки наклеек на листе A4)

[![Deploy to GitHub Pages](https://github.com/sefga/sticker-sheet-a4-generator/actions/workflows/deploy.yml/badge.svg)](https://github.com/sefga/sticker-sheet-a4-generator/actions/workflows/deploy.yml)
[![Vercel Deployment](https://img.shields.io/badge/Vercel-Live%20Demo-black?logo=vercel)](https://sticker-sheet-a4-generator.vercel.app)
[![Deploy to Netlify](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start/deploy?repository=https://github.com/sefga/sticker-sheet-a4-generator)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

Автономное клиентское веб-приложение для автоматической подготовки и верстки листов A4 со стикерами для печати с физической точностью геометрии (в миллиметрах).

---

## 🌐 Ссылки на сервисы и онлайн-доступ

| Сервис / Платформа | Статус | Прямая ссылка | Назначение |
|:---|:---:|:---|:---|
| **Vercel (Основной домен)** | 🟢 Live | [sticker-sheet-a4-generator.vercel.app](https://sticker-sheet-a4-generator.vercel.app) | Основной канонический production CDN |
| **GitHub Pages (Зеркало)** | 🟢 Live | [sefga.github.io/sticker-sheet-a4-generator](https://sefga.github.io/sticker-sheet-a4-generator/) | Официальное зеркало на GitHub Pages |
| **Netlify (1-Click Deploy)** | 🟢 Ready | [Развернуть на Netlify в 1 клик](https://app.netlify.com/start/deploy?repository=https://github.com/sefga/sticker-sheet-a4-generator) | Мгновенный импорт и запуск на Netlify CDN |
| **Исходный код (GitHub)** | 🟢 Public | [github.com/sefga/sticker-sheet-a4-generator](https://github.com/sefga/sticker-sheet-a4-generator) | Открытый репозиторий проекта |

---

## 🚀 Основные возможности

1. **Загрузка и кадрирование**:
   - Поддержка Drag & Drop, выбора файла и вставки из буфера обмена (Ctrl+V).
   - Поддерживаемые форматы: PNG, JPG/JPEG, WebP.
   - Интерактивное кадрирование через Cropper.js с сохранением координат относительно исходного разрешения (без потери резкости).
   - Поворот кадра на 90°, сброс, сохранение целевого соотношения сторон.
   - Режимы заполнения: **Crop / Fill** (заполнение стикера) и **Fit** (целиком внутри стикера).

2. **Точная физическая геометрия (мм)**:
   - Ввод размеров стикера с шагом 0.1 мм.
   - Опция фиксации пропорций 🔒.
   - Поддержка форматов A4 Portrait (210 × 297 мм) и Landscape (297 × 210 мм).
   - Настройка полей (Margins) и расстояния между стикерами (Gap) со связкой значений.
   - Предупреждение о полях меньше 3 мм для принтеров с широкими технологическими полями.

3. **Автоматическая оптимизация раскладки**:
   - Автоматический расчет сетки: $N = \text{columns} \times \text{rows}$.
   - **Автоповорот 90°**: расчет экономичной ориентации (например, 10 шт. с поворотом вместо 9 шт. без поворота).
   - Автоматическое центрирование сетки внутри доступной области листа.
   - Ограничение количества копий (`AUTO` или ручной ввод числа, например 7).

4. **Контроль качества (DPI)**:
   - Автоматический расчет эффективного разрешения: $\text{DPI} = \text{pixelWidth} / (\text{widthMm} / 25.4)$.
   - Цветовая шкала качества:
     - $\ge 300\text{ DPI}$ — Отличное качество (зеленый);
     - $200\text{--}299\text{ DPI}$ — Допустимое качество (синий);
     - $150\text{--}199\text{ DPI}$ — Низкое качество (желтый);
     - $< 150\text{ DPI}$ — Предупреждение о пикселизации (красный).

5. **Полиграфия и экспорт в PDF**:
   - Программная генерация PDF через библиотеку `pdf-lib` (физический MediaBox $210 \times 297\text{ мм} = 595.28 \times 841.89\text{ pt}$).
   - Однократное встраивание растрового изображения в PDF без повторного пережатия.
   - Тонкие векторные метки реза (длина 3 мм, смещение 1 мм, толщина 0.2 pt).
   - Поддержка Bleed (вылета под обрез): 0, 1, 2, 3 мм.
   - Кнопка «Печать» с предупреждением о печати со 100% масштабом (Actual size).
   - Калибровочный лист PDF: тестовый квадрат $50 \times 50\text{ мм}$, контрольная линия $100\text{ мм}$ и линейка $0\text{--}15\text{ см}$ с шагом 1 мм.

6. **Надежность и автономность**:
   - 100% client-side (без бэкенда, полная конфиденциальность).
   - Автосохранение настроек в `LocalStorage` + кнопка сброса к заводским.
   - Полный набор юнит-тестов Vitest, проверяющих Тесты 1–6 из ТЗ и регрессионный тест MediaBox.

---

## 🛠️ Запуск и тестирование

### 1. Установка зависимостей:
```bash
npm install
```

### 2. Запуск локального dev-сервера:
```bash
npm run dev
```
Приложение откроется по адресу `http://localhost:3000`.

### 3. Запуск автоматических тестов (Vitest):
```bash
npm test
```

### 4. Сборка production-бандла:
```bash
npm run build
```

---

## 📁 Архитектура проекта

```text
src/
  app.ts                 # Точка входа приложения
  state.ts               # Управление состоянием (Store) и LocalStorage
  styles.css             # Стили оформления интерфейса

  units/
    mm.ts                # Преобразования мм <-> pt <-> px, расчет DPI, константы A4

  layout/
    layoutEngine.ts      # Чистый математический модуль раскладки сетки (без DOM/Canvas)
    layoutEngine.test.ts # Тесты геометрических сценариев 1-6 из ТЗ

  image/
    imageLoader.ts       # Загрузка (File, Drag&Drop, Clipboard)
    cropEngine.ts        # Кадрирование в полном исходном разрешении и учет поворота
    dpiCalculator.ts     # Расчет effective DPI и градаций качества

  preview/
    previewRenderer.ts   # Точный физический SVG-рендерер листа A4

  pdf/
    pdfGenerator.ts      # Векторная сборка PDF через pdf-lib
    pdfGenerator.test.ts # Регрессионный тест точного размера MediaBox и координат
    cutMarks.ts          # Расчет и векторная отрисовка меток реза
    calibrationPage.ts   # Генерация калибровочной страницы A4

  ui/
    controls.ts          # Контроллер элементов интерфейса и событий формы
    cropDialog.ts        # Модальное окно кадрирования Cropper.js
```

---

## ☁️ Как опубликовать на Netlify и Автоматизация в 1 клик

В проект уже добавлен файл конфигурации [netlify.toml](file:///c:/Desk/автоматизация%20разкалдки%20наклеек/netlify.toml), определяющий команду сборки `npm run build`, каталог `dist` и SPA-редиректы.

### Вариант 1. В 1 клик через веб (Рекомендуется)
Нажмите на кнопку ниже, войдите через свой GitHub — Netlify автоматически клонирует репозиторий, запустит сборку и выделит постоянный онлайн-домен `.netlify.app` с автообновлением при каждом `git push`:

[![Deploy to Netlify](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start/deploy?repository=https://github.com/sefga/sticker-sheet-a4-generator)

### Вариант 2. Через Netlify CLI из консоли
1. Однократный вход в аккаунт:
   ```bash
   npx netlify-cli login
   ```
2. Развертывание в production в 1 команду:
   ```bash
   npm run deploy:netlify
   ```
   *(или `npx netlify-cli deploy --prod --dir=dist`)*.

---

## 🤖 Netlify Model Context Protocol (MCP) для ИИ-Агентов

Для полной автоматизации деплоя и управления сайтами в **1 клик силами ИИ-агентов** (включая Antigravity, Claude Desktop, Cursor) существует официальный протокол **MCP (Model Context Protocol)** от Netlify.

### Как настроить Netlify MCP сервер:
1. Получите Personal Access Token в личном кабинете Netlify: `User Settings -> Applications -> Personal access tokens`.
2. Добавьте MCP-сервер в конфигурацию агента (например, в `claude_desktop_config.json` или конфигурацию Antigravity MCP):

```json
{
  "mcpServers": {
    "netlify": {
      "command": "npx",
      "args": ["-y", "@netlify/mcp"],
      "env": {
        "NETLIFY_AUTH_TOKEN": "ваш_персональный_токен_netlify"
      }
    }
  }
}
```

### Что может ИИ-агент через Netlify MCP в 1 клик:
* `listSites` — получать список всех проектов пользователя;
* `createSite` — создавать новые сайты без открытия браузера;
* `deploySite` — загружать собранные артефакты `dist/` в production;
* `getDeploy` — проверять статус сборки и доступность URL;
* `configureSite` — настраивать переменные окружения, кастомные домены и заголовки.

---

## 🔍 SEO & GEO Оптимизация страницы

Проект полностью оптимизирован для индексации поисковыми системами (Яндекс, Google, Bing, Mail.ru) и привлекательного сниппета в социальных сетях:

1. **Региональный GEO-таргетинг (GEO Meta Tags)**:
   - `geo.region: RU`
   - `geo.placename: Москва, Россия`
   - `geo.position / ICBM: 55.7558; 37.6176` (географическая привязка к региону).
2. **Семантическая микроразметка Schema.org (JSON-LD)**:
   - Внедрена схема `WebApplication` / `DesignApplication` с описанием бесплатных функций кадрирования, контроля DPI, раскладки на листе A4 и генерации PDF 1:1.
3. **Open Graph & Twitter Cards**:
   - При отправке ссылки в **Telegram, WhatsApp, VK, Twitter** генерируется привлекательное превью с брендовым векторным баннером [public/og-image.svg](file:///c:/Desk/автоматизация%20разкалдки%20наклеек/public/og-image.svg).
4. **Канонический URL (`canonical`)**:
   - Адрес `https://sticker-sheet-a4-generator.vercel.app/` назначен основным каноническим доменом, что объединяет ссылочную массу и исключает санкции за дублирование зеркал на GitHub Pages и Netlify.
5. **Файлы для поисковых краулеров**:
   - [public/robots.txt](file:///c:/Desk/автоматизация%20разкалдки наклеек/public/robots.txt) — правила индексации для всех роботов.
   - [public/sitemap.xml](file:///c:/Desk/автоматизация%20разкалдки наклеек/public/sitemap.xml) — карта сайта с приоритетом 1.0.

