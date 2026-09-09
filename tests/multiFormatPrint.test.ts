import { describe, it, expect } from 'vitest';
import { PDFDocument } from 'pdf-lib';
import { calculateLayout } from '../src/layout/layoutEngine';
import { generateStickerSheetPdf } from '../src/pdf/pdfGenerator';
import { calculatePageDimensions, getPaperFormat } from '../src/units/paperFormats';
import { pointsToMm } from '../src/units/mm';

describe('Multi-Format Layout & PDF Generation (US Letter, A3, Custom, 4x6)', () => {
  it('Раскладка на US Letter (215.9 × 279.4 мм) и генерация PDF со строгим размером MediaBox 612 × 792 pt', async () => {
    const dim = calculatePageDimensions('letter', 0, 0, 'portrait');
    expect(dim.widthMm).toBeCloseTo(215.9, 1);
    expect(dim.heightMm).toBeCloseTo(279.4, 1);

    const layout = calculateLayout({
      pageWidthMm: dim.widthMm,
      pageHeightMm: dim.heightMm,
      stickerWidthMm: 50,
      stickerHeightMm: 50,
      margins: { top: 10, bottom: 10, left: 10, right: 10 },
      gapX: 3,
      gapY: 3,
      allowRotation: false,
    });

    expect(layout.hasError).toBe(false);
    expect(layout.totalCapacity).toBeGreaterThan(0);

    // Проверяем, что все стикеры строго внутри габаритов листа Letter
    for (const pos of layout.positions) {
      expect(pos.xMm).toBeGreaterThanOrEqual(10);
      expect(pos.yMm).toBeGreaterThanOrEqual(10);
      expect(pos.xMm + pos.widthMm).toBeLessThanOrEqual(dim.widthMm + 0.001);
      expect(pos.yMm + pos.heightMm).toBeLessThanOrEqual(dim.heightMm + 0.001);
    }

    const pdfBytes = await generateStickerSheetPdf({
      pageWidthMm: dim.widthMm,
      pageHeightMm: dim.heightMm,
      layout,
    });

    const doc = await PDFDocument.load(pdfBytes);
    const page = doc.getPages()[0];
    const { width, height } = page.getSize();

    // 8.5 × 72 = 612 pt, 11 × 72 = 792 pt
    expect(width).toBeCloseTo(612, 1);
    expect(height).toBeCloseTo(792, 1);
    expect(pointsToMm(width)).toBeCloseTo(215.9, 1);
    expect(pointsToMm(height)).toBeCloseTo(279.4, 1);
  });

  it('Раскладка на широкоформатном листе A3 (297 × 420 мм)', async () => {
    const dim = calculatePageDimensions('a3', 0, 0, 'portrait');
    expect(dim.widthMm).toBe(297);
    expect(dim.heightMm).toBe(420);

    const layout = calculateLayout({
      pageWidthMm: dim.widthMm,
      pageHeightMm: dim.heightMm,
      stickerWidthMm: 54,
      stickerHeightMm: 85,
      margins: { top: 5, bottom: 5, left: 5, right: 5 },
      gapX: 2,
      gapY: 2,
      allowRotation: true,
    });

    expect(layout.hasError).toBe(false);
    // На A4 помещается около 10 шт., на A3 должно поместиться вдвое больше (> 20 шт.)
    expect(layout.totalCapacity).toBeGreaterThanOrEqual(20);

    const pdfBytes = await generateStickerSheetPdf({
      pageWidthMm: dim.widthMm,
      pageHeightMm: dim.heightMm,
      layout,
    });

    const doc = await PDFDocument.load(pdfBytes);
    const page = doc.getPages()[0];
    const { width, height } = page.getSize();

    expect(pointsToMm(width)).toBeCloseTo(297, 1);
    expect(pointsToMm(height)).toBeCloseTo(420, 1);
  });

  it('Пользовательский квадратный размер (Custom 200 × 200 мм)', async () => {
    const dim = calculatePageDimensions('custom', 200, 200, 'portrait');
    expect(dim.widthMm).toBe(200);
    expect(dim.heightMm).toBe(200);

    const layout = calculateLayout({
      pageWidthMm: dim.widthMm,
      pageHeightMm: dim.heightMm,
      stickerWidthMm: 40,
      stickerHeightMm: 40,
      margins: { top: 10, bottom: 10, left: 10, right: 10 },
      gapX: 5,
      gapY: 5,
      allowRotation: false,
    });

    // 180 мм полезной ширины / (40 + 5) = 4 колонки
    // 180 мм полезной высоты / (40 + 5) = 4 строки
    // Вместимость = 4 × 4 = 16 шт.
    expect(layout.columns).toBe(4);
    expect(layout.rows).toBe(4);
    expect(layout.totalCapacity).toBe(16);

    const pdfBytes = await generateStickerSheetPdf({
      pageWidthMm: dim.widthMm,
      pageHeightMm: dim.heightMm,
      layout,
    });

    const doc = await PDFDocument.load(pdfBytes);
    const page = doc.getPages()[0];
    const { width, height } = page.getSize();

    expect(pointsToMm(width)).toBeCloseTo(200, 1);
    expect(pointsToMm(height)).toBeCloseTo(200, 1);
  });

  it('Термоэтикетка 4×6" (101.6 × 152.4 мм)', async () => {
    const dim = calculatePageDimensions('label_4x6', 0, 0, 'portrait');
    const layout = calculateLayout({
      pageWidthMm: dim.widthMm,
      pageHeightMm: dim.heightMm,
      stickerWidthMm: 40,
      stickerHeightMm: 40,
      margins: { top: 3, bottom: 3, left: 3, right: 3 },
      gapX: 2,
      gapY: 2,
      allowRotation: true,
    });

    expect(layout.hasError).toBe(false);
    expect(layout.totalCapacity).toBeGreaterThan(0);
  });
});
