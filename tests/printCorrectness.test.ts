import { describe, it, expect } from 'vitest';
import { PDFDocument } from 'pdf-lib';
import { calculateLayout, LayoutInput } from '../src/layout/layoutEngine';
import { generateStickerSheetPdf } from '../src/pdf/pdfGenerator';
import {
  PT_PER_MM,
  MM_PER_PT,
  A4_WIDTH_MM,
  A4_HEIGHT_MM,
  mmToPoints,
  pointsToMm,
  roundMm,
} from '../src/units/mm';

describe('Print Correctness & Physical Accuracy Test Suite (Golden Standards)', () => {
  // =========================================================================
  // 1. Полиграфические константы и точность MediaBox A4
  // =========================================================================
  describe('1. Полиграфическая физика и MediaBox A4', () => {
    it('Коэффициент перевода мм в pt соответствует стандарту DTP (72 / 25.4)', () => {
      const expectedFactor = 72 / 25.4;
      expect(PT_PER_MM).toBeCloseTo(expectedFactor, 8);
      expect(MM_PER_PT).toBeCloseTo(25.4 / 72, 8);
      expect(PT_PER_MM * MM_PER_PT).toBeCloseTo(1, 10);
    });

    it('MediaBox листа A4 (210 × 297 мм) строго равен 595.276 × 841.890 pt', async () => {
      const a4WidthPt = mmToPoints(A4_WIDTH_MM);
      const a4HeightPt = mmToPoints(A4_HEIGHT_MM);

      expect(a4WidthPt).toBeCloseTo(595.27559, 4);
      expect(a4HeightPt).toBeCloseTo(841.88976, 4);

      // Генерируем реальный PDF и проверяем размер страницы через pdf-lib
      const layout = calculateLayout({
        pageWidthMm: A4_WIDTH_MM,
        pageHeightMm: A4_HEIGHT_MM,
        stickerWidthMm: 50,
        stickerHeightMm: 50,
        margins: { top: 5, bottom: 5, left: 5, right: 5 },
        gapX: 2,
        gapY: 2,
        allowRotation: false,
      });

      const pdfBytes = await generateStickerSheetPdf({
        pageWidthMm: A4_WIDTH_MM,
        pageHeightMm: A4_HEIGHT_MM,
        layout,
      });

      const doc = await PDFDocument.load(pdfBytes);
      const page = doc.getPages()[0];
      const { width, height } = page.getSize();

      expect(width).toBeCloseTo(595.276, 2);
      expect(height).toBeCloseTo(841.890, 2);
      expect(pointsToMm(width)).toBeCloseTo(210, 2);
      expect(pointsToMm(height)).toBeCloseTo(297, 2);
    });
  });

  // =========================================================================
  // 2. Эталонные контрольные размеры стикеров (10x10, 25x25, 50x50, 54x85, 100x100)
  // =========================================================================
  describe('2. Эталонные типоразмеры стикеров', () => {
    const testSizes = [
      { name: 'Микро-иконка (10×10 мм)', w: 10, h: 10 },
      { name: 'Квадрат малый (25×25 мм)', w: 25, h: 25 },
      { name: 'Квадрат средний (50×50 мм)', w: 50, h: 50 },
      { name: 'Визитка / карточка (54×85 мм)', w: 54, h: 85 },
      { name: 'Квадрат большой (100×100 мм)', w: 100, h: 100 },
    ];

    for (const { name, w, h } of testSizes) {
      it(`Корректно рассчитывает и размещает: ${name}`, () => {
        const layout = calculateLayout({
          pageWidthMm: A4_WIDTH_MM,
          pageHeightMm: A4_HEIGHT_MM,
          stickerWidthMm: w,
          stickerHeightMm: h,
          margins: { top: 10, bottom: 10, left: 10, right: 10 },
          gapX: 2,
          gapY: 2,
          allowRotation: false,
        });

        expect(layout.hasError).toBe(false);
        expect(layout.totalCapacity).toBeGreaterThan(0);
        expect(layout.positions.length).toBe(layout.totalCapacity);

        // Проверяем точные размеры каждого стикера в результате
        for (const pos of layout.positions) {
          expect(pos.widthMm).toBe(w);
          expect(pos.heightMm).toBe(h);
        }
      });
    }
  });

  // =========================================================================
  // 3. Отсутствие накопительного дрифта (Zero Cumulative Drift)
  // =========================================================================
  describe('3. Отсутствие накопительной погрешности округления', () => {
    it('Координаты строк и колонок не накапливают дрейф при сетке', () => {
      const stickerW = 18.5;
      const stickerH = 26.7;
      const gapX = 1.3;
      const gapY = 1.7;
      const marginLeft = 6.5;
      const marginTop = 7.5;

      const layout = calculateLayout({
        pageWidthMm: A4_WIDTH_MM,
        pageHeightMm: A4_HEIGHT_MM,
        stickerWidthMm: stickerW,
        stickerHeightMm: stickerH,
        margins: { top: marginTop, bottom: 5, left: marginLeft, right: 5 },
        gapX,
        gapY,
        allowRotation: false,
      });

      expect(layout.positions.length).toBeGreaterThan(0);

      // Проверяем каждую позицию аналитически
      const { offsetX, offsetY } = layout.positions.length > 0
        ? { offsetX: layout.positions[0].xMm, offsetY: layout.positions[0].yMm }
        : { offsetX: marginLeft, offsetY: marginTop };

      for (const pos of layout.positions) {
        const expectedX = roundMm(offsetX + pos.col * (stickerW + gapX), 2);
        const expectedY = roundMm(offsetY + pos.row * (stickerH + gapY), 2);

        expect(roundMm(pos.xMm, 2)).toBeCloseTo(expectedX, 2);
        expect(roundMm(pos.yMm, 2)).toBeCloseTo(expectedY, 2);
      }
    });
  });

  // =========================================================================
  // 4. Граничные случаи (Edge Cases & Boundaries)
  // =========================================================================
  describe('4. Граничные условия и предельные размеры', () => {
    it('Умещается с точностью до 0.1 мм (Usable: 100.1 мм, 2 стикера по 50 + 0.1 gap)', () => {
      // Usable width = 210 - 54.95 - 54.95 = 100.1 мм
      const layout = calculateLayout({
        pageWidthMm: 210,
        pageHeightMm: 297,
        stickerWidthMm: 50,
        stickerHeightMm: 50,
        margins: { top: 10, bottom: 10, left: 54.95, right: 54.95 },
        gapX: 0.1,
        gapY: 0.1,
        allowRotation: false,
      });

      // 50 + 0.1 + 50 = 100.1 мм => ровно 2 колонки!
      expect(layout.columns).toBe(2);
    });

    it('Не помещается при нехватке 0.1 мм (Usable: 100.0 мм, требуется 100.1 мм)', () => {
      // Usable width = 210 - 55 - 55 = 100.0 мм
      const layout = calculateLayout({
        pageWidthMm: 210,
        pageHeightMm: 297,
        stickerWidthMm: 50,
        stickerHeightMm: 50,
        margins: { top: 10, bottom: 10, left: 55, right: 55 },
        gapX: 0.1,
        gapY: 0.1,
        allowRotation: false,
      });

      // 100.0 < 100.1 => только 1 колонка!
      expect(layout.columns).toBe(1);
    });

    it('Корректно работает при нулевых полях (margin = 0)', () => {
      const layout = calculateLayout({
        pageWidthMm: 210,
        pageHeightMm: 297,
        stickerWidthMm: 70,
        stickerHeightMm: 99,
        margins: { top: 0, bottom: 0, left: 0, right: 0 },
        gapX: 0,
        gapY: 0,
        allowRotation: false,
      });

      // 210 / 70 = 3 колонки, 297 / 99 = 3 ряда -> 9 стикеров
      expect(layout.columns).toBe(3);
      expect(layout.rows).toBe(3);
      expect(layout.totalCapacity).toBe(9);
      expect(layout.positions[0].xMm).toBe(0);
      expect(layout.positions[0].yMm).toBe(0);
    });

    it('Корректно работает при нулевых зазорах (gap = 0)', () => {
      const layout = calculateLayout({
        pageWidthMm: 210,
        pageHeightMm: 297,
        stickerWidthMm: 50,
        stickerHeightMm: 50,
        margins: { top: 5, bottom: 5, left: 5, right: 5 },
        gapX: 0,
        gapY: 0,
        allowRotation: false,
      });

      // Usable 200 x 287 -> 4 cols (4*50=200), 5 rows (5*50=250)
      expect(layout.columns).toBe(4);
      expect(layout.rows).toBe(5);
      expect(layout.totalCapacity).toBe(20);
    });

    it('Стикер почти размером с лист A4 (200 × 287 мм)', () => {
      const layout = calculateLayout({
        pageWidthMm: 210,
        pageHeightMm: 297,
        stickerWidthMm: 200,
        stickerHeightMm: 287,
        margins: { top: 5, bottom: 5, left: 5, right: 5 },
        gapX: 0,
        gapY: 0,
        allowRotation: false,
      });

      expect(layout.columns).toBe(1);
      expect(layout.rows).toBe(1);
      expect(layout.totalCapacity).toBe(1);
    });

    it('Стикер больше листа A4 выдает capacity = 0 и ошибку', () => {
      const layout = calculateLayout({
        pageWidthMm: 210,
        pageHeightMm: 297,
        stickerWidthMm: 250,
        stickerHeightMm: 350,
        margins: { top: 5, bottom: 5, left: 5, right: 5 },
        gapX: 2,
        gapY: 2,
        allowRotation: true,
      });

      expect(layout.totalCapacity).toBe(0);
      expect(layout.hasError).toBe(true);
      expect(layout.positions.length).toBe(0);
    });

    it('Автоповорот выбирает более выгодную ориентацию стикера (90°)', () => {
      const layout = calculateLayout({
        pageWidthMm: 210,
        pageHeightMm: 297,
        stickerWidthMm: 90,
        stickerHeightMm: 40,
        margins: { top: 5, bottom: 5, left: 5, right: 5 },
        gapX: 0,
        gapY: 0,
        allowRotation: true,
      });

      expect(layout.selectedRotation).toBe(90);
      expect(layout.totalCapacity).toBe(15);
    });
  });

  // =========================================================================
  // 5. Фундаментальный инвариант: ни один элемент не выходит за печатную область
  // =========================================================================
  describe('5. Инвариант печатной области (Printable Area Invariant)', () => {
    const testConfigs: LayoutInput[] = [
      {
        pageWidthMm: 210,
        pageHeightMm: 297,
        stickerWidthMm: 33.3,
        stickerHeightMm: 44.4,
        margins: { top: 7, bottom: 8, left: 9, right: 10 },
        gapX: 1.5,
        gapY: 2.2,
        allowRotation: true,
      },
      {
        pageWidthMm: 210,
        pageHeightMm: 297,
        stickerWidthMm: 50,
        stickerHeightMm: 50,
        margins: { top: 0, bottom: 0, left: 0, right: 0 },
        gapX: 0,
        gapY: 0,
        allowRotation: false,
      },
      {
        pageWidthMm: 210,
        pageHeightMm: 297,
        stickerWidthMm: 15,
        stickerHeightMm: 15,
        margins: { top: 12, bottom: 15, left: 8, right: 14 },
        gapX: 3,
        gapY: 4,
        allowRotation: false,
      },
    ];

    for (let i = 0; i < testConfigs.length; i++) {
      const config = testConfigs[i];
      it(`Инвариант соблюден для конфигурации #${i + 1}`, () => {
        const layout = calculateLayout(config);

        for (const pos of layout.positions) {
          // 1. Позиция стикера внутри листа
          expect(pos.xMm).toBeGreaterThanOrEqual(config.margins.left - 0.001);
          expect(pos.yMm).toBeGreaterThanOrEqual(config.margins.top - 0.001);

          // 2. Правый нижний угол стикера не превышает границы листа минус правое/нижнее поле
          const maxX = config.pageWidthMm - config.margins.right + 0.001;
          const maxY = config.pageHeightMm - config.margins.bottom + 0.001;

          expect(pos.xMm + pos.widthMm).toBeLessThanOrEqual(maxX);
          expect(pos.yMm + pos.heightMm).toBeLessThanOrEqual(maxY);
        }

        // 3. Отсутствие взаимных перекрытий (No overlaps between stickers)
        for (let a = 0; a < layout.positions.length; a++) {
          for (let b = a + 1; b < layout.positions.length; b++) {
            const pA = layout.positions[a];
            const pB = layout.positions[b];

            const overlapX =
              pA.xMm < pB.xMm + pB.widthMm - 0.001 &&
              pA.xMm + pA.widthMm - 0.001 > pB.xMm;
            const overlapY =
              pA.yMm < pB.yMm + pB.heightMm - 0.001 &&
              pA.yMm + pA.heightMm - 0.001 > pB.yMm;

            expect(overlapX && overlapY).toBe(false);
          }
        }
      });
    }
  });
});
