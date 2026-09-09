import puppeteer from 'puppeteer-core';
import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const distDir = path.resolve(__dirname, '../dist');
const screenshotsDir = path.resolve(__dirname, '../docs/screenshots');
const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

if (!fs.existsSync(screenshotsDir)) {
  fs.mkdirSync(screenshotsDir, { recursive: true });
}

function startServer(port = 4192) {
  const mimeTypes = {
    '.html': 'text/html; charset=utf-8',
    '.js': 'application/javascript; charset=utf-8',
    '.css': 'text/css; charset=utf-8',
    '.svg': 'image/svg+xml',
    '.png': 'image/png',
  };

  const server = http.createServer((req, res) => {
    let filePath = path.join(distDir, req.url === '/' ? 'index.html' : req.url.split('?')[0]);
    if (!fs.existsSync(filePath)) filePath = path.join(distDir, 'index.html');
    const ext = path.extname(filePath).toLowerCase();
    res.writeHead(200, { 'Content-Type': mimeTypes[ext] || 'application/octet-stream' });
    fs.createReadStream(filePath).pipe(res);
  });

  return new Promise((resolve, reject) => {
    server.on('error', (err) => {
      if (err.code === 'EADDRINUSE') {
        const fallbackServer = http.createServer(server.listeners('request')[0]);
        fallbackServer.listen(0, () => resolve({ server: fallbackServer, port: fallbackServer.address().port }));
      } else {
        reject(err);
      }
    });
    server.listen(port, () => resolve({ server, port }));
  });
}

async function captureScreenshots() {
  console.log('📸 Запуск захвата официальных скриншотов интерфейса для README.md...');
  const { server, port } = await startServer(4198);
  const baseUrl = `http://localhost:${port}`;
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  try {
    const page = await browser.newPage();

    // 1. Десктопный вид (1440x900)
    console.log('  1. Захват desktop-ui.png (1440x900)...');
    await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 2 });
    await page.goto(baseUrl, { waitUntil: 'networkidle0' });
    await new Promise((r) => setTimeout(r, 400));
    const desktopPath = path.join(screenshotsDir, 'desktop-ui.png');
    await page.screenshot({ path: desktopPath, fullPage: false });
    console.log(`     ✓ Сохранено: ${desktopPath}`);

    // 2. Мобильный вид (390x844, iPhone 14/15)
    console.log('  2. Захват mobile-ui.png (390x844)...');
    await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
    await page.goto(baseUrl, { waitUntil: 'networkidle0' });
    await new Promise((r) => setTimeout(r, 400));
    const mobilePath = path.join(screenshotsDir, 'mobile-ui.png');
    await page.screenshot({ path: mobilePath, fullPage: false });
    console.log(`     ✓ Сохранено: ${mobilePath}`);

    // 3. Открытое модальное окно справки (Apple Help Sheet)
    console.log('  3. Захват help-modal.png...');
    await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 2 });
    await page.goto(baseUrl, { waitUntil: 'networkidle0' });
    await page.evaluate(() => {
      const guideBtn = document.getElementById('btnGuideLink');
      if (guideBtn) guideBtn.click();
    });
    await new Promise((r) => setTimeout(r, 400));
    const modalPath = path.join(screenshotsDir, 'help-modal.png');
    await page.screenshot({ path: modalPath, fullPage: false });
    console.log(`     ✓ Сохранено: ${modalPath}`);

    // 4. Панель параметров стикера с новыми подсказками (smart-input.png)
    console.log('  4. Захват smart-input.png (крупный план параметров)...');
    await page.evaluate(() => {
      const closeBtn = document.getElementById('btnGuideModalClose');
      if (closeBtn) closeBtn.click();
    });
    await new Promise((r) => setTimeout(r, 300));

    const section2 = await page.$('.panel-section:nth-of-type(2)');
    if (section2) {
      const sectionPath = path.join(screenshotsDir, 'smart-input.png');
      await section2.screenshot({ path: sectionPath });
      console.log(`     ✓ Сохранено: ${sectionPath}`);
    }

    console.log('\n🎉 Все скриншоты успешно сохранены в docs/screenshots/!');
  } finally {
    await browser.close();
    server.close();
  }
}

captureScreenshots().catch((err) => {
  console.error('Ошибка создания скриншотов:', err);
  process.exit(1);
});
