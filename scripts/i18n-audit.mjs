import puppeteer from 'puppeteer-core';
import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const distDir = path.resolve(__dirname, '../dist');

// Простой статический сервер для раздачи dist
function startServer(port = 4173) {
  const mimeTypes = {
    '.html': 'text/html; charset=utf-8',
    '.js': 'application/javascript; charset=utf-8',
    '.css': 'text/css; charset=utf-8',
    '.svg': 'image/svg+xml',
    '.txt': 'text/plain',
    '.xml': 'application/xml',
  };

  const server = http.createServer((req, res) => {
    let filePath = path.join(distDir, req.url === '/' ? 'index.html' : req.url.split('?')[0]);
    if (!fs.existsSync(filePath)) {
      filePath = path.join(distDir, 'index.html');
    }
    const ext = path.extname(filePath).toLowerCase();
    const contentType = mimeTypes[ext] || 'application/octet-stream';

    fs.readFile(filePath, (err, content) => {
      if (err) {
        res.writeHead(500);
        res.end('Error loading file');
      } else {
        res.writeHead(200, { 'Content-Type': contentType });
        res.end(content);
      }
    });
  });

  return new Promise((resolve) => {
    server.listen(port, () => {
      console.log(`Test server running at http://localhost:${port}`);
      resolve(server);
    });
  });
}

