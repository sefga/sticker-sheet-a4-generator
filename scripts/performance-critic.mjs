import puppeteer from 'puppeteer-core';
import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const distDir = path.resolve(__dirname, '../dist');
const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

function startServer(port = 4188) {
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

  return new Promise((resolve, reject) => {
    server.on('error', (err) => {
      if (err.code === 'EADDRINUSE') {
        const fallback = http.createServer(server.listeners('request')[0]);
        fallback.listen(0, () => resolve({ server: fallback, port: fallback.address().port }));
      } else {
        reject(err);
      }
    });
    server.listen(port, () => resolve({ server, port }));
  });
}

async function runPerformanceCritic() {
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('⚡ ИНТЕРКРИТИКА СКОРОСТИ И ОТЗЫВЧИВОСТИ ВВОДА (StickerFit)');
  console.log('═══════════════════════════════════════════════════════════════');

  const { server, port } = await startServer(4188);
  const baseUrl = `http://localhost:${port}`;
  console.log(`📡 Локальный сервер запущен: ${baseUrl}`);

  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  const report = {
    tests: [],
    passed: true,
    metrics: {},
  };

  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 390, height: 844, isMobile: true, hasTouch: true });

    // Устанавливаем наблюдатель за Long Tasks (> 50ms)
    await page.evaluateOnNewDocument(() => {
      window.__longTasks = [];
      try {
        const observer = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            window.__longTasks.push({
              name: entry.name,
              duration: entry.duration,
              startTime: entry.startTime,
            });
          }
        });
        observer.observe({ entryTypes: ['longtask'] });
      } catch (e) {
        // Fallback если PerformanceObserver не поддерживается
      }
    });

    await page.goto(baseUrl, { waitUntil: 'networkidle0' });

    // ─────────────────────────────────────────────────────────────
    // ТЕСТ 1: Проверка атрибутов мобильных клавиатур
    // ─────────────────────────────────────────────────────────────
    console.log('\n📱 ТЕСТ 1: Аудит атрибутов мобильных клавиатур...');
    const keyboardAudit = await page.evaluate(() => {
      const widthInput = document.getElementById('stickerWidth');
      const heightInput = document.getElementById('stickerHeight');
      const marginAll = document.getElementById('marginAll');
      const gapAll = document.getElementById('gapAll');
      const copiesInput = document.getElementById('requestedCopies');

      return {
        widthInputMode: widthInput?.getAttribute('inputmode'),
        heightInputMode: heightInput?.getAttribute('inputmode'),
        marginInputMode: marginAll?.getAttribute('inputmode'),
        gapInputMode: gapAll?.getAttribute('inputmode'),
        copiesInputMode: copiesInput?.getAttribute('inputmode'),
        copiesPattern: copiesInput?.getAttribute('pattern'),
        hasAutocompleteOff: widthInput?.getAttribute('autocomplete') === 'off',
      };
    });

    const isKeyboardsOk =
      keyboardAudit.widthInputMode === 'decimal' &&
      keyboardAudit.heightInputMode === 'decimal' &&
      keyboardAudit.marginInputMode === 'decimal' &&
      keyboardAudit.gapInputMode === 'decimal' &&
      keyboardAudit.copiesInputMode === 'numeric' &&
      keyboardAudit.hasAutocompleteOff;

    report.tests.push({
      name: 'Mobile Virtual Keyboard Attributes',
      passed: isKeyboardsOk,
      details: keyboardAudit,
    });
    console.log(`  Статус: ${isKeyboardsOk ? '✅ УСПЕШНО' : '❌ ПРОВАЛ'}`);
    if (isKeyboardsOk) {
      console.log('  -> inputmode="decimal" активен для всех миллиметров');
      console.log('  -> inputmode="numeric" активен для тиража');
    }

    // Вспомогательная функция надежного ввода с очисткой поля
    const typeInField = async (selector, text, pressEnter = false) => {
      await page.click(selector);
      await page.keyboard.down('Control');
      await page.keyboard.press('KeyA');
      await page.keyboard.up('Control');
      await page.keyboard.press('Backspace');
      if (text) {
        await page.type(selector, text, { delay: 25 });
      }
      if (pressEnter) {
        await page.keyboard.press('Enter');
      }
    };

    // ─────────────────────────────────────────────────────────────
    // ТЕСТ 2: Скорость ввода символов и задержка Event Loop
    // ─────────────────────────────────────────────────────────────
    console.log('\n⚡ ТЕСТ 2: Симуляция скоростного ввода чисел (Latency & Debounce)...');
    await page.evaluate(() => {
      window.__longTasks = [];
    });
    const startTime = Date.now();
    await typeInField('#stickerWidth', '75.0', false);
    const typingTime = Date.now() - startTime;

    // Сразу проверяем состояние до срабатывания дебаунса
    const stateBeforeDebounce = await page.evaluate(() => {
      const val = document.getElementById('stickerWidth').value;
      const longTasks = window.__longTasks || [];
      return { val, longTasksCount: longTasks.length };
    });

    console.log(`  -> Время ввода символов: ${typingTime} мс`);
    console.log(`  -> Значение в инпуте: "${stateBeforeDebounce.val}"`);
    console.log(`  -> Блокирующих задач (>50мс) во время набора: ${stateBeforeDebounce.longTasksCount}`);

    // Ждем истечения дебаунса (500 мс)
    await new Promise((r) => setTimeout(r, 550));

    const stateAfterDebounce = await page.evaluate(() => {
      const chip = document.querySelector('.stat-chip');
      const badge = document.getElementById('layoutHeaderBadge')?.textContent;
      return { chipText: chip?.textContent, badge };
    });

    const isDebounceOk = stateBeforeDebounce.longTasksCount === 0 && stateBeforeDebounce.val === '75.0';
    report.tests.push({
      name: 'Typing Latency & Zero Main-Thread Freezes',
      passed: isDebounceOk,
      details: { typingTime, stateBeforeDebounce, stateAfterDebounce },
    });
    console.log(`  Статус: ${isDebounceOk ? '✅ УСПЕШНО' : '❌ ПРОВАЛ'}`);

    // ─────────────────────────────────────────────────────────────
    // ТЕСТ 3: Мгновенный коммит по клавише Enter и закрытие клавиатуры
    // ─────────────────────────────────────────────────────────────
    console.log('\n⌨️ ТЕСТ 3: Мгновенный коммит по Enter и blur()...');
    await typeInField('#stickerWidth', '60', true);

    const enterCommitState = await page.evaluate(() => {
      const activeEl = document.activeElement;
      const widthVal = document.getElementById('stickerWidth').value;
      return {
        isBlurred: activeEl !== document.getElementById('stickerWidth'),
        widthVal,
      };
    });

    const isEnterOk = enterCommitState.isBlurred && enterCommitState.widthVal === '60';
    report.tests.push({
      name: 'Instant Commit on Enter & Blur',
      passed: isEnterOk,
      details: enterCommitState,
    });
    console.log(`  Статус: ${isEnterOk ? '✅ УСПЕШНО' : '❌ ПРОВАЛ'}`);
    console.log(`  -> Поле потеряло фокус (скрытие экранной клавиатуры): ${enterCommitState.isBlurred}`);
    console.log(`  -> Значение успешно закоммичено: ${enterCommitState.widthVal} мм`);

    // ─────────────────────────────────────────────────────────────
    // ТЕСТ 4: Поддержка запятой (54,5 -> 54.5)
    // ─────────────────────────────────────────────────────────────
    console.log('\n콤 ТЕСТ 4: Поддержка мобильной десятичной запятой (54,5)...');
    await typeInField('#stickerWidth', '54,5', true);

    const commaState = await page.evaluate(() => {
      return document.getElementById('stickerWidth').value;
    });

    const isCommaOk = commaState === '54.5';
    report.tests.push({
      name: 'Decimal Comma Handling',
      passed: isCommaOk,
      details: { input: '54,5', output: commaState },
    });
    console.log(`  Статус: ${isCommaOk ? '✅ УСПЕШНО' : '❌ ПРОВАЛ'} (Значение: ${commaState})`);

    // ─────────────────────────────────────────────────────────────
    // ТЕСТ 5: Защита от экстремальных микро-значений (1 мм -> clamp 5 мм)
    // ─────────────────────────────────────────────────────────────
    console.log('\n🛡️ ТЕСТ 5: Защита DOM от зависания при микро-значениях...');
    await typeInField('#stickerWidth', '1', true);

    const microProtection = await page.evaluate(() => {
      const rects = document.querySelectorAll('.sheet-svg rect');
      const val = document.getElementById('stickerWidth').value;
      return {
        clampedValue: val,
        svgRectCount: rects.length,
        isSafe: rects.length < 500,
      };
    });

    const isProtectionOk = microProtection.isSafe && parseFloat(microProtection.clampedValue) >= 5;
    report.tests.push({
      name: 'Extreme Micro-Values Safety',
      passed: isProtectionOk,
      details: microProtection,
    });
    console.log(`  Статус: ${isProtectionOk ? '✅ УСПЕШНО' : '❌ ПРОВАЛ'}`);
    console.log(`  -> Значение безопасно ограничено (min 5 мм): ${microProtection.clampedValue} мм`);
    console.log(`  -> Количество SVG rect в DOM: ${microProtection.svgRectCount} (< 500)`);

    report.passed = report.tests.every((t) => t.passed);

    await page.close();
  } finally {
    await browser.close();
    server.close();
  }

  console.log('\n═══════════════════════════════════════════════════════════════');
  console.log(`⚡ ИТОГ ИНТЕРКРИТИКИ СКОРОСТИ: ${report.passed ? '✅ ВСЕ ТЕСТЫ ПРОЙДЕНЫ' : '❌ ЕСТЬ ОШИБКИ'}`);
  console.log('═══════════════════════════════════════════════════════════════');

  if (!report.passed) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

runPerformanceCritic().catch((err) => {
  console.error('Ошибка в performance-critic:', err);
  process.exit(1);
});
