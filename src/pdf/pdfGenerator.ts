import { PDFDocument } from 'pdf-lib';
import { mmToPoints } from '../units/mm';
import { LayoutResult } from '../layout/layoutEngine';
import { CutMarksConfig, DEFAULT_CUT_MARKS_CONFIG, drawCutMarksOnPdf, generateCutMarks } from './cutMarks';

export interface PdfExportOptions {
  pageWidthMm: number;
  pageHeightMm: number;
  layout: LayoutResult;
  imageBytes?: Uint8Array;
  imageMimeType?: string;
  cutMarks?: CutMarksConfig;
  bleedMm?: number; // 0, 1, 2, 3 мм
}

/**
 * Программная генерация PDF A4 с точными физическими размерами в миллиметрах
 */
export async function generateStickerSheetPdf(options: PdfExportOptions): Promise<Uint8Array> {
  const {
    pageWidthMm,
    pageHeightMm,
    layout,
    imageBytes,
    imageMimeType,
    cutMarks = DEFAULT_CUT_MARKS_CONFIG,
    bleedMm = 0,
  } = options;

  const pdfDoc = await PDFDocument.create();

  // Физический размер страницы в типографских пунктах (pt = mm * 72 / 25.4)
  const pageWidthPt = mmToPoints(pageWidthMm);
  const pageHeightPt = mmToPoints(pageHeightMm);

  const page = pdfDoc.addPage([pageWidthPt, pageHeightPt]);

  // Если передано изображение, декодируем и встраиваем его в PDF ровно ОДИН раз
  let embeddedImage: any = null;
  if (imageBytes && imageBytes.length > 0) {
    const isJpeg = imageMimeType?.includes('jpeg') || imageMimeType?.includes('jpg');
    if (isJpeg) {
      embeddedImage = await pdfDoc.embedJpg(imageBytes);
    } else {
      embeddedImage = await pdfDoc.embedPng(imageBytes);
    }
  }

  // Отрисовка каждого стикера из рассчитанной сетки layoutEngine
  for (const pos of layout.positions) {
    // Геометрия стикера с учетом Bleed (довылета под обрез)
    // Trim size (линия чистого реза) остается pos.widthMm x pos.heightMm
    const artXMm = pos.xMm - bleedMm;
    const artYMm = pos.yMm - bleedMm;
    const artWidthMm = pos.widthMm + bleedMm * 2;
    const artHeightMm = pos.heightMm + bleedMm * 2;

    // В PDF ось Y направлена снизу вверх, начало в левом нижнем углу
    const xPt = mmToPoints(artXMm);
    const yPt = pageHeightPt - mmToPoints(artYMm + artHeightMm);
    const wPt = mmToPoints(artWidthMm);
    const hPt = mmToPoints(artHeightMm);

    if (embeddedImage) {
      page.drawImage(embeddedImage, {
        x: xPt,
        y: yPt,
        width: wPt,
        height: hPt,
      });
    }
  }

  // Векторные метки реза (рисуются поверх изображений строго по Trim Box)
  if (cutMarks.enabled && layout.positions.length > 0) {
    const lines = generateCutMarks(layout.positions, cutMarks);
    drawCutMarksOnPdf(page, lines, pageHeightPt, cutMarks.lineWidthPt);
  }

  return await pdfDoc.save();
}

/**
 * Вспомогательная функция для скачивания PDF в браузере
 */
export function downloadPdfBlob(pdfBytes: Uint8Array, fileName: string = 'stickers-a4.pdf') {
  const blob = new Blob([pdfBytes as unknown as BlobPart], { type: 'application/pdf' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 10000);
}

/**
 * Вспомогательная функция для открытия PDF в отдельной вкладке / вызова печати
 */
export function openPdfForPrint(pdfBytes: Uint8Array) {
  const blob = new Blob([pdfBytes as unknown as BlobPart], { type: 'application/pdf' });
  const url = URL.createObjectURL(blob);
  const printWindow = window.open(url, '_blank');
  if (printWindow) {
    printWindow.focus();
  }
}
