/**
 * Модуль интернационализации (i18n) для Генератора раскладки наклеек A4.
 * Поддерживает два языка: Русский (ru) и Английский (en).
 * Автоматически определяет язык по локали браузера и сохраняет выбор в localStorage.
 */

export type Language = 'ru' | 'en';

export const STORAGE_LANG_KEY = 'sticker_sheet_lang';

export const translations = {
  ru: {
    // Шапка и бренд
    brandName: 'StickerFit',
    appTitle: 'Раскладка наклеек A4',
    appSubtitle: 'Онлайн верстка и печать стикеров в миллиметрах',
    itemsBadge: '{count} шт.',
    btnGuide: '📖 Справка & FAQ',
    guideModalTitle: 'Справка & Руководство StickerFit',
    guideModalSub: 'Справочный центр и калькулятор',
    btnGuideDone: '✓ Понятно, вернуться к раскладке',
    btnGuideBack: '← Назад',
    btnGuideCloseAria: 'Закрыть окно справки',

    // Мобильные вкладки
    tabControls: '⚙️ Параметры',
    tabPreview: '📄 Превью листа',
    tabGuide: '📖 Справка',

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
    lblLockRatio: '🔗 Связать ширину и высоту',
    hintLockRatioOn: 'Ширина и высота связаны: изменение одного размера пропорционально меняет второй.',
    hintLockRatioOff: 'Размеры независимы: можно свободно задавать любую ширину и высоту.',
    lblSizingMode: 'Режим заполнения стикера',
    lblSizingFill: 'Заполнить (обрезка)',
    lblSizingFit: 'Вписать целиком',
    titleSizingFill: 'Изображение заполняет стикер на 100% без белых рамок; лишние края кадрируются',
    titleSizingFit: 'Изображение видно полностью на 100% без обрезки; по краям могут появиться поля',
    explainSizingFill: '✂️ <strong>Заполнить (обрезка):</strong> фото занимает весь стикер без белых полос. Лишние края кадрируются. Выбирайте, если нужен стикер «под обрез» без рамок.',
    explainSizingFit: '🖼️ <strong>Вписать целиком:</strong> всё изображение видно на 100% без обрезки деталей. Если пропорции фото отличаются, останутся аккуратные поля. Идеально для логотипов, текста и иконок.',

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
    tipPaperMargins: '💡 <strong>Поля листа:</strong> стандартная белая кромка принтера (3–5 мм). При 0 мм требуется принтер с поддержкой печати «в край» (borderless).',
    tipGaps: '💡 <strong>Зазор:</strong> 0 мм — резка ножом по линейке встык (1 рез = 2 стикера); 2–4 мм — резка ножницами или плоттером.',

    // Секция 4: Раскладка
    secLayoutTitle: '4. Раскладка и сетка',
    lblAllowRotation: '☑ Автоматически выбрать наиболее экономичную ориентацию',
    tipAutoRotate: '💡 <strong>Умный поворот:</strong> система автоматически повернет стикеры на 90°, если так на лист поместится больше штук.',
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
    errSizeExceedsSheet: '⚠️ Размер {val} мм превышает длину листа A4 ({max} мм). Стикер не поместится на страницу!',
    errSizeExceedsUsable: '⚠️ Размер {val} мм не помещается в печатную область ({usable} мм) из-за полей листа.',
    errSizeTooSmall: '⚠️ Минимальный размер стикера — 5 мм.',

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

    // SEO & GEO Content Hub (Справочный центр и FAQ)
    hubHeroTitle: 'A4 Sticker Sheet Maker',
    hubHeroSubtitle: 'Загрузите стикер, укажите точные физические размеры в миллиметрах, и StickerFit автоматически заполнит лист А4 максимальным количеством копий. Экспортируйте макет для печати со 100% масштабом.',
    hubPrivacyBadge: '🛡️ 100% Конфиденциальность: Ваши изображения обрабатываются только в браузере и не покидают устройство',

    hubHowTitle: 'Как работает StickerFit',
    hubStep1Title: '1. Загрузите стикер',
    hubStep1Desc: 'Выберите изображение (PNG, JPG, WebP) из галереи, камеры или вставьте из буфера обмена.',
    hubStep2Title: '2. Укажите размеры (мм)',
    hubStep2Desc: 'Задайте ширину и высоту в миллиметрах. При необходимости используйте кадрирование и поворот.',
    hubStep3Title: '3. Авто-раскладка на А4',
    hubStep3Desc: 'Умный алгоритм рассчитает экономичную сетку и проверит автоповорот на 90° для максимума копий.',
    hubStep4Title: '4. Печать 1:1 в PDF',
    hubStep4Desc: 'Скачайте готовый векторный PDF с метками реза и вылетами Bleed. Печатайте в масштабе 100%.',

    hubCalcTitle: 'Сколько стикеров помещается на листе А4?',
    hubCalcDesc: 'Стандартный лист бумаги A4 имеет физический размер 210 × 297 мм. Алгоритм рассчитывает вместимость по формуле с учетом полей и зазоров:',
    hubFormulaCols: 'Колонки = ⌊(Ширина области + Зазор) / (Ширина стикера + Зазор)⌋',
    hubFormulaRows: 'Строки = ⌊(Высота области + Зазор) / (Высота стикера + Зазор)⌋',
    hubFormulaTotal: 'Всего стикеров = Колонки × Строки',

    hubSizesTitle: 'Таблица популярных размеров стикеров на А4',
    hubSizesColSize: 'Размер (мм)',
    hubSizesColUsage: 'Назначение',
    hubSizesColMax: 'Вместимость на А4',
    hubSize1Usage: 'Круглые пломбы, иконки, мини-стикеры',
    hubSize2Usage: 'Товарные логотипы, этикетки для упаковки',
    hubSize3Usage: 'Стандартные квадратные брендовые наклейки',
    hubSize4Usage: 'Размер банковской карты / визитки',
    hubSize5Usage: 'Транспортные и упаковочные наклейки',

    hubScaleTitle: 'Печать в масштабе 1:1: почему это критично',
    hubScaleDesc: 'Диалоги печати в браузерах часто по умолчанию включают режим «По размеру страницы» (Fit to Page), сжимая макет на 3–7% и искажая физические миллиметры. Всегда выбирайте масштаб «100%» или «Реальный размер» (Actual size).',

    hubFaqTitle: 'Часто задаваемые вопросы (FAQ)',
    faqQ1: 'Что такое StickerFit?',
    faqA1: 'StickerFit — это бесплатный онлайн-генератор раскладки наклеек на листе А4. Он автоматически рассчитывает сетку по миллиметрам и генерирует векторный PDF 1:1 для печати.',
    faqQ2: 'Каков точный размер листа бумаги формата А4?',
    faqA2: 'Международный стандарт бумаги A4 имеет точные размеры 210 × 297 мм (8.27 × 11.69 дюймов).',
    faqQ3: 'Как распечатать стикеры в точном физическом размере?',
    faqA3: 'Всегда выбирайте «100%» или «Реальный размер» (Actual size) в диалоге принтера. Не используйте «По размеру страницы». Для проверки принтера можно распечатать наш встроенный калибровочный лист.',
    faqQ4: 'Какое разрешение изображения нужно для качественной печати?',
    faqA4: 'Для полиграфической четкости рекомендуется от 300 DPI. StickerFit автоматически рассчитывает эффективный DPI для указанных миллиметров и отображает цветовую плашку качества.',
    faqQ5: 'Умеет ли StickerFit поворачивать стикеры для экономии бумаги?',
    faqA5: 'Да! При включенном автоповороте StickerFit сравнивает варианты 0° и 90° и выбирает тот, в котором на лист помещается больше стикеров.',
    faqQ6: 'Сохраняются ли мои изображения на сервере?',
    faqA6: 'Нет. Вся обработка, кадрирование и сборка PDF происходят на 100% локально в вашем браузере. Ваши файлы и изображения никогда не отправляются на сервер. StickerFit использует только минимальную анонимную продуктовую аналитику (подсчет визитов и факта экспорта PDF) без использования cookies и без сбора персональных данных.',
  },

  en: {
    // Header & Brand
    brandName: 'StickerFit',
    appTitle: 'A4 Sticker Sheet Maker',
    appSubtitle: 'Online sticker layout & print preparation in millimeters',
    itemsBadge: '{count} pcs',
    btnGuide: '📖 Guide & FAQ',
    guideModalTitle: 'StickerFit Guide & Documentation',
    guideModalSub: 'Help Center & Grid Calculator',
    btnGuideDone: '✓ Done, back to layout',
    btnGuideBack: '← Back',
    btnGuideCloseAria: 'Close help modal',

    // Mobile tabs
    tabControls: '⚙️ Settings',
    tabPreview: '📄 Sheet Preview',
    tabGuide: '📖 Guide',

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
    lblLockRatio: '🔗 Link width & height',
    hintLockRatioOn: 'Linked: changing one dimension proportionally adjusts the other.',
    hintLockRatioOff: 'Independent dimensions: free to set any custom width and height.',
    lblSizingMode: 'Sticker fitting mode',
    lblSizingFill: 'Fill (Crop edges)',
    lblSizingFit: 'Fit (Whole image)',
    titleSizingFill: 'Image completely fills sticker area (excess edges are cropped)',
    titleSizingFit: 'Entire image fits inside sticker area (no cropping, borders may appear)',
    explainSizingFill: '✂️ <strong>Fill (Crop edges):</strong> image covers 100% of sticker without white bars. Edges are cropped. Best for photos and full-bleed artwork.',
    explainSizingFit: '🖼️ <strong>Fit (Whole image):</strong> entire image fits without cutting any details. Clean borders appear if ratios differ. Best for logos, text, and badges.',

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
    warnPrintableArea: '⚠️ <strong>Margin Warning:</strong> Margins are less than 3 mm ({min} мм). Some printers cannot print this close to the paper edge (risk of clipped content).',
    tipPaperMargins: '💡 <strong>Sheet Margins:</strong> standard printer white borders (3–5 mm). 0 mm requires borderless printing support.',
    tipGaps: '💡 <strong>Gap between stickers:</strong> 0 mm for fast knife & ruler cuts (1 cut separates 2 stickers); 2–4 mm for scissors or plotter cuts.',

    // Section 4: Layout & Grid
    secLayoutTitle: '4. Layout & Grid',
    lblAllowRotation: '☑ Automatically select most economical orientation',
    tipAutoRotate: '💡 <strong>Smart rotate:</strong> automatically rotates stickers 90° if more fit on the sheet.',
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
    errSizeExceedsSheet: '⚠️ Size {val} mm exceeds A4 sheet dimension ({max} mm). Sticker cannot fit on the page!',
    errSizeExceedsUsable: '⚠️ Size {val} mm exceeds printable area ({usable} mm) due to sheet margins.',
    errSizeTooSmall: '⚠️ Minimum sticker size is 5 mm.',

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

    // SEO & GEO Content Hub (Documentation & FAQ)
    hubHeroTitle: 'A4 Sticker Sheet Maker',
    hubHeroSubtitle: 'Upload a sticker, enter its exact dimensions, and StickerFit automatically fills an A4 sheet with the maximum number of copies. Export a print-ready layout without changing the sticker dimensions.',
    hubPrivacyBadge: '🛡️ 100% Client-Side Privacy: Your images are processed entirely in your browser and never leave your device',

    hubHowTitle: 'How StickerFit Works',
    hubStep1Title: '1. Upload Sticker',
    hubStep1Desc: 'Select any sticker image (PNG, JPG, WebP) from your files, camera or paste directly from clipboard.',
    hubStep2Title: '2. Set Exact Dimensions',
    hubStep2Desc: 'Enter target width and height in millimeters (mm). Crop, rotate or lock aspect ratio as required.',
    hubStep3Title: '3. Auto-Fit on A4 Sheet',
    hubStep3Desc: 'The smart layout engine calculates optimal grid rows/columns and tests 90° rotation to maximize sheet capacity.',
    hubStep4Title: '4. Print 1:1 Vector PDF',
    hubStep4Desc: 'Download your print-ready vector PDF with optional cut marks and bleed margins. Always print at 100% scale.',

    hubCalcTitle: 'How Many Stickers Fit on an A4 Sheet?',
    hubCalcDesc: 'Standard international A4 paper measures 210 × 297 mm. The formula calculates total copies based on margins and gaps:',
    hubFormulaCols: 'Columns = ⌊(Usable Width + Gap) / (Sticker Width + Gap)⌋',
    hubFormulaRows: 'Rows = ⌊(Usable Height + Gap) / (Sticker Height + Gap)⌋',
    hubFormulaTotal: 'Total Stickers = Columns × Rows',

    hubSizesTitle: 'Popular Sticker Sizes Reference on A4',
    hubSizesColSize: 'Size (mm)',
    hubSizesColUsage: 'Recommended Use',
    hubSizesColMax: 'Max Copies on A4',
    hubSize1Usage: 'Small circular seals, icons, journal stickers',
    hubSize2Usage: 'Product logo labels, packaging seals',
    hubSize3Usage: 'Standard square branding stickers',
    hubSize4Usage: 'Credit card / ID badge / business card size',
    hubSize5Usage: 'Shipping labels, large package stickers',

    hubScaleTitle: 'Print at Exact 1:1 Scale: Why 100% Matters',
    hubScaleDesc: 'Desktop and mobile print dialogs often default to "Fit to Page" or "Shrink to Fit". This shrinks your document by 3–7%, distorting the physical millimeters. Always ensure "100%" or "Actual Size" is selected in your printer settings.',

    hubFaqTitle: 'Frequently Asked Questions (FAQ)',
    faqQ1: 'What is StickerFit?',
    faqA1: 'StickerFit is an online sticker sheet layout tool and PDF generator. It automatically arranges copies of a sticker on an A4 page using exact physical millimeter dimensions and prepares the layout for printing.',
    faqQ2: 'What size is an A4 sticker sheet?',
    faqA2: 'International standard A4 paper measures exactly 210 × 297 mm (8.27 × 11.69 inches). StickerFit computes placement using these exact physical boundaries.',
    faqQ3: 'How do I ensure stickers print at their exact physical size?',
    faqA3: 'Always choose "100%" or "Actual Size" in your print dialog. Never use "Fit to Page". You can also print our calibration test page to verify printer geometry with a physical ruler.',
    faqQ4: 'What resolution should my sticker artwork have?',
    faqA4: 'For sharp, professional results, use artwork with at least 300 DPI. StickerFit dynamically calculates the effective DPI for your chosen dimensions and warns you if the resolution is too low.',
    faqQ5: 'Can StickerFit auto-rotate stickers to fit more copies?',
    faqA5: 'Yes! When "Auto-rotate" is enabled, StickerFit compares both 0° and 90° orientations and automatically chooses whichever packs more stickers onto the sheet.',
    faqQ6: 'Are my uploaded images saved or sent to any server?',
    faqA6: 'No. All image processing, cropping, and PDF layout rendering take place 100% locally in your web browser. Your artwork and images never leave your device. StickerFit uses minimal, privacy-friendly anonymous product analytics (counting pageviews and successful exports) without cookies and without collecting your files or personal data.',
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
 * 1. Явный URL-параметр (?lang=ru или ?lang=en)
 * 2. Сохраненный выбор в localStorage ('ru' или 'en')
 * 3. Язык браузера/системы устройства (navigator.languages / navigator.language)
 */
export function detectInitialLanguage(): Language {
  // 1. Приоритет: явный URL параметр
  if (typeof window !== 'undefined' && window.location?.search) {
    try {
      const params = new URLSearchParams(window.location.search);
      const urlLang = params.get('lang')?.toLowerCase();
      if (urlLang === 'ru' || urlLang === 'en') {
        const storage = getSafeStorage();
        storage?.setItem(STORAGE_LANG_KEY, urlLang);
        return urlLang;
      }
    } catch {
      // игнорируем
    }
  }

  // 2. Приоритет: сохраненный выбор в localStorage
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

  // 3. Приоритет: предпочтительные языки браузера/системы пользователя
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

// Автоматическая реакция на смену языка в настройках системы/браузера
if (typeof window !== 'undefined') {
  window.addEventListener('languagechange', () => {
    const storage = getSafeStorage();
    // Если пользователь вручную не зафиксировал выбор в localStorage, мгновенно адаптируем язык под систему
    if (!storage?.getItem(STORAGE_LANG_KEY)) {
      setLanguage(detectInitialLanguage());
    }
  });
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
