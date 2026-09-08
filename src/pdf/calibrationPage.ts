import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import { A4_WIDTH_MM, A4_HEIGHT_MM, mmToPoints } from '../units/mm';

/**
 * Создание калибровочного листа PDF A4 для проверки точности масштаба принтера
 */
export async function createCalibrationPdf(): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.create();
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  const pageW = mmToPoints(A4_WIDTH_MM);
  const pageH = mmToPoints(A4_HEIGHT_MM);
  const page = pdfDoc.addPage([pageW, pageH]);

  const textColor = rgb(0.1, 0.1, 0.1);
  const lineDark = rgb(0.15, 0.15, 0.15);
  const lineLight = rgb(0.5, 0.5, 0.5);

  // Функция для перевода mm координат (сверху вниз) в PDF points (снизу вверх)
  const toPdfX = (xMm: number) => mmToPoints(xMm);
  const toPdfY = (yMm: number) => pageH - mmToPoints(yMm);

  // 1. Заголовок
  page.drawText('Sticker Sheet A4 Generator — Calibration Sheet', {
    x: toPdfX(20),
    y: toPdfY(25),
    size: 16,
    font: boldFont,
    color: textColor,
  });

  page.drawText('Printer Scale Verification (100% / Actual Size)', {
    x: toPdfX(20),
    y: toPdfY(32),
    size: 11,
    font,
    color: lineLight,
  });

  // 2. Инструкция
  const instructions = [
    'Instructions for checking print scale:',
    '1. In your print dialog, select "100%" or "Actual size" (NEVER select "Fit to page" or "Shrink to fit").',
    '2. Print this sheet and measure the elements below with a physical ruler.',
    '3. If the measurements match, your printer prints with exact 1:1 physical geometry.',
  ];

  let textY = 44;
  for (const line of instructions) {
    page.drawText(line, {
      x: toPdfX(20),
      y: toPdfY(textY),
      size: 9.5,
      font,
      color: textColor,
    });
    textY += 5.5;
  }

  // 3. Тестовый квадрат 50 × 50 мм
  const sqX = 30;
  const sqY = 80;
  const sqSize = 50;

  page.drawRectangle({
    x: toPdfX(sqX),
    y: toPdfY(sqY + sqSize),
    width: mmToPoints(sqSize),
    height: mmToPoints(sqSize),
    borderColor: lineDark,
    borderWidth: 0.75,
  });

  page.drawText('50 x 50 mm', {
    x: toPdfX(sqX + 13),
    y: toPdfY(sqY + sqSize / 2 + 2),
    size: 11,
    font: boldFont,
    color: textColor,
  });

  page.drawText('Exact square', {
    x: toPdfX(sqX + 14),
    y: toPdfY(sqY + sqSize / 2 + 7),
    size: 8.5,
    font,
    color: lineLight,
  });

  // Диагональные перекрестия внутри квадрата для проверки искажений
  page.drawLine({
    start: { x: toPdfX(sqX + sqSize / 2 - 4), y: toPdfY(sqY + sqSize / 2) },
    end: { x: toPdfX(sqX + sqSize / 2 + 4), y: toPdfY(sqY + sqSize / 2) },
    thickness: 0.5,
    color: lineLight,
  });
  page.drawLine({
    start: { x: toPdfX(sqX + sqSize / 2), y: toPdfY(sqY + sqSize / 2 - 4) },
    end: { x: toPdfX(sqX + sqSize / 2), y: toPdfY(sqY + sqSize / 2 + 4) },
    thickness: 0.5,
    color: lineLight,
  });

  // 4. Калибровочная линия 100 мм с засечками
  const lineStartX = 30;
  const lineLength = 100;
  const linePosY = 150;

  // Основная горизонтальная линия 100 мм
  page.drawLine({
    start: { x: toPdfX(lineStartX), y: toPdfY(linePosY) },
    end: { x: toPdfX(lineStartX + lineLength), y: toPdfY(linePosY) },
    thickness: 0.75,
    color: lineDark,
  });

  // Засечка начала (x = 0)
  page.drawLine({
    start: { x: toPdfX(lineStartX), y: toPdfY(linePosY - 4) },
    end: { x: toPdfX(lineStartX), y: toPdfY(linePosY + 4) },
    thickness: 0.75,
    color: lineDark,
  });

  // Засечка конца (x = 100)
  page.drawLine({
    start: { x: toPdfX(lineStartX + lineLength), y: toPdfY(linePosY - 4) },
    end: { x: toPdfX(lineStartX + lineLength), y: toPdfY(linePosY + 4) },
    thickness: 0.75,
    color: lineDark,
  });

  page.drawText('Reference line: exactly 100 mm', {
    x: toPdfX(lineStartX + 20),
    y: toPdfY(linePosY - 6),
    size: 10,
    font: boldFont,
    color: textColor,
  });

  // 5. Точная сантиметровая шкала (0 - 150 мм)
  const rulerStartX = 30;
  const rulerStartY = 180;
  const rulerLengthMm = 150;

  // Базовая линия шкалы
  page.drawLine({
    start: { x: toPdfX(rulerStartX), y: toPdfY(rulerStartY) },
    end: { x: toPdfX(rulerStartX + rulerLengthMm), y: toPdfY(rulerStartY) },
    thickness: 0.75,
    color: lineDark,
  });

  // Деления шкалы: каждый 1 мм (маленькое), каждые 5 мм (среднее), каждые 10 мм (крупное + цифра)
  for (let mm = 0; mm <= rulerLengthMm; mm++) {
    const currX = rulerStartX + mm;
    let tickHeight = 2; // для 1 мм

    if (mm % 10 === 0) {
      tickHeight = 6;
      page.drawText(`${mm / 10}`, {
        x: toPdfX(currX - 1.5),
        y: toPdfY(rulerStartY + 10),
        size: 8,
        font,
        color: textColor,
      });
    } else if (mm % 5 === 0) {
      tickHeight = 4;
    }

    page.drawLine({
      start: { x: toPdfX(currX), y: toPdfY(rulerStartY) },
      end: { x: toPdfX(currX), y: toPdfY(rulerStartY + tickHeight) },
      thickness: mm % 10 === 0 ? 0.75 : 0.35,
      color: lineDark,
    });
  }

  page.drawText('Centimeter ruler (0 - 15 cm, 1 mm step)', {
    x: toPdfX(rulerStartX),
    y: toPdfY(rulerStartY - 5),
    size: 9,
    font,
    color: lineLight,
  });

  // 6. Границы листа A4 (контур с отступом 5 мм по периметру для проверки центрирования принтера)
  page.drawRectangle({
    x: toPdfX(5),
    y: toPdfY(A4_HEIGHT_MM - 5),
    width: mmToPoints(A4_WIDTH_MM - 10),
    height: mmToPoints(A4_HEIGHT_MM - 10),
    borderColor: rgb(0.8, 0.8, 0.8),
    borderWidth: 0.5,
  });

  page.drawText('Sheet margin border: 5 mm from edges', {
    x: toPdfX(7),
    y: toPdfY(A4_HEIGHT_MM - 7),
    size: 7,
    font,
    color: rgb(0.6, 0.6, 0.6),
  });

  return await pdfDoc.save();
}