async function runAudit() {
  const server = await startServer(4178);
  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  try {
    const resultsDir = path.resolve(__dirname, '../test-results');
    if (!fs.existsSync(resultsDir)) {
      fs.mkdirSync(resultsDir, { recursive: true });
    }

    // ТЕСТ 1: Десктоп, проверка переключения на EN и обратно на RU
    console.log('\n--- ТЕСТ 1: Десктоп (1280x800) переключение RU -> EN -> RU ---');
    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 800 });

    const errors = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') errors.push(msg.text());
    });
    page.on('pageerror', (err) => errors.push(err.toString()));

    await page.goto('http://localhost:4178', { waitUntil: 'networkidle0' });

    // Проверяем наличие кнопки переключения
    const btnRuExists = await page.$('#btnLangRu') !== null;
    const btnEnExists = await page.$('#btnLangEn') !== null;
    console.log(`Кнопки переключения языка в DOM: RU=${btnRuExists}, EN=${btnEnExists}`);

    // Читаем исходный заголовок
    let titleText = await page.$eval('[data-i18n="appTitle"]', (el) => el.textContent.trim());
    let downloadBtnText = await page.$eval('#btnDownloadPdf', (el) => el.textContent.trim());
    console.log(`Начальное состояние: Title="${titleText}", DownloadBtn="${downloadBtnText}"`);

    // Кликаем EN
    console.log('Кликаем по кнопке EN...');
    await page.click('#btnLangEn');
    await new Promise((r) => setTimeout(r, 200));

    titleText = await page.$eval('[data-i18n="appTitle"]', (el) => el.textContent.trim());
    downloadBtnText = await page.$eval('#btnDownloadPdf', (el) => el.textContent.trim());
    const selectImageText = await page.$eval('#btnSelectImage', (el) => el.textContent.trim());
    const widthLabelText = await page.$eval('label[for="stickerWidth"]', (el) => el.textContent.trim());
    const htmlLang = await page.$eval('html', (el) => el.getAttribute('lang'));
    const savedLang = await page.evaluate(() => localStorage.getItem('sticker_sheet_lang'));

    console.log(`После клика EN: Title="${titleText}", DownloadBtn="${downloadBtnText}", SelectImage="${selectImageText}", WidthLabel="${widthLabelText}", html[lang]="${htmlLang}", localStorage="${savedLang}"`);

    if (titleText !== 'A4 Sticker Sheet Maker' || savedLang !== 'en' || htmlLang !== 'en') {
      throw new Error(`Ошибка переключения на EN! Получено: title=${titleText}, lang=${savedLang}`);
    }

    await page.screenshot({ path: path.join(resultsDir, 'desktop-en-preview.png') });
    console.log('Скриншот desktop-en-preview.png сохранен.');

    // Перезагружаем страницу, чтобы проверить сохранение языка из localStorage
    console.log('Перезагружаем страницу для проверки сохранения выбора в localStorage...');
    await page.reload({ waitUntil: 'networkidle0' });
    const reloadedTitle = await page.$eval('[data-i18n="appTitle"]', (el) => el.textContent.trim());
    const reloadedEnActive = await page.$eval('#btnLangEn', (el) => el.classList.contains('active'));
    console.log(`После перезагрузки: Title="${reloadedTitle}", EN кнопка активна: ${reloadedEnActive}`);
    if (reloadedTitle !== 'A4 Sticker Sheet Maker' || !reloadedEnActive) {
      throw new Error('Выбор языка не сохранился после перезагрузки страницы!');
    }

    // Кликаем RU
    console.log('Кликаем обратно по кнопке RU...');
    await page.click('#btnLangRu');
    await new Promise((r) => setTimeout(r, 200));

    const ruTitle = await page.$eval('[data-i18n="appTitle"]', (el) => el.textContent.trim());
    const ruSavedLang = await page.evaluate(() => localStorage.getItem('sticker_sheet_lang'));
    console.log(`После клика RU: Title="${ruTitle}", localStorage="${ruSavedLang}"`);
    if (ruTitle !== 'Раскладка наклеек A4' || ruSavedLang !== 'ru') {
      throw new Error('Ошибка переключения обратно на RU!');
    }
    await page.screenshot({ path: path.join(resultsDir, 'desktop-ru-preview.png') });
    console.log('Скриншот desktop-ru-preview.png сохранен.');

    await page.close();

    // ТЕСТ 2: Мобильный экран (iPhone 375x667)
    console.log('\n--- ТЕСТ 2: Мобильный экран (iPhone SE 375x667) ---');
    const mobilePage = await browser.newPage();
    await mobilePage.setViewport({ width: 375, height: 667, isMobile: true, hasTouch: true });

    await mobilePage.goto('http://localhost:4178', { waitUntil: 'networkidle0' });
    // Переключаем на EN на мобильном
    await mobilePage.click('#btnLangEn');
    await new Promise((r) => setTimeout(r, 200));

    const mobileTabControls = await mobilePage.$eval('#tabBtnControls', (el) => el.textContent.trim());
    const mobileStickyBtn = await mobilePage.$eval('#btnMobileDownloadPdf', (el) => el.textContent.trim());
    console.log(`Мобильный вид EN: TabControls="${mobileTabControls}", StickyBtn="${mobileStickyBtn}"`);

    await mobilePage.screenshot({ path: path.join(resultsDir, 'mobile-en-controls.png') });
    console.log('Скриншот mobile-en-controls.png сохранен.');

    // Переключаем на вкладку Превью на мобильном
    await mobilePage.click('#tabBtnPreview');
    await new Promise((r) => setTimeout(r, 200));
    await mobilePage.screenshot({ path: path.join(resultsDir, 'mobile-en-preview.png') });
    console.log('Скриншот mobile-en-preview.png сохранен.');

    await mobilePage.close();

    // ТЕСТ 3: Автоопределение языка для зарубежного пользователя (navigator.language = en-US)
    console.log('\n--- ТЕСТ 3: Автодетект языка устройства (чистый localStorage + локаль en-US) ---');
    const enBrowserPage = await browser.newPage();
    await enBrowserPage.setViewport({ width: 1280, height: 800 });

    // Очищаем localStorage перед переходом и эмулируем заголовок/языки
    await enBrowserPage.evaluateOnNewDocument(() => {
      localStorage.clear();
      Object.defineProperty(navigator, 'languages', {
        get: () => ['en-US', 'en'],
      });
      Object.defineProperty(navigator, 'language', {
        get: () => 'en-US',
      });
    });

    await enBrowserPage.goto('http://localhost:4178', { waitUntil: 'networkidle0' });
    const autoTitle = await enBrowserPage.$eval('[data-i18n="appTitle"]', (el) => el.textContent.trim());
    const autoHtmlLang = await enBrowserPage.$eval('html', (el) => el.getAttribute('lang'));
    const autoEnActive = await enBrowserPage.$eval('#btnLangEn', (el) => el.classList.contains('active'));

    console.log(`Автодетект для en-US: Title="${autoTitle}", html[lang]="${autoHtmlLang}", EN active=${autoEnActive}`);
    if (autoTitle !== 'A4 Sticker Sheet Maker' || !autoEnActive) {
      throw new Error(`Автодетект не сработал для иностранного пользователя! Получено: ${autoTitle}`);
    }

    await enBrowserPage.close();

    console.log('\n=============================================');
    console.log('🎉 ВСЕ ПРОВЕРКИ И ТЕСТЫ I18N ПРОЙДЕНЫ НА 10/10!');
    console.log('=============================================');
  } finally {
    await browser.close();
    server.close();
  }
}

runAudit().catch((err) => {
  console.error('Audit failed:', err);
  process.exit(1);
});
