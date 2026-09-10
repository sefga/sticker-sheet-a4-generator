import { describe, it, expect } from 'vitest';
import { PDFDocument } from 'pdf-lib';
import { calculateLayout } from '../src/layout/layoutEngine';
import { generateStickerSheetPdf } from '../src/pdf/pdfGenerator';
import { calculatePageDimensions, getPaperFormat, isRollPaperFormat } from '../src/units/paperFormats';
import { pointsToMm } from '../src/units/mm';
import { parseUrlSettings } from '../src/urlParams';

describe('Настройка расстояния по длине рулонной термобумаги (Thermal Roll Length)', () => {
  it('Рулон PeriPage 57 мм: увеличение длины ленты пропорционально увеличивает вместимость наклеек', () => {
    // 1. При дефолтной длине рулона 80 мм
    const dim80 = calculatePageDimensions('peripage_57', 0, 0, 'portrait', 80);
    expect(dim80.widthMm).toBe(57);
    expect(dim80.heightMm).toBe(80);

    const layout80 = calculateLayout({
      pageWidthMm: dim80.widthMm,
      pageHeightMm: dim80.heightMm,
      stickerWidthMm: 25,
      stickerHeightMm: 25,
      margins: { top: 0, bottom: 0, left: 0, right: 0 },
      gapX: 2,
      gapY: 2,
      allowRotation: false,
    });

    expect(layout80.hasError).toBe(false);
    expect(layout80.columns).toBe(2);
    expect(layout80.rows).toBe(3);
    expect(layout80.totalCapacity).toBe(6);

    // 2. При увеличенной длине рулона 160 мм (удвоенная длина)
    const dim160 = calculatePageDimensions('peripage_57', 0, 0, 'portrait', 160);
    expect(dim160.widthMm).toBe(57);
    expect(dim160.heightMm).toBe(160);

    const layout160 = calculateLayout({
      pageWidthMm: dim160.widthMm,
      pageHeightMm: dim160.heightMm,
      stickerWidthMm: 25,
      stickerHeightMm: 25,
      margins: { top: 0, bottom: 0, left: 0, right: 0 },
      gapX: 2,
      gapY: 2,
      allowRotation: false,
    });

    expect(layout160.hasError).toBe(false);
    expect(layout160.columns).toBe(2);
    // 6 строк: 6 × 25 + 5 × 2 = 160 мм ровно
    expect(layout160.rows).toBe(6);
    expect(layout160.totalCapacity).toBe(12);
    expect(layout160.totalCapacity).toBeGreaterThan(layout80.totalCapacity);
  });

  it('Генерация PDF для PeriPage 57 мм со строгим размером MediaBox при настраиваемой длине 140 мм', async () => {
    const dim = calculatePageDimensions('peripage_57', 0, 0, 'portrait', 140);
    expect(dim.widthMm).toBe(57);
    expect(dim.heightMm).toBe(140);

    const layout = calculateLayout({
      pageWidthMm: dim.widthMm,
      pageHeightMm: dim.heightMm,
      stickerWidthMm: 25,
      stickerHeightMm: 25,
      margins: { top: 0, bottom: 0, left: 0, right: 0 },
      gapX: 1,
      gapY: 1,
      allowRotation: false,
    });

    const pdfBytes = await generateStickerSheetPdf({
      pageWidthMm: dim.widthMm,
      pageHeightMm: dim.heightMm,
      layout,
    });

    const doc = await PDFDocument.load(pdfBytes);
    const page = doc.getPages()[0];
    const { width, height } = page.getSize();

    expect(pointsToMm(width)).toBeCloseTo(57, 1);
    expect(pointsToMm(height)).toBeCloseTo(140, 1);
  });

  it('Терморулон 80 мм (roll_80): настраиваемая длина 220 мм и экспорт в PDF', async () => {
    expect(isRollPaperFormat('roll_80')).toBe(true);

    const dim = calculatePageDimensions('roll_80', 0, 0, 'portrait', 220);
    expect(dim.widthMm).toBe(80);
    expect(dim.heightMm).toBe(220);

    const layout = calculateLayout({
      pageWidthMm: dim.widthMm,
      pageHeightMm: dim.heightMm,
      stickerWidthMm: 35,
      stickerHeightMm: 35,
      margins: { top: 0, bottom: 0, left: 0, right: 0 },
      gapX: 2,
      gapY: 2,
      allowRotation: false,
    });

    expect(layout.hasError).toBe(false);
    expect(layout.columns).toBe(2);
    expect(layout.rows).toBeGreaterThanOrEqual(5);

    const pdfBytes = await generateStickerSheetPdf({
      pageWidthMm: dim.widthMm,
      pageHeightMm: dim.heightMm,
      layout,
    });

    const doc = await PDFDocument.load(pdfBytes);
    const page = doc.getPages()[0];
    const { width, height } = page.getSize();

    expect(pointsToMm(width)).toBeCloseTo(80, 1);
    expect(pointsToMm(height)).toBeCloseTo(220, 1);
  });

  it('Поддержка URL-параметра rollLength (Smart Deeplink для термопринтеров)', () => {
    const parsed = parseUrlSettings('?paper=peripage_57&rollLength=175');
    expect(parsed.paperFormatId).toBe('peripage_57');
    expect(parsed.rollLengthMm).toBe(175);
  });

  it('Все термопринтеры (WB 58x40, Niimbot, 4x6, PeriPage, 80мм) поддерживают настройку длины', () => {
    // 1. WB 58x40: дефолт 58x40 мм в альбомной ориентации, при настройке длины рулона 90 мм
    const dimWbDefault = calculatePageDimensions('label_58x40', 0, 0, 'landscape');
    expect(dimWbDefault.widthMm).toBe(58);
    expect(dimWbDefault.heightMm).toBe(40);

    const dimWbCustom = calculatePageDimensions('label_58x40', 0, 0, 'portrait', 90);
    expect(dimWbCustom.widthMm).toBe(58);
    expect(dimWbCustom.heightMm).toBe(90);

    // 2. Niimbot 50x30: дефолт 30 мм, при настройке длины 65 мм
    const dimNiimbotCustom = calculatePageDimensions('label_50x30', 0, 0, 'portrait', 65);
    expect(dimNiimbotCustom.widthMm).toBe(50);
    expect(dimNiimbotCustom.heightMm).toBe(65);

    // 3. 4x6" логистическая этикетка: при настройке длины 200 мм
    const dim4x6Custom = calculatePageDimensions('label_4x6', 0, 0, 'portrait', 200);
    expect(dim4x6Custom.widthMm).toBe(101.6);
    expect(dim4x6Custom.heightMm).toBe(200);
  });

  it('Офисные форматы (A4, Letter, A3) игнорируют настройку rollLengthMm и сохраняют строгие стандартные размеры', () => {
    const dimA4 = calculatePageDimensions('a4', 0, 0, 'portrait', 500);
    expect(dimA4.widthMm).toBe(210);
    expect(dimA4.heightMm).toBe(297);

    const dimLetter = calculatePageDimensions('letter', 0, 0, 'portrait', 400);
    expect(dimLetter.widthMm).toBe(215.9);
    expect(dimLetter.heightMm).toBe(279.4);
  });
});
