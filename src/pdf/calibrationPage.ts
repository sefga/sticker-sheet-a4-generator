import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import { A4_WIDTH_MM, A4_HEIGHT_MM, mmToPoints } from '../units/mm';

/**
 * Создание калибровочного листа PDF A4 для проверки точности масштаба принтера
 * Включает:
 * - Эталонный квадрат 50 × 50 мм
 * - Эталонный квадрат 100 × 100 мм
 * - Эталонную линию 100 мм с концевыми засечками
 * - Точную миллиметровую шкалу 0–150 мм
 * - Рамку отступов листа 5 мм
 * - Инструкцию по настройке печати без масштабирования (100% / Actual Size)
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
  const accentColor = rgb(0.1, 0.4, 0.85);

  // Функция для перевода mm координат (сверху вниз) в PDF points (снизу вверх)
  const toPdfX = (xMm: number) => mmToPoints(xMm);
  const toPdfY = (yMm: number) => pageH - mmToPoints(yMm);

  // 1. Заголовок
  page.drawText('StickerFit — Calibration & Print Accuracy Sheet', {
    x: toPdfX(20),
    y: toPdfY(22),
    size: 15,
    font: boldFont,
    color: textColor,
  });

  page.drawText('Printer Scale & Physical Geometry Verification (100% / 1:1 Actual Size)', {
    x: toPdfX(20),
    y: toPdfY(28),
    size: 9.5,
    font,
    color: accentColor,
  });

  // 2. Инструкция по печати
  const instructions = [
    'How to verify your print scale:',
    '1. In your system print dialog, select "100%" or "Actual size" (DO NOT select "Fit to printable area" or "Shrink to fit").',
    '2. Print this sheet and measure the elements below with a physical ruler.',
    '3. If measurements match the indicated millimeters, your printer produces mathematically exact 1:1 output.',
  ];

  let textY = 36;
  for (const line of instructions) {
    page.drawText(line, {
      x: toPdfX(20),
      y: toPdfY(textY),
      size: 8.5,
      font,
      color: textColor,
    });
    textY += 4.5;
  }

  // 3. Тестовый квадрат 50 × 50 мм (слева)
  const sq50X = 20;
  const sq50Y = 60;
  const sq50Size = 50;

  page.drawRectangle({
    x: toPdfX(sq50X),
    y: toPdfY(sq50Y + sq50Size),
    width: mmToPoints(sq50Size),
    height: mmToPoints(sq50Size),
    borderColor: lineDark,
    borderWidth: 0.75,
  });

  page.drawText('50 x 50 mm', {
    x: toPdfX(sq50X + 11),
    y: toPdfY(sq50Y + sq50Size / 2 - 2),
    size: 11,
    font: boldFont,
    color: textColor,
  });

  page.drawText('Exact square (5.0 cm)', {
    x: toPdfX(sq50X + 8),
    y: toPdfY(sq50Y + sq50Size / 2 + 5),
    size: 7.5,
    font,
    color: lineLight,
  });

  // Перекрестие внутри 50x50 квадрата
  page.drawLine({
    start: { x: toPdfX(sq50X + sq50Size / 2 - 4), y: toPdfY(sq50Y + sq50Size / 2) },
    end: { x: toPdfX(sq50X + sq50Size / 2 + 4), y: toPdfY(sq50Y + sq50Size / 2) },
    thickness: 0.5,
    color: lineLight,
  });
  page.drawLine({
    start: { x: toPdfX(sq50X + sq50Size / 2), y: toPdfY(sq50Y + sq50Size / 2 - 4) },
    end: { x: toPdfX(sq50X + sq50Size / 2), y: toPdfY(sq50Y + sq50Size / 2 + 4) },
    thickness: 0.5,
    color: lineLight,
  });

  // 4. Тестовый квадрат 100 × 100 мм (справа)
  const sq100X = 85;
  const sq100Y = 60;
  const sq100Size = 100;

  page.drawRectangle({
    x: toPdfX(sq100X),
    y: toPdfY(sq100Y + sq100Size),
    width: mmToPoints(sq100Size),
    height: mmToPoints(sq100Size),
    borderColor: lineDark,
    borderWidth: 0.75,
  });

  page.drawText('100 x 100 mm', {
    x: toPdfX(sq100X + 28),
    y: toPdfY(sq100Y + sq100Size / 2 - 2),
    size: 13,
    font: boldFont,
    color: textColor,
  });

  page.drawText('Exact square (10.0 cm)', {
    x: toPdfX(sq100X + 29),
    y: toPdfY(sq100Y + sq100Size / 2 + 5),
    size: 8.5,
    font,
    color: lineLight,
  });

  // Перекрестие внутри 100x100 квадрата
  page.drawLine({
    start: { x: toPdfX(sq100X + sq100Size / 2 - 8), y: toPdfY(sq100Y + sq100Size / 2) },
    end: { x: toPdfX(sq100X + sq100Size / 2 + 8), y: toPdfY(sq100Y + sq100Size / 2) },
    thickness: 0.5,
    color: lineLight,
  });
  page.drawLine({
    start: { x: toPdfX(sq100X + sq100Size / 2), y: toPdfY(sq100Y + sq100Size / 2 - 8) },
    end: { x: toPdfX(sq100X + sq100Size / 2), y: toPdfY(sq100Y + sq100Size / 2 + 8) },
    thickness: 0.5,
    color: lineLight,
  });

  // 5. Калибровочная эталонная линия 100 мм с засечками
  const lineStartX = 20;
  const lineLength = 100;
  const linePosY = 180;

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

  page.drawText('Reference line: exactly 100 mm (10.0 cm between vertical tick marks)', {
    x: toPdfX(lineStartX),
    y: toPdfY(linePosY - 6),
    size: 9,
    font: boldFont,
    color: textColor,
  });

  // 6. Точная миллиметровая шкала (0 - 150 мм)
  const rulerStartX = 20;
  const rulerStartY = 208;
  const rulerLengthMm = 150;

  page.drawLine({
    start: { x: toPdfX(rulerStartX), y: toPdfY(rulerStartY) },
    end: { x: toPdfX(rulerStartX + rulerLengthMm), y: toPdfY(rulerStartY) },
    thickness: 0.75,
    color: lineDark,
  });

  for (let mm = 0; mm <= rulerLengthMm; mm++) {
    const currX = rulerStartX + mm;
    let tickHeight = 2;

    if (mm % 10 === 0) {
      tickHeight = 6;
      page.drawText(`${mm / 10}`, {
        x: toPdfX(currX - 1.5),
        y: toPdfY(rulerStartY + 9),
        size: 7.5,
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

  page.drawText('Centimeter & millimeter scale (0 - 15 cm with 1 mm divisions)', {
    x: toPdfX(rulerStartX),
    y: toPdfY(rulerStartY - 5),
    size: 8.5,
    font,
    color: lineLight,
  });

  // 7. Диагностический блок / Troubleshooting note
  const diagY = 238;
  page.drawText('Scale Troubleshooting Guide:', {
    x: toPdfX(20),
    y: toPdfY(diagY),
    size: 9,
    font: boldFont,
    color: textColor,
  });

  const notes = [
    '* Measured square is ~47-48 mm instead of 50 mm: Printer scaled page to 94-96% ("Fit to printable area" is active). Disable scaling in print dialog.',
    '* Measured square is exactly 50 mm & 100 mm: Printer scaling is perfect. Your sticker sheets will match your input sizes with 0.1 mm precision.',
    '* Output is shifted off-center: Adjust paper guide tabs in your printer input tray.',
  ];

  let noteY = diagY + 5;
  for (const n of notes) {
    page.drawText(n, {
      x: toPdfX(20),
      y: toPdfY(noteY),
      size: 7.5,
      font,
      color: lineDark,
    });
    noteY += 4;
  }

  // 8. Контур границ листа A4 (5 мм от края для проверки центрирования)
  page.drawRectangle({
    x: toPdfX(5),
    y: toPdfY(A4_HEIGHT_MM - 5),
    width: mmToPoints(A4_WIDTH_MM - 10),
    height: mmToPoints(A4_HEIGHT_MM - 10),
    borderColor: rgb(0.8, 0.8, 0.8),
    borderWidth: 0.5,
  });

  page.drawText('Sheet margin border: 5 mm from sheet edges', {
    x: toPdfX(7),
    y: toPdfY(A4_HEIGHT_MM - 7),
    size: 7,
    font,
    color: rgb(0.6, 0.6, 0.6),
  });

  return await pdfDoc.save();
}
