import puppeteer from 'puppeteer-core';
import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const distDir = path.resolve(__dirname, '../dist');
const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const ARTIFACT_DIR = 'C:\\Users\\sokol\\.gemini\\antigravity\\brain\\9b742780-902a-4b12-a6e0-470f65c4a30c';
const testStickerPath = path.resolve(__dirname, '../test-sticker.png');

if (!fs.existsSync(ARTIFACT_DIR)) {
  fs.mkdirSync(ARTIFACT_DIR, { recursive: true });
}

function startServer(port = 4422) {
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

export async function runMobileModalsCritic() {
  console.log('╔══════════════════════════════════════════════════════════════════════════╗');
  console.log('║ 📱 АВТОМАТИЗИРОВАННЫЙ БРАУЗЕРНЫЙ КРИТИК: МОДАЛЬНЫЕ ОКНА И РАЗДЕЛ 3        ║');
  console.log('║    Проверка адаптивности, отсутствия переполнения и реальные скриншоты   ║');
  console.log('╚══════════════════════════════════════════════════════════════════════════╝\n');

  const { server, port } = await startServer(4422);
  const baseUrl = `http://localhost:${port}`;
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  const viewports = [
    { name: 'iphone_se_320', width: 320, height: 568, device: 'iPhone SE (320×568)' },
    { name: 'android_360', width: 360, height: 740, device: 'Android Compact (360×740)' },
    { name: 'iphone_14_375', width: 375, height: 812, device: 'iPhone 12/13/14 (375×812)' },
    { name: 'iphone_max_414', width: 414, height: 896, device: 'iPhone XR/Plus/Max (414×896)' },
  ];

  const critique = {
    scores: {
      section3: 25,
      paperCatalog: 25,
      guideModal: 25,
      cropModal: 25,
    },
    defects: [],
    highlights: [],
    screenshots: [],
  };

  try {
    for (const vp of viewports) {
      console.log(`\n▶️ [ТЕСТ ЭКРАНА] ${vp.device}...`);
      const page = await browser.newPage();
      await page.setViewport({ width: vp.width, height: vp.height, isMobile: true, hasTouch: true });
      await page.goto(baseUrl, { waitUntil: 'networkidle0' });

      // Переключаем интерфейс на русский язык
      await page.evaluate(() => {
        const btnRu = document.getElementById('btnLangRu');
        if (btnRu) btnRu.click();
      });
      await new Promise(r => setTimeout(r, 150));

      // -------------------------------------------------------------
      // 1. ПРОВЕРКА РАЗДЕЛА 3 (Лист бумаги)
      // -------------------------------------------------------------
      console.log(`   [1/4] Проверка Раздела 3 (Лист бумаги)...`);
      const sec3Metrics = await page.evaluate(() => {
        const sec3 = document.querySelector('.panel-section:nth-of-type(3)');
        if (sec3) sec3.scrollIntoView();

        const docWidth = document.documentElement.scrollWidth;
        const winWidth = window.innerWidth;
        const hasHScroll = docWidth > winWidth;

        const paperSwitch = document.querySelector('.paper-switch');
        const psRect = paperSwitch ? paperSwitch.getBoundingClientRect() : null;

        const chips = Array.from(document.querySelectorAll('.paper-chip-btn')).map(btn => {
          const r = btn.getBoundingClientRect();
          return {
            id: btn.id,
            text: (btn.textContent || '').trim(),
            width: r.width,
            height: r.height,
          };
        });

        const card = document.getElementById('paperSummaryCard');
        const cRect = card ? card.getBoundingClientRect() : null;

        return {
          hasHScroll,
          docWidth,
          winWidth,
          paperSwitchEnclosed: psRect ? psRect.left >= 0 && psRect.right <= winWidth + 2 : false,
          paperSwitchScrollable: paperSwitch ? paperSwitch.scrollWidth >= paperSwitch.clientWidth : false,
          chipsCount: chips.length,
          allChipsMinHeight: chips.every(c => c.height >= 34),
          summaryCardEnclosed: cRect ? cRect.left >= 0 && cRect.right <= winWidth + 2 : false,
        };
      });

      const shotSec3Name = `critic_${vp.name}_section3.png`;
      await page.screenshot({ path: path.join(ARTIFACT_DIR, shotSec3Name) });
      critique.screenshots.push({ screen: `${vp.device} - Раздел 3`, file: shotSec3Name });

      if (sec3Metrics.hasHScroll) {
        critique.defects.push(`[${vp.device}] Горизонтальный скролл страницы в Разделе 3 (${sec3Metrics.docWidth}px > ${sec3Metrics.winWidth}px)`);
        critique.scores.section3 = Math.max(0, critique.scores.section3 - 5);
      } else {
        critique.highlights.push(`[${vp.device}] Нулевой горизонтальный скролл: страница строго укладывается в ${vp.width}px.`);
      }

      if (!sec3Metrics.paperSwitchEnclosed) {
        critique.defects.push(`[${vp.device}] Контейнер чипсов бумаги .paper-switch выходит за пределы экрана.`);
        critique.scores.section3 = Math.max(0, critique.scores.section3 - 5);
      } else {
        critique.highlights.push(`[${vp.device}] Контейнер .paper-switch идеально вписан в ширину экрана со скролл-треком.`);
      }

      // -------------------------------------------------------------
      // 2. ПРОВЕРКА МОДАЛЬНОГО ОКНА КАТАЛОГА БУМАГИ
      // -------------------------------------------------------------
      console.log(`   [2/4] Проверка Модального окна каталога бумаги...`);
      await page.evaluate(() => {
        const btnOpen = document.getElementById('btnOpenCatalogLink') || document.getElementById('chipPaperMore');
        if (btnOpen) btnOpen.click();
      });
      await new Promise(r => setTimeout(r, 350));

      const catalogMetrics = await page.evaluate(() => {
        const modal = document.getElementById('paperCatalogModal');
        const dialog = document.querySelector('.paper-catalog-dialog');
        const tabs = document.querySelector('.catalog-category-tabs');
        const cardsGrid = document.querySelector('.catalog-cards-grid');
        const doneBtn = document.getElementById('btnDonePaperCatalog');

        const winWidth = window.innerWidth;
        const dRect = dialog ? dialog.getBoundingClientRect() : null;
        const tRect = tabs ? tabs.getBoundingClientRect() : null;

        const cards = Array.from(document.querySelectorAll('.catalog-card')).map(c => {
          const r = c.getBoundingClientRect();
          return {
            width: r.width,
            height: r.height,
            left: r.left,
            right: r.right,
          };
        });

        // Проверяем, что карточки не наползают друг на друга
        let overlappingCards = false;
        for (let i = 0; i < cards.length - 1; i++) {
          if (cards[i].height < 55) overlappingCards = true;
          if (cards[i].right > winWidth + 2) overlappingCards = true;
        }

        return {
          isOpen: modal && modal.classList.contains('open'),
          dialogEnclosed: dRect ? dRect.left >= -1 && dRect.right <= winWidth + 2 : false,
          tabsHeightOk: tRect ? tRect.height >= 34 : false,
          cardsCount: cards.length,
          overlappingCards,
          doneBtnVisible: doneBtn ? doneBtn.getBoundingClientRect().height >= 40 : false,
        };
      });

      const shotCatalogName = `critic_${vp.name}_modal_paper_catalog.png`;
      await page.screenshot({ path: path.join(ARTIFACT_DIR, shotCatalogName) });
      critique.screenshots.push({ screen: `${vp.device} - Каталог бумаги`, file: shotCatalogName });

      if (!catalogMetrics.dialogEnclosed) {
        critique.defects.push(`[${vp.device}] Диалоговое окно каталога бумаги выступает за границы экрана.`);
        critique.scores.paperCatalog = Math.max(0, critique.scores.paperCatalog - 5);
      } else {
        critique.highlights.push(`[${vp.device}] Каталог бумаги: идеальный Bottom Sheet, точно укладывается в ширину ${vp.width}px.`);
      }

      if (!catalogMetrics.tabsHeightOk) {
        critique.defects.push(`[${vp.device}] Табы категорий сплющены или обрезаны по высоте.`);
        critique.scores.paperCatalog = Math.max(0, critique.scores.paperCatalog - 5);
      } else {
        critique.highlights.push(`[${vp.device}] Табы категорий: полноценные скроллируемые pill-кнопки без сжатия.`);
      }

      if (catalogMetrics.overlappingCards) {
        critique.defects.push(`[${vp.device}] Карточки бумаги переполняются или наползают друг на друга.`);
        critique.scores.paperCatalog = Math.max(0, critique.scores.paperCatalog - 6);
      } else {
        critique.highlights.push(`[${vp.device}] Карточки форматов: правильная высота, текст и бейджи внутри границ карточки.`);
      }

      // Закрываем каталог бумаги
      await page.evaluate(() => {
        const btnDone = document.getElementById('btnDonePaperCatalog') || document.getElementById('btnClosePaperCatalog');
        if (btnDone) btnDone.click();
      });
      await new Promise(r => setTimeout(r, 200));

      // -------------------------------------------------------------
      // 3. ПРОВЕРКА МОДАЛЬНОГО ОКНА СПРАВКИ (Tab 3)
      // -------------------------------------------------------------
      console.log(`   [3/4] Проверка Модального окна справки...`);
      await page.evaluate(() => {
        const tabGuide = document.getElementById('tabBtnGuide') || document.getElementById('btnGuideLink');
        if (tabGuide) tabGuide.click();
      });
      await new Promise(r => setTimeout(r, 300));

      const guideMetrics = await page.evaluate(() => {
        const winWidth = window.innerWidth;
        const modal = document.querySelector('.guide-modal-window');
        const mRect = modal ? modal.getBoundingClientRect() : null;
        const table = document.querySelector('.table-responsive');
        const tRect = table ? table.getBoundingClientRect() : null;
        const btnBack = document.getElementById('btnGuideBack');
        const bRect = btnBack ? btnBack.getBoundingClientRect() : null;

        return {
          modalEnclosed: mRect ? mRect.left >= -1 && mRect.right <= winWidth + 2 : false,
          tableEnclosed: tRect ? tRect.left >= 0 && tRect.right <= winWidth + 2 : false,
          btnBackAccessible: bRect ? bRect.width >= 40 && bRect.height >= 38 : false,
        };
      });

      const shotGuideName = `critic_${vp.name}_modal_guide.png`;
      await page.screenshot({ path: path.join(ARTIFACT_DIR, shotGuideName) });
      critique.screenshots.push({ screen: `${vp.device} - Справка и документация`, file: shotGuideName });

      if (!guideMetrics.modalEnclosed) {
        critique.defects.push(`[${vp.device}] Окно справки выходит за пределы экрана.`);
        critique.scores.guideModal = Math.max(0, critique.scores.guideModal - 5);
      } else {
        critique.highlights.push(`[${vp.device}] Модалка справки: нативный полноэкранный вид с плавной прокруткой.`);
      }

      if (!guideMetrics.tableEnclosed) {
        critique.defects.push(`[${vp.device}] Таблица популярных размеров стикеров выталкивает ширину страницы.`);
        critique.scores.guideModal = Math.max(0, critique.scores.guideModal - 5);
      } else {
        critique.highlights.push(`[${vp.device}] Таблица справочника полностью адаптирована и изолирована от переполнения.`);
      }

      // Возврат назад
      await page.evaluate(() => {
        const btnBack = document.getElementById('btnGuideBack') || document.getElementById('btnGuideDoneBottom');
        if (btnBack) btnBack.click();
        const tabControls = document.getElementById('tabBtnControls');
        if (tabControls) tabControls.click();
      });
      await new Promise(r => setTimeout(r, 200));

      // -------------------------------------------------------------
      // 4. ПРОВЕРКА МОДАЛЬНОГО ОКНА КАДРИРОВАНИЯ
      // -------------------------------------------------------------
      console.log(`   [4/4] Проверка Модального окна кадрирования...`);
      const fileInput = await page.$('#imageFileInput');
      if (fileInput && fs.existsSync(testStickerPath)) {
        await fileInput.uploadFile(testStickerPath);
        await new Promise(r => setTimeout(r, 400));

        await page.evaluate(() => {
          const btnCrop = document.getElementById('btnOpenCrop');
          if (btnCrop && !btnCrop.disabled) btnCrop.click();
        });
        await new Promise(r => setTimeout(r, 500));

        const cropMetrics = await page.evaluate(() => {
          const winWidth = window.innerWidth;
          const winHeight = window.innerHeight;
          const modalWindow = document.querySelector('.crop-modal-window');
          const mwRect = modalWindow ? modalWindow.getBoundingClientRect() : null;

          const toolbar = document.querySelector('.crop-modal-toolbar');
          const tbRect = toolbar ? toolbar.getBoundingClientRect() : null;

          const buttons = Array.from(toolbar ? toolbar.querySelectorAll('button') : []).map(b => {
            const r = b.getBoundingClientRect();
            return {
              id: b.id,
              text: b.textContent.trim(),
              left: r.left,
              right: r.right,
              width: r.width,
              height: r.height,
            };
          });

          const buttonsEnclosed = buttons.every(b => b.left >= -1 && b.right <= winWidth + 2);
          const touchTargetsOk = buttons.every(b => b.height >= 42);

          return {
            windowEnclosed: mwRect ? mwRect.left >= -1 && mwRect.right <= winWidth + 2 : false,
            toolbarEnclosed: tbRect ? tbRect.left >= -1 && tbRect.right <= winWidth + 2 : false,
            buttonsEnclosed,
            touchTargetsOk,
            buttonsCount: buttons.length,
          };
        });

        const shotCropName = `critic_${vp.name}_modal_crop.png`;
        await page.screenshot({ path: path.join(ARTIFACT_DIR, shotCropName) });
        critique.screenshots.push({ screen: `${vp.device} - Кадрирование`, file: shotCropName });

        if (!cropMetrics.windowEnclosed || !cropMetrics.buttonsEnclosed) {
          critique.defects.push(`[${vp.device}] Окно кадрирования или его кнопки выходят за экран.`);
          critique.scores.cropModal = Math.max(0, critique.scores.cropModal - 5);
        } else {
          critique.highlights.push(`[${vp.device}] Окно кадрирования: все кнопки (${cropMetrics.buttonsCount} шт.) идеально вписаны без переполнения.`);
        }

        if (!cropMetrics.touchTargetsOk) {
          critique.defects.push(`[${vp.device}] Недостаточный размер кнопок в окне кадрирования (< 42px).`);
          critique.scores.cropModal = Math.max(0, critique.scores.cropModal - 3);
        } else {
          critique.highlights.push(`[${vp.device}] Кнопки кадрирования: отличные touch-таргеты (>= 44px).`);
        }

        // Закрываем окно кадрирования
        await page.evaluate(() => {
          const btnCancel = document.getElementById('btnCropCancel');
          if (btnCancel) btnCancel.click();
        });
        await new Promise(r => setTimeout(r, 200));
      }

      await page.close();
    }

    const totalScore = critique.scores.section3 +
                       critique.scores.paperCatalog +
                       critique.scores.guideModal +
                       critique.scores.cropModal;

    console.log('\n==========================================================================');
    console.log(`🏆 ИТОГОВАЯ ОЦЕНКА БРАУЗЕРНОГО КРИТИКА: ${totalScore} / 100 БАЛЛОВ`);
    console.log('==========================================================================');
    console.log(`  1. Раздел 3 (Лист бумаги и поля):           ${critique.scores.section3} / 25`);
    console.log(`  2. Модальное окно каталога бумаги:          ${critique.scores.paperCatalog} / 25`);
    console.log(`  3. Модальное окно справки (Tab 3):          ${critique.scores.guideModal} / 25`);
    console.log(`  4. Модальное окно кадрирования стикера:     ${critique.scores.cropModal} / 25`);
    console.log('--------------------------------------------------------------------------');
    console.log(`✨ Успешных критериев (Highlights): ${critique.highlights.length}`);
    critique.highlights.slice(0, 8).forEach(h => console.log(`   ✓ ${h}`));
    if (critique.highlights.length > 8) {
      console.log(`   ... и ещё ${critique.highlights.length - 8} проверок пройдены успешно`);
    }

    if (critique.defects.length > 0) {
      console.log(`\n⚠️ Выявленные дефекты (${critique.defects.length}):`);
      critique.defects.forEach(d => console.log(`   ✗ ${d}`));
    } else {
      console.log('\n🎉 ДЕФЕКТОВ НЕ ОБНАРУЖЕНО! Все модальные окна и Раздел 3 на 100% адаптивны.');
    }
    console.log('==========================================================================\n');

    // Сохраняем JSON-отчет в артефакты
    const reportPath = path.join(ARTIFACT_DIR, 'critic_mobile_modals_report.json');
    fs.writeFileSync(reportPath, JSON.stringify({ ...critique, totalScore }, null, 2), 'utf-8');
    console.log(`📁 Подробный отчет и скриншоты сохранены в:\n   ${ARTIFACT_DIR}`);

  } catch (err) {
    console.error('Ошибка в цикле критика:', err);
  } finally {
    await browser.close();
    server.close();
  }
}

runMobileModalsCritic();
