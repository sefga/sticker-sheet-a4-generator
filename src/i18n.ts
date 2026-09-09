/**
 * Модуль интернационализации (i18n) для Генератора раскладки наклеек A4.
 * Поддерживает два языка: Русский (ru) и Английский (en).
 * Автоматически определяет язык по локали браузера и сохраняет выбор в localStorage.
 */

export type Language = 'ru' | 'en';

export const STORAGE_LANG_KEY = 'sticker_sheet_lang';

export const translations = {
  ru: {
    // Шапка
    appTitle: 'Раскладка наклеек A4',
    appSubtitle: 'Онлайн верстка и печать стикеров в миллиметрах',
    itemsBadge: '{count} шт.',

    // Мобильные вкладки
    tabControls: '⚙️ Параметры',
    tabPreview: '📄 Превью листа',

    // Секция 1: Изображение
    secImageTitle: '1. Изображение стикера',
    dropZoneMain: 'Нажмите, чтобы выбрать фото',
    dropZoneSub: 'из галереи, камеры или перетащите файл',
    dropZoneTitle: 'Нажмите для выбора фото или перетащите файл',
    btnSelectImage: 'Выбрать изображение',
    btnOpenCrop: 'Обрезать',
    imgStatSource: 'Исходник:',
    imgStatCropped: 'Кадр:',
    imgStatAuto: 'Авто',

    // Секция 2: Размер стикера
    secSizeTitle: '2. Размер стикера',
    lblWidth: 'Ширина (мм)',
    lblHeight: 'Высота (мм)',
    lblLockRatio: '🔒 Сохранять пропорции',
    lblSizingMode: 'Режим заполнения',
    lblSizingFill: 'Crop / Fill',
    lblSizingFit: 'Fit',
    titleSizingFill: 'Изображение полностью заполняет стикер (лишнее обрезается)',
    titleSizingFit: 'Всё изображение помещается целиком внутри заданного размера',

    // Секция 3: Параметры листа
    secPageTitle: '3. Параметры листа A4',
    lblOrientation: 'Ориентация страницы',
    lblOrientPortrait: 'Книжная (210 × 297)',
    lblOrientLandscape: 'Альбомная (297 × 210)',
    lblMargins: 'Поля листа (Margins)',
    lblLinkMargins: 'Связать все поля',
    lblMarginTop: 'Верх (мм)',
    lblMarginBottom: 'Низ (мм)',
    lblMarginLeft: 'Лево (мм)',
    lblMarginRight: 'Право (мм)',
    lblGaps: 'Расстояние между стикерами (Gap)',
    lblLinkGaps: 'Связать зазоры',
    lblGapX: 'По горизонтали (мм)',
    lblGapY: 'По вертикали (мм)',
    warnPrintableArea: '⚠️ <strong>Внимание к полям:</strong> Вы используете поля меньше 3 мм ({min} мм). Некоторые принтеры не способны печатать настолько близко к краю листа (риск обрезки контента).',

    // Секция 4: Раскладка
    secLayoutTitle: '4. Раскладка и сетка',
    lblAllowRotation: '☑ Автоматически выбрать наиболее экономичную ориентацию',
    lblCopies: 'Количество копий',
    placeholderCopies: 'AUTO или число',
    btnMaxCopies: 'Максимум',
    statStickersOnSheet: 'стикеров на листе',
    statGrid: 'Сетка:',
    statColsRows: '{cols} колонок × {rows} строк',
    statCapacity: 'Вместимость:',
    statRequested: '(задано: {req})',
    statStickerRotation: 'Ориентация стикера:',
    statRotated90: 'Повернут на 90°',
    statNoRotation: 'Без поворота (0°)',

    // Сообщения рекомендаций раскладки
    recBestRotated: 'Лучшее размещение: с поворотом 90° — {rot} шт. вместо {orig} шт.',
    recOptimalNoRotation: 'Оптимально без поворота: {orig} шт. (с поворотом — {rot} шт.)',
    recEqualCapacity: 'Одинаковая вместимость ({cap} шт.) в обоих вариантах.',
    recEnableRotation: 'С поворотом на 90° поместится больше: {rot} шт. вместо {orig} шт. Включите автоповорот.',
    recPlacedNoRotation: 'Размещение без поворота: {orig} шт.',
    errMarginsExceed: 'Поля превышают размер листа бумаги.',
    errStickerSizeZero: 'Размеры стикера должны быть больше 0.',
    errNoFit: 'Стикер не помещается в доступную область листа с текущими полями.',

    // Секция 5: Полиграфия
    secPrintPrepTitle: '5. Полиграфия и резка',
    lblCutMarks: 'Метки реза (Cut marks)',
    lblBleed: 'Bleed (вылет)',
    optBleed0: '0 мм (без вылета)',
    optBleed1: '1 мм',
    optBleed2: '2 мм',
    optBleed3: '3 мм',

    // Секция 6: Экспорт и печать
    secExportTitle: '6. Экспорт и печать',
    btnDownloadPdf: 'Скачать PDF для печати',
    btnPrintPdf: '🖨️ Печать',
    printNotice: '💡 <strong>Важно при печати:</strong> В диалоге принтера обязательно установите масштаб <strong>«100%»</strong> или <strong>«Реальный размер»</strong> (Actual size). Не используйте режим «По размеру страницы» (Fit to page), чтобы сохранить точные размеры наклеек в мм!',
    btnCalibrationPdf: '📏 Проверить масштаб принтера (Калибровка A4)',
    btnResetSettings: 'Сбросить настройки',

    // Превью зона
    previewLoading: 'Загрузка листа A4...',
    previewScale: 'Масштаб печати: 100%',
    chipSheet: 'Лист:',
    chipSticker: 'Стикер:',
    chipGrid: 'Сетка:',
    chipMargins: 'Поля:',
    chipGap: 'Зазор:',
    previewMm: 'мм',
    previewStickerPlaceholder: '#{idx} ({w}×{h} мм)',

    // Мобильный стики-бар
    mobileGrid: 'Сетка: {cols}×{rows}',
    mobileDownload: 'Скачать PDF',

    // Модальное окно кадрирования
    cropModalTitle: 'Кадрирование стикера',
    cropModalRatio: 'Пропорции: {w} × {h} мм ({ratio})',
    cropBtnRotateLeftTitle: 'Повернуть влево на 90°',
    cropBtnRotateRightTitle: 'Повернуть вправо на 90°',
    cropBtnResetTitle: 'Сбросить кадрирование',
    cropBtnReset: 'Сброс',
    cropBtnCancel: 'Отмена',
    cropBtnApply: 'Применить',

    // Оценки качества DPI
    dpiExcellentTitle: 'Отличное качество',
    dpiExcellentDesc: 'Изображение имеет высокую четкость для полиграфии (≥300 DPI).',
    dpiAcceptableTitle: 'Допустимое качество',
    dpiAcceptableDesc: 'Изображение подходит для печати, но мелкий текст может быть слегка размыт (200-299 DPI).',
    dpiLowTitle: 'Низкое качество',
    dpiLowDesc: 'Возможна заметная потеря резкости деталей (150-199 DPI).',
    dpiWarningTitle: 'Внимание: очень низкое разрешение',
    dpiWarningDesc: 'Изображение будет пикселизированным при печати (<150 DPI). Рекомендуется использовать исходник большего размера.',

    // Алерт ошибок
    alertNoStickers: 'Нет стикеров для размещения на листе.',
    alertImageError: 'Ошибка загрузки изображения: {error}',
  },

  en: {
    // Header
    appTitle: 'Sticker Sheet A4 Generator',
    appSubtitle: 'Online sticker layout & print preparation in millimeters',
    itemsBadge: '{count} pcs',

    // Mobile tabs
    tabControls: '⚙️ Settings',
    tabPreview: '📄 Sheet Preview',

    // Section 1: Image
    secImageTitle: '1. Sticker Image',
    dropZoneMain: 'Click to select photo',
    dropZoneSub: 'from gallery, camera or drag & drop file',
    dropZoneTitle: 'Click to select photo or drag and drop a file',
    btnSelectImage: 'Choose Image',
    btnOpenCrop: 'Crop',
    imgStatSource: 'Source:',
    imgStatCropped: 'Cropped:',
    imgStatAuto: 'Auto',

    // Section 2: Sticker Size
    secSizeTitle: '2. Sticker Dimensions',
    lblWidth: 'Width (mm)',
    lblHeight: 'Height (mm)',
    lblLockRatio: '🔒 Lock aspect ratio',
    lblSizingMode: 'Fitting mode',
    lblSizingFill: 'Crop / Fill',
    lblSizingFit: 'Fit',
    titleSizingFill: 'Image completely fills sticker area (excess is cropped)',
    titleSizingFit: 'Entire image fits inside specified dimensions',

    // Section 3: Sheet Settings
    secPageTitle: '3. A4 Sheet Settings',
    lblOrientation: 'Page orientation',
    lblOrientPortrait: 'Portrait (210 × 297)',
    lblOrientLandscape: 'Landscape (297 × 210)',
    lblMargins: 'Sheet Margins',
    lblLinkMargins: 'Link all margins',
    lblMarginTop: 'Top (mm)',
    lblMarginBottom: 'Bottom (mm)',
    lblMarginLeft: 'Left (mm)',
    lblMarginRight: 'Right (mm)',
    lblGaps: 'Gap between stickers',
    lblLinkGaps: 'Link gaps',
    lblGapX: 'Horizontal (mm)',
    lblGapY: 'Vertical (mm)',
    warnPrintableArea: '⚠️ <strong>Margin Warning:</strong> Margins are less than 3 mm ({min} mm). Some printers cannot print this close to the paper edge (risk of clipped content).',

    // Section 4: Layout & Grid
    secLayoutTitle: '4. Layout & Grid',
    lblAllowRotation: '☑ Automatically select most economical orientation',
    lblCopies: 'Number of copies',
    placeholderCopies: 'AUTO or number',
    btnMaxCopies: 'Maximum',
    statStickersOnSheet: 'stickers on sheet',
    statGrid: 'Grid:',
    statColsRows: '{cols} columns × {rows} rows',
    statCapacity: 'Capacity:',
    statRequested: '(requested: {req})',
    statStickerRotation: 'Sticker rotation:',
    statRotated90: 'Rotated 90°',
    statNoRotation: 'No rotation (0°)',

    // Layout recommendation messages
    recBestRotated: 'Best fit: 90° rotation — {rot} pcs instead of {orig} pcs.',
    recOptimalNoRotation: 'Optimal without rotation: {orig} pcs (with rotation — {rot} pcs).',
    recEqualCapacity: 'Equal capacity ({cap} pcs) in both orientations.',
    recEnableRotation: 'With 90° rotation more stickers fit: {rot} pcs instead of {orig} pcs. Enable auto-rotate.',
    recPlacedNoRotation: 'Layout without rotation: {orig} pcs.',
    errMarginsExceed: 'Margins exceed paper sheet dimensions.',
    errStickerSizeZero: 'Sticker dimensions must be greater than 0.',
    errNoFit: 'Sticker does not fit into printable area with current margins.',

    // Section 5: Printing & Cutting
    secPrintPrepTitle: '5. Printing & Cutting',
    lblCutMarks: 'Cut marks',
    lblBleed: 'Bleed margin',
    optBleed0: '0 mm (no bleed)',
    optBleed1: '1 mm',
    optBleed2: '2 mm',
    optBleed3: '3 mm',

    // Section 6: Export & Print
    secExportTitle: '6. Export & Print',
    btnDownloadPdf: 'Download Print-Ready PDF',
    btnPrintPdf: '🖨️ Print',
    printNotice: '💡 <strong>Important when printing:</strong> In your printer dialog, always select <strong>«100%»</strong> or <strong>«Actual size»</strong>. Do not use «Fit to page» or «Shrink to fit» to preserve exact physical sticker dimensions in millimeters!',
    btnCalibrationPdf: '📏 Check Printer Scale (A4 Calibration)',
    btnResetSettings: 'Reset Settings',

    // Preview area
    previewLoading: 'Loading A4 sheet...',
    previewScale: 'Print scale: 100%',
    chipSheet: 'Sheet:',
    chipSticker: 'Sticker:',
    chipGrid: 'Grid:',
    chipMargins: 'Margins:',
    chipGap: 'Gap:',
    previewMm: 'mm',
    previewStickerPlaceholder: '#{idx} ({w}×{h} mm)',

    // Mobile sticky bar
    mobileGrid: 'Grid: {cols}×{rows}',
    mobileDownload: 'Download PDF',

    // Crop dialog
    cropModalTitle: 'Crop Sticker',
    cropModalRatio: 'Aspect Ratio: {w} × {h} mm ({ratio})',
    cropBtnRotateLeftTitle: 'Rotate 90° left',
    cropBtnRotateRightTitle: 'Rotate 90° right',
    cropBtnResetTitle: 'Reset crop',
    cropBtnReset: 'Reset',
    cropBtnCancel: 'Cancel',
    cropBtnApply: 'Apply',

    // DPI grades
    dpiExcellentTitle: 'Excellent Quality',
    dpiExcellentDesc: 'Image has high print clarity for professional printing (≥300 DPI).',
    dpiAcceptableTitle: 'Good Quality',
    dpiAcceptableDesc: 'Suitable for printing, though very small text may appear slightly soft (200-299 DPI).',
    dpiLowTitle: 'Low Quality',
    dpiLowDesc: 'Noticeable loss of sharpness and detail may occur (150-199 DPI).',
    dpiWarningTitle: 'Warning: Very Low Resolution',
    dpiWarningDesc: 'Image will appear pixelated when printed (<150 DPI). A higher-resolution original is recommended.',

    // Alerts
    alertNoStickers: 'No stickers to place on the sheet.',
    alertImageError: 'Image loading error: {error}',
  },
} as const;

