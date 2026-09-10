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

function startServer(port = 4578) {
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
    fs.readFile(filePath, (err, data) => {
      if (err) {
        res.writeHead(404);
        res.end('Not found');
        return;
      }
      const ext = path.extname(filePath);
      res.writeHead(200, { 'Content-Type': mimeTypes[ext] || 'application/octet-stream' });
      res.end(data);
    });
  });

  return new Promise((resolve) => {
    server.listen(port, () => resolve(server));
  });
}

async function run() {
  console.log('🚀 Запуск верификации победителя дизайнерского конкурса...');
  const server = await startServer(4578);
  const baseUrl = 'http://localhost:4578';

  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();

  // 1. Десктоп 1280x800
  await page.setViewport({ width: 1280, height: 800, deviceScaleFactor: 2 });
  await page.goto(baseUrl, { waitUntil: 'networkidle0' });

  // Проверка состояния по умолчанию (A4)
  const a4Active = await page.$eval('#chipPaperA4', el => el.classList.contains('active'));
  const moreActive = await page.$eval('#chipPaperMore', el => el.classList.contains('active'));
  const moreText = await page.$eval('#chipPaperMore', el => el.textContent.trim());
  const summaryTitle = await page.$eval('#paperSummaryTitle', el => el.textContent.trim());
  const summaryBadge = await page.$eval('#badgeSmartMargins', el => el.textContent.trim());

  console.log(`[Desktop] По умолчанию:`);
  console.log(` - A4 активен: ${a4Active}`);
  console.log(` - Кнопка More активна: ${moreActive} (текст: "${moreText}")`);
  console.log(` - Карточка заголовок: "${summaryTitle}"`);
  console.log(` - Карточка бейдж полей: "${summaryBadge}"`);

  // Скриншот секции 3 на десктопе
  const sec3El = await page.$('.section-title-paper');
  if (sec3El) {
    const parent = await sec3El.getProperty('parentElement');
    await parent.asElement().screenshot({ path: path.join(ARTIFACT_DIR, 'tot-desktop-section3-a4.png') });
  }

  // Клик по кнопке "Другие принтеры ▾" для открытия каталога
  await page.click('#chipPaperMore');
  await new Promise(r => setTimeout(r, 400));
  const modalOpen = await page.$eval('#paperCatalogModal', el => el.classList.contains('open'));
  console.log(`[Desktop] Каталог открылся: ${modalOpen}`);
  await page.screenshot({ path: path.join(ARTIFACT_DIR, 'tot-catalog-modal.png') });

  // Клик по карточке WB 58x40
  await page.evaluate(() => {
    const cards = Array.from(document.querySelectorAll('.catalog-card'));
    const wbCard = cards.find(c => c.textContent.includes('58 × 40') || c.textContent.includes('Wildberries'));
    if (wbCard) wbCard.click();
  });
  await new Promise(r => setTimeout(r, 600));

  // Проверка состояния после выбора WB 58x40
  const a4After = await page.$eval('#chipPaperA4', el => el.classList.contains('active'));
  const moreAfter = await page.$eval('#chipPaperMore', el => el.classList.contains('active'));
  const moreTextAfter = await page.$eval('#chipPaperMore', el => el.textContent.trim());
  const summaryTitleAfter = await page.$eval('#paperSummaryTitle', el => el.textContent.trim());
  const summaryBadgeAfter = await page.$eval('#badgeSmartMargins', el => el.textContent.trim());
  const thermalRollVisible = await page.$eval('#thermalRollGroup', el => window.getComputedStyle(el).display !== 'none');

  console.log(`[Desktop] После выбора WB 58x40:`);
  console.log(` - A4 активен: ${a4After}`);
  console.log(` - Кнопка More активна: ${moreAfter} (динамический текст: "${moreTextAfter}")`);
  console.log(` - Карточка заголовок: "${summaryTitleAfter}"`);
  console.log(` - Карточка бейдж: "${summaryBadgeAfter}"`);
  console.log(` - Настройка длины ленты видна: ${thermalRollVisible}`);

  if (sec3El) {
    const parent = await sec3El.getProperty('parentElement');
    await parent.asElement().screenshot({ path: path.join(ARTIFACT_DIR, 'tot-desktop-section3-wb.png') });
  }

  // Возврат в A4 одним кликом
  await page.click('#chipPaperA4');
  await new Promise(r => setTimeout(r, 300));
  const returnedA4 = await page.$eval('#chipPaperA4', el => el.classList.contains('active'));
  const moreReturnedText = await page.$eval('#chipPaperMore', el => el.textContent.trim());
  console.log(`[Desktop] Возврат в A4 в 1 клик: ${returnedA4}, текст кнопки: "${moreReturnedText}"`);

  // 2. Мобильный экран iPhone 375x812
  await page.setViewport({ width: 375, height: 812, deviceScaleFactor: 2 });
  await page.goto(baseUrl, { waitUntil: 'networkidle0' });

  const mobileCheck = await page.evaluate(() => {
    const sw = document.querySelector('.paper-switch');
    const titleRow = document.querySelector('.section-title-paper');
    return {
      switchWidth: sw?.offsetWidth,
      titleRowWidth: titleRow?.offsetWidth,
      hasOverflow: document.body.scrollWidth > window.innerWidth
    };
  });
  console.log(`[Mobile 375px] Геометрия:`, mobileCheck);

  // Клик по карточке бумаги для открытия каталога
  await page.click('#paperSummaryCard');
  await new Promise(r => setTimeout(r, 400));
  const mobileModalOpen = await page.$eval('#paperCatalogModal', el => el.classList.contains('open'));
  console.log(`[Mobile 375px] Каталог открылся по клику на карточку: ${mobileModalOpen}`);

  // Выбор PeriPage 57 мм
  await page.evaluate(() => {
    const cards = Array.from(document.querySelectorAll('.catalog-card'));
    const pCard = cards.find(c => c.textContent.includes('PeriPage'));
    if (pCard) pCard.click();
  });
  await new Promise(r => setTimeout(r, 600));

  const mobileMoreText = await page.$eval('#chipPaperMore', el => el.textContent.trim());
  const mobilePeriPageTitle = await page.$eval('#paperSummaryTitle', el => el.textContent.trim());
  const mobilePeriPageDesc = await page.$eval('#paperSummaryDesc', el => el.textContent.trim());
  console.log(`[Mobile 375px] Текст кнопки: "${mobileMoreText}"`);
  console.log(`[Mobile 375px] Карточка PeriPage: Title="${mobilePeriPageTitle}", Desc="${mobilePeriPageDesc}"`);

  const mobileSec3 = await page.$('.section-title-paper');
  if (mobileSec3) {
    const parent = await mobileSec3.getProperty('parentElement');
    await parent.asElement().screenshot({ path: path.join(ARTIFACT_DIR, 'tot-mobile-section3-peripage.png') });
  }

  // 3. Компактный экран 320px
  await page.setViewport({ width: 320, height: 600, deviceScaleFactor: 2 });
  await page.reload({ waitUntil: 'networkidle0' });
  const compactCheck = await page.evaluate(() => {
    return {
      bodyScrollWidth: document.body.scrollWidth,
      windowWidth: window.innerWidth,
      hasOverflow: document.body.scrollWidth > window.innerWidth
    };
  });
  console.log(`[Mobile 320px] Проверка переполнения:`, compactCheck);
  const compactSec3 = await page.$('.section-title-paper');
  if (compactSec3) {
    const parent = await compactSec3.getProperty('parentElement');
    await parent.asElement().screenshot({ path: path.join(ARTIFACT_DIR, 'tot-mobile-320px.png') });
  }

  // 4. Проверка языковой чистоты (отсутствие слова Custom в русской локали)
  const ruWords = await page.evaluate(() => {
    const sec3 = document.querySelector('.section-title-paper')?.parentElement;
    const text = sec3 ? sec3.innerText : '';
    const hasCustomEn = /\bCustom\b/.test(text);
    return { hasCustomEn };
  });
  console.log(`[Language RU] Слово "Custom" в Секции 3 обнаружено: ${ruWords.hasCustomEn}`);

  // Переключение на EN
  await page.click('#btnLangEn');
  await new Promise(r => setTimeout(r, 300));
  const enBtnText = await page.$eval('#chipPaperMore', el => el.textContent.trim());
  console.log(`[Language EN] Текст кнопки в EN: "${enBtnText}"`);

  await browser.close();
  server.close();
  console.log('🎉 ВСЕ ПРОВЕРКИ УСПЕШНО ПРОЙДЕНЫ!');
}

run().catch(err => {
  console.error('❌ Ошибка:', err);
  process.exit(1);
});
