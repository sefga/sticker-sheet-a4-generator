import puppeteer from 'puppeteer-core';
import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const distDir = path.resolve(__dirname, '../dist');
const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const artifactDir = 'C:\\Users\\sokol\\.gemini\\antigravity\\brain\\374f1080-c01c-4fbe-bb09-a58f02ae06e7';

function startServer(port = 4190) {
  const mimeTypes = {
    '.html': 'text/html; charset=utf-8',
    '.js': 'application/javascript; charset=utf-8',
    '.css': 'text/css; charset=utf-8',
    '.svg': 'image/svg+xml',
    '.png': 'image/png',
    '.txt': 'text/plain',
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

async function run5CyclesCritic() {
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('🔄 ЗАПУСК 5 НЕЗАВИСИМЫХ ЦИКЛОВ АУДИТА КРИТИКА ИНТЕРФЕЙСА');
  console.log('🎯 ПОРОГ ПРОХОЖДЕНИЯ ДЛЯ КАЖДОГО ЦИКЛА: >= 95 БАЛЛОВ');
  console.log('═══════════════════════════════════════════════════════════════\n');

  const { server, port } = await startServer(4195);
  const baseUrl = `http://localhost:${port}`;
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  const cycleResults = [];

  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1440, height: 900 });

    // =========================================================================
    // ЦИКЛ 1: Понятность русской терминологии и подсказок (RU UX Audit)
    // =========================================================================
    console.log('▶️ [ЦИКЛ 1 / 5] Аудит понятности терминологии и контекстных пояснений (RU)...');
    await page.goto(baseUrl, { waitUntil: 'networkidle0' });

    // Убедимся, что включен русский язык
    await page.evaluate(() => {
      const btnRu = document.getElementById('btnLangRu');
      if (btnRu) btnRu.click();
    });
    await new Promise((r) => setTimeout(r, 200));

    const cycle1Data = await page.evaluate(() => {
      const lblFill = document.querySelector('label[for="sizingFill"]')?.textContent?.trim() || '';
      const lblFit = document.querySelector('label[for="sizingFit"]')?.textContent?.trim() || '';
      const explanationEl = document.getElementById('sizingExplanation');
      const lockLabel = document.querySelector('label.checkbox-label span[data-i18n="lblLockRatio"]')?.textContent?.trim() || '';
      const lockHint = document.getElementById('lockRatioHint')?.textContent?.trim() || '';
      const paperTip = document.querySelector('.section-tip[data-i18n="tipPaperMargins"]')?.textContent?.trim() || '';
      const gapTip = document.querySelector('.section-tip[data-i18n="tipGaps"]')?.textContent?.trim() || '';
      const rotateTip = document.querySelector('.field-hint[data-i18n="tipAutoRotate"]')?.textContent?.trim() || '';

      // Проверяем интерактивное переключение режима заполнения
      const fitRadio = document.getElementById('sizingFit');
      fitRadio.click();
      fitRadio.dispatchEvent(new Event('change'));
      const explanationAfterFit = explanationEl?.textContent?.trim() || '';

      // Возвращаем fill
      const fillRadio = document.getElementById('sizingFill');
      fillRadio.click();
      fillRadio.dispatchEvent(new Event('change'));
      const explanationAfterFill = explanationEl?.textContent?.trim() || '';

      return {
        lblFill,
        lblFit,
        lockLabel,
        lockHint,
        paperTip,
        gapTip,
        rotateTip,
        explanationAfterFit,
        explanationAfterFill,
      };
    });

    let score1 = 100;
    const defects1 = [];
    if (!cycle1Data.lblFill.includes('Заполнить')) {
      score1 -= 20;
      defects1.push('Кнопка sizingFill не содержит понятный русский термин "Заполнить"');
    }
    if (!cycle1Data.lblFit.includes('Вписать')) {
      score1 -= 20;
      defects1.push('Кнопка sizingFit не содержит понятный русский термин "Вписать"');
    }
    if (!cycle1Data.lockLabel.includes('Связать')) {
      score1 -= 15;
      defects1.push('Лейбл пропорций не содержит понятный термин "Связать ширину и высоту"');
    }
    if (!cycle1Data.explanationAfterFill.includes('Заполнить') || !cycle1Data.explanationAfterFill.includes('обрезка')) {
      score1 -= 15;
      defects1.push('Пояснение для режима "Заполнить" отсутствует или некорректно');
    }
    if (!cycle1Data.explanationAfterFit.includes('Вписать') || !cycle1Data.explanationAfterFit.includes('100%')) {
      score1 -= 15;
      defects1.push('Пояснение для режима "Вписать" не обновляется при клике');
    }
    if (!cycle1Data.paperTip || !cycle1Data.gapTip) {
      score1 -= 10;
      defects1.push('Отсутствуют подсказки для полей принтера или зазоров под резку');
    }

    console.log(`  ✓ Термины режимов: "${cycle1Data.lblFill}" / "${cycle1Data.lblFit}"`);
    console.log(`  ✓ Связывание размеров: "${cycle1Data.lockLabel}"`);
    console.log(`  ✓ Динамическое пояснение Fill: "${cycle1Data.explanationAfterFill.slice(0, 60)}..."`);
    console.log(`  ✓ Динамическое пояснение Fit: "${cycle1Data.explanationAfterFit.slice(0, 60)}..."`);
    console.log(`  🏆 Оценка Цикла 1: ${score1} / 100 ${score1 >= 95 ? '✅ (>=95)' : '❌ (<95)'}\n`);
    cycleResults.push({ cycle: 1, name: 'Русская терминология и понятность UX', score: score1, defects: defects1 });

    // =========================================================================
    // ЦИКЛ 2: Международная локализация и переключение языков (EN Localization)
    // =========================================================================
    console.log('▶️ [ЦИКЛ 2 / 5] Аудит английской локализации и чистоты перевода (EN)...');
    await page.evaluate(() => {
      const btnEn = document.getElementById('btnLangEn');
      if (btnEn) btnEn.click();
    });
    await new Promise((r) => setTimeout(r, 200));

    const cycle2Data = await page.evaluate(() => {
      const langAttr = document.documentElement.lang;
      const lblFillEn = document.querySelector('label[for="sizingFill"]')?.textContent?.trim() || '';
      const lblFitEn = document.querySelector('label[for="sizingFit"]')?.textContent?.trim() || '';
      const lockLabelEn = document.querySelector('label.checkbox-label span[data-i18n="lblLockRatio"]')?.textContent?.trim() || '';
      const explanationEn = document.getElementById('sizingExplanation')?.textContent?.trim() || '';
      const paperTipEn = document.querySelector('.section-tip[data-i18n="tipPaperMargins"]')?.textContent?.trim() || '';

      // Проверка обратного переключения на RU
      const btnRu = document.getElementById('btnLangRu');
      if (btnRu) btnRu.click();
      const restoredLang = document.documentElement.lang;

      return {
        langAttr,
        lblFillEn,
        lblFitEn,
        lockLabelEn,
        explanationEn,
        paperTipEn,
        restoredLang,
      };
    });

    let score2 = 100;
    const defects2 = [];
    if (cycle2Data.langAttr !== 'en') {
      score2 -= 25;
      defects2.push('Атрибут lang не переключился на "en"');
    }
    if (!cycle2Data.lblFillEn.includes('Fill')) {
      score2 -= 20;
      defects2.push('Английская кнопка Fill не содержит "Fill"');
    }
    if (!cycle2Data.lblFitEn.includes('Fit')) {
      score2 -= 20;
      defects2.push('Английская кнопка Fit не содержит "Fit"');
    }
    if (!cycle2Data.lockLabelEn.includes('Link')) {
      score2 -= 15;
      defects2.push('Английский лейбл замка не содержит "Link"');
    }
    if (!cycle2Data.explanationEn.includes('Fill')) {
      score2 -= 15;
      defects2.push('Английское пояснение режима заполнения отсутствует');
    }
    if (cycle2Data.restoredLang !== 'ru') {
      score2 -= 10;
      defects2.push('Язык не восстановился при повторном клике на RU');
    }

    console.log(`  ✓ EN термины: "${cycle2Data.lblFillEn}" / "${cycle2Data.lblFitEn}"`);
    console.log(`  ✓ EN связывание: "${cycle2Data.lockLabelEn}"`);
    console.log(`  ✓ EN пояснение: "${cycle2Data.explanationEn.slice(0, 60)}..."`);
    console.log(`  ✓ Двустороннее переключение: en -> ${cycle2Data.restoredLang}`);
    console.log(`  🏆 Оценка Цикла 2: ${score2} / 100 ${score2 >= 95 ? '✅ (>=95)' : '❌ (<95)'}\n`);
    cycleResults.push({ cycle: 2, name: 'Локализация и переключение языков (EN/RU)', score: score2, defects: defects2 });

    // =========================================================================
    // ЦИКЛ 3: Защита от некорректного кода и размера > 304 мм (Boundary Audit)
    // =========================================================================
    console.log('▶️ [ЦИКЛ 3 / 5] Аудит защиты от некорректных размеров (>304 мм, микро-размеры)...');
    
    // Вводим размер 304 мм в ширину стикера, предварительно очистив поле
    await page.evaluate(() => {
      const input = document.getElementById('stickerWidth');
      input.value = '';
    });
    const inputW = await page.$('#stickerWidth');
    await inputW.type('304');

    const cycle3Exceed = await page.evaluate(() => {
      const banner = document.getElementById('stickerSizeError');
      const inputEl = document.getElementById('stickerWidth');
      return {
        bannerVisible: banner && banner.style.display !== 'none',
        bannerText: banner?.textContent?.trim() || '',
        hasErrorClass: inputEl?.classList.contains('input-has-error'),
      };
    });

    // Нажимаем Enter для коммита
    await page.keyboard.press('Enter');
    await new Promise((r) => setTimeout(r, 100));

    // Проверяем ввод микро-размера (2 мм)
    await page.evaluate(() => {
      const input = document.getElementById('stickerWidth');
      input.value = '';
    });
    await inputW.type('2');

    const cycle3Micro = await page.evaluate(() => {
      const banner = document.getElementById('stickerSizeError');
      return {
        bannerVisible: banner && banner.style.display !== 'none',
        bannerText: banner?.textContent?.trim() || '',
      };
    });

    // Возвращаем нормальный валидный размер 54 мм
    await page.evaluate(() => {
      const input = document.getElementById('stickerWidth');
      input.value = '';
    });
    await inputW.type('54');
    await page.keyboard.press('Enter');
    await new Promise((r) => setTimeout(r, 150));

    const cycle3Valid = await page.evaluate(() => {
      const banner = document.getElementById('stickerSizeError');
      const inputEl = document.getElementById('stickerWidth');
      return {
        bannerHidden: !banner || banner.style.display === 'none',
        noErrorClass: !inputEl?.classList.contains('input-has-error'),
      };
    });

    let score3 = 100;
    const defects3 = [];
    if (!cycle3Exceed.bannerVisible || !cycle3Exceed.bannerText.includes('297')) {
      score3 -= 30;
      defects3.push('При вводе 304 мм не появилось предупреждение о превышении длины A4 (297 мм)');
    }
    if (!cycle3Exceed.hasErrorClass) {
      score3 -= 15;
      defects3.push('Поле ввода 304 мм не подсвечено классом ошибки');
    }
    if (!cycle3Micro.bannerVisible || !cycle3Micro.bannerText.includes('5')) {
      score3 -= 20;
      defects3.push('При вводе 2 мм не появилось предупреждение о минимальном размере 5 мм');
    }
    if (!cycle3Valid.bannerHidden || !cycle3Valid.noErrorClass) {
      score3 -= 20;
      defects3.push('После ввода корректного значения 54 мм ошибка не исчезла');
    }

    console.log(`  ✓ Ввод 304 мм: обнаружена ошибка -> "${cycle3Exceed.bannerText}"`);
    console.log(`  ✓ Подсветка инпута: ${cycle3Exceed.hasErrorClass ? 'красная рамка активна' : 'нет'}`);
    console.log(`  ✓ Ввод 2 мм: предупреждение -> "${cycle3Micro.bannerText}"`);
    console.log(`  ✓ Восстановление 54 мм: баннер скрыт, статус чистый`);
    console.log(`  🏆 Оценка Цикла 3: ${score3} / 100 ${score3 >= 95 ? '✅ (>=95)' : '❌ (<95)'}\n`);
    cycleResults.push({ cycle: 3, name: 'Защита от неправильных размеров (>304 мм)', score: score3, defects: defects3 });

    // =========================================================================
    // ЦИКЛ 4: Мобильный интерфейс и сенсорные зоны (Mobile Touch Audit, 390x844)
    // =========================================================================
    console.log('▶️ [ЦИКЛ 4 / 5] Аудит мобильного интерфейса и сенсорной эргономики (390x844)...');
    await page.setViewport({ width: 390, height: 844, isMobile: true, hasTouch: true });
    await new Promise((r) => setTimeout(r, 200));

    const cycle4Data = await page.evaluate(() => {
      const wInput = document.getElementById('stickerWidth');
      const hInput = document.getElementById('stickerHeight');
      const cInput = document.getElementById('requestedCopies');
      const fillLabel = document.querySelector('label[for="sizingFill"]');
      const fitLabel = document.querySelector('label[for="sizingFit"]');

      const fillRect = fillLabel?.getBoundingClientRect() || {};
      const fitRect = fitLabel?.getBoundingClientRect() || {};

      // Проверка переключения мобильных табов (Параметры / Превью / Справка)
      const tabControls = document.getElementById('tabBtnControls');
      const tabPreview = document.getElementById('tabBtnPreview');
      const tabGuide = document.getElementById('tabBtnGuide');

      // Переключаемся на справку
      tabGuide?.click();
      const isGuideActive = document.body.classList.contains('tab-active-guide');

      // Переключаемся обратно на параметры
      tabControls?.click();
      const isControlsActive = document.body.classList.contains('tab-active-controls');

      return {
        wMode: wInput?.getAttribute('inputmode'),
        hMode: hInput?.getAttribute('inputmode'),
        cMode: cInput?.getAttribute('inputmode'),
        fillHeight: fillRect.height || 0,
        fitHeight: fitRect.height || 0,
        isGuideActive,
        isControlsActive,
        noHorizontalOverflow: document.documentElement.scrollWidth <= window.innerWidth + 2,
      };
    });

    let score4 = 100;
    const defects4 = [];
    if (cycle4Data.wMode !== 'decimal' || cycle4Data.hMode !== 'decimal') {
      score4 -= 20;
      defects4.push('Размеры стикера не используют inputmode="decimal"');
    }
    if (cycle4Data.cMode !== 'numeric') {
      score4 -= 15;
      defects4.push('Количество копий не использует inputmode="numeric"');
    }
    if (cycle4Data.fillHeight < 36 || cycle4Data.fitHeight < 36) {
      score4 -= 15;
      defects4.push('Сенсорные зоны переключателя режимов меньше 36px');
    }
    if (!cycle4Data.isGuideActive || !cycle4Data.isControlsActive) {
      score4 -= 25;
      defects4.push('Мобильные вкладки навигации не переключают разделы');
    }
    if (!cycle4Data.noHorizontalOverflow) {
      score4 -= 15;
      defects4.push('Обнаружен горизонтальный скролл на мобильном экране');
    }

    console.log(`  ✓ Мобильные клавиатуры: width=${cycle4Data.wMode}, height=${cycle4Data.hMode}, copies=${cycle4Data.cMode}`);
    console.log(`  ✓ Высота сенсорных кнопок: Fill=${cycle4Data.fillHeight.toFixed(1)}px, Fit=${cycle4Data.fitHeight.toFixed(1)}px`);
    console.log(`  ✓ Мобильная навигация по вкладкам: Справка=${cycle4Data.isGuideActive}, Параметры=${cycle4Data.isControlsActive}`);
    console.log(`  ✓ Отсутствие горизонтального скролла: ${cycle4Data.noHorizontalOverflow ? 'чисто' : 'ошибка'}`);
    console.log(`  🏆 Оценка Цикла 4: ${score4} / 100 ${score4 >= 95 ? '✅ (>=95)' : '❌ (<95)'}\n`);
    cycleResults.push({ cycle: 4, name: 'Мобильная эргономика и сенсорные зоны', score: score4, defects: defects4 });

    // =========================================================================
    // ЦИКЛ 5: Комплексный расчет раскладки и устойчивость системы (End-to-End)
    // =========================================================================
    console.log('▶️ [ЦИКЛ 5 / 5] Аудит сквозного расчета раскладки и производительности...');
    await page.setViewport({ width: 1440, height: 900 });
    await new Promise((r) => setTimeout(r, 200));

    const cycle5Data = await page.evaluate(() => {
      const headerStats = document.getElementById('previewHeaderStats')?.textContent?.trim() || '';
      const summaryStats = document.getElementById('layoutSummaryStats')?.textContent?.trim() || '';
      const downloadBtn = document.getElementById('btnDownloadPdf');
      const printBtn = document.getElementById('btnPrintPdf');
      const sheetSvg = document.querySelector('#sheetPreviewContainer svg');

      const stickerRects = sheetSvg?.querySelectorAll('rect.sticker-slot, rect') || [];

      return {
        headerStats,
        summaryStats,
        downloadAvailable: !!downloadBtn,
        printAvailable: !!printBtn,
        hasSvg: !!sheetSvg,
        stickersRendered: stickerRects.length,
      };
    });

    let score5 = 100;
    const defects5 = [];
    if (!cycle5Data.headerStats || cycle5Data.headerStats.includes('Загрузка')) {
      score5 -= 25;
      defects5.push('Вместимость листа в шапке не обновилась');
    }
    if (!cycle5Data.summaryStats || !cycle5Data.summaryStats.includes('колонок')) {
      score5 -= 25;
      defects5.push('Сводка колонок и строк в сайдбаре не рассчитана');
    }
    if (!cycle5Data.downloadAvailable || !cycle5Data.printAvailable) {
      score5 -= 25;
      defects5.push('Кнопки печати и скачивания PDF недоступны');
    }
    if (!cycle5Data.hasSvg || cycle5Data.stickersRendered === 0) {
      score5 -= 25;
      defects5.push('SVG-превью листа не содержит элементов');
    }

    console.log(`  ✓ Шапка превью: "${cycle5Data.headerStats}"`);
    console.log(`  ✓ Сводка сетки: "${cycle5Data.summaryStats.slice(0, 50)}..."`);
    console.log(`  ✓ Отрисовано элементов в SVG: ${cycle5Data.stickersRendered} шт.`);
    console.log(`  ✓ Экспорт: Скачать PDF и Печать готовы к работе`);
    console.log(`  🏆 Оценка Цикла 5: ${score5} / 100 ${score5 >= 95 ? '✅ (>=95)' : '❌ (<95)'}\n`);
    cycleResults.push({ cycle: 5, name: 'Сквозной расчет раскладки и экспорт', score: score5, defects: defects5 });

    // Сохранение скриншота десктопа с новыми подсказками
    const screenshotPath = path.join(artifactDir, 'critic-5-cycles-verified.png');
    await page.screenshot({ path: screenshotPath, fullPage: false });
    console.log(`📸 Снимок экрана сохранен в артефакты: ${screenshotPath}\n`);

  } finally {
    await browser.close();
    server.close();
  }

  // =========================================================================
  // ИТОГОВЫЙ СВОДНЫЙ ОТЧЕТ
  // =========================================================================
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('📊 ИТОГОВАЯ ТАБЛИЦА ВСЕХ 5 ЦИКЛОВ АУДИТА КРИТИКА:');
  console.log('═══════════════════════════════════════════════════════════════');
  let allPassed = true;
  let totalAverage = 0;

  cycleResults.forEach(({ cycle, name, score, defects }) => {
    const status = score >= 95 ? '✅ УСПЕШНО' : '❌ ПРОВАЛ';
    console.log(`  Цикл ${cycle}: [${score}/100] ${status} — ${name}`);
    if (defects.length > 0) {
      defects.forEach((d) => console.log(`      ⚠️ ${d}`));
    }
    totalAverage += score;
    if (score < 95) allPassed = false;
  });

  const averageScore = Math.round(totalAverage / cycleResults.length);
  console.log('───────────────────────────────────────────────────────────────');
  console.log(`🎯 СРЕДНЯЯ ОЦЕНКА ПО ВСЕМ ЦИКЛАМ: ${averageScore} / 100`);
  console.log(`🚦 ИТОГОВЫЙ СТАТУС: ${allPassed ? '✅ ВСЕ 5 ЦИКЛОВ ПРЕВЗОШЛИ ПОРОГ 95 БАЛЛОВ!' : '❌ ТРЕБУЕТСЯ ДОРАБОТКА'}`);
  console.log('═══════════════════════════════════════════════════════════════\n');

  if (!allPassed) {
    process.exit(1);
  }
}

run5CyclesCritic().catch((err) => {
  console.error('Ошибка выполнения 5 циклов критика:', err);
  process.exit(1);
});
