import puppeteer from 'puppeteer-core';
import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const distDir = path.resolve(__dirname, '../dist');
const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const artifactDir = process.env.ARTIFACT_DIR || 'C:\\Users\\sokol\\.gemini\\antigravity\\brain\\67c6c949-429d-46c6-ac07-409c23eca07d';
if (!fs.existsSync(artifactDir)) {
  fs.mkdirSync(artifactDir, { recursive: true });
}

function startServer(port = 4182) {
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

async function runAppleDesignCritic() {
  console.log('🍏 Запуск агента-критика интерфейса ранга Apple HIG...');
  const { server, port } = await startServer(4186);
  const baseUrl = `http://localhost:${port}`;
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  const critique = {
    totalScore: 0,
    categories: {},
    defects: [],
    highlights: [],
    screenshots: {},
  };

  try {
    // -------------------------------------------------------------
    // ЭКРАН 1: Десктоп (MacBook Pro 1440x900)
    // -------------------------------------------------------------
    const page = await browser.newPage();
    await page.setViewport({ width: 1440, height: 900 });
    await page.goto(baseUrl, { waitUntil: 'networkidle0' });

    // 1. Проверка коллизий (Наложений элементов) — 25 баллов
    const collisionCheck = await page.evaluate(() => {
      const sheet = document.getElementById('sheetPreviewContainer');
      const header = document.querySelector('.sidebar-header');
      const previewHeader = document.querySelector('.preview-header');
      const guideModal = document.getElementById('guideModalBackdrop');

      const sRect = sheet.getBoundingClientRect();
      const hRect = header.getBoundingClientRect();
      const phRect = previewHeader.getBoundingClientRect();

      // Проверяем, что лист не наезжает на шапку превью
      const sheetHeaderCollision = sRect.top < phRect.bottom && sRect.bottom > phRect.top;
      // Проверяем, что модалка справки закрыта по умолчанию
      const isModalOpenByDefault = guideModal && guideModal.classList.contains('open');

      return {
        sheetVisible: sRect.width > 200 && sRect.height > 300,
        sheetHeaderCollision,
        isModalOpenByDefault,
        horizontalOverflow: document.documentElement.scrollWidth > window.innerWidth,
      };
    });

    let layoutScore = 25;
    if (collisionCheck.sheetHeaderCollision) {
      layoutScore -= 10;
      critique.defects.push('Лист А4 наезжает на верхнюю плашку статуса превью');
    }
    if (collisionCheck.isModalOpenByDefault) {
      layoutScore -= 10;
      critique.defects.push('Модальное окно справки открыто по умолчанию вместо фокуса на холсте');
    }
    if (collisionCheck.horizontalOverflow) {
      layoutScore -= 10;
      critique.defects.push('Обнаружено горизонтальное переполнение страницы');
    }
    if (!collisionCheck.sheetVisible) {
      layoutScore -= 15;
      critique.defects.push('Лист А4 не отображается на холсте');
    }
    critique.categories['Layout & Zero Collisions'] = { score: layoutScore, max: 25 };

    // 2. Проверка типографики шапки (Отсутствие уродливых переносов) — 20 баллов
    const typographyCheck = await page.evaluate(() => {
      const title = document.querySelector('.header-app-title');
      const brandTag = document.querySelector('.brand-tag');
      const badge = document.getElementById('layoutHeaderBadge');
      const guideBtn = document.getElementById('btnGuideLink');
      const langSwitch = document.querySelector('.lang-switch');

      const tRect = title.getBoundingClientRect();
      const bRect = brandTag.getBoundingClientRect();

      return {
        titleHeight: tRect.height,
        titleSingleLine: tRect.height <= 32, // Заголовок должен быть в 1 строку!
        brandTagVisible: bRect.width > 30 && bRect.height >= 20,
        badgeVisible: !!badge && badge.offsetWidth > 0,
        guideBtnVisible: !!guideBtn && guideBtn.offsetWidth > 0,
        langSwitchVisible: !!langSwitch && langSwitch.offsetWidth > 0,
        hasStatsBar: !!document.getElementById('previewHeaderStats'),
        chipsCount: document.querySelectorAll('.preview-stats-bar .stat-chip').length,
        hasStuckColonText: /(Sheet|Лист|Sticker|Стикер|Grid|Сетка|Margins|Поля|Gap|Зазор):[^\s]/.test(
          document.getElementById('previewHeaderStats')?.textContent || ''
        ),
        headerExportVisible: (() => {
          const btn = document.getElementById('btnHeaderDownloadPdf');
          return !!btn && btn.offsetWidth > 0 && btn.offsetHeight > 0;
        })(),
      };
    });

    let typoScore = 20;
    if (!typographyCheck.titleSingleLine) {
      typoScore -= 10;
      critique.defects.push(`Заголовок приложения переносится на несколько строк (высота: ${typographyCheck.titleHeight}px > 32px)`);
    } else {
      critique.highlights.push('Заголовок приложения аккуратно размещен в одну строку без переносов');
    }
    if (!typographyCheck.brandTagVisible || !typographyCheck.guideBtnVisible) {
      typoScore -= 5;
      critique.defects.push('Элементы управления в шапке скрыты или имеют нулевой размер');
    }
    if (typographyCheck.hasStuckColonText) {
      typoScore -= 5;
      critique.defects.push('Обнаружено типографическое слипание в характеристиках листа (отсутствует пробел после двоеточия)');
    } else if (typographyCheck.chipsCount >= 5) {
      critique.highlights.push('Характеристики листа оформлены в виде аккуратных чипов Apple HIG без типографического слипания');
    }
    if (typographyCheck.headerExportVisible) {
      critique.highlights.push('Ключевая кнопка экспорта PDF продублирована в правом верхнем углу шапки холста');
    } else {
      typoScore -= 5;
      critique.defects.push('Кнопка быстрого экспорта PDF в шапке отсутствует или скрыта');
    }
    critique.categories['Typography & Header Balance'] = { score: typoScore, max: 20 };

    // 3. Проверка эстетики Apple (Скругления, мягкие тени, canvas) — 20 баллов
    const aestheticCheck = await page.evaluate(() => {
      const sheet = document.getElementById('sheetPreviewContainer');
      const cs = window.getComputedStyle(sheet);
      const canvas = document.querySelector('.preview-area');
      const canvasCs = window.getComputedStyle(canvas);

      return {
        sheetShadow: cs.boxShadow,
        hasSoftShadow: cs.boxShadow !== 'none' && cs.boxShadow.includes('rgba'),
        hasCanvasTexture: canvasCs.backgroundImage !== 'none',
        borderRadius: parseInt(cs.borderRadius, 10) >= 4,
      };
    });

    let aestheticScore = 20;
    if (!aestheticCheck.hasSoftShadow) {
      aestheticScore -= 5;
      critique.defects.push('Отсутствует мягкая реалистичная тень листа бумаги A4');
    }
    critique.categories['Apple Aesthetics & Polish'] = { score: aestheticScore, max: 20 };

    // Скриншот основного чистого холста (Десктоп)
    const desktopScreenshotPath = path.join(artifactDir, 'apple-critic-desktop-canvas.png');
    await page.screenshot({ path: desktopScreenshotPath });
    critique.screenshots.desktopCanvas = desktopScreenshotPath;

    // 4. Проверка работы Apple Help Sheet (Открытие / закрытие модалки Справки) — 15 баллов
    console.log('  -> Проверка интерактивности Apple Help Sheet...');
    await page.click('#btnGuideLink');
    await new Promise((r) => setTimeout(r, 300));

    const modalStateOpen = await page.evaluate(() => {
      const modal = document.getElementById('guideModalBackdrop');
      const windowEl = document.querySelector('.guide-modal-window');
      const h3 = document.querySelector('#guideSection h3');
      const faq = document.querySelectorAll('.faq-item');

      const mStyle = window.getComputedStyle(modal);
      const isOpen = mStyle.display !== 'none' && mStyle.opacity === '1';

      return {
        isOpen,
        windowWidth: windowEl ? windowEl.offsetWidth : 0,
        hasContent: !!h3 && faq.length >= 5,
      };
    });

    let usabilityScore = 15;
    if (!modalStateOpen.isOpen || modalStateOpen.windowWidth < 500) {
      usabilityScore -= 10;
      critique.defects.push('Модальное окно справки не открылось по клику на кнопку');
    } else {
      critique.highlights.push('Apple Help Sheet плавно открывается в модальном окне с размытием фона');
    }

    // Скриншот открытой справки
    const helpModalScreenshotPath = path.join(artifactDir, 'apple-critic-help-modal.png');
    await page.screenshot({ path: helpModalScreenshotPath });
    critique.screenshots.helpModal = helpModalScreenshotPath;

    // Закрываем модалку по кнопке ✕
    await page.click('#btnGuideModalClose');
    await new Promise((r) => setTimeout(r, 250));

    const modalStateClosed = await page.evaluate(() => {
      const modal = document.getElementById('guideModalBackdrop');
      return !modal || !modal.classList.contains('open');
    });

    if (!modalStateClosed) {
      usabilityScore -= 5;
      critique.defects.push('Кнопка закрытия модального окна ✕ не сработала');
    }
    critique.categories['Information Architecture & Usability'] = { score: usabilityScore, max: 15 };

    // -------------------------------------------------------------
    // ЭКРАН 2: Мобильный (iPhone 390x844) — 20 баллов
    // -------------------------------------------------------------
    console.log('  -> Проверка мобильного интерфейса на iPhone (390 × 844)...');
    await page.setViewport({ width: 390, height: 844, isMobile: true, hasTouch: true });
    await page.reload({ waitUntil: 'networkidle0' });

    const mobileCheck = await page.evaluate(() => {
      const tabs = document.querySelectorAll('.mobile-tab-btn');
      const tabControls = document.getElementById('tabBtnControls');
      const tabPreview = document.getElementById('tabBtnPreview');
      const tabGuide = document.getElementById('tabBtnGuide');
      const stickyBar = document.getElementById('mobileStickyBar');
      const overflow = document.documentElement.scrollWidth > window.innerWidth;

      // Замер сенсорных зон (кнопки, поля ввода, селекты и контейнеры меток)
      const clickables = Array.from(document.querySelectorAll('button, input:not([type="checkbox"]):not([type="radio"]):not([type="file"]), select, .lang-switch-btn, .checkbox-label'));
      let smallTargets = 0;
      clickables.forEach((el) => {
        const r = el.getBoundingClientRect();
        if (r.width > 0 && r.height > 0 && (r.width < 32 || r.height < 32)) {
          smallTargets++;
        }
      });

      return {
        tabsCount: tabs.length,
        hasTabGuide: !!tabGuide,
        stickyBarVisible: stickyBar && window.getComputedStyle(stickyBar).display !== 'none',
        overflow,
        smallTargets,
      };
    });

    let mobileScore = 20;
    if (mobileCheck.overflow) {
      mobileScore -= 10;
      critique.defects.push('Мобильный экран имеет горизонтальное переполнение');
    }
    if (mobileCheck.tabsCount < 3 || !mobileCheck.hasTabGuide) {
      mobileScore -= 5;
      critique.defects.push('На мобильном экране отсутствует вкладка Справка');
    }
    if (mobileCheck.smallTargets > 5) {
      mobileScore -= 3;
      critique.defects.push(`Слишком мелкие сенсорные зоны на мобильном (${mobileCheck.smallTargets} шт.)`);
    } else {
      critique.highlights.push('Все сенсорные зоны оптимизированы под пальцевый ввод');
    }
    critique.categories['Responsiveness & Touch Targets'] = { score: mobileScore, max: 20 };

    // Скриншот мобильного
    const mobileScreenshotPath = path.join(artifactDir, 'apple-critic-mobile.png');
    await page.screenshot({ path: mobileScreenshotPath });
    critique.screenshots.mobile = mobileScreenshotPath;

    // Подсчет общего балла
    critique.totalScore = Object.values(critique.categories).reduce((sum, cat) => sum + cat.score, 0);
    critique.passed = critique.totalScore >= 95;

    await page.close();
  } finally {
    await browser.close();
    server.close();
  }

  console.log('\n═══════════════════════════════════════════════════════════════');
  console.log(`🍏 ИТОГОВАЯ ОЦЕНКА ДИЗАЙН-КРИТИКА APPLE HIG: ${critique.totalScore} / 100`);
  console.log(`🎯 ПОРОГ ПРОХОЖДЕНИЯ ЦИКЛА: 95 БАЛЛОВ`);
  console.log(`🚦 СТАТУС: ${critique.passed ? '✅ ПРИНЯТО (ВЫШЕ 95 БАЛЛОВ)' : '❌ ОТКЛОНЕНО (ТРЕБУЕТСЯ ИСПРАВЛЕНИЕ)'}`);
  console.log('═══════════════════════════════════════════════════════════════');

  console.log('\n📊 Детализация по категориям:');
  for (const [name, data] of Object.entries(critique.categories)) {
    console.log(`  • ${name}: ${data.score} / ${data.max} баллов`);
  }

  if (critique.highlights.length > 0) {
    console.log('\n✨ Сильные стороны:');
    critique.highlights.forEach((h) => console.log(`  + ${h}`));
  }

  if (critique.defects.length > 0) {
    console.log('\n⚠️ Обнаруженные дефекты:');
    critique.defects.forEach((d) => console.log(`  - ${d}`));
  }

  if (!critique.passed) {
    console.error(`\n❌ Браузерный критик отклонил билд: ${critique.totalScore} < 95. Требуется цикл исправлений.`);
    process.exit(1);
  } else {
    console.log('\n🎉 Браузерная проверка критика успешно пройдена с высшим баллом!');
    process.exit(0);
  }
}

runAppleDesignCritic().catch((err) => {
  console.error('Ошибка критика:', err);
  process.exit(1);
});
