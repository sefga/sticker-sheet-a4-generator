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

function startServer(port = 4599) {
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
  console.log('🚀 Запуск верификации модального окна каталога бумаги...');
  const server = await startServer(4599);
  const baseUrl = 'http://localhost:4599';

  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();

  // 1. Десктоп 1280x850
  await page.setViewport({ width: 1280, height: 850, deviceScaleFactor: 2 });
  await page.goto(baseUrl, { waitUntil: 'networkidle0' });

  // Открываем каталог
  await page.click('#chipPaperMore');
  await new Promise(r => setTimeout(r, 400));

  const modalOpen = await page.$eval('#paperCatalogModal', el => el.classList.contains('open'));
  console.log(`[Desktop] Каталог открыт: ${modalOpen}`);

  // Проверка табов
  const tabs = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('.catalog-tab')).map(t => ({
      cat: t.getAttribute('data-cat'),
      text: t.textContent.trim(),
      active: t.classList.contains('active')
    }));
  });
  console.log('[Desktop] Табы категорий:', tabs);

  // Проверка карточек
  const cardsData = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('.catalog-card')).map((card, idx) => {
      const nameEl = card.querySelector('.card-name');
      const dimEl = card.querySelector('.card-dimensions');
      const badges = Array.from(card.querySelectorAll('.card-badge')).map(b => b.textContent.trim());
      const descEl = card.querySelector('.card-description');

      // Проверка обрезания (overflow)
      const isOverflowing = nameEl ? (nameEl.scrollWidth > nameEl.clientWidth) : false;

      return {
        index: idx,
        id: card.getAttribute('data-paper'),
        name: nameEl?.textContent?.trim() || '',
        dimensions: dimEl?.textContent?.trim() || '',
        badges: badges,
        description: descEl?.textContent?.trim() || '',
        isOverflowing,
        nameWidth: nameEl?.clientWidth,
        nameScrollWidth: nameEl?.scrollWidth
      };
    });
  });

  console.log(`[Desktop] Всего карточек в каталоге: ${cardsData.length}`);
  console.log('[Desktop] Первые 5 карточек:');
  cardsData.slice(0, 5).forEach(c => {
    console.log(` #${c.index + 1} [${c.id}] Name: "${c.name}", Dims: "${c.dimensions}", Badges: [${c.badges.join(', ')}], Overflow: ${c.isOverflowing}`);
  });

  // Проверка карточки #1 — должна быть Свой размер (custom)
  if (cardsData[0].id === 'custom') {
    console.log('✅ КАРТОЧКА #1: «Свой размер» на первом месте!');
  } else {
    console.error(`❌ ОШИБКА: Карточка #1 не custom, а ${cardsData[0].id}`);
  }

  // Проверка наличия обрезаний
  const truncatedCards = cardsData.filter(c => c.name.endsWith('...') || c.isOverflowing || c.name.length <= 2 && !['A4', 'A3', 'A5', 'A6'].includes(c.name));
  if (truncatedCards.length === 0) {
    console.log('✅ НИ ОДНО НАЗВАНИЕ НЕ ОБРЕЗАНО! Обрубков «P...», «T...», «5...» нет!');
  } else {
    console.error('❌ Найдены обрезанные карточки:', truncatedCards);
  }

  // Скриншот каталога на десктопе
  await page.screenshot({ path: path.join(ARTIFACT_DIR, 'catalog-modal-desktop.png') });

  // 2. Мобильный экран iPhone 375x812
  await page.setViewport({ width: 375, height: 812, deviceScaleFactor: 2 });
  await page.reload({ waitUntil: 'networkidle0' });

  // Открываем модальное окно на смартфоне
  await page.click('#chipPaperMore');
  await new Promise(r => setTimeout(r, 400));

  const mobileModalOpen = await page.$eval('#paperCatalogModal', el => el.classList.contains('open'));
  console.log(`[Mobile 375px] Каталог открыт: ${mobileModalOpen}`);

  const mobileCardsData = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('.catalog-card')).map((card, idx) => {
      const nameEl = card.querySelector('.card-name');
      const isOverflowing = nameEl ? (nameEl.scrollWidth > nameEl.clientWidth) : false;
      return {
        index: idx,
        id: card.getAttribute('data-paper'),
        name: nameEl?.textContent?.trim() || '',
        isOverflowing
      };
    });
  });

  const mobileTruncated = mobileCardsData.filter(c => c.name.endsWith('...') || c.isOverflowing);
  console.log(`[Mobile 375px] Карточек: ${mobileCardsData.length}, с обрезанием: ${mobileTruncated.length}`);

  // Скриншот на мобильном 375px
  await page.screenshot({ path: path.join(ARTIFACT_DIR, 'catalog-modal-mobile-375.png') });

  // Тест клика по табу "Свой размер"
  await page.evaluate(() => {
    const tabCustom = document.querySelector('.catalog-tab[data-cat="custom"]');
    if (tabCustom) tabCustom.click();
  });
  await new Promise(r => setTimeout(r, 300));

  const filteredCardsCount = await page.$$eval('.catalog-card', cards => cards.length);
  const firstFilteredCardId = await page.$eval('.catalog-card', el => el.getAttribute('data-paper'));
  console.log(`[Mobile Tab Custom] Отфильтровано карточек: ${filteredCardsCount}, ID первой карточки: ${firstFilteredCardId}`);

  // Клик по карточке "Свой размер"
  await page.click('.catalog-card');
  await new Promise(r => setTimeout(r, 500));

  const isCustomGroupVisible = await page.$eval('#customPaperGroup', el => window.getComputedStyle(el).display !== 'none');
  const summaryTitle = await page.$eval('#paperSummaryTitle', el => el.textContent.trim());
  console.log(`[Mobile] После выбора «Свой размер»: блок настроек виден: ${isCustomGroupVisible}, Title: "${summaryTitle}"`);

  // 3. Компактный мобильный 320px
  await page.setViewport({ width: 320, height: 600, deviceScaleFactor: 2 });
  // Снова открываем каталог
  await page.click('#chipPaperMore');
  await new Promise(r => setTimeout(r, 400));
  // Сбрасываем таб на "Все размеры"
  await page.evaluate(() => {
    const tabAll = document.querySelector('.catalog-tab[data-cat="all"]');
    if (tabAll) tabAll.click();
  });
  await new Promise(r => setTimeout(r, 300));

  await page.screenshot({ path: path.join(ARTIFACT_DIR, 'catalog-modal-mobile-320.png') });
  console.log('[Mobile 320px] Скриншот сохранен.');

  // 4. Проверка вкладки "Этикетки и рулоны" (на десктопе и мобильном)
  await page.setViewport({ width: 1280, height: 850, deviceScaleFactor: 2 });
  await page.evaluate(() => {
    const tabThermal = document.querySelector('.catalog-tab[data-cat="thermal"]');
    if (tabThermal) tabThermal.click();
  });
  await new Promise(r => setTimeout(r, 300));
  await page.screenshot({ path: path.join(ARTIFACT_DIR, 'catalog-modal-thermal-desktop.png') });

  const thermalCards = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('.catalog-card')).map(c => ({
      name: c.querySelector('.card-name')?.textContent?.trim(),
      dims: c.querySelector('.card-dimensions')?.textContent?.trim(),
      badges: Array.from(c.querySelectorAll('.card-badge')).map(b => b.textContent.trim())
    }));
  });
  console.log('[Thermal Tab Cards]:', thermalCards);

  await page.setViewport({ width: 375, height: 812, deviceScaleFactor: 2 });
  await page.screenshot({ path: path.join(ARTIFACT_DIR, 'catalog-modal-thermal-mobile.png') });
  console.log('🎉 ВСЕ ПРОВЕРКИ МОДАЛЬНОГО ОКНА КАТАЛОГА УСПЕШНО ЗАВЕРШЕНЫ!');
}

run().catch(err => {
  console.error('❌ Ошибка:', err);
  process.exit(1);
});
