import { describe, it, expect } from 'vitest';
import {
  PAPER_FORMATS,
  getPaperFormat,
  calculatePageDimensions,
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
});
