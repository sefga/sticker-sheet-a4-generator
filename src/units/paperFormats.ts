import { PageOrientation } from '../state';

export type PaperGroup = 'iso' | 'ansi' | 'photo_label' | 'custom';

export interface PaperFormat {
  id: string;
  name: string;
  group: PaperGroup;
  widthMm: number;
  heightMm: number;
  descriptionRu: string;
  descriptionEn: string;
}

export const PAPER_FORMATS: PaperFormat[] = [
  // Международные форматы ISO 216 (Серия A)
  {
    id: 'a4',
    name: 'A4',
    group: 'iso',
    widthMm: 210,
    heightMm: 297,
    descriptionRu: '210 × 297 мм (стандартный офисный)',
    descriptionEn: '210 × 297 mm (standard office)',
  },
  {
    id: 'a3',
    name: 'A3',
    group: 'iso',
    widthMm: 297,
    heightMm: 420,
    descriptionRu: '297 × 420 мм (вдвое больше A4)',
    descriptionEn: '297 × 420 mm (double A4)',
  },
  {
    id: 'a5',
    name: 'A5',
    group: 'iso',
    widthMm: 148,
    heightMm: 210,
    descriptionRu: '148 × 210 мм (половина A4)',
    descriptionEn: '148 × 210 mm (half A4)',
  },
  {
    id: 'a6',
    name: 'A6',
    group: 'iso',
    widthMm: 105,
    heightMm: 148,
    descriptionRu: '105 × 148 мм (открытка)',
    descriptionEn: '105 × 148 mm (postcard size)',
  },

  // Североамериканские форматы ANSI
  {
    id: 'letter',
    name: 'US Letter',
    group: 'ansi',
    widthMm: 215.9,
    heightMm: 279.4,
    descriptionRu: '8.5 × 11 дюймов (215.9 × 279.4 мм)',
    descriptionEn: '8.5 × 11 in (215.9 × 279.4 mm)',
  },
  {
    id: 'legal',
    name: 'US Legal',
    group: 'ansi',
    widthMm: 215.9,
    heightMm: 355.6,
    descriptionRu: '8.5 × 14 дюймов (215.9 × 355.6 мм)',
    descriptionEn: '8.5 × 14 in (215.9 × 355.6 mm)',
  },
  {
    id: 'tabloid',
    name: 'US Tabloid',
    group: 'ansi',
    widthMm: 279.4,
    heightMm: 431.8,
    descriptionRu: '11 × 17 дюймов (279.4 × 431.8 мм)',
    descriptionEn: '11 × 17 in (279.4 × 431.8 mm)',
  },
  {
    id: 'half_letter',
    name: 'Half Letter',
    group: 'ansi',
    widthMm: 139.7,
    heightMm: 215.9,
    descriptionRu: '5.5 × 8.5 дюймов (139.7 × 215.9 мм)',
    descriptionEn: '5.5 × 8.5 in (139.7 × 215.9 mm)',
  },

  // Этикетки и фото
  {
    id: 'label_4x6',
    name: '4 × 6" (Термоэтикетка)',
    group: 'photo_label',
    widthMm: 101.6,
    heightMm: 152.4,
    descriptionRu: '101.6 × 152.4 мм (4 × 6 дюймов)',
    descriptionEn: '101.6 × 152.4 mm (4 × 6 in shipping label)',
  },
  {
    id: 'photo_10x15',
    name: '10 × 15 см (Фото)',
    group: 'photo_label',
    widthMm: 100,
    heightMm: 150,
    descriptionRu: '100 × 150 мм (стандартное фото)',
    descriptionEn: '100 × 150 mm (photo print)',
  },

  // Пользовательский размер
  {
    id: 'custom',
    name: 'Пользовательский размер',
    group: 'custom',
    widthMm: 210,
    heightMm: 297,
    descriptionRu: 'Любой произвольный размер листа',
    descriptionEn: 'Custom sheet dimension',
  },
];

