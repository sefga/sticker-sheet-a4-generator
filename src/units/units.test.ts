import { describe, it, expect } from 'vitest';
import {
  toMm,
  fromMm,
  roundToUnit,
  formatUnitValue,
  getUnitStep,
  getUnitSymbol,
  getUnitShortSuffix,
  MM_PER_CM,
  MM_PER_INCH,
} from './units';

describe('Units Module (мм, см, дюймы)', () => {
  it('Константы перевода точны', () => {
    expect(MM_PER_CM).toBe(10);
    expect(MM_PER_INCH).toBe(25.4);
  });

  describe('Конвертация toMm и fromMm', () => {
    it('Миллиметры остаются без изменений', () => {
      expect(toMm(54, 'mm')).toBe(54);
      expect(fromMm(54, 'mm')).toBe(54);
    });

    it('Сантиметры: 1 см = 10 мм', () => {
      expect(toMm(5.4, 'cm')).toBe(54);
      expect(fromMm(54, 'cm')).toBe(5.4);
      expect(toMm(10, 'cm')).toBe(100);
      expect(fromMm(100, 'cm')).toBe(10);
    });

    it('Дюймы: 1 дюйм = 25.4 мм', () => {
      expect(toMm(1, 'in')).toBe(25.4);
      expect(fromMm(25.4, 'in')).toBe(1);
      expect(toMm(2, 'in')).toBe(50.8);
      expect(fromMm(50.8, 'in')).toBe(2);
    });

    it('Обратимость без накопления погрешностей (Round-trip conversion)', () => {
      // 54 мм -> in -> mm (с точностью до сотых дюйма)
      const inVal = fromMm(54, 'in'); // ~2.12598 in
      expect(inVal).toBeCloseTo(2.126, 3);
      expect(toMm(inVal, 'in')).toBeCloseTo(54, 3);

      // 85 мм -> cm -> mm
      const cmVal = fromMm(85, 'cm'); // 8.5 cm
      expect(cmVal).toBe(8.5);
      expect(toMm(cmVal, 'cm')).toBe(85);
    });
  });

  describe('Округление и форматирование чисел', () => {
    it('roundToUnit корректно округляет под естественный шаг единицы', () => {
      expect(roundToUnit(54.123, 'mm')).toBe(54.1);
      expect(roundToUnit(5.456, 'cm')).toBe(5.46);
      expect(roundToUnit(2.126, 'in')).toBe(2.13);
    });

    it('formatUnitValue формирует аккуратную строку для инпутов', () => {
      expect(formatUnitValue(54, 'mm')).toBe('54');
      expect(formatUnitValue(54, 'cm')).toBe('5.4');
      expect(formatUnitValue(25.4, 'in')).toBe('1');
      expect(formatUnitValue(54, 'in')).toBe('2.13');
    });

    it('Шаг инпутов getUnitStep', () => {
      expect(getUnitStep('mm')).toBe(0.5);
      expect(getUnitStep('cm')).toBe(0.05);
      expect(getUnitStep('in')).toBe(0.05);
    });

    it('Символы и суффиксы единиц', () => {
      expect(getUnitSymbol('mm', 'ru')).toBe('мм');
      expect(getUnitSymbol('mm', 'en')).toBe('mm');
      expect(getUnitSymbol('cm', 'ru')).toBe('см');
      expect(getUnitSymbol('cm', 'en')).toBe('cm');
      expect(getUnitSymbol('in', 'ru')).toBe('дюймы');
      expect(getUnitSymbol('in', 'en')).toBe('in');

      expect(getUnitShortSuffix('in', 'ru')).toBe('in');
      expect(getUnitShortSuffix('cm', 'ru')).toBe('см');
    });
  });
});
