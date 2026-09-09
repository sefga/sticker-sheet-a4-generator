import { roundMm } from './mm';

export type Unit = 'mm' | 'cm' | 'in';

export const MM_PER_CM = 10;
export const MM_PER_INCH = 25.4;
export const INCH_PER_MM = 1 / 25.4;
export const CM_PER_MM = 0.1;

/**
 * Перевод значения из указанной единицы измерения в миллиметры (каноническую базу).
 */
export function toMm(value: number, unit: Unit): number {
  if (unit === 'cm') {
    return roundMm(value * MM_PER_CM, 3);
  }
  if (unit === 'in') {
    return roundMm(value * MM_PER_INCH, 3);
  }
  return roundMm(value, 3);
}

/**
 * Перевод значения из миллиметров (базовой величины) в выбранную единицу измерения.
 */
export function fromMm(valueMm: number, unit: Unit): number {
  if (unit === 'cm') {
    return roundMm(valueMm * CM_PER_MM, 3);
  }
  if (unit === 'in') {
    return roundMm(valueMm * INCH_PER_MM, 3);
  }
  return roundMm(valueMm, 3);
}

/**
 * Округление числа под естественный шаг единицы измерения:
 * - мм: 1 знак после запятой (например: 54.0)
 * - см: 2 знака (например: 5.40)
 * - in: 2 знака (например: 2.13)
 */
export function roundToUnit(valueInUnit: number, unit: Unit): number {
  const decimals = unit === 'mm' ? 1 : 2;
  return roundMm(valueInUnit, decimals);
}

/**
 * Форматирование значения из миллиметров для отображения в поле ввода в выбранной единице.
 * Устраняет хвосты вида 2.1299999999999995 или 5.400000000000001.
 */
export function formatUnitValue(valueMm: number, unit: Unit, decimals?: number): string {
  const val = fromMm(valueMm, unit);
  const dec = decimals !== undefined ? decimals : (unit === 'mm' ? 1 : 2);
  const rounded = roundMm(val, dec);
  return rounded.toString();
}

/**
 * Получение шага (step) для числовых полей ввода в зависимости от единицы.
 */
export function getUnitStep(unit: Unit): number {
  switch (unit) {
    case 'cm':
      return 0.05;
    case 'in':
      return 0.05;
    case 'mm':
    default:
      return 0.5;
  }
}

/**
 * Символ единицы измерения для меток и бейджей.
 */
export function getUnitSymbol(unit: Unit, lang: 'ru' | 'en' = 'ru'): string {
  switch (unit) {
    case 'cm':
      return lang === 'ru' ? 'см' : 'cm';
    case 'in':
      return lang === 'ru' ? 'дюймы' : 'in';
    case 'mm':
    default:
      return lang === 'ru' ? 'мм' : 'mm';
  }
}

/**
 * Краткий суффикс единицы (для инпутов и карточек).
 */
export function getUnitShortSuffix(unit: Unit, lang: 'ru' | 'en' = 'ru'): string {
  switch (unit) {
    case 'cm':
      return lang === 'ru' ? 'см' : 'cm';
    case 'in':
      return 'in';
    case 'mm':
    default:
      return lang === 'ru' ? 'мм' : 'mm';
  }
}