export type TranslationKey = keyof typeof translations.ru;

type LanguageChangeListener = (lang: Language) => void;
const listeners: Set<LanguageChangeListener> = new Set();

function getSafeStorage(): { getItem(key: string): string | null; setItem(key: string, value: string): void } | null {
  try {
    if (typeof globalThis !== 'undefined' && (globalThis as any).localStorage) {
      return (globalThis as any).localStorage;
    }
    if (typeof window !== 'undefined' && window.localStorage) {
      return window.localStorage;
    }
  } catch {
    // игнорируем
  }
  return null;
}

/**
 * Определение исходного языка приложения:
 * 1. Сохраненный выбор в localStorage ('ru' или 'en')
 * 2. Язык браузера/системы пользователя (navigator.languages / navigator.language)
 */
export function detectInitialLanguage(): Language {
  const storage = getSafeStorage();
  if (storage) {
    try {
      const saved = storage.getItem(STORAGE_LANG_KEY);
      if (saved === 'ru' || saved === 'en') {
        return saved;
      }
    } catch {
      // игнорируем
    }
  }

  // Проверяем список предпочтительных языков браузера
  if (typeof navigator !== 'undefined') {
    const langs: readonly string[] = navigator.languages && navigator.languages.length > 0
      ? navigator.languages
      : [navigator.language || (navigator as any).userLanguage || 'en'];

    for (const rawLang of langs) {
      if (!rawLang) continue;
      const l = rawLang.toLowerCase();
      // Если язык русский, белорусский, украинский или казахский — включаем русскую локаль
      if (l.startsWith('ru') || l.startsWith('be') || l.startsWith('uk') || l.startsWith('kk')) {
        return 'ru';
      }
    }
  }

  // Для всех остальных стран по умолчанию английский
  return 'en';
}

