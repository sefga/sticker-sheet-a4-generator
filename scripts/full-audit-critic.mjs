import puppeteer from 'puppeteer-core';
import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const distDir = path.resolve(__dirname, '../dist');
const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

function startServer(port = 4180) {
  const mimeTypes = {
    '.html': 'text/html; charset=utf-8',
    '.js': 'application/javascript; charset=utf-8',
    '.css': 'text/css; charset=utf-8',
    '.svg': 'image/svg+xml',
    '.png': 'image/png',
    '.txt': 'text/plain',
    '.xml': 'application/xml',
  };

  const server = http.createServer((req, res) => {
    let filePath = path.join(distDir, req.url === '/' ? 'index.html' : req.url.split('?')[0]);
    if (!fs.existsSync(filePath)) filePath = path.join(distDir, 'index.html');
    const ext = path.extname(filePath).toLowerCase();
    res.writeHead(200, { 'Content-Type': mimeTypes[ext] || 'application/octet-stream' });
    fs.createReadStream(filePath).pipe(res);
  });

  return new Promise((resolve) => {
    server.listen(port, () => resolve(server));
  });
}

const VIEWPORTS = [
  { name: '4K_Desktop', width: 1920, height: 1080, isMobile: false, hasTouch: false },
  { name: 'MacBook_Desktop', width: 1440, height: 900, isMobile: false, hasTouch: false },
  { name: 'Laptop_Desktop', width: 1280, height: 800, isMobile: false, hasTouch: false },
  { name: 'Tablet_iPad', width: 768, height: 1024, isMobile: true, hasTouch: true },
  { name: 'Phone_Large', width: 390, height: 844, isMobile: true, hasTouch: true },
  { name: 'Phone_Small', width: 320, height: 568, isMobile: true, hasTouch: true },
];

async function runMultiViewportCritic() {
  const server = await startServer(4180);
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  const critiqueReport = [];

  try {
    const testResultsDir = path.resolve('test-results/audit-viewports');
    if (!fs.existsSync(testResultsDir)) fs.mkdirSync(testResultsDir, { recursive: true });

    for (const vp of VIEWPORTS) {
      console.log(`\n🔍 Критик анализирует экран: ${vp.name} (${vp.width} × ${vp.height})...`);
      const page = await browser.newPage();
      await page.setViewport({ width: vp.width, height: vp.height, isMobile: vp.isMobile, hasTouch: vp.hasTouch });

      const errors = [];
      page.on('console', (msg) => {
        if (msg.type() === 'error') errors.push(msg.text());
      });
      page.on('pageerror', (err) => errors.push(err.toString()));

      await page.goto('http://localhost:4180', { waitUntil: 'networkidle0' });

      // 1. Проверка горизонтального переполнения
      const hasHorizontalOverflow = await page.evaluate(() => {
        return document.documentElement.scrollWidth > window.innerWidth;
      });

      // 2. Проверка видимости ключевых компонентов
      const components = await page.evaluate(() => {
        const header = document.querySelector('.sidebar-header');
        const langSwitch = document.querySelector('.lang-switch');
        const btnDownload = document.getElementById('btnDownloadPdf');
        const btnMobileDownload = document.getElementById('btnMobileDownloadPdf');
        const previewContainer = document.getElementById('sheetPreviewContainer');
        const svg = document.querySelector('.sheet-svg');
        const tabs = document.getElementById('mobileTabNav');

        const isVisible = (el) => {
          if (!el) return false;
          const s = window.getComputedStyle(el);
          return s.display !== 'none' && s.visibility !== 'hidden' && s.opacity !== '0';
        };

        return {
          headerVisible: isVisible(header),
          langSwitchVisible: isVisible(langSwitch),
          btnDownloadVisible: isVisible(btnDownload),
          btnMobileDownloadVisible: isVisible(btnMobileDownload),
          previewRendered: isVisible(previewContainer) && !!svg,
          tabsVisible: isVisible(tabs),
        };
      });

      // 3. Замер кликабельных зон (Touch targets)
      const touchAnalysis = await page.evaluate((isMobile) => {
        if (!isMobile) return { smallCount: 0, items: [] };
        const clickable = Array.from(document.querySelectorAll('button, input, select, label, .lang-switch-btn'));
        const issues = [];
        clickable.forEach((el) => {
          const r = el.getBoundingClientRect();
          if (r.width > 0 && r.height > 0) {
            if (r.height < 32 || r.width < 32) {
              issues.push({
                tag: el.tagName,
                id: el.id || el.className,
                w: Math.round(r.width),
                h: Math.round(r.height),
                text: (el.innerText || el.value || '').slice(0, 15),
              });
            }
          }
        });
        return { smallCount: issues.length, items: issues.slice(0, 3) };
      }, vp.isMobile);

      // 4. Проверка клика по смене языка
      await page.click('#btnLangEn');
      await new Promise((r) => setTimeout(r, 150));
      const enTitle = await page.$eval('[data-i18n="appTitle"]', (el) => el.textContent.trim());

      // 5. Загрузка тестового стикера
      const fileInput = await page.$('#imageFileInput');
      await fileInput.uploadFile(path.resolve('test-sticker.png'));
      await new Promise((r) => setTimeout(r, 300));

      const stickersCount = await page.evaluate(() => {
        return document.querySelectorAll('#sheetPreviewContainer svg image').length;
      });

      // Скриншот
      const screenshotPath = path.join(testResultsDir, `${vp.name}.png`);
      await page.screenshot({ path: screenshotPath });

      // Оценка критика
      let score = 10;
      const issues = [];

      if (hasHorizontalOverflow) {
        score -= 3;
        issues.push('Горизонтальное переполнение экрана (overflow-x)');
      }
      if (errors.length > 0) {
        score -= 2;
        issues.push(`Ошибки в консоли: ${errors.join('; ')}`);
      }
      if (!components.langSwitchVisible) {
        score -= 2;
        issues.push('Кнопка переключения языка скрыта');
      }
      if (stickersCount === 0) {
        score -= 4;
        issues.push('Стикеры не отрисовались на листе A4');
      }
      if (enTitle !== 'A4 Sticker Sheet Maker') {
        score -= 2;
        issues.push('Перевод заголовка не сработал');
      }

      critiqueReport.push({
        viewport: vp.name,
        resolution: `${vp.width}x${vp.height}`,
        score: Math.max(1, score),
        hasHorizontalOverflow,
        stickersRendered: stickersCount,
        langSwitchVisible: components.langSwitchVisible,
        touchIssues: touchAnalysis.smallCount,
        issues,
      });

      console.log(`  -> Оценка: ${score}/10 | Стикеры на листе: ${stickersCount} | Переполнение: ${hasHorizontalOverflow}`);
      await page.close();
    }
  } finally {
    await browser.close();
    server.close();
  }

  console.log('\n====================================');
  console.log('ИТОГОВЫЙ ОТЧЕТ АГЕНТА-КРИТИКА UX/UI:');
  console.log('====================================');
  console.log(JSON.stringify(critiqueReport, null, 2));
}

runMultiViewportCritic().catch((err) => {
  console.error('Критический сбой аудита:', err);
  process.exit(1);
});