export const DEFAULT_PAPER_FORMAT_ID = 'a4';

/**
 * Получение информации о формате бумаги по ID.
 */
export function getPaperFormat(formatId: string): PaperFormat {
  const found = PAPER_FORMATS.find((f) => f.id.toLowerCase() === formatId.toLowerCase());
  return found || PAPER_FORMATS[0]; // По умолчанию A4
}

/**
 * Расчет физических размеров страницы в миллиметрах с учетом формата,
 * пользовательских размеров (если выбран custom) и ориентации.
 */
export function calculatePageDimensions(
  formatId: string,
  customWidthMm: number,
  customHeightMm: number,
  orientation: PageOrientation
): { widthMm: number; heightMm: number } {
  let baseW: number;
  let baseH: number;

  if (formatId.toLowerCase() === 'custom') {
    baseW = Math.max(20, Math.min(2000, customWidthMm || 210));
    baseH = Math.max(20, Math.min(2000, customHeightMm || 297));
  } else {
    const format = getPaperFormat(formatId);
    baseW = format.widthMm;
    baseH = format.heightMm;
  }

  // При книжной ориентации ширина <= высоты (или исходные пропорции)
  // При альбомной — разворачиваем
  const minDim = Math.min(baseW, baseH);
  const maxDim = Math.max(baseW, baseH);

  if (orientation === 'landscape') {
    return { widthMm: maxDim, heightMm: minDim };
  }
  return { widthMm: minDim, heightMm: maxDim };
}

/**
 * Получение динамического заголовка приложения для выбранного формата бумаги
 * Устраняет когнитивный диссонанс, когда при выборе Letter или 10x15 в шапке было написано A4.
 */
export function getAppTitleForFormat(formatId: string, lang: 'ru' | 'en'): string {
  const fId = (formatId || 'a4').toLowerCase();
  if (lang === 'ru') {
    if (fId === 'a4') return 'Раскладка наклеек A4';
    if (fId === 'letter') return 'Раскладка наклеек Letter';
    if (fId === 'custom') return 'Раскладка наклеек (свой размер)';
    if (fId === 'a3') return 'Раскладка наклеек A3';
    if (fId === 'a5') return 'Раскладка наклеек A5';
    if (fId === 'a6') return 'Раскладка наклеек A6';
    if (fId === 'legal') return 'Раскладка наклеек Legal';
    if (fId === 'tabloid') return 'Раскладка наклеек Tabloid';
    if (fId === 'half_letter') return 'Раскладка наклеек Half Letter';
    if (fId === 'label_4x6') return 'Раскладка наклеек 4 × 6"';
    if (fId === 'photo_10x15') return 'Раскладка наклеек 10 × 15 см';
    const fmt = getPaperFormat(formatId);
    return `Раскладка наклеек ${fmt.name}`;
  } else {
    if (fId === 'a4') return 'A4 Sticker Sheet Maker';
    if (fId === 'letter') return 'Letter Sticker Sheet Maker';
    if (fId === 'custom') return 'Custom Sticker Sheet Maker';
    if (fId === 'a3') return 'A3 Sticker Sheet Maker';
    if (fId === 'a5') return 'A5 Sticker Sheet Maker';
    if (fId === 'a6') return 'A6 Sticker Sheet Maker';
    if (fId === 'legal') return 'US Legal Sticker Sheet Maker';
    if (fId === 'tabloid') return 'US Tabloid Sticker Sheet Maker';
    if (fId === 'half_letter') return 'Half Letter Sticker Sheet Maker';
    if (fId === 'label_4x6') return '4 × 6" Label Sticker Sheet Maker';
    if (fId === 'photo_10x15') return '10 × 15 cm Photo Sticker Sheet Maker';
    const fmt = getPaperFormat(formatId);
    return `${fmt.name} Sticker Sheet Maker`;
  }
}