let currentLanguage: Language = detectInitialLanguage();

// Первоначальная синхронизация lang у <html> при загрузке страницы
if (typeof document !== 'undefined' && document.documentElement) {
  document.documentElement.lang = currentLanguage;
}

/**
 * Получение текущего активного языка
 */
export function getLanguage(): Language {
  return currentLanguage;
}

/**
 * Установка активного языка с сохранением в localStorage и оповещением подписчиков
 */
export function setLanguage(lang: Language): void {
  if (lang !== 'ru' && lang !== 'en') return;
  currentLanguage = lang;

  const storage = getSafeStorage();
  if (storage) {
    try {
      storage.setItem(STORAGE_LANG_KEY, lang);
    } catch {
      // игнорируем
    }
  }

  // Обновляем атрибут lang у html для доступности и поисковых систем
  if (typeof document !== 'undefined' && document.documentElement) {
    document.documentElement.lang = lang;
  }

  // Применяем переводы ко всем элементам с атрибутами data-i18n
  if (typeof document !== 'undefined') {
    applyTranslations();
  }

  // Оповещаем подписчиков
  listeners.forEach((fn) => fn(lang));
}

/**
 * Подписка на изменение языка
 */
export function onLanguageChange(fn: LanguageChangeListener): () => void {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

/**
 * Получение переведенной строки по ключу с интерполяцией параметров {param}
 */
export function t(key: TranslationKey, params?: Record<string, string | number>): string {
  const dict = translations[currentLanguage] || translations.ru;
  let text = (dict as any)[key] || (translations.ru as any)[key] || key;

  if (params) {
    Object.keys(params).forEach((paramKey) => {
      text = text.replace(new RegExp(`\\{${paramKey}\\}`, 'g'), String(params[paramKey]));
    });
  }

  return text;
}

/**
 * Автоматический обход DOM-дерева и замена текстового содержимого,
 * плейсхолдеров и подсказок (title) на основе data-атрибутов:
 * - [data-i18n="key"] -> textContent / innerHTML
 * - [data-i18n-placeholder="key"] -> placeholder
 * - [data-i18n-title="key"] -> title
 */
export function applyTranslations(root: any = typeof document !== 'undefined' ? document : null): void {
  if (!root || typeof root.querySelectorAll !== 'function') return;

  if (typeof document !== 'undefined' && document.documentElement) {
    document.documentElement.lang = currentLanguage;
  }

  // 1. Текстовое содержимое
  const textElements = root.querySelectorAll('[data-i18n]');
  textElements.forEach((el: any) => {
    const key = el.getAttribute('data-i18n') as TranslationKey;
    if (key) {
      const translated = t(key);
      if (translated.includes('<') && translated.includes('>')) {
        el.innerHTML = translated;
      } else {
        el.textContent = translated;
      }
    }
  });

  // 2. Плейсхолдеры для инпутов
  const placeholderElements = root.querySelectorAll('[data-i18n-placeholder]');
  placeholderElements.forEach((el: any) => {
    const key = el.getAttribute('data-i18n-placeholder') as TranslationKey;
    if (key) {
      el.placeholder = t(key);
    }
  });

  // 3. Подсказки title
  const titleElements = root.querySelectorAll('[data-i18n-title]');
  titleElements.forEach((el: any) => {
    const key = el.getAttribute('data-i18n-title') as TranslationKey;
    if (key) {
      el.title = t(key);
    }
  });

  // 4. Синхронизация состояния кнопок переключателя в шапке
  if (typeof document !== 'undefined') {
    const btnRu = document.getElementById('btnLangRu');
    const btnEn = document.getElementById('btnLangEn');
    if (btnRu && btnEn) {
      if (currentLanguage === 'ru') {
        btnRu.classList.add('active');
        btnEn.classList.remove('active');
      } else {
        btnEn.classList.add('active');
        btnRu.classList.remove('active');
      }
    }
  }
}
