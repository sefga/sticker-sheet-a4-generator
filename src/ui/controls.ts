import { store, AppState } from '../state';
import { calculateLayout, LayoutResult } from '../layout/layoutEngine';
import { loadSourceImage, extractImageFromClipboard, isSupportedImageType } from '../image/imageLoader';
import { renderCroppedArtwork, CropData } from '../image/cropEngine';
import { getDpiInfo } from '../image/dpiCalculator';
import { cropDialog } from './cropDialog';
import { generateStickerSheetPdf, downloadPdfBlob, openPdfForPrint } from '../pdf/pdfGenerator';
import { createCalibrationPdf } from '../pdf/calibrationPage';
import { renderPreviewSvg } from '../preview/previewRenderer';
import { roundMm } from '../units/mm';

export class UIController {
  private currentLayout: LayoutResult | null = null;
  private isProcessingImage: boolean = false;

  constructor() {
    this.initEventListeners();
    store.subscribe((state) => this.render(state));
  }

  /**
   * Инициализация всех обработчиков событий формы и кнопок
   */
  private initEventListeners() {
    // 1. Загрузка файла (File Input, Label & Drag-and-Drop)
    const fileInput = document.getElementById('imageFileInput') as HTMLInputElement;
    const dropZone = document.getElementById('imageDropZone') as HTMLElement;
    const btnSelect = document.getElementById('btnSelectImage') as HTMLElement;
    const btnCrop = document.getElementById('btnOpenCrop') as HTMLButtonElement;

    // Клавиатурная доступность для семантических label (Enter / Пробел)
    [btnSelect, dropZone].forEach((elem) => {
      elem?.addEventListener('keydown', (e: KeyboardEvent) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          fileInput?.click();
        }
      });
    });

    fileInput?.addEventListener('change', async () => {
      const file = fileInput.files?.[0];
      if (file) await this.handleNewImage(file);
      fileInput.value = '';
    });

    // Drag & Drop
    ['dragenter', 'dragover'].forEach((eventName) => {
      dropZone?.addEventListener(eventName, (e) => {
        e.preventDefault();
        dropZone.classList.add('drag-over');
      });
    });

    ['dragleave', 'drop'].forEach((eventName) => {
      dropZone?.addEventListener(eventName, (e) => {
        e.preventDefault();
        dropZone.classList.remove('drag-over');
      });
    });

    dropZone?.addEventListener('drop', async (e: DragEvent) => {
      const file = e.dataTransfer?.files?.[0];
      if (file && isSupportedImageType(file)) {
        await this.handleNewImage(file);
      }
    });

    // Вставка из буфера обмена (Ctrl+V / Paste)
    window.addEventListener('paste', async (e: ClipboardEvent) => {
      const file = extractImageFromClipboard(e);
      if (file) {
        await this.handleNewImage(file);
      }
    });

    // Кнопка вызова кадрирования
    btnCrop?.addEventListener('click', () => {
      const state = store.getState();
      if (!state.loadedImage) return;

      cropDialog.open({
        imageSrc: state.loadedImage.dataUrl,
        targetWidthMm: state.stickerWidthMm,
        targetHeightMm: state.stickerHeightMm,
        initialCropData: state.cropData,
        onApply: async (cropData: CropData) => {
          store.update({ cropData });
          await this.recalculateArtwork();
        },
        onCancel: () => {},
      });
    });

    // 2. Размеры стикера
    const inputWidth = document.getElementById('stickerWidth') as HTMLInputElement;
    const inputHeight = document.getElementById('stickerHeight') as HTMLInputElement;
    const lockRatioToggle = document.getElementById('lockAspectRatio') as HTMLInputElement;
    const sizingFillBtn = document.getElementById('sizingFill') as HTMLInputElement;
    const sizingFitBtn = document.getElementById('sizingFit') as HTMLInputElement;

    inputWidth?.addEventListener('input', async () => {
      const state = store.getState();
      const newWidth = parseFloat(inputWidth.value) || 1;
      if (state.lockAspectRatio && state.stickerWidthMm > 0) {
        const ratio = state.stickerHeightMm / state.stickerWidthMm;
        const newHeight = roundMm(newWidth * ratio, 1);
        inputHeight.value = newHeight.toString();
        store.update({ stickerWidthMm: newWidth, stickerHeightMm: newHeight });
      } else {
        store.update({ stickerWidthMm: newWidth });
      }
      await this.recalculateArtwork();
    });

    inputHeight?.addEventListener('input', async () => {
      const state = store.getState();
      const newHeight = parseFloat(inputHeight.value) || 1;
      if (state.lockAspectRatio && state.stickerHeightMm > 0) {
        const ratio = state.stickerWidthMm / state.stickerHeightMm;
        const newWidth = roundMm(newHeight * ratio, 1);
        inputWidth.value = newWidth.toString();
        store.update({ stickerWidthMm: newWidth, stickerHeightMm: newHeight });
      } else {
        store.update({ stickerHeightMm: newHeight });
      }
      await this.recalculateArtwork();
    });

    lockRatioToggle?.addEventListener('change', () => {
      store.update({ lockAspectRatio: lockRatioToggle.checked });
    });

    sizingFillBtn?.addEventListener('change', async () => {
      if (sizingFillBtn.checked) {
        store.update({ sizingMode: 'fill' });
        await this.recalculateArtwork();
      }
    });

    sizingFitBtn?.addEventListener('change', async () => {
      if (sizingFitBtn.checked) {
        store.update({ sizingMode: 'fit' });
        await this.recalculateArtwork();
      }
    });

    // 3. Ориентация листа (Portrait / Landscape)
    const orientPortrait = document.getElementById('orientPortrait') as HTMLInputElement;
    const orientLandscape = document.getElementById('orientLandscape') as HTMLInputElement;

    orientPortrait?.addEventListener('change', async () => {
      if (orientPortrait.checked) {
        store.update({ pageOrientation: 'portrait' });
        await this.recalculateArtwork();
      }
    });
    orientLandscape?.addEventListener('change', async () => {
      if (orientLandscape.checked) {
        store.update({ pageOrientation: 'landscape' });
        await this.recalculateArtwork();
      }
    });

    // 4. Поля страницы (Margins)
    const marginAll = document.getElementById('marginAll') as HTMLInputElement;
    const marginTop = document.getElementById('marginTop') as HTMLInputElement;
    const marginBottom = document.getElementById('marginBottom') as HTMLInputElement;
    const marginLeft = document.getElementById('marginLeft') as HTMLInputElement;
    const marginRight = document.getElementById('marginRight') as HTMLInputElement;
    const linkMarginsToggle = document.getElementById('linkMargins') as HTMLInputElement;

    linkMarginsToggle?.addEventListener('change', () => {
      store.update({ linkMargins: linkMarginsToggle.checked });
    });

    marginAll?.addEventListener('input', () => {
      const val = Math.max(0, parseFloat(marginAll.value) || 0);
      store.update({
        margins: { top: val, bottom: val, left: val, right: val },
      });
    });

    const updateIndividualMargins = () => {
      store.update({
        margins: {
          top: Math.max(0, parseFloat(marginTop.value) || 0),
          bottom: Math.max(0, parseFloat(marginBottom.value) || 0),
          left: Math.max(0, parseFloat(marginLeft.value) || 0),
          right: Math.max(0, parseFloat(marginRight.value) || 0),
        },
      });
    };

    [marginTop, marginBottom, marginLeft, marginRight].forEach((input) => {
      input?.addEventListener('input', updateIndividualMargins);
    });

    // 5. Зазор между стикерами (Gap)
    const gapAll = document.getElementById('gapAll') as HTMLInputElement;
    const gapX = document.getElementById('gapX') as HTMLInputElement;
    const gapY = document.getElementById('gapY') as HTMLInputElement;
    const linkGapsToggle = document.getElementById('linkGaps') as HTMLInputElement;

    linkGapsToggle?.addEventListener('change', () => {
      store.update({ linkGaps: linkGapsToggle.checked });
    });

    gapAll?.addEventListener('input', () => {
      const val = Math.max(0, parseFloat(gapAll.value) || 0);
      store.update({ gapX: val, gapY: val });
    });

    gapX?.addEventListener('input', () => {
      store.update({ gapX: Math.max(0, parseFloat(gapX.value) || 0) });
    });

    gapY?.addEventListener('input', () => {
      store.update({ gapY: Math.max(0, parseFloat(gapY.value) || 0) });
    });

    // 6. Раскладка и количество копий
    const autoRotationToggle = document.getElementById('allowRotation') as HTMLInputElement;
    const requestedCopiesInput = document.getElementById('requestedCopies') as HTMLInputElement;
    const autoCopiesBtn = document.getElementById('btnAutoCopies') as HTMLButtonElement;

    autoRotationToggle?.addEventListener('change', async () => {
      store.update({ allowRotation: autoRotationToggle.checked });
      await this.recalculateArtwork();
    });

    requestedCopiesInput?.addEventListener('input', () => {
      const val = requestedCopiesInput.value.trim().toUpperCase();
      if (val === 'AUTO' || val === '') {
        store.update({ requestedCopies: 'AUTO' });
      } else {
        const num = parseInt(val, 10);
        if (!isNaN(num) && num > 0) {
          store.update({ requestedCopies: num });
        }
      }
    });

    autoCopiesBtn?.addEventListener('click', () => {
      store.update({ requestedCopies: 'AUTO' });
      requestedCopiesInput.value = 'AUTO';
    });

    // 7. Метки реза и Bleed
    const cutMarksToggle = document.getElementById('cutMarksEnabled') as HTMLInputElement;
    const bleedSelect = document.getElementById('bleedSelect') as HTMLSelectElement;

    cutMarksToggle?.addEventListener('change', () => {
      const state = store.getState();
      store.update({
        cutMarks: { ...state.cutMarks, enabled: cutMarksToggle.checked },
      });
    });

    bleedSelect?.addEventListener('change', () => {
      store.update({ bleedMm: parseInt(bleedSelect.value, 10) || 0 });
    });

    // 8. Кнопки экспорта
    document.getElementById('btnDownloadPdf')?.addEventListener('click', () => this.handleDownloadPdf());
    document.getElementById('btnPrintPdf')?.addEventListener('click', () => this.handlePrintPdf());
    document.getElementById('btnCalibrationPdf')?.addEventListener('click', () => this.handleCalibrationPdf());
    document.getElementById('btnResetSettings')?.addEventListener('click', () => {
      if (confirm('Сбросить все настройки к значениям по умолчанию?')) {
        store.resetToDefaults();
      }
    });

    // 9. Мобильные табы (Параметры / Превью)
    const tabBtnControls = document.getElementById('tabBtnControls');
    const tabBtnPreview = document.getElementById('tabBtnPreview');
    const btnMobileDownloadPdf = document.getElementById('btnMobileDownloadPdf');

    // По умолчанию на мобильных активны параметры
    document.body.classList.add('tab-active-controls');

    tabBtnControls?.addEventListener('click', () => {
      document.body.classList.remove('tab-active-preview');
      document.body.classList.add('tab-active-controls');
      tabBtnControls.classList.add('active');
      tabBtnPreview?.classList.remove('active');
    });

    tabBtnPreview?.addEventListener('click', () => {
      document.body.classList.remove('tab-active-controls');
      document.body.classList.add('tab-active-preview');
      tabBtnPreview.classList.add('active');
      tabBtnControls?.classList.remove('active');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    btnMobileDownloadPdf?.addEventListener('click', () => this.handleDownloadPdf());
  }

  /**
   * Обработка загруженного файла изображения
   */
  private async handleNewImage(file: File) {
    try {
      const loaded = await loadSourceImage(file);
      store.update({
        loadedImage: loaded,
        cropData: null,
      });
      await this.recalculateArtwork();

      // На мобильных устройствах (<= 768px) после успешной загрузки фото
      // автоматически переключаем на вкладку «Превью листа»,
      // чтобы пользователь сразу увидел разложенные стикеры
      if (window.innerWidth <= 768) {
        const tabBtnPreview = document.getElementById('tabBtnPreview');
        if (tabBtnPreview && !tabBtnPreview.classList.contains('active')) {
          setTimeout(() => {
            tabBtnPreview.click();
          }, 300);
        }
      }
    } catch (e: any) {
      alert(`Ошибка загрузки изображения: ${e.message}`);
    }
  }

  /**
   * Пересчет кадрированного изображения в максимальном качестве
   */
  private async recalculateArtwork() {
    const state = store.getState();
    if (!state.loadedImage || this.isProcessingImage) return;

    this.isProcessingImage = true;
    try {
      const pageDim = store.getPageDimensions();
      // Вычисляем текущую раскладку, чтобы знать выбранный поворот
      const layout = calculateLayout({
        pageWidthMm: pageDim.widthMm,
        pageHeightMm: pageDim.heightMm,
        stickerWidthMm: state.stickerWidthMm,
        stickerHeightMm: state.stickerHeightMm,
        margins: state.margins,
        gapX: state.gapX,
        gapY: state.gapY,
        allowRotation: state.allowRotation,
        requestedCopies: state.requestedCopies,
      });

      const sheetRotation = layout.selectedRotation;
      const aspectRatio = state.stickerWidthMm / state.stickerHeightMm;
      const cropped = await renderCroppedArtwork(
        state.loadedImage.imageElement,
        state.cropData,
        state.sizingMode,
        aspectRatio,
        state.loadedImage.mimeType,
        sheetRotation
      );

      // Расчет эффективного разрешения DPI
      const dpiDimensionMm = sheetRotation === 90 ? state.stickerHeightMm : state.stickerWidthMm;
      const dpiInfo = getDpiInfo(cropped.pixelWidth, dpiDimensionMm);

      store.update({
        croppedResult: cropped,
        effectiveDpi: dpiInfo.dpi,
      });
    } catch (e) {
      console.error('Ошибка нарезки изображения:', e);
    } finally {
      this.isProcessingImage = false;
    }
  }

  /**
   * Экспорт PDF для скачивания
   */
  private async handleDownloadPdf() {
    if (!this.currentLayout || this.currentLayout.positions.length === 0) {
      alert('Нет стикеров для размещения на листе.');
      return;
    }

    const state = store.getState();
    const pageDim = store.getPageDimensions();

    const pdfBytes = await generateStickerSheetPdf({
      pageWidthMm: pageDim.widthMm,
      pageHeightMm: pageDim.heightMm,
      layout: this.currentLayout,
      imageBytes: state.croppedResult?.bytes,
      imageMimeType: state.croppedResult?.mimeType,
      cutMarks: state.cutMarks,
      bleedMm: state.bleedMm,
    });

    const filename = `stickers-${state.stickerWidthMm}x${state.stickerHeightMm}mm-${this.currentLayout.actualCopies}pcs.pdf`;
    downloadPdfBlob(pdfBytes, filename);
  }

  /**
   * Печать PDF с выводом предупреждения о масштабе 100%
   */
  private async handlePrintPdf() {
    if (!this.currentLayout || this.currentLayout.positions.length === 0) {
      alert('Нет стикеров для размещения на листе.');
      return;
    }

    const state = store.getState();
    const pageDim = store.getPageDimensions();

    const pdfBytes = await generateStickerSheetPdf({
      pageWidthMm: pageDim.widthMm,
      pageHeightMm: pageDim.heightMm,
      layout: this.currentLayout,
      imageBytes: state.croppedResult?.bytes,
      imageMimeType: state.croppedResult?.mimeType,
      cutMarks: state.cutMarks,
      bleedMm: state.bleedMm,
    });

    openPdfForPrint(pdfBytes);
  }

  /**
   * Генерация калибровочного листа для проверки точности принтера
   */
  private async handleCalibrationPdf() {
    const pdfBytes = await createCalibrationPdf();
    downloadPdfBlob(pdfBytes, 'calibration-sheet-a4.pdf');
  }

  /**
   * Главный метод отрисовки интерфейса на основе обновленного состояния
   */
  public render(state: AppState) {
    const pageDim = store.getPageDimensions();

    // 1. Расчет раскладки через layoutEngine (единый модуль для preview и PDF)
    this.currentLayout = calculateLayout({
      pageWidthMm: pageDim.widthMm,
      pageHeightMm: pageDim.heightMm,
      stickerWidthMm: state.stickerWidthMm,
      stickerHeightMm: state.stickerHeightMm,
      margins: state.margins,
      gapX: state.gapX,
      gapY: state.gapY,
      allowRotation: state.allowRotation,
      requestedCopies: state.requestedCopies,
    });

    // 2. Синхронизация полей ввода
    this.syncFormValues(state);

    // 3. Отображение информации об изображении и DPI
    this.updateImageStats(state);

    // 4. Отображение сводки раскладки
    this.updateLayoutStats(state, this.currentLayout, pageDim);

    // 5. Предупреждение о printable area (<3 мм)
    this.updatePrintableAreaWarning(state);

    // 6. Отрисовка Live Preview A4 (векторный SVG в миллиметрах)
    const previewContainer = document.getElementById('sheetPreviewContainer');
    if (previewContainer) {
      if (state.pageOrientation === 'landscape') {
        previewContainer.classList.add('landscape');
      } else {
        previewContainer.classList.remove('landscape');
      }

      previewContainer.innerHTML = renderPreviewSvg({
        pageWidthMm: pageDim.widthMm,
        pageHeightMm: pageDim.heightMm,
        margins: state.margins,
        layout: this.currentLayout,
        imageUrl: state.croppedResult?.dataUrl || null,
        cutMarksConfig: state.cutMarks,
        bleedMm: state.bleedMm,
      });
    }
  }

  /**
   * Синхронизация значений инпутов с состоянием
   */
  private syncFormValues(state: AppState) {
    const setVal = (id: string, val: string | number) => {
      const el = document.getElementById(id) as HTMLInputElement;
      if (el && document.activeElement !== el) {
        el.value = val.toString();
      }
    };
    const setChecked = (id: string, checked: boolean) => {
      const el = document.getElementById(id) as HTMLInputElement;
      if (el) el.checked = checked;
    };

    setVal('stickerWidth', state.stickerWidthMm);
    setVal('stickerHeight', state.stickerHeightMm);
    setChecked('lockAspectRatio', state.lockAspectRatio);

    setChecked('sizingFill', state.sizingMode === 'fill');
    setChecked('sizingFit', state.sizingMode === 'fit');

    setChecked('orientPortrait', state.pageOrientation === 'portrait');
    setChecked('orientLandscape', state.pageOrientation === 'landscape');

    setChecked('linkMargins', state.linkMargins);
    const marginLinkedGroup = document.getElementById('marginLinkedGroup');
    const marginUnlinkedGroup = document.getElementById('marginUnlinkedGroup');
    if (marginLinkedGroup && marginUnlinkedGroup) {
      marginLinkedGroup.style.display = state.linkMargins ? 'block' : 'none';
      marginUnlinkedGroup.style.display = state.linkMargins ? 'none' : 'grid';
    }
    setVal('marginAll', state.margins.top);
    setVal('marginTop', state.margins.top);
    setVal('marginBottom', state.margins.bottom);
    setVal('marginLeft', state.margins.left);
    setVal('marginRight', state.margins.right);

    setChecked('linkGaps', state.linkGaps);
    const gapLinkedGroup = document.getElementById('gapLinkedGroup');
    const gapUnlinkedGroup = document.getElementById('gapUnlinkedGroup');
    if (gapLinkedGroup && gapUnlinkedGroup) {
      gapLinkedGroup.style.display = state.linkGaps ? 'block' : 'none';
      gapUnlinkedGroup.style.display = state.linkGaps ? 'none' : 'grid';
    }
    setVal('gapAll', state.gapX);
    setVal('gapX', state.gapX);
    setVal('gapY', state.gapY);

    setChecked('allowRotation', state.allowRotation);
    setVal('requestedCopies', state.requestedCopies === 'AUTO' ? 'AUTO' : state.requestedCopies);

    setChecked('cutMarksEnabled', state.cutMarks.enabled);

    const bleedSelect = document.getElementById('bleedSelect') as HTMLSelectElement;
    if (bleedSelect) bleedSelect.value = state.bleedMm.toString();

    // Кнопка кадрирования доступна только если изображение загружено
    const btnCrop = document.getElementById('btnOpenCrop') as HTMLButtonElement;
    if (btnCrop) {
      btnCrop.disabled = !state.loadedImage;
    }
  }

  /**
   * Отображение информации об изображении и DPI
   */
  private updateImageStats(state: AppState) {
    const infoContainer = document.getElementById('imageInfoPanel');
    const dropPrompt = document.getElementById('dropZonePrompt');
    const dropThumb = document.getElementById('dropZoneThumb') as HTMLImageElement;

    if (!state.loadedImage) {
      if (infoContainer) infoContainer.style.display = 'none';
      if (dropPrompt) dropPrompt.style.display = 'block';
      if (dropThumb) dropThumb.style.display = 'none';
      return;
    }

    if (dropPrompt) dropPrompt.style.display = 'none';
    if (dropThumb) {
      dropThumb.style.display = 'block';
      dropThumb.src = state.croppedResult?.dataUrl || state.loadedImage.dataUrl;
    }

    if (infoContainer) {
      infoContainer.style.display = 'block';
      const dpi = state.effectiveDpi;
      const dpiInfo = getDpiInfo(state.croppedResult?.pixelWidth || state.loadedImage.sourceWidthPx, state.stickerWidthMm);

      infoContainer.innerHTML = `
        <div class="image-stats-grid">
          <div><strong>Исходник:</strong> ${state.loadedImage.sourceWidthPx} × ${state.loadedImage.sourceHeightPx} px</div>
          <div><strong>Кадр:</strong> ${state.croppedResult ? `${state.croppedResult.pixelWidth} × ${state.croppedResult.pixelHeight} px` : 'Авто'}</div>
        </div>
        <div class="dpi-badge-wrapper">
          <span class="dpi-badge" style="background-color: ${dpiInfo.color}18; color: ${dpiInfo.color}; border: 1px solid ${dpiInfo.color}40;">
            ● ${dpiInfo.label} — ${dpi} DPI
          </span>
          <p class="dpi-description">${dpiInfo.description}</p>
        </div>
      `;
    }
  }

  /**
   * Отображение сводки раскладки
   */
  private updateLayoutStats(state: AppState, layout: LayoutResult, pageDim: { widthMm: number; heightMm: number }) {
    const layoutSummary = document.getElementById('layoutSummaryStats');
    const layoutHeaderBadge = document.getElementById('layoutHeaderBadge');

    if (layoutHeaderBadge) {
      layoutHeaderBadge.textContent = `${layout.actualCopies} шт.`;
    }

    if (layoutSummary) {
      if (layout.hasError) {
        layoutSummary.innerHTML = `
          <div class="alert alert-error">
            ⚠️ ${layout.errorMessage}
          </div>
        `;
        return;
      }

      layoutSummary.innerHTML = `
        <div class="stats-card">
          <div class="stats-main-number">
            <span class="number">${layout.actualCopies}</span>
            <span class="label">стикеров на листе</span>
          </div>
          <div class="stats-details">
            <div><strong>Сетка:</strong> ${layout.columns} колонок × ${layout.rows} строк</div>
            <div><strong>Вместимость:</strong> ${layout.totalCapacity} шт. ${state.requestedCopies !== 'AUTO' ? `(задано: ${state.requestedCopies})` : ''}</div>
            <div><strong>Ориентация стикера:</strong> ${layout.selectedRotation === 90 ? 'Повернут на 90°' : 'Без поворота (0°)'}</div>
          </div>
          <div class="recommendation-box">
            💡 ${layout.recommendationMessage}
          </div>
        </div>
      `;
    }

    // Обновление информационной полосы над превью
    const previewHeaderStats = document.getElementById('previewHeaderStats');
    if (previewHeaderStats) {
      previewHeaderStats.innerHTML = `
        <span class="stat-chip"><strong>Лист:</strong> A4 ${pageDim.widthMm} × ${pageDim.heightMm} мм</span>
        <span class="stat-dot">•</span>
        <span class="stat-chip"><strong>Стикер:</strong> ${state.stickerWidthMm} × ${state.stickerHeightMm} мм</span>
        <span class="stat-dot">•</span>
        <span class="stat-chip"><strong>Сетка:</strong> ${layout.columns} × ${layout.rows}</span>
        <span class="stat-dot">•</span>
        <span class="stat-chip"><strong>Поля:</strong> ${state.margins.top} мм</span>
        <span class="stat-dot">•</span>
        <span class="stat-chip"><strong>Зазор:</strong> ${state.gapX} мм</span>
      `;
    }

    // Обновление мобильного плавающего тулбара и бейджей табов
    const mobileStickyCount = document.getElementById('mobileStickyCount');
    const mobileStickyGrid = document.getElementById('mobileStickyGrid');
    const mobileTabBadge = document.getElementById('mobileTabBadge');

    if (mobileStickyCount) {
      mobileStickyCount.textContent = `${layout.actualCopies} шт.`;
    }
    if (mobileStickyGrid) {
      mobileStickyGrid.textContent = `Сетка: ${layout.columns} × ${layout.rows}`;
    }
    if (mobileTabBadge) {
      mobileTabBadge.textContent = `${layout.actualCopies}`;
    }
  }

  /**
   * Предупреждение о печати близко к краю листа (< 3 мм)
   */
  private updatePrintableAreaWarning(state: AppState) {
    const warningEl = document.getElementById('printableAreaWarning');
    if (!warningEl) return;

    const { top, bottom, left, right } = state.margins;
    const minMargin = Math.min(top, bottom, left, right);

    if (minMargin < 3) {
      warningEl.style.display = 'block';
      warningEl.innerHTML = `
        ⚠️ <strong>Внимание к полям:</strong> Вы используете поля меньше 3 мм (${minMargin} мм).
        Некоторые принтеры не способны печатать настолько близко к краю листа (риск обрезки контента).
      `;
    } else {
      warningEl.style.display = 'none';
    }
  }
}
