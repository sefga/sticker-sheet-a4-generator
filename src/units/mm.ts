/**
 * Модуль математических преобразований единиц измерения (мм, pt, px, DPI)
 * и стандартных полиграфических констант.
 */

// Коэффициент перевода миллиметров в типографские пункты (PostScript points / DTP points)
// 1 дюйм = 25.4 мм = 72 pt => 1 мм = 72 / 25.4 pt ≈ 2.83464567 pt
export const PT_PER_MM = 72 / 25.4;
export const MM_PER_PT = 25.4 / 72;

// Стандартные физические размеры листа A4 в миллиметрах
export const A4_WIDTH_MM = 210;
export const A4_HEIGHT_MM = 297;

/**
 * Перевод миллиметров в типографские пункты (points для PDF)
 */
export function mmToPoints(mm: number): number {
  return mm * PT_PER_MM;
}

/**
 * Перевод типографских пунктов в миллиметры
 */
export function pointsToMm(pt: number): number {
  return pt * MM_PER_PT;
}

/**
 * Расчет эффективного разрешения (DPI) при заданном размере в пикселях и физической ширине в мм
 * DPI = pixelWidth / (widthMm / 25.4)
 */
export function calculateDpi(pixelDimension: number, mmDimension: number): number {
  if (mmDimension <= 0 || pixelDimension <= 0) return 0;
  return Math.round(pixelDimension / (mmDimension / 25.4));
}

/**
 * Безопасное округление чисел с плавающей точкой до заданного количества знаков,
 * чтобы избежать накопления погрешностей вида 0.1 + 0.2 = 0.30000000000000004
 */
export function roundMm(value: number, decimals: number = 2): number {
  const factor = Math.pow(10, decimals);
  return Math.round((value + Number.EPSILON) * factor) / factor;
}
