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

function startServer(port = 4192) {
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

async function runGuideCloseUXCritic() {
  console.log('🛡️ Запуск критика UX закрытия Справки и Модального окна (Guide Close UX Critic)...');
  const { server, port } = await startServer(4194);
  const baseUrl = `http://localhost:${port}`;
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  let totalScore = 100;
  const defects = [];
  const highlights = [];

  try {
    const page = await browser.newPage();

    // =========================================================================
    // ТЕСТ 1: ДЕСКТОП (1280 × 800) — Проверка крестика, оверлея, Escape, кнопки внизу
    // =========================================================================
    console.log('  -> Проверка сценариев закрытия на десктопе (1280 × 800)...');
    await page.setViewport({ width: 1280, height: 800 });
    await page.goto(baseUrl, { waitUntil: 'networkidle0' });

    // 1.1 Открытие модального окна
    await page.click('#btnGuideLink');
    await new Promise((r) => setTimeout(r, 200));

    let isOpen = await page.evaluate(() => {
      const modal = document.getElementById('guideModalBackdrop');
      return modal && modal.classList.contains('open') && modal.getAttribute('aria-hidden') === 'false';
    });

    if (!isOpen) {
      totalScore -= 20;
      defects.push('Модальное окно не открылось по клику на #btnGuideLink');
    }

    // 1.2 Замер Touch Target открытого крестика закрытия
    const closeBtnMetrics = await page.evaluate(() => {
      const btn = document.getElementById('btnGuideModalClose');
      if (!btn) return null;
      const rect = btn.getBoundingClientRect();
      return {
        width: Math.round(rect.width),
        height: Math.round(rect.height),
        ariaLabel: btn.getAttribute('aria-label') || '',
      };
    });

    if (!closeBtnMetrics || closeBtnMetrics.width < 44 || closeBtnMetrics.height < 44) {
      totalScore -= 15;
      defects.push(`Крестик закрытия слишком мал: ${closeBtnMetrics?.width || 0}x${closeBtnMetrics?.height || 0} px (требуется >= 44x44 px)`);
    } else {
      highlights.push(`Крестик закрытия соответствует стандарту Apple HIG: ${closeBtnMetrics.width}×${closeBtnMetrics.height} px`);
    }

    // Скриншот открытой модалки на десктопе
    const desktopGuideScreenshot = path.join(artifactDir, 'guide-ux-critic-desktop.png');
    await page.screenshot({ path: desktopGuideScreenshot });

    // 1.3 Закрытие по крестику
    await page.click('#btnGuideModalClose');
    await new Promise((r) => setTimeout(r, 200));

    let isClosed = await page.evaluate(() => {
      const modal = document.getElementById('guideModalBackdrop');
      return !modal || (!modal.classList.contains('open') && modal.getAttribute('aria-hidden') === 'true');
    });

    if (!isClosed) {
      totalScore -= 20;
      defects.push('Модальное окно не закрылось по клику на крестик #btnGuideModalClose');
    } else {
      highlights.push('Закрытие по крестику ✕ работает мгновенно');
    }

    // 1.4 Закрытие по клику на оверлей (backdrop click)
    await page.click('#btnGuideLink');
    await new Promise((r) => setTimeout(r, 200));

    // Кликаем по координатам левого верхнего угла (за пределами модального окна)
    await page.mouse.click(20, 20);
    await new Promise((r) => setTimeout(r, 200));

    isClosed = await page.evaluate(() => {
      const modal = document.getElementById('guideModalBackdrop');
      return !modal || !modal.classList.contains('open');
    });

    if (!isClosed) {
      totalScore -= 15;
      defects.push('Модальное окно не закрылось по клику на оверлей вне окна');
    } else {
      highlights.push('Закрытие по клику на затемнённый фон (Backdrop tap) успешно подтверждено');
    }

    // 1.5 Закрытие по клавише Escape
    await page.click('#btnGuideLink');
    await new Promise((r) => setTimeout(r, 200));

    await page.keyboard.press('Escape');
    await new Promise((r) => setTimeout(r, 200));

    isClosed = await page.evaluate(() => {
      const modal = document.getElementById('guideModalBackdrop');
      return !modal || !modal.classList.contains('open');
    });

    if (!isClosed) {
      totalScore -= 15;
      defects.push('Модальное окно не закрылось по клавише Escape');
    } else {
      highlights.push('Закрытие по клавише Escape на десктопе работает надёжно');
    }

    // 1.6 Закрытие по кнопке внизу статьи (#btnGuideDoneBottom)
    await page.click('#btnGuideLink');
    await new Promise((r) => setTimeout(r, 200));

    const bottomBtnExists = await page.evaluate(() => {
      const btn = document.getElementById('btnGuideDoneBottom');
      return !!btn && btn.textContent.trim().length > 5;
    });

    if (!bottomBtnExists) {
      totalScore -= 15;
      defects.push('Кнопка быстрого закрытия внизу контента #btnGuideDoneBottom отсутствует');
    } else {
      // Скроллим модальное окно вниз и кликаем по кнопке
      await page.evaluate(() => {
        const scrollContainer = document.querySelector('.guide-modal-scroll');
        if (scrollContainer) scrollContainer.scrollTop = scrollContainer.scrollHeight;
      });
      await new Promise((r) => setTimeout(r, 150));

      await page.click('#btnGuideDoneBottom');
      await new Promise((r) => setTimeout(r, 200));

      isClosed = await page.evaluate(() => {
        const modal = document.getElementById('guideModalBackdrop');
        return !modal || !modal.classList.contains('open');
      });

      if (!isClosed) {
        totalScore -= 15;
        defects.push('Модальное окно не закрылось по кнопке внизу #btnGuideDoneBottom');
      } else {
        highlights.push('Нижняя кнопка «✓ Понятно, вернуться к раскладке» закрывает окно и спасает от скролла');
      }
    }

    // =========================================================================
    // ТЕСТ 2: МОБИЛЬНЫЙ (iPhone 390 × 844) — Табы, Sticky-шапка, возврат контекста
    // =========================================================================
    console.log('  -> Проверка сценариев на мобильном устройстве iPhone (390 × 844)...');
    await page.setViewport({ width: 390, height: 844, isMobile: true, hasTouch: true });
    await page.reload({ waitUntil: 'networkidle0' });

    // 2.1 Переключаемся во вкладку «Превью листа»
    await page.click('#tabBtnPreview');
    await new Promise((r) => setTimeout(r, 150));

    // 2.2 Открываем Справку из Превью
    await page.click('#tabBtnGuide');
    await new Promise((r) => setTimeout(r, 200));

    const isGuideActiveMobile = await page.evaluate(() => {
      return document.body.classList.contains('tab-active-guide');
    });

    if (!isGuideActiveMobile) {
      totalScore -= 20;
      defects.push('На мобильном экране не активировалась вкладка Справки');
    }

    // 2.3 Проверяем сенсорные зоны мобильной кнопки «← Назад» и крестика
    const mobileHeaderBtns = await page.evaluate(() => {
      const btnBack = document.getElementById('btnGuideBack');
      const btnClose = document.getElementById('btnGuideModalClose');
      const rBack = btnBack ? btnBack.getBoundingClientRect() : null;
      const rClose = btnClose ? btnClose.getBoundingClientRect() : null;

      return {
        hasBackBtn: !!btnBack && window.getComputedStyle(btnBack).display !== 'none',
        backHeight: rBack ? Math.round(rBack.height) : 0,
        closeWidth: rClose ? Math.round(rClose.width) : 0,
        closeHeight: rClose ? Math.round(rClose.height) : 0,
      };
    });

    if (!mobileHeaderBtns.hasBackBtn) {
      totalScore -= 10;
      defects.push('На мобильном экране отсутствует кнопка «← Назад» в шапке гайда');
    } else {
      highlights.push('Мобильная шапка гайда снабжена наглядной кнопкой «← Назад»');
    }

    if (mobileHeaderBtns.closeWidth < 44 || mobileHeaderBtns.closeHeight < 44) {
      totalScore -= 10;
      defects.push(`Крестик на мобильном меньше 44px: ${mobileHeaderBtns.closeWidth}x${mobileHeaderBtns.closeHeight}`);
    } else {
      highlights.push(`Крестик на мобильном имеет размер ${mobileHeaderBtns.closeWidth}×${mobileHeaderBtns.closeHeight} px (>=44px)`);
    }

    // Скриншот мобильного экрана гайда со sticky-шапкой
    const mobileGuideScreenshot = path.join(artifactDir, 'guide-ux-critic-mobile.png');
    await page.screenshot({ path: mobileGuideScreenshot });

    // 2.4 Проверяем возврат в предыдущую вкладку (было Превью -> нажали Назад -> должно стать Превью!)
    await page.click('#btnGuideBack');
    await new Promise((r) => setTimeout(r, 200));

    const restoredTab = await page.evaluate(() => {
      return {
        isGuideGone: !document.body.classList.contains('tab-active-guide'),
        isPreviewActive: document.body.classList.contains('tab-active-preview'),
        isControlsActive: document.body.classList.contains('tab-active-controls'),
      };
    });

    if (!restoredTab.isGuideGone) {
      totalScore -= 25;
      defects.push('После клика на «← Назад» вкладка гайда осталась видимой');
    } else if (!restoredTab.isPreviewActive) {
      totalScore -= 15;
      defects.push('Нарушен возврат контекста: после закрытия гайда не восстановилась активная вкладка Превью');
    } else {
      highlights.push('Идеальное сохранение контекста: возврат именно на ту вкладку, с которой пришёл пользователь');
    }

    // 2.5 Проверяем мобильное закрытие по клавише Escape
    await page.click('#tabBtnGuide');
    await new Promise((r) => setTimeout(r, 200));
    await page.keyboard.press('Escape');
    await new Promise((r) => setTimeout(r, 200));

    const escClosedOnMobile = await page.evaluate(() => {
      return !document.body.classList.contains('tab-active-guide');
    });

    if (!escClosedOnMobile) {
      totalScore -= 10;
      defects.push('Клавиша Escape не закрывает гайд в мобильном режиме');
    } else {
      highlights.push('Клавиша Escape корректно закрывает гайд даже в мобильном режиме');
    }

    totalScore = Math.max(0, Math.min(100, totalScore));

    console.log('\n' + '═'.repeat(65));
    console.log(`🛡️ ИТОГОВАЯ ОЦЕНКА КРИТИКА UX ЗАКРЫТИЯ ГАЙДА: ${totalScore} / 100`);
    console.log(`🎯 ПОРОГ ПРИНЯТИЯ: 95 БАЛЛОВ`);
    console.log(`🚦 СТАТУС: ${totalScore >= 95 ? '✅ ПРИНЯТО (ВЫШЕ 95)' : '❌ ОТКЛОНЕНО'}`);
    console.log('═'.repeat(65) + '\n');

    if (highlights.length > 0) {
      console.log('✨ Сильные стороны:');
      highlights.forEach((h) => console.log(`  + ${h}`));
      console.log('');
    }

    if (defects.length > 0) {
      console.log('⚠️ Выявленные дефекты:');
      defects.forEach((d) => console.log(`  - ${d}`));
      console.log('');
    }

    if (totalScore < 95) {
      process.exit(1);
    }
  } catch (err) {
    console.error('❌ Ошибка во время работы критика:', err);
    process.exit(1);
  } finally {
    await browser.close();
    server.close();
  }
}

runGuideCloseUXCritic();
