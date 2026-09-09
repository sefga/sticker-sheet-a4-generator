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
import { setLanguage, t, applyTranslations, onLanguageChange, TranslationKey } from '../i18n';
import { trackEvent } from '../analytics';

export class UIController {
  private currentLayout: LayoutResult | null = null;
  private isProcessingImage: boolean = false;
  private lastArtworkCache: {
    imageSrc: string;
    cropJson: string;
    sizingMode: string;
    aspectRatio: number;
    sheetRotation: number;
  } | null = null;

  constructor() {
    this.initEventListeners();
    this.initLanguageSwitch();
    applyTranslations();
    onLanguageChange(() => {
      const state = store.getState();
      this.updateLockRatioHint(state.lockAspectRatio);
      this.updateSizingExplanation(state.sizingMode);
      this.validateStickerDimensions();
      this.render(state);
    });
    store.subscribe((state) => this.render(state));
  }

  /**
   * Привязка "умного" обработчика к числовому инпуту:
   * 1. Во время набора (событие input) не производит тяжелых расчетов,
   *    а ждет паузы в наборе (debounce 450 мс).
   * 2. При явном завершении ввода (blur, change, Enter) сразу коммитит без ожидания.
   * 3. Поддерживает запятую как десятичный разделитель на мобильных клавиатурах.
   * 4. Защищает от пустых или микро-значений (не крашит макет).
   * 5. По клавише Enter вызывает blur(), скрывая мобильную экранную клавиатуру.
   */
  private bindSmartNumberInput(
    input: HTMLInputElement | null,
    options: {
      min?: number;
      max?: number;
      getFallback: () => number;
      onCommit: (val: number) => void | Promise<void>;
      debounceMs?: number;
      onInput?: (parsed: number | null, raw: string) => void;
    }
  ) {
    if (!input) return;

    const { min = 0, max = 1000, getFallback, onCommit, debounceMs = 450, onInput } = options;
    let timer: any = null;

    const parseVal = (raw: string): number | null => {
      const sanitized = raw.trim().replace(',', '.');
      if (sanitized === '' || sanitized === '-' || sanitized === '.') return null;
      const num = parseFloat(sanitized);
      return isNaN(num) ? null : num;
    };

    const commit = async (forceValid = false) => {
      if (timer) {
        clearTimeout(timer);
        timer = null;
      }

      const parsed = parseVal(input.value);
      let finalVal: number;

      if (parsed === null) {
        if (forceValid) {
          finalVal = getFallback();
          input.value = finalVal.toString();
        } else {
          return; // пользователь в процессе набора
        }
      } else {
        finalVal = parsed;
        if (min !== undefined && finalVal < min) finalVal = min;
        if (max !== undefined && finalVal > max) finalVal = max;
        if (forceValid) {
          input.value = finalVal.toString();
        }
      }

      if (onInput) {
        onInput(finalVal, input.value);
      }

      await onCommit(finalVal);
    };

    input.addEventListener('input', () => {
      if (timer) clearTimeout(timer);
      const parsed = parseVal(input.value);
      if (onInput) {
        onInput(parsed, input.value);
      }
      // Если значение валидно и не меньше допустимого порога, взводим таймер
      if (parsed !== null && parsed >= (min || 0)) {
        timer = setTimeout(() => commit(false), debounceMs);
      }
    });

    input.addEventListener('change', () => commit(true));
    input.addEventListener('blur', () => commit(true));

    input.addEventListener('keydown', (e: KeyboardEvent) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        commit(true);
        input.blur(); // Скрывает экранную клавиатуру на мобильном
      }
    });
  }

  /**
   * Инициализация переключателя языков RU | EN
   */
  private initLanguageSwitch() {
    const btnRu = document.getElementById('btnLangRu');
    const btnEn = document.getElementById('btnLangEn');

    btnRu?.addEventListener('click', () => {
      setLanguage('ru');
    });

    btnEn?.addEventListener('click', () => {
      setLanguage('en');
    });
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
          this.lastArtworkCache = null;
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

    this.bindSmartNumberInput(inputWidth, {
      min: 5,
      max: 297,
      getFallback: () => store.getState().stickerWidthMm,
      onInput: (parsed) => {
        this.validateStickerDimensions(parsed, null);
      },
      onCommit: async (newWidth) => {
        const state = store.getState();
        if (state.lockAspectRatio && state.stickerWidthMm > 0) {
          const ratio = state.stickerHeightMm / state.stickerWidthMm;
          const newHeight = roundMm(newWidth * ratio, 1);
          inputHeight.value = newHeight.toString();
          store.update({ stickerWidthMm: newWidth, stickerHeightMm: newHeight });
        } else {
          store.update({ stickerWidthMm: newWidth });
        }
        this.validateStickerDimensions();
        await this.recalculateArtwork();
      },
    });

    this.bindSmartNumberInput(inputHeight, {
      min: 5,
      max: 297,
      getFallback: () => store.getState().stickerHeightMm,
      onInput: (parsed) => {
        this.validateStickerDimensions(null, parsed);
      },
      onCommit: async (newHeight) => {
        const state = store.getState();
        if (state.lockAspectRatio && state.stickerHeightMm > 0) {
          const ratio = state.stickerWidthMm / state.stickerHeightMm;
          const newWidth = roundMm(newHeight * ratio, 1);
          inputWidth.value = newWidth.toString();
          store.update({ stickerWidthMm: newWidth, stickerHeightMm: newHeight });
        } else {
          store.update({ stickerHeightMm: newHeight });
        }
        this.validateStickerDimensions();
        await this.recalculateArtwork();
      },
    });

    lockRatioToggle?.addEventListener('change', () => {
      const isLocked = lockRatioToggle.checked;
      store.update({ lockAspectRatio: isLocked });
      this.updateLockRatioHint(isLocked);
    });

    sizingFillBtn?.addEventListener('change', async () => {
      if (sizingFillBtn.checked) {
        store.update({ sizingMode: 'fill' });
        this.updateSizingExplanation('fill');
        await this.recalculateArtwork();
      }
    });

    sizingFitBtn?.addEventListener('change', async () => {
      if (sizingFitBtn.checked) {
        store.update({ sizingMode: 'fit' });
        this.updateSizingExplanation('fit');
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

    this.bindSmartNumberInput(marginAll, {
      min: 0,
      max: 100,
      getFallback: () => store.getState().margins.top,
      onCommit: (val) => {
        store.update({
          margins: { top: val, bottom: val, left: val, right: val },
        });
      },
    });

    const marginFields = [
      { el: marginTop, key: 'top' as const },
      { el: marginBottom, key: 'bottom' as const },
      { el: marginLeft, key: 'left' as const },
      { el: marginRight, key: 'right' as const },
    ];

    marginFields.forEach(({ el, key }) => {
      this.bindSmartNumberInput(el, {
        min: 0,
        max: 100,
        getFallback: () => store.getState().margins[key],
        onCommit: (val) => {
          store.update({
            margins: { ...store.getState().margins, [key]: val },
          });
        },
      });
    });

    // 5. Зазор между стикерами (Gap)
    const gapAll = document.getElementById('gapAll') as HTMLInputElement;
    const gapX = document.getElementById('gapX') as HTMLInputElement;
    const gapY = document.getElementById('gapY') as HTMLInputElement;
    const linkGapsToggle = document.getElementById('linkGaps') as HTMLInputElement;

    linkGapsToggle?.addEventListener('change', () => {
      store.update({ linkGaps: linkGapsToggle.checked });
    });

    this.bindSmartNumberInput(gapAll, {
      min: 0,
      max: 50,
      getFallback: () => store.getState().gapX,
      onCommit: (val) => {
        store.update({ gapX: val, gapY: val });
      },
    });

    this.bindSmartNumberInput(gapX, {
      min: 0,
      max: 50,
      getFallback: () => store.getState().gapX,
      onCommit: (val) => {
        store.update({ gapX: val });
      },
    });

    this.bindSmartNumberInput(gapY, {
      min: 0,
      max: 50,
      getFallback: () => store.getState().gapY,
      onCommit: (val) => {
        store.update({ gapY: val });
      },
    });

    // 6. Раскладка и количество копий
    const autoRotationToggle = document.getElementById('allowRotation') as HTMLInputElement;
    const requestedCopiesInput = document.getElementById('requestedCopies') as HTMLInputElement;
    const autoCopiesBtn = document.getElementById('btnAutoCopies') as HTMLButtonElement;

    autoRotationToggle?.addEventListener('change', async () => {
      store.update({ allowRotation: autoRotationToggle.checked });
      await this.recalculateArtwork();
    });

    let copiesTimer: any = null;
    const commitCopies = (force = false) => {
      if (copiesTimer) {
        clearTimeout(copiesTimer);
        copiesTimer = null;
      }
      if (!requestedCopiesInput) return;
      const raw = requestedCopiesInput.value.trim().toUpperCase();
      if (raw === 'AUTO' || raw === '') {
        store.update({ requestedCopies: 'AUTO' });
        if (force) requestedCopiesInput.value = 'AUTO';
      } else {
        const num = parseInt(raw, 10);
        if (!isNaN(num) && num > 0) {
          store.update({ requestedCopies: num });
          if (force) requestedCopiesInput.value = num.toString();
        } else if (force) {
          store.update({ requestedCopies: 'AUTO' });
          requestedCopiesInput.value = 'AUTO';
        }
      }
    };

    requestedCopiesInput?.addEventListener('input', () => {
      if (copiesTimer) clearTimeout(copiesTimer);
      copiesTimer = setTimeout(() => commitCopies(false), 450);
    });
    requestedCopiesInput?.addEventListener('change', () => commitCopies(true));
    requestedCopiesInput?.addEventListener('blur', () => commitCopies(true));
    requestedCopiesInput?.addEventListener('keydown', (e: KeyboardEvent) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        commitCopies(true);
        requestedCopiesInput.blur();
      }
    });

    autoCopiesBtn?.addEventListener('click', () => {
      store.update({ requestedCopies: 'AUTO' });
      if (requestedCopiesInput) requestedCopiesInput.value = 'AUTO';
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

    // 9. Мобильные табы (Параметры / Превью / Справка)
    const tabBtnControls = document.getElementById('tabBtnControls');
    const tabBtnPreview = document.getElementById('tabBtnPreview');
    const tabBtnGuide = document.getElementById('tabBtnGuide');
    const btnGuideLink = document.getElementById('btnGuideLink');
    const btnMobileDownloadPdf = document.getElementById('btnMobileDownloadPdf');

    // По умолчанию на мобильных активны параметры
    document.body.classList.add('tab-active-controls');
    let lastActiveTab: 'controls' | 'preview' = 'controls';

    const guideModalBackdrop = document.getElementById('guideModalBackdrop');
    const btnGuideModalClose = document.getElementById('btnGuideModalClose');
    const btnGuideBack = document.getElementById('btnGuideBack');
    const btnGuideDoneBottom = document.getElementById('btnGuideDoneBottom');

    const openGuideModal = () => {
      if (window.innerWidth <= 1024) {
        activateTab('guide');
      } else {
        guideModalBackdrop?.classList.add('open');
        guideModalBackdrop?.setAttribute('aria-hidden', 'false');
      }
    };

    const dismissGuide = () => {
      guideModalBackdrop?.classList.remove('open');
      guideModalBackdrop?.setAttribute('aria-hidden', 'true');
      document.body.classList.remove('tab-active-guide');
      document.body.style.overflow = '';
      tabBtnGuide?.classList.remove('active');

      if (window.innerWidth <= 1024) {
        activateTab(lastActiveTab);
      }
    };

    const activateTab = (tab: 'controls' | 'preview' | 'guide') => {
      document.body.classList.remove('tab-active-controls', 'tab-active-preview', 'tab-active-guide');
      tabBtnControls?.classList.remove('active');
      tabBtnPreview?.classList.remove('active');
      tabBtnGuide?.classList.remove('active');

      if (tab === 'controls') {
        document.body.style.overflow = '';
        lastActiveTab = 'controls';
        document.body.classList.add('tab-active-controls');
        tabBtnControls?.classList.add('active');
      } else if (tab === 'preview') {
        document.body.style.overflow = '';
        lastActiveTab = 'preview';
        document.body.classList.add('tab-active-preview');
        tabBtnPreview?.classList.add('active');
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else if (tab === 'guide') {
        document.body.style.overflow = 'hidden';
        document.body.classList.add('tab-active-guide');
        tabBtnGuide?.classList.add('active');
        const guideScroll = document.querySelector('.guide-modal-scroll');
        if (guideScroll) {
          guideScroll.scrollTop = 0;
        }
        window.scrollTo({ top: 0, behavior: 'instant' });
      }
    };

    tabBtnControls?.addEventListener('click', () => activateTab('controls'));
    tabBtnPreview?.addEventListener('click', () => activateTab('preview'));
    tabBtnGuide?.addEventListener('click', () => activateTab('guide'));

    // Открытие модального окна Справки на десктопе или переключение таба на мобильных
    btnGuideLink?.addEventListener('click', (e) => {
      e.preventDefault();
      openGuideModal();
    });

    // Мульти-выход из Справки: крестик, мобильная кнопка назад и кнопка внизу контента
    btnGuideModalClose?.addEventListener('click', (e) => {
      e.preventDefault();
      dismissGuide();
    });

    btnGuideBack?.addEventListener('click', (e) => {
      e.preventDefault();
      dismissGuide();
    });

    btnGuideDoneBottom?.addEventListener('click', (e) => {
      e.preventDefault();
      dismissGuide();
    });

    // Закрытие по клику вне модального окна (на затемненный оверлей)
    guideModalBackdrop?.addEventListener('click', (e) => {
      const modalWindow = document.querySelector('.guide-modal-window');
      if (modalWindow && !modalWindow.contains(e.target as Node)) {
        dismissGuide();
      }
    });

    // Закрытие по нажатию клавиши Escape в любом режиме (десктоп или мобильный)
    window.addEventListener('keydown', (e) => {
      const isGuideOpen =
        guideModalBackdrop?.classList.contains('open') ||
        document.body.classList.contains('tab-active-guide');

      if (e.key === 'Escape' && isGuideOpen) {
        dismissGuide();
      }
    });

    btnMobileDownloadPdf?.addEventListener('click', () => this.handleDownloadPdf());
  }

  /**
   * Обработка загруженного файла изображения
   */
  private async handleNewImage(file: File) {
    try {
      const loaded = await loadSourceImage(file);
      this.lastArtworkCache = null;
      store.update({
        loadedImage: loaded,
        cropData: null,
      });
      await this.recalculateArtwork();

      // Фиксация шага воронки: пользователь выбрал и загрузил стикер
      trackEvent({
        name: 'sticker_uploaded',
        data: {
          format: file.type,
          sizeBytes: file.size,
        },
      });

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
      alert(t('alertImageError', { error: e.message }));
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
      const aspectRatio = roundMm(state.stickerWidthMm / state.stickerHeightMm, 4);

      const cacheKey = {
        imageSrc: state.loadedImage.imageElement.src,
        cropJson: JSON.stringify(state.cropData),
        sizingMode: state.sizingMode,
        aspectRatio,
        sheetRotation,
      };

      if (
        this.lastArtworkCache &&
        this.lastArtworkCache.imageSrc === cacheKey.imageSrc &&
        this.lastArtworkCache.cropJson === cacheKey.cropJson &&
        this.lastArtworkCache.sizingMode === cacheKey.sizingMode &&
        Math.abs(this.lastArtworkCache.aspectRatio - cacheKey.aspectRatio) < 0.001 &&
        this.lastArtworkCache.sheetRotation === cacheKey.sheetRotation &&
        state.croppedResult !== null
      ) {
        // Кэш актуален: изображение и пропорции не менялись, тяжелый Canvas рендер пропускаем!
        return;
      }

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

      this.lastArtworkCache = cacheKey;

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
      alert(t('alertNoStickers'));
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

    // Фиксация ключевой конверсии: пользователь успешно скачал готовый лист PDF
    trackEvent({
      name: 'pdf_downloaded',
      data: {
        widthMm: state.stickerWidthMm,
        heightMm: state.stickerHeightMm,
        copies: this.currentLayout.actualCopies,
        bleedMm: state.bleedMm,
        orientation: state.pageOrientation,
      },
    });
  }

  /**
   * Печать PDF с выводом предупреждения о масштабе 100%
   */
  private async handlePrintPdf() {
    if (!this.currentLayout || this.currentLayout.positions.length === 0) {
      alert(t('alertNoStickers'));
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

    // Фиксация действия: отправка на прямую печать
    trackEvent({
      name: 'print_initiated',
      data: {
        copies: this.currentLayout.actualCopies,
      },
    });
  }

  /**
   * Генерация калибровочного листа для проверки точности принтера
   */
  private async handleCalibrationPdf() {
    const pdfBytes = await createCalibrationPdf();
    downloadPdfBlob(pdfBytes, 'calibration-sheet-a4.pdf');

    // Фиксация действия: калибровка масштаба
    trackEvent({
      name: 'calibration_downloaded',
    });
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
    this.updateLockRatioHint(state.lockAspectRatio);

    setChecked('sizingFill', state.sizingMode === 'fill');
    setChecked('sizingFit', state.sizingMode === 'fit');
    this.updateSizingExplanation(state.sizingMode);

    this.validateStickerDimensions(state.stickerWidthMm, state.stickerHeightMm);

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

      const gradeTitleMap: Record<string, TranslationKey> = {
        excellent: 'dpiExcellentTitle',
        acceptable: 'dpiAcceptableTitle',
        low: 'dpiLowTitle',
        warning: 'dpiWarningTitle',
      };
      const gradeDescMap: Record<string, TranslationKey> = {
        excellent: 'dpiExcellentDesc',
        acceptable: 'dpiAcceptableDesc',
        low: 'dpiLowDesc',
        warning: 'dpiWarningDesc',
      };

      const dpiTitle = t(gradeTitleMap[dpiInfo.grade] || 'dpiAcceptableTitle');
      const dpiDesc = t(gradeDescMap[dpiInfo.grade] || 'dpiAcceptableDesc');

      infoContainer.innerHTML = `
        <div class="image-stats-grid">
          <div><strong>${t('imgStatSource')}</strong> ${state.loadedImage.sourceWidthPx} × ${state.loadedImage.sourceHeightPx} px</div>
          <div><strong>${t('imgStatCropped')}</strong> ${state.croppedResult ? `${state.croppedResult.pixelWidth} × ${state.croppedResult.pixelHeight} px` : t('imgStatAuto')}</div>
        </div>
        <div class="dpi-badge-wrapper">
          <span class="dpi-badge" style="background-color: ${dpiInfo.color}18; color: ${dpiInfo.color}; border: 1px solid ${dpiInfo.color}40;">
            ● ${dpiTitle} — ${dpi} DPI
          </span>
          <p class="dpi-description">${dpiDesc}</p>
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
      layoutHeaderBadge.textContent = t('itemsBadge', { count: layout.actualCopies });
    }

    if (layoutSummary) {
      if (layout.hasError) {
        layoutSummary.innerHTML = `
          <div class="alert alert-error">
            ⚠️ ${this.getLocalizedRecommendation(layout, state)}
          </div>
        `;
        return;
      }

      layoutSummary.innerHTML = `
        <div class="stats-card">
          <div class="stats-main-number">
            <span class="number">${layout.actualCopies}</span>
            <span class="label">${t('statStickersOnSheet')}</span>
          </div>
          <div class="stats-details">
            <div><strong>${t('statGrid')}</strong> ${t('statColsRows', { cols: layout.columns, rows: layout.rows })}</div>
            <div><strong>${t('statCapacity')}</strong> ${t('itemsBadge', { count: layout.totalCapacity })} ${state.requestedCopies !== 'AUTO' ? t('statRequested', { req: state.requestedCopies }) : ''}</div>
            <div><strong>${t('statStickerRotation')}</strong> ${layout.selectedRotation === 90 ? t('statRotated90') : t('statNoRotation')}</div>
          </div>
          <div class="recommendation-box">
            💡 ${this.getLocalizedRecommendation(layout, state)}
          </div>
        </div>
      `;
    }

    // Обновление информационной полосы над превью (Apple HIG Capsule Chips)
    const previewHeaderStats = document.getElementById('previewHeaderStats');
    if (previewHeaderStats) {
      const pcsSuffix = t('previewMm') === 'мм' ? 'шт.' : 'pcs';
      previewHeaderStats.innerHTML = `
        <span class="stat-chip" title="${t('chipSheet')}">
          <span class="stat-chip-icon" aria-hidden="true">📄</span>
          <span class="stat-chip-label">${t('chipSheet')}:</span>
          <span class="stat-chip-val">A4 ${pageDim.widthMm} × ${pageDim.heightMm} ${t('previewMm')}</span>
        </span>
        <span class="stat-chip" title="${t('chipSticker')}">
          <span class="stat-chip-icon" aria-hidden="true">🏷️</span>
          <span class="stat-chip-label">${t('chipSticker')}:</span>
          <span class="stat-chip-val">${state.stickerWidthMm} × ${state.stickerHeightMm} ${t('previewMm')}</span>
        </span>
        <span class="stat-chip stat-chip-accent" title="${t('chipGrid')}">
          <span class="stat-chip-icon" aria-hidden="true">▦</span>
          <span class="stat-chip-label">${t('chipGrid')}:</span>
          <span class="stat-chip-val">${layout.columns} × ${layout.rows} (${layout.actualCopies} ${pcsSuffix})</span>
        </span>
        <span class="stat-chip" title="${t('chipMargins')}">
          <span class="stat-chip-icon" aria-hidden="true">📐</span>
          <span class="stat-chip-label">${t('chipMargins')}:</span>
          <span class="stat-chip-val">${state.margins.top} ${t('previewMm')}</span>
        </span>
        <span class="stat-chip" title="${t('chipGap')}">
          <span class="stat-chip-icon" aria-hidden="true">↔️</span>
          <span class="stat-chip-label">${t('chipGap')}:</span>
          <span class="stat-chip-val">${state.gapX} ${t('previewMm')}</span>
        </span>
      `;
    }

    // Обновление мобильного плавающего тулбара и бейджей табов
    const mobileStickyCount = document.getElementById('mobileStickyCount');
    const mobileStickyGrid = document.getElementById('mobileStickyGrid');
    const mobileTabBadge = document.getElementById('mobileTabBadge');

    if (mobileStickyCount) {
      mobileStickyCount.textContent = t('itemsBadge', { count: layout.actualCopies });
    }
    if (mobileStickyGrid) {
      mobileStickyGrid.textContent = t('mobileGrid', { cols: layout.columns, rows: layout.rows });
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
      warningEl.innerHTML = t('warnPrintableArea', { min: minMargin });
    } else {
      warningEl.style.display = 'none';
    }
  }

  /**
   * Получение локализованного текста рекомендаций или ошибок раскладки
   */
  private getLocalizedRecommendation(layout: LayoutResult, state: AppState): string {
    if (layout.usableWidthMm <= 0 || layout.usableHeightMm <= 0) {
      return t('errMarginsExceed');
    }
    if (state.stickerWidthMm <= 0 || state.stickerHeightMm <= 0) {
      return t('errStickerSizeZero');
    }
    if (layout.totalCapacity === 0) {
      return t('errNoFit');
    }

    if (state.allowRotation) {
      if (layout.rotationRecommended) {
        return t('recBestRotated', { rot: layout.totalCapacity, orig: layout.alternativeCapacity });
      }
      if (layout.totalCapacity > layout.alternativeCapacity) {
        return t('recOptimalNoRotation', { orig: layout.totalCapacity, rot: layout.alternativeCapacity });
      }
      return t('recEqualCapacity', { cap: layout.totalCapacity });
    } else {
      if (layout.alternativeCapacity > layout.totalCapacity) {
        return t('recEnableRotation', { rot: layout.alternativeCapacity, orig: layout.totalCapacity });
      }
      return t('recPlacedNoRotation', { orig: layout.totalCapacity });
    }
  }

  /**
   * Обновление динамической подсказки о связывании размеров
   */
  private updateLockRatioHint(locked: boolean) {
    const hintEl = document.getElementById('lockRatioHint');
    if (hintEl) {
      hintEl.textContent = t(locked ? 'hintLockRatioOn' : 'hintLockRatioOff');
    }
  }

  /**
   * Обновление интерактивного описания выбранного режима заполнения
   */
  private updateSizingExplanation(mode: 'fill' | 'fit') {
    const explainEl = document.getElementById('sizingExplanation');
    if (explainEl) {
      explainEl.innerHTML = t(mode === 'fill' ? 'explainSizingFill' : 'explainSizingFit');
    }
  }

  /**
   * Инлайн-валидация размеров стикера: защита от некорректных размеров (>304 мм, больше листа A4, < 5 мм)
   */
  private validateStickerDimensions(widthOverride?: number | null, heightOverride?: number | null) {
    const errorBanner = document.getElementById('stickerSizeError');
    const inputWidth = document.getElementById('stickerWidth') as HTMLInputElement;
    const inputHeight = document.getElementById('stickerHeight') as HTMLInputElement;

    const parseNum = (val: string): number | null => {
      const sanitized = val.trim().replace(',', '.');
      if (!sanitized) return null;
      const num = parseFloat(sanitized);
      return isNaN(num) ? null : num;
    };

    const w = widthOverride !== undefined ? widthOverride : (inputWidth ? parseNum(inputWidth.value) : null);
    const h = heightOverride !== undefined ? heightOverride : (inputHeight ? parseNum(inputHeight.value) : null);

    const maxSheetDim = 297; // Максимальный габарит листа A4
    let errorMessage: string | null = null;
    let hasErrorW = false;
    let hasErrorH = false;

    if (w !== null && w > maxSheetDim) {
      errorMessage = t('errSizeExceedsSheet', { val: w, max: maxSheetDim });
      hasErrorW = true;
    } else if (h !== null && h > maxSheetDim) {
      errorMessage = t('errSizeExceedsSheet', { val: h, max: maxSheetDim });
      hasErrorH = true;
    } else if ((w !== null && w < 5 && w > 0) || (h !== null && h < 5 && h > 0)) {
      errorMessage = t('errSizeTooSmall');
      if (w !== null && w < 5) hasErrorW = true;
      if (h !== null && h < 5) hasErrorH = true;
    }

    if (inputWidth) inputWidth.classList.toggle('input-has-error', hasErrorW);
    if (inputHeight) inputHeight.classList.toggle('input-has-error', hasErrorH);

    if (errorBanner) {
      if (errorMessage) {
        errorBanner.textContent = errorMessage;
        errorBanner.style.display = 'block';
      } else {
        errorBanner.style.display = 'none';
        errorBanner.textContent = '';
      }
    }
  }
}
