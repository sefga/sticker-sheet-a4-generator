import puppeteer from 'puppeteer-core';
import fs from 'fs';
import path from 'path';

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const OUTPUT_DIR = path.resolve('test-results');

if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

async function runAudit() {
  console.log('🚀 Запуск итерации UX-аудита через Chrome...');
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu'],
  });

  const report = {
    timestamp: new Date().toISOString(),
    desktop: {},
    mobile: {},
  };

  try {
    // -------------------------------------------------------------
    // 1. ДЕСКТОПНЫЙ АУДИТ (1440 × 900)
    // -------------------------------------------------------------
    console.log('🖥️ Тестирование Desktop UX (1440 × 900)...');
    const desktopPage = await browser.newPage();
    await desktopPage.setViewport({ width: 1440, height: 900, deviceScaleFactor: 2 });

    const desktopConsoleErrors = [];
    desktopPage.on('console', (msg) => {
      if (msg.type() === 'error') desktopConsoleErrors.push(msg.text());
    });
    desktopPage.on('pageerror', (err) => desktopConsoleErrors.push(err.toString()));

    await desktopPage.goto('http://localhost:3000', { waitUntil: 'networkidle0' });

    // Проверка отсутствия горизонтального скролла
    const desktopOverflow = await desktopPage.evaluate(() => {
      return document.documentElement.scrollWidth > window.innerWidth;
    });

    // Проверка физических размеров превью
    const desktopPreviewMetrics = await desktopPage.evaluate(() => {
      const container = document.getElementById('sheetPreviewContainer');
      const svg = document.querySelector('.sheet-svg');
      const rect = container ? container.getBoundingClientRect() : null;
      const svgRect = svg ? svg.getBoundingClientRect() : null;
      return {
        containerRendered: !!container,
        containerWidth: rect ? Math.round(rect.width) : 0,
        containerHeight: rect ? Math.round(rect.height) : 0,
        svgWidth: svgRect ? Math.round(svgRect.width) : 0,
        svgHeight: svgRect ? Math.round(svgRect.height) : 0,
      };
    });

    // Проверка интерактивности: переключение на альбомную ориентацию через label
    await desktopPage.click('label[for="orientLandscape"]');
    await new Promise((r) => setTimeout(r, 200));

    const landscapePreviewMetrics = await desktopPage.evaluate(() => {
      const container = document.getElementById('sheetPreviewContainer');
      const rect = container ? container.getBoundingClientRect() : null;
      return {
        width: rect ? Math.round(rect.width) : 0,
        height: rect ? Math.round(rect.height) : 0,
        isLandscape: rect ? rect.width > rect.height : false,
      };
    });

    // Возвращаем книжную ориентацию
    await desktopPage.click('label[for="orientPortrait"]');
    await new Promise((r) => setTimeout(r, 200));

    // Интерактивный тест: Загрузка изображения через input[type=file]
    const fileInput = await desktopPage.$('#imageFileInput');
    await fileInput.uploadFile(path.resolve('test-sticker.png'));
    await new Promise((r) => setTimeout(r, 500));

    // Проверка отображения DPI и информации об исходнике
    const dpiStats = await desktopPage.evaluate(() => {
      const panel = document.getElementById('imageInfoPanel');
      return {
        panelVisible: panel ? window.getComputedStyle(panel).display !== 'none' : false,
        text: panel ? panel.innerText : '',
      };
    });

    // Проверка интерактивности: открытие модального окна кадрирования
    await desktopPage.click('#btnOpenCrop');
    await new Promise((r) => setTimeout(r, 600));

    const cropModalInfo = await desktopPage.evaluate(() => {
      const modal = document.querySelector('.crop-modal-window');
      const cropperCanvas = document.querySelector('.cropper-crop-box');
      return {
        modalOpened: !!modal,
        cropperInitialized: !!cropperCanvas,
      };
    });

    // Скриншот модального окна кадрирования
    await desktopPage.screenshot({
      path: path.join(OUTPUT_DIR, 'desktop-crop-modal.png'),
    });

    // Применение кадрирования
    await desktopPage.click('#btnCropApply');
    await new Promise((r) => setTimeout(r, 400));

    // Скриншот рабочего стола с загруженными и кадрированными стикерами
    await desktopPage.screenshot({
      path: path.join(OUTPUT_DIR, 'desktop-with-stickers.png'),
    });

    report.desktop = {
      consoleErrors: desktopConsoleErrors,
      hasHorizontalOverflow: desktopOverflow,
      preview: desktopPreviewMetrics,
      landscapeToggleWorks: landscapePreviewMetrics.isLandscape,
      dpiStats,
      cropModal: cropModalInfo,
      screenshots: {
        empty: 'test-results/desktop.png',
        cropModal: 'test-results/desktop-crop-modal.png',
        stickers: 'test-results/desktop-with-stickers.png',
      },
    };

    await desktopPage.close();

    // -------------------------------------------------------------
    // 2. МОБИЛЬНЫЙ АУДИТ (390 × 844, iPhone / Android Viewport)
    // -------------------------------------------------------------
    console.log('📱 Тестирование Mobile UX (390 × 844, Touch)...');
    const mobilePage = await browser.newPage();
    await mobilePage.setViewport({
      width: 390,
      height: 844,
      deviceScaleFactor: 3,
      isMobile: true,
      hasTouch: true,
    });

    const mobileConsoleErrors = [];
    mobilePage.on('console', (msg) => {
      if (msg.type() === 'error') mobileConsoleErrors.push(msg.text());
    });
    mobilePage.on('pageerror', (err) => mobileConsoleErrors.push(err.toString()));

    await mobilePage.goto('http://localhost:3000', { waitUntil: 'networkidle0' });

    // Проверка горизонтального переполнения
    const mobileOverflow = await mobilePage.evaluate(() => {
      return document.documentElement.scrollWidth > window.innerWidth;
    });

    // Скриншот вкладки настроек (Mobile Controls)
    await mobilePage.screenshot({
      path: path.join(OUTPUT_DIR, 'mobile-controls.png'),
    });

    // Проверка переключения на вкладку превью
    await mobilePage.click('#tabBtnPreview');
    await new Promise((r) => setTimeout(r, 250));

    // Скриншот вкладки превью (Mobile Preview)
    await mobilePage.screenshot({
      path: path.join(OUTPUT_DIR, 'mobile-preview.png'),
    });

    // Проверка видимости и размеров превью листа на мобильном
    const mobilePreviewMetrics = await mobilePage.evaluate(() => {
      const container = document.getElementById('sheetPreviewContainer');
      const rect = container ? container.getBoundingClientRect() : null;
      const previewArea = document.querySelector('.preview-area');
      const areaDisplay = previewArea ? window.getComputedStyle(previewArea).display : null;
      return {
        areaDisplay,
        width: rect ? Math.round(rect.width) : 0,
        height: rect ? Math.round(rect.height) : 0,
        isVisible: rect ? rect.width > 50 && rect.height > 50 : false,
      };
    });

    // Проверка Sticky Bar на мобильном
    const mobileStickyBarMetrics = await mobilePage.evaluate(() => {
      const bar = document.getElementById('mobileStickyBar');
      const count = document.getElementById('mobileStickyCount')?.innerText;
      const btn = document.getElementById('btnMobileDownloadPdf');
      const btnRect = btn ? btn.getBoundingClientRect() : null;
      return {
        barVisible: bar ? window.getComputedStyle(bar).display !== 'none' : false,
        countText: count,
        ctaButtonHeight: btnRect ? Math.round(btnRect.height) : 0,
        ctaButtonWidth: btnRect ? Math.round(btnRect.width) : 0,
      };
    });

    // Проверка сенсорных зон на вкладке настроек
    await mobilePage.click('#tabBtnControls');
    await new Promise((r) => setTimeout(r, 200));

    const touchTargetMetrics = await mobilePage.evaluate(() => {
      const interactiveEls = Array.from(
        document.querySelectorAll(
          '.sidebar-content button, .sidebar-content input, .sidebar-content select, .sidebar-content .checkbox-label, .sidebar-content .segmented-control label, .mobile-tab-btn, .btn-mobile-cta'
        )
      );
      const smallTargets = [];

      interactiveEls.forEach((el) => {
        const rect = el.getBoundingClientRect();
        if (rect.width > 0 && rect.height > 0) {
          // Стандарт доступности: высота touch target >= 40px
          if (rect.height < 40) {
            smallTargets.push({
              tag: el.tagName,
              id: el.id,
              text: (el.innerText || el.value || '').slice(0, 20),
              height: Math.round(rect.height),
            });
          }
        }
      });

      return {
        totalChecked: interactiveEls.length,
        smallTargetsCount: smallTargets.length,
        smallTargetsSample: smallTargets.slice(0, 5),
      };
    });

    // 3. ПРОВЕРКА СЕНСОРНОГО ВЫЗОВА И ЗАГРУЗКИ ФОТО НА МОБИЛЬНОМ
    console.log('📸 Тестирование сенсорной загрузки фото на Mobile...');
    
    // Проверка семантической связки label -> input и атрибутов галереи
    const touchGalleryValidation = await mobilePage.evaluate(() => {
      const dropZone = document.getElementById('imageDropZone');
      const btnSelect = document.getElementById('btnSelectImage');
      const fileInput = document.getElementById('imageFileInput');
      const style = fileInput ? window.getComputedStyle(fileInput) : null;

      return {
        dropZoneIsLabel: dropZone?.tagName === 'LABEL',
        dropZoneHtmlFor: dropZone?.getAttribute('for'),
        btnSelectIsLabel: btnSelect?.tagName === 'LABEL',
        btnSelectHtmlFor: btnSelect?.getAttribute('for'),
        inputNotDisplayNone: style ? style.display !== 'none' : false,
        acceptHasImageWildcard: fileInput?.getAttribute('accept')?.includes('image/*') || false,
      };
    });

    // Загрузка фото на мобильном устройстве
    const mobileFileInput = await mobilePage.$('#imageFileInput');
    await mobileFileInput.uploadFile(path.resolve('test-sticker.png'));
    await new Promise((r) => setTimeout(r, 600));

    // Проверка отображения миниатюры и DPI на вкладке параметров
    await mobilePage.click('#tabBtnControls');
    await new Promise((r) => setTimeout(r, 200));

    const mobileImageStats = await mobilePage.evaluate(() => {
      const thumb = document.getElementById('dropZoneThumb');
      const infoPanel = document.getElementById('imageInfoPanel');
      const btnCrop = document.getElementById('btnOpenCrop');
      const thumbDisplay = thumb ? window.getComputedStyle(thumb).display : null;
      const infoDisplay = infoPanel ? window.getComputedStyle(infoPanel).display : null;

      return {
        thumbVisible: thumbDisplay !== 'none' && !!thumb?.getAttribute('src'),
        infoPanelVisible: infoDisplay !== 'none',
        infoText: infoPanel?.innerText || '',
        btnCropEnabled: btnCrop ? !btnCrop.disabled : false,
      };
    });

    await mobilePage.screenshot({
      path: path.join(OUTPUT_DIR, 'mobile-loaded-controls.png'),
    });

    // Переключение на вкладку превью с отображением наклеек
    await mobilePage.click('#tabBtnPreview');
    await new Promise((r) => setTimeout(r, 300));

    const mobileSheetImagesCount = await mobilePage.evaluate(() => {
      const svgImages = document.querySelectorAll('#sheetPreviewContainer svg image');
      const countBadge = document.getElementById('mobileStickyCount')?.innerText;
      return {
        imagesCount: svgImages.length,
        countBadgeText: countBadge,
      };
    });

    await mobilePage.screenshot({
      path: path.join(OUTPUT_DIR, 'mobile-loaded-preview.png'),
    });

    report.mobile = {
      consoleErrors: mobileConsoleErrors,
      hasHorizontalOverflow: mobileOverflow,
      tabSwitchingWorks: mobilePreviewMetrics.isVisible,
      previewMetrics: mobilePreviewMetrics,
      stickyBar: mobileStickyBarMetrics,
      touchTargets: touchTargetMetrics,
      touchGalleryValidation,
      mobilePhotoUpload: {
        success: mobileImageStats.thumbVisible && mobileSheetImagesCount.imagesCount > 0,
        imageStats: mobileImageStats,
        sheetStickersRendered: mobileSheetImagesCount.imagesCount,
      },
      screenshots: {
        controls: 'test-results/mobile-controls.png',
        preview: 'test-results/mobile-preview.png',
        loadedControls: 'test-results/mobile-loaded-controls.png',
        loadedPreview: 'test-results/mobile-loaded-preview.png',
      },
    };

    await mobilePage.close();
  } finally {
    await browser.close();
  }

  const reportFile = path.join(OUTPUT_DIR, 'audit-report.json');
  fs.writeFileSync(reportFile, JSON.stringify(report, null, 2), 'utf-8');
  console.log('✅ Аудит завершен! Отчет сохранен в:', reportFile);
  console.log(JSON.stringify(report, null, 2));
}

runAudit().catch((err) => {
  console.error('❌ Ошибка во время аудита:', err);
  process.exit(1);
});
