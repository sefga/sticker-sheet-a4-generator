import { describe, it, expect } from 'vitest';
import {
  PAPER_FORMATS,
  getPaperFormat,
  calculatePageDimensions,
  getAppTitleForFormat,
  isRollPaperFormat,
} from './paperFormats';

describe('Paper Formats Module (Стандарты бумаги и кастомные размеры)', () => {
  it('Каталог содержит ключевые стандарты ISO и ANSI', () => {
    const ids = PAPER_FORMATS.map((f) => f.id);
    expect(ids).toContain('a4');
    expect(ids).toContain('a3');
    expect(ids).toContain('a5');
    expect(ids).toContain('a6');
    expect(ids).toContain('letter');
    expect(ids).toContain('legal');
    expect(ids).toContain('tabloid');
    expect(ids).toContain('label_4x6');
    expect(ids).toContain('custom');
  });

  describe('Физические размеры форматов', () => {
    it('A4 строго 210 × 297 мм', () => {
      const a4 = getPaperFormat('a4');
      expect(a4.widthMm).toBe(210);
      expect(a4.heightMm).toBe(297);
    });

    it('A3 строго 297 × 420 мм', () => {
      const a3 = getPaperFormat('a3');
      expect(a3.widthMm).toBe(297);
      expect(a3.heightMm).toBe(420);
    });

    it('US Letter строго 215.9 × 279.4 мм (8.5 × 11 дюймов)', () => {
      const letter = getPaperFormat('letter');
      expect(letter.widthMm).toBe(215.9);
      expect(letter.heightMm).toBe(279.4);
    });

    it('4×6" термоэтикетка строго 101.6 × 152.4 мм', () => {
      const label = getPaperFormat('label_4x6');
      expect(label.widthMm).toBe(101.6);
      expect(label.heightMm).toBe(152.4);
    });
  });

  describe('Расчет габаритов calculatePageDimensions', () => {
    it('Книжная ориентация для A4', () => {
      const dim = calculatePageDimensions('a4', 0, 0, 'portrait');
      expect(dim.widthMm).toBe(210);
      expect(dim.heightMm).toBe(297);
    });

    it('Альбомная ориентация для A4', () => {
      const dim = calculatePageDimensions('a4', 0, 0, 'landscape');
      expect(dim.widthMm).toBe(297);
      expect(dim.heightMm).toBe(210);
    });

    it('US Letter в альбомной ориентации', () => {
      const dim = calculatePageDimensions('letter', 0, 0, 'landscape');
      expect(dim.widthMm).toBe(279.4);
      expect(dim.heightMm).toBe(215.9);
    });

    it('Пользовательский размер (Custom)', () => {
      const dim = calculatePageDimensions('custom', 150, 200, 'portrait');
      expect(dim.widthMm).toBe(150);
      expect(dim.heightMm).toBe(200);

      const dimLand = calculatePageDimensions('custom', 150, 200, 'landscape');
      expect(dimLand.widthMm).toBe(200);
      expect(dimLand.heightMm).toBe(150);
    });

    it('Защита от некорректных или нулевых размеров в Custom', () => {
      const dimZero = calculatePageDimensions('custom', 0, 0, 'portrait');
      expect(dimZero.widthMm).toBe(210);
      expect(dimZero.heightMm).toBe(297);

      const dimMax = calculatePageDimensions('custom', 3000, 3000, 'portrait');
      expect(dimMax.widthMm).toBe(2000);
      expect(dimMax.heightMm).toBe(2000);
    });
  });

  describe('Термопринтеры и этикетки (PeriPage, Niimbot, маркетплейсы)', () => {
    it('PeriPage 57 мм рулон строго 57 × 80 мм по умолчанию, с флагом isRoll', () => {
      const p57 = getPaperFormat('peripage_57');
      expect(p57.widthMm).toBe(57);
      expect(p57.heightMm).toBe(80);
      expect(p57.group).toBe('thermal');
      expect(p57.isRoll).toBe(true);
      expect(isRollPaperFormat('peripage_57')).toBe(true);
    });

    it('Терморулон 80 мм (roll_80) с флагом isRoll и настраиваемой длиной', () => {
      const r80 = getPaperFormat('roll_80');
      expect(r80.widthMm).toBe(80);
      expect(r80.heightMm).toBe(100);
      expect(r80.group).toBe('thermal');
      expect(r80.isRoll).toBe(true);
      expect(isRollPaperFormat('roll_80')).toBe(true);
      expect(isRollPaperFormat('a4')).toBe(false);
    });

    it('Расчет физических размеров рулона с настраиваемым расстоянием по длине в мм', () => {
      // По умолчанию, если rollLengthMm не указан — берутся дефолтные 80 мм
      const defaultDim = calculatePageDimensions('peripage_57', 0, 0, 'portrait');
      expect(defaultDim.widthMm).toBe(57);
      expect(defaultDim.heightMm).toBe(80);

      // При настройке расстояния по длине 150 мм
      const customLenDim = calculatePageDimensions('peripage_57', 0, 0, 'portrait', 150);
      expect(customLenDim.widthMm).toBe(57);
      expect(customLenDim.heightMm).toBe(150);

      // Рулон 80 мм с длиной 250 мм
      const r80Dim = calculatePageDimensions('roll_80', 0, 0, 'portrait', 250);
      expect(r80Dim.widthMm).toBe(80);
      expect(r80Dim.heightMm).toBe(250);
    });

    it('Термоэтикетка 58 × 40 мм (WB, Ozon)', () => {
      const wb = getPaperFormat('label_58x40');
      expect(wb.widthMm).toBe(58);
      expect(wb.heightMm).toBe(40);
      expect(wb.group).toBe('thermal');
    });

    it('Этикетка Niimbot / Phomemo 50 × 30 мм', () => {
      const nb = getPaperFormat('label_50x30');
      expect(nb.widthMm).toBe(50);
      expect(nb.heightMm).toBe(30);
      expect(nb.group).toBe('thermal');
    });
  });

  describe('Динамический заголовок страницы getAppTitleForFormat', () => {
    it('Корректно формирует заголовок на русском языке для всех типов форматов', () => {
      expect(getAppTitleForFormat('a4', 'ru')).toBe('Раскладка наклеек A4');
      expect(getAppTitleForFormat('letter', 'ru')).toBe('Раскладка наклеек Letter');
      expect(getAppTitleForFormat('a3', 'ru')).toBe('Раскладка наклеек A3');
      expect(getAppTitleForFormat('peripage_57', 'ru')).toBe('Раскладка наклеек PeriPage 57 мм');
      expect(getAppTitleForFormat('roll_80', 'ru')).toBe('Раскладка наклеек Терморулон 80 мм');
      expect(getAppTitleForFormat('label_58x40', 'ru')).toBe('Раскладка наклеек 58 × 40 мм');
      expect(getAppTitleForFormat('label_50x30', 'ru')).toBe('Раскладка наклеек 50 × 30 мм');
      expect(getAppTitleForFormat('photo_10x15', 'ru')).toBe('Раскладка наклеек 10 × 15 см');
      expect(getAppTitleForFormat('label_4x6', 'ru')).toBe('Раскладка наклеек 4 × 6"');
      expect(getAppTitleForFormat('custom', 'ru')).toBe('Раскладка наклеек (свой размер)');
    });

    it('Корректно формирует заголовок на английском языке для всех типов форматов', () => {
      expect(getAppTitleForFormat('a4', 'en')).toBe('A4 Sticker Sheet Maker');
      expect(getAppTitleForFormat('letter', 'en')).toBe('Letter Sticker Sheet Maker');
      expect(getAppTitleForFormat('a3', 'en')).toBe('A3 Sticker Sheet Maker');
      expect(getAppTitleForFormat('peripage_57', 'en')).toBe('PeriPage 57 mm Sticker Maker');
      expect(getAppTitleForFormat('roll_80', 'en')).toBe('80 mm Thermal Roll Sticker Maker');
      expect(getAppTitleForFormat('label_58x40', 'en')).toBe('58 × 40 mm Thermal Label Maker');
      expect(getAppTitleForFormat('label_50x30', 'en')).toBe('50 × 30 mm Thermal Label Maker');
      expect(getAppTitleForFormat('photo_10x15', 'en')).toBe('10 × 15 cm Photo Sticker Sheet Maker');
      expect(getAppTitleForFormat('label_4x6', 'en')).toBe('4 × 6" Label Sticker Sheet Maker');
      expect(getAppTitleForFormat('custom', 'en')).toBe('Custom Sticker Sheet Maker');
    });
  });
});
