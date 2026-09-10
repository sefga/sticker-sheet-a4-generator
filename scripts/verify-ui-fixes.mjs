import puppeteer from 'puppeteer-core';
import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const distDir = path.resolve(__dirname, '../dist');
const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const ARTIFACT_DIR = 'C:\\Users\\sokol\\.gemini\\antigravity\\brain\\53da9357-4c31-4022-8645-5f638698a280';

function startServer(port = 4567) {
  const mimeTypes = {
    '.html': 'text/html; charset=utf-8',
    '.js': 'application/javascript; charset=utf-8',
    '.css': 'text/css; charset=utf-8',
    '.svg': 'image/svg+xml',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.txt': 'text/plain',
  };

  const server = http.createServer((req, res) => {
    let filePath = path.join(distDir, req.url === '/' ? 'index.html' : req.url.split('?')[0]);
    if (!fs.existsSync(filePath)) {
      res.writeHead(404);
      res.end('Not found');
      return;
    }
    const ext = path.extname(filePath);
    res.writeHead(200, { 'Content-Type': mimeTypes[ext] || 'application/octet-stream' });
    fs.createReadStream(filePath).pipe(res);
  });

  return new Promise((resolve) => {
    server.listen(port, () => resolve(server));
  });
}

async function run() {
  const server = await startServer(4567);
  console.log('Server started on port 4567');

  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  try {
    const page = await browser.newPage();

    // 1. Десктопная проверка (1280x800)
    await page.setViewport({ width: 1280, height: 800, deviceScaleFactor: 2 });
    await page.goto('http://localhost:4567', { waitUntil: 'networkidle0' });

    // Скриншот секции 3 на десктопе по умолчанию (A4)
    const section3 = await page.$('.panel-section:nth-of-type(3)');
    if (section3) {
      await section3.screenshot({ path: path.join(ARTIFACT_DIR, 'desktop-section3-a4.png') });
      console.log('Saved desktop-section3-a4.png');
    }

    // Проверяем клик на "Термо"
    const chipThermal = await page.$('#chipPaperThermal');
    if (chipThermal) {
      await chipThermal.click();
      await new Promise(r => setTimeout(r, 300));
      if (section3) {
        await section3.screenshot({ path: path.join(ARTIFACT_DIR, 'desktop-section3-thermal.png') });
        console.log('Saved desktop-section3-thermal.png');
      }
    }

    // Открываем модалку каталога принтеров
    const btnOpenCatalog = await page.$('#btnOpenCatalogLink');
    if (btnOpenCatalog) {
      await btnOpenCatalog.click();
      await new Promise(r => setTimeout(r, 400));

      // Скриншот поисковой строки без фокуса
      const searchWrapper = await page.$('.catalog-search-wrapper');
      if (searchWrapper) {
        await searchWrapper.screenshot({ path: path.join(ARTIFACT_DIR, 'search-input-unfocused.png') });
        console.log('Saved search-input-unfocused.png');
      }

      // Фокусируем строку поиска (проверка скрытия плейсхолдера)
      const searchInput = await page.$('#paperCatalogSearch');
      if (searchInput) {
        await searchInput.focus();
        await new Promise(r => setTimeout(r, 200));
        if (searchWrapper) {
          await searchWrapper.screenshot({ path: path.join(ARTIFACT_DIR, 'search-input-focused.png') });
          console.log('Saved search-input-focused.png');
        }

        // Вводим текст
        await searchInput.type('PeriPage');
        await new Promise(r => setTimeout(r, 200));
        if (searchWrapper) {
          await searchWrapper.screenshot({ path: path.join(ARTIFACT_DIR, 'search-input-typing.png') });
          console.log('Saved search-input-typing.png');
        }
      }

      // Полный скриншот модального окна каталога
      const modalDialog = await page.$('.paper-catalog-dialog');
      if (modalDialog) {
        await modalDialog.screenshot({ path: path.join(ARTIFACT_DIR, 'catalog-modal-desktop.png') });
        console.log('Saved catalog-modal-desktop.png');
      }

      // Очищаем поиск кнопкой ✕
      const btnClear = await page.$('#btnClearPaperSearch');
      if (btnClear) {
        await btnClear.click();
        await new Promise(r => setTimeout(r, 200));
      }

      // Выбираем формат WB 58x40 из каталога
      const wbCard = await page.$('.catalog-card[data-paper="label_58x40"]');
      if (wbCard) {
        await wbCard.click();
        await new Promise(r => setTimeout(r, 400));
        // Проверяем, что для WB 58x40 отобразился блок настройки длины!
        if (section3) {
          await section3.screenshot({ path: path.join(ARTIFACT_DIR, 'desktop-section3-wb58x40-length.png') });
          console.log('Saved desktop-section3-wb58x40-length.png');
        }
      }
    }

    // 2. Мобильная проверка (375x812 - iPhone)
    await page.setViewport({ width: 375, height: 812, isMobile: true, hasTouch: true, deviceScaleFactor: 2 });
    await page.goto('http://localhost:4567', { waitUntil: 'networkidle0' });

    const mobileSection3 = await page.$('.panel-section:nth-of-type(3)');
    if (mobileSection3) {
      await mobileSection3.screenshot({ path: path.join(ARTIFACT_DIR, 'mobile-section3-iphone.png') });
      console.log('Saved mobile-section3-iphone.png');
    }

    // Открываем каталог на мобильном
    const mobileBtnCatalog = await page.$('#btnOpenCatalogLink');
    if (mobileBtnCatalog) {
      await mobileBtnCatalog.click();
      await new Promise(r => setTimeout(r, 400));
      const mobileModalDialog = await page.$('.paper-catalog-dialog');
      if (mobileModalDialog) {
        await mobileModalDialog.screenshot({ path: path.join(ARTIFACT_DIR, 'catalog-modal-mobile.png') });
        console.log('Saved catalog-modal-mobile.png');
      }
      // Закрываем каталог
      const closeBtn = await page.$('#btnClosePaperCatalog');
      if (closeBtn) {
        await closeBtn.click();
        await new Promise(r => setTimeout(r, 300));
      }
    }

    // 3. Ультра-узкий мобильный (320x568 - iPhone SE / компактный экран)
    await page.setViewport({ width: 320, height: 568, isMobile: true, hasTouch: true, deviceScaleFactor: 2 });
    await page.goto('http://localhost:4567', { waitUntil: 'networkidle0' });

    const seSection3 = await page.$('.panel-section:nth-of-type(3)');
    if (seSection3) {
      await seSection3.screenshot({ path: path.join(ARTIFACT_DIR, 'mobile-section3-320px.png') });
      console.log('Saved mobile-section3-320px.png');
    }

    console.log('All screenshots captured successfully!');
  } finally {
    await browser.close();
    server.close();
  }
}

run().catch((err) => {
  console.error('Error running visual tests:', err);
  process.exit(1);
});
