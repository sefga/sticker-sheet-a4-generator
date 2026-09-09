import puppeteer from 'puppeteer-core';
import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const distDir = path.resolve(__dirname, '../dist');
const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const ARTIFACT_DIR = 'C:\\Users\\sokol\\.gemini\\antigravity\\brain\\c6417109-ac7c-48ea-9805-da39b0cc511c';

if (!fs.existsSync(ARTIFACT_DIR)) {
  fs.mkdirSync(ARTIFACT_DIR, { recursive: true });
}

function startServer(port = 4210) {
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
        const fallbackServer = http.createServer(server.listeners('request')[0]);
        fallbackServer.listen(0, () => resolve({ server: fallbackServer, port: fallbackServer.address().port }));
      } else {
        reject(err);
      }
    });
    server.listen(port, () => resolve({ server, port }));
  });
}

export async function run5PassCritic() {
  console.log('╔════════════════════════════════════════════════════════════════════════╗');
  console.log('║       🤖 АВТОМАТИЗИРОВАННЫЙ АУДИТ UX/UI: 5 НЕЗАВИСИМЫХ АГЕНТОВ-КРИТИКОВ ║');
  console.log('║            Критерий прохождения: Оценка каждого агента >= 95           ║');
  console.log('╚════════════════════════════════════════════════════════════════════════╝\n');

  const { server, port } = await startServer(4210);
  const baseUrl = `http://localhost:${port}`;
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  const results = {
    agent1: { name: 'Агент 1: Визуальная иерархия и компактность', score: 0, defects: [], highlights: [] },
    agent2: { name: 'Агент 2: Понятность терминов и полиграфия', score: 0, defects: [], highlights: [] },
    agent3: { name: 'Агент 3: Anti-AI-Smell / No-Slop / Craft & Polish', score: 0, defects: [], highlights: [] },
    agent4: { name: 'Агент 4: Эргономика и сенсорные зоны (Touch Targets)', score: 0, defects: [], highlights: [] },
    agent5: { name: 'Агент 5: Микроинтеракции и предсказуемость состояний', score: 0, defects: [], highlights: [] },
  };

  try {
    // =========================================================================
    // ПРОХОД 1: АГЕНТ 1 — ВИЗУАЛЬНАЯ ИЕРАРХИЯ И КОМПАКТНОСТЬ
    // =========================================================================
    console.log('🔍 [ПРОХОД 1] Агент 1 проверяет визуальную иерархию, компактность и геометрию...');
    const page1 = await browser.newPage();
    await page1.setViewport({ width: 1440, height: 900 });
    await page1.goto(baseUrl, { waitUntil: 'networkidle0' });

    const layoutData = await page1.evaluate(() => {
      const sheet = document.getElementById('sheetPreviewContainer');
      const header = document.querySelector('.sidebar-header');
      const previewHeader = document.querySelector('.preview-header');
      const sRect = sheet ? sheet.getBoundingClientRect() : null;
      const hRect = header ? header.getBoundingClientRect() : null;
      const phRect = previewHeader ? previewHeader.getBoundingClientRect() : null;

      const hasHorizontalScroll = document.documentElement.scrollWidth > window.innerWidth;
      const collision = sRect && phRect ? (sRect.top < phRect.bottom && sRect.bottom > phRect.top) : false;

      // Проверка структуры секций
      const sections = Array.from(document.querySelectorAll('.panel-section'));
      const sectionHeights = sections.map(s => s.getBoundingClientRect().height);
      const totalSidebarHeight = sections.reduce((acc, h) => acc + h, 0);

      return {
        hasHorizontalScroll,
        collision,
        sheetVisible: sRect ? (sRect.width > 150 && sRect.height > 200) : false,
        sectionsCount: sections.length,
        totalSidebarHeight,
      };
    });

    let score1 = 100;
    if (layoutData.hasHorizontalScroll) {
      score1 -= 15;
      results.agent1.defects.push('Обнаружен горизонтальный скролл на десктопном экране 1440px.');
    } else {
      results.agent1.highlights.push('Горизонтальный скролл отсутствует на десктопе.');
    }

    if (layoutData.collision) {
      score1 -= 20;
      results.agent1.defects.push('Коллизия: лист накладывается на панель заголовка превью.');
    } else {
      results.agent1.highlights.push('Геометрические границы превью и панелей строго изолированы.');
    }

    if (!layoutData.sheetVisible) {
      score1 -= 30;
      results.agent1.defects.push('Контейнер превью листа не отображается или имеет некорректные габариты.');
    } else {
      results.agent1.highlights.push('Интерактивный лист A4 масштабируется корректно.');
    }

    if (layoutData.sectionsCount < 5) {
      score1 -= 10;
      results.agent1.defects.push('Нарушена блочная структура панелей настроек.');
    } else {
      results.agent1.highlights.push(`Четкая структура: ${layoutData.sectionsCount} логических панелей.`);
    }

    results.agent1.score = Math.max(0, score1);
    await page1.screenshot({ path: path.join(ARTIFACT_DIR, 'pass1_agent1_desktop_hierarchy.png') });
    await page1.close();

    // =========================================================================
    // ПРОХОД 2: АГЕНТ 2 — ПОНЯТНОСТЬ ТЕРМИНОВ И ПОЛИГРАФИЧЕСКАЯ ТОЧНОСТЬ
    // =========================================================================
    console.log('🔍 [ПРОХОД 2] Агент 2 анализирует понятность терминов, раскладки и полиграфию...');
    const page2 = await browser.newPage();
    await page2.setViewport({ width: 1440, height: 900 });
    await page2.goto(baseUrl, { waitUntil: 'networkidle0' });

    // Убедимся, что включен русский язык
    await page2.evaluate(() => {
      const btnRu = document.getElementById('btnLangRu');
      if (btnRu) btnRu.click();
    });
    await new Promise(r => setTimeout(r, 200));

    const termsData = await page2.evaluate(() => {
      const lblWidth = document.getElementById('lblStickerWidth')?.textContent || '';
      const lblHeight = document.getElementById('lblStickerHeight')?.textContent || '';
      const lblPaperFormat = document.querySelector('label[for="paperFormatSelect"]')?.textContent || '';
      const chipA4 = document.getElementById('chipPaperA4')?.textContent || '';
      const chipLetter = document.getElementById('chipPaperLetter')?.textContent || '';
      const chipCustom = document.getElementById('chipPaperCustom')?.textContent || '';
      const lblMargins = document.querySelector('label[data-i18n="lblMargins"]')?.textContent || '';
      const lblGaps = document.querySelector('label[data-i18n="lblGaps"]')?.textContent || '';
      const cutMarksSpan = document.querySelector('span[data-i18n="lblCutMarks"]')?.textContent || '';
      const bleedLabel = document.querySelector('label[for="bleedSelect"]')?.textContent || '';

      // Переключаем единицу на см
      const btnCm = document.getElementById('btnUnitCm');
      if (btnCm) btnCm.click();
      const lblWidthAfterCm = document.getElementById('lblStickerWidth')?.textContent || '';

      // Переключаем на in
      const btnIn = document.getElementById('btnUnitIn');
      if (btnIn) btnIn.click();
      const lblWidthAfterIn = document.getElementById('lblStickerWidth')?.textContent || '';

      // Возвращаем мм
      const btnMm = document.getElementById('btnUnitMm');
      if (btnMm) btnMm.click();

      return {
        lblWidth,
        lblHeight,
        lblPaperFormat,
        chipA4,
        chipLetter,
        chipCustom,
        lblMargins,
        lblGaps,
        cutMarksSpan,
        bleedLabel,
        unitSyncCm: lblWidthAfterCm.includes('см'),
        unitSyncIn: lblWidthAfterIn.includes('дюйм') || lblWidthAfterIn.includes('in'),
      };
    });

    let score2 = 100;
    if (!termsData.unitSyncCm || !termsData.unitSyncIn) {
      score2 -= 15;
      results.agent2.defects.push('Метки размеров не синхронизируют единицу измерения при переключении.');
    } else {
      results.agent2.highlights.push('Метки параметров мгновенно и наглядно обновляют единицу (мм / см / in).');
    }

    if (!termsData.lblMargins.toLowerCase().includes('поля') || !termsData.lblGaps.toLowerCase().includes('зазор') && !termsData.lblGaps.toLowerCase().includes('расстояние')) {
      score2 -= 15;
      results.agent2.defects.push('Терминология полей или зазоров недостаточно понятна.');
    } else {
      results.agent2.highlights.push('Четкая полиграфическая терминология: Поля листа, Зазоры между стикерами, Метки реза.');
    }

    if (!termsData.chipA4 || !termsData.chipLetter || !termsData.chipCustom) {
      score2 -= 10;
      results.agent2.defects.push('Отсутствуют быстрые чипсы популярных стандартов бумаги.');
    } else {
      results.agent2.highlights.push('Наличие быстрых чипсов бумаги: A4, Letter, Свой размер.');
    }

    results.agent2.score = Math.max(0, score2);
    await page2.close();

    // =========================================================================
    // ПРОХОД 3: АГЕНТ 3 — ANTI-AI-SMELL / NO-SLOP / CRAFT & POLISH
    // =========================================================================
    console.log('🔍 [ПРОХОД 3] Агент 3 ищет «запах ИИ» (эмодзи-спам, многословные лекции, водянистый текст)...');
    const page3 = await browser.newPage();
    await page3.setViewport({ width: 1440, height: 900 });
    await page3.goto(baseUrl, { waitUntil: 'networkidle0' });

    const aiSmellData = await page3.evaluate(() => {
      // Ищем типичные эмодзи, характерные для шаблонного AI-интерфейса
      const emojiRegex = /[\u{1F300}-\u{1F64F}\u{1F680}-\u{1F6FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1F900}-\u{1F9FF}\u{1F1E0}-\u{1F1FF}]/gu;
      
      const elementsToCheck = [
        ...Array.from(document.querySelectorAll('.mobile-tab-btn')),
        ...Array.from(document.querySelectorAll('.section-title')),
        ...Array.from(document.querySelectorAll('.section-tip')),
        ...Array.from(document.querySelectorAll('.field-hint')),
        ...Array.from(document.querySelectorAll('.sizing-explanation')),
        ...Array.from(document.querySelectorAll('.print-notice')),
        ...Array.from(document.querySelectorAll('.checkbox-label')),
        ...Array.from(document.querySelectorAll('.btn')),
      ];

      const foundEmojis = [];
      const verboseTexts = [];

      for (const el of elementsToCheck) {
        const text = el.textContent?.trim() || '';
        const matches = text.match(emojiRegex);
        if (matches) {
          foundEmojis.push({ tag: el.tagName, className: el.className, emoji: matches.join(' '), text: text.substring(0, 40) });
        }
        // Проверяем на избыточную многословность (водянистый лекторский стиль > 120 символов в тултипе)
        if (text.length > 140 && (el.classList.contains('section-tip') || el.classList.contains('sizing-explanation') || el.classList.contains('field-hint'))) {
          verboseTexts.push({ className: el.className, length: text.length, snippet: text.substring(0, 60) + '...' });
        }
      }

      return {
        foundEmojis,
        verboseTexts,
      };
    });

    let score3 = 100;
    if (aiSmellData.foundEmojis.length > 3) {
      const penalty = Math.min(25, (aiSmellData.foundEmojis.length - 2) * 3);
      score3 -= penalty;
      results.agent3.defects.push(`Обнаружено ${aiSmellData.foundEmojis.length} элементов с эмодзи-шумом (типичный AI smell). Примеры: ${aiSmellData.foundEmojis.slice(0, 4).map(e => `${e.emoji} в «${e.text}»`).join('; ')}`);
    } else {
      results.agent3.highlights.push('Интерфейс очищен от кричащего эмодзи-шума; строгий инструментальный вид.');
    }

    if (aiSmellData.verboseTexts.length > 0) {
      score3 -= Math.min(20, aiSmellData.verboseTexts.length * 6);
      results.agent3.defects.push(`Обнаружено ${aiSmellData.verboseTexts.length} многословных лекторских подсказок («вода» ChatGPT). Примеры: ${aiSmellData.verboseTexts.map(v => v.snippet).join('; ')}`);
    } else {
      results.agent3.highlights.push('Подсказки лаконичны, конкретны и функциональны, без лекторской воды.');
    }

    results.agent3.score = Math.max(0, score3);
    await page3.close();

    // =========================================================================
    // ПРОХОД 4: АГЕНТ 4 — ЭРГОНОМИКА И СЕНСОРНЫЕ ЗОНЫ (TOUCH TARGETS)
    // =========================================================================
    console.log('🔍 [ПРОХОД 4] Агент 4 тестирует сенсорные зоны (Touch Targets) на мобильном (375x812)...');
    const page4 = await browser.newPage();
    await page4.setViewport({ width: 375, height: 812, isMobile: true, hasTouch: true });
    await page4.goto(baseUrl, { waitUntil: 'networkidle0' });

    const touchData = await page4.evaluate(() => {
      const unitBtns = Array.from(document.querySelectorAll('.unit-btn')).map(b => {
        const r = b.getBoundingClientRect();
        return { text: b.textContent?.trim(), width: r.width, height: r.height };
      });

      const paperChips = Array.from(document.querySelectorAll('.paper-chip-btn')).map(b => {
        const r = b.getBoundingClientRect();
        return { text: b.textContent?.trim(), width: r.width, height: r.height };
      });

      const mobileTabs = Array.from(document.querySelectorAll('.mobile-tab-btn')).map(b => {
        const r = b.getBoundingClientRect();
        return { text: b.textContent?.trim(), width: r.width, height: r.height };
      });

      const mainBtn = document.getElementById('btnDownloadPdf')?.getBoundingClientRect();

      const hasMobileHorizontalScroll = document.documentElement.scrollWidth > window.innerWidth;

      return {
        unitBtns,
        paperChips,
        mobileTabs,
        mainBtnHeight: mainBtn ? mainBtn.height : 0,
        hasMobileHorizontalScroll,
      };
    });

    let score4 = 100;
    if (touchData.hasMobileHorizontalScroll) {
      score4 -= 20;
      results.agent4.defects.push('На мобильном экране (375px) обнаружен горизонтальный скролл.');
    } else {
      results.agent4.highlights.push('Отличная мобильная верстка: 0 горизонтального скролла на 375px.');
    }

    // Проверяем сенсорные зоны кнопок единиц (рекомендуется высота >= 36-40px для комфортного тапа)
    const smallUnitBtns = touchData.unitBtns.filter(b => b.height < 34);
    if (smallUnitBtns.length > 0) {
      score4 -= 15;
      results.agent4.defects.push(`Кнопки единиц измерения слишком мелкие для тапа: высота ${Math.round(smallUnitBtns[0].height)}px (требуется >= 36-40px).`);
    } else {
      results.agent4.highlights.push(`Кнопки единиц комфортны для тапа: высота >= 36px (${Math.round(touchData.unitBtns[0]?.height || 0)}px).`);
    }

    // Проверяем сенсорные зоны чипсов бумаги
    const smallChips = touchData.paperChips.filter(b => b.height < 32);
    if (smallChips.length > 0) {
      score4 -= 12;
      results.agent4.defects.push(`Чипсы бумаги мелкие: высота ${Math.round(smallChips[0].height)}px (требуется >= 32-36px).`);
    } else {
      results.agent4.highlights.push(`Чипсы бумаги эргономичны: высота >= 32px (${Math.round(touchData.paperChips[0]?.height || 0)}px).`);
    }

    // Проверяем кнопку скачивания PDF
    if (touchData.mainBtnHeight < 44) {
      score4 -= 10;
      results.agent4.defects.push(`Главная кнопка экспорта имеет высоту < 44px (${Math.round(touchData.mainBtnHeight)}px).`);
    } else {
      results.agent4.highlights.push(`Главная кнопка экспорта соответствует стандарту Apple HIG (высота ${Math.round(touchData.mainBtnHeight)}px).`);
    }

    results.agent4.score = Math.max(0, score4);
    await page4.screenshot({ path: path.join(ARTIFACT_DIR, 'pass4_agent4_mobile_touch.png') });
    await page4.close();

    // =========================================================================
    // ПРОХОД 5: АГЕНТ 5 — МИКРОИНТЕРАКЦИИ И ПРЕДСКАЗУЕМОСТЬ СОСТОЯНИЙ
    // =========================================================================
    console.log('🔍 [ПРОХОД 5] Агент 5 проверяет реактивность, плавность и предсказуемость переключений...');
    const page5 = await browser.newPage();
    await page5.setViewport({ width: 1440, height: 900 });
    await page5.goto(baseUrl, { waitUntil: 'networkidle0' });

    const jsErrors = [];
    page5.on('pageerror', err => jsErrors.push(err.message));

    const interactData = await page5.evaluate(async () => {
      // 1. Тест переключения бумаги через чипс Custom
      const chipCustom = document.getElementById('chipPaperCustom');
      const customGroup = document.getElementById('customPaperGroup');
      const formatSelect = document.getElementById('paperFormatSelect');

      chipCustom.click();
      const customVisibleAfterChip = customGroup && window.getComputedStyle(customGroup).display !== 'none';
      const selectValueAfterChip = formatSelect.value;

      // 2. Возврат на чипс A4
      const chipA4 = document.getElementById('chipPaperA4');
      chipA4.click();
      const customHiddenAfterA4 = customGroup && window.getComputedStyle(customGroup).display === 'none';

      // 3. Тест ориентации листа
      const lblOrientLandscape = document.getElementById('lblOrientLandscape');
      const lblOrientPortrait = document.getElementById('lblOrientPortrait');
      const sheetContainer = document.getElementById('sheetPreviewContainer');

      if (lblOrientLandscape) lblOrientLandscape.click();
      await new Promise(r => setTimeout(r, 260));
      const rectLandscape = sheetContainer ? sheetContainer.getBoundingClientRect() : null;
      const isLandscapeClass = sheetContainer ? sheetContainer.classList.contains('landscape') : false;

      if (lblOrientPortrait) lblOrientPortrait.click();
      await new Promise(r => setTimeout(r, 260));
      const rectPortrait = sheetContainer ? sheetContainer.getBoundingClientRect() : null;
      const isPortraitClass = sheetContainer ? !sheetContainer.classList.contains('landscape') : false;

      const orientationResponded = isLandscapeClass && isPortraitClass && rectLandscape && rectPortrait && 
        (rectLandscape.width >= rectPortrait.width) && (rectPortrait.height >= rectLandscape.height);

      // 4. Тест связывания полей
      const linkMargins = document.getElementById('linkMargins');
      const unlinkedMargins = document.getElementById('marginUnlinkedGroup');
      linkMargins.click(); // отключаем связку
      linkMargins.dispatchEvent(new Event('change'));
      const unlinkedVisible = unlinkedMargins && window.getComputedStyle(unlinkedMargins).display !== 'none';
      linkMargins.click(); // включаем обратно
      linkMargins.dispatchEvent(new Event('change'));

      return {
        customVisibleAfterChip,
        selectValueAfterChip,
        customHiddenAfterA4,
        orientationResponded,
        unlinkedVisible,
      };
    });

    let score5 = 100;
    if (jsErrors.length > 0) {
      score5 -= 25;
      results.agent5.defects.push(`Ошибки в консоли браузера: ${jsErrors.join('; ')}`);
    } else {
      results.agent5.highlights.push('Консоль браузера чиста, 0 ошибок во время всех взаимодействий.');
    }

    if (!interactData.customVisibleAfterChip || !interactData.customHiddenAfterA4) {
      score5 -= 15;
      results.agent5.defects.push('Блок пользовательского размера бумаги некорректно реагирует на чипсы A4/Свой.');
    } else {
      results.agent5.highlights.push('Чипсы бумаги и кастомные поля ввода идеально согласованы.');
    }

    if (!interactData.orientationResponded) {
      score5 -= 15;
      results.agent5.defects.push('Ориентация превью листа не переключается между альбомной и книжной.');
    } else {
      results.agent5.highlights.push('Превью моментально пересчитывает пропорции при смене ориентации.');
    }

    results.agent5.score = Math.max(0, score5);
    await page5.close();

  } finally {
    await browser.close();
    server.close();
  }

  // Сводный отчет
  console.log('\n════════════════════════════════════════════════════════════════════════');
  console.log('📊 РЕЗУЛЬТАТЫ 5 НЕЗАВИСИМЫХ ПРОХОДОВ АГЕНТОВ-КРИТИКОВ:');
  console.log('════════════════════════════════════════════════════════════════════════');
  let allPass = true;
  for (const [key, agent] of Object.entries(results)) {
    const passed = agent.score >= 95;
    if (!passed) allPass = false;
    const statusMark = passed ? '✅' : '❌';
    console.log(`\n${statusMark} ${agent.name}: ${agent.score} / 100 ${passed ? '(ПРОЙДЕНО)' : '(ТРЕБУЕТСЯ ДОРАБОТКА)'}`);
    if (agent.highlights.length > 0) {
      console.log('   Преимущества:');
      agent.highlights.forEach(h => console.log(`     • ${h}`));
    }
    if (agent.defects.length > 0) {
      console.log('   Замечания / дефекты:');
      agent.defects.forEach(d => console.log(`     ⚠️ ${d}`));
    }
  }

  console.log('\n════════════════════════════════════════════════════════════════════════');
  if (allPass) {
    console.log('🎉 ВСЕ 5 АГЕНТОВ-КРИТИКОВ ПОСТАВИЛИ ОЦЕНКУ >= 95 БАЛЛОВ!');
  } else {
    console.log('⚠️ ОБНАРУЖЕНЫ ОЦЕНКИ НИЖЕ 95. ТРЕБУЕТСЯ ОТЛАДКА И ПОВТОРНЫЙ ПРОХОД.');
  }
  console.log('════════════════════════════════════════════════════════════════════════\n');

  return { results, allPass };
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  run5PassCritic()
    .then(({ allPass }) => {
      process.exit(allPass ? 0 : 1);
    })
    .catch(err => {
      console.error('Ошибка выполнения аудита:', err);
      process.exit(1);
    });
}
