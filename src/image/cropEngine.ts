export interface CropData {
  x: number;
  y: number;
  width: number;
  height: number;
  rotate: number;
  scaleX: number;
  scaleY: number;
}

export type SizingMode = 'fill' | 'fit';

export interface CroppedResult {
  dataUrl: string;
  bytes: Uint8Array;
  mimeType: string;
  pixelWidth: number;
  pixelHeight: number;
}

/**
 * Отрисовка и нарезка изображения в максимальном исходном разрешении
 * с учетом координат Cropper.js и режима размещения (Fill / Fit)
 */
export async function renderCroppedArtwork(
  sourceImage: HTMLImageElement,
  cropData: CropData | null,
  sizingMode: SizingMode,
  aspectRatio: number, // targetWidth / targetHeight
  originalMimeType: string,
  sheetRotation: 0 | 90 = 0
): Promise<CroppedResult> {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d', { alpha: true });
  if (!ctx) {
    throw new Error('Не удалось инициализировать 2D-контекст Canvas.');
  }

  const srcW = sourceImage.naturalWidth;
  const srcH = sourceImage.naturalHeight;

  // Если cropData не задан, используем дефолтное заполнение по соотношению сторон
  let cropX = 0;
  let cropY = 0;
  let cropW = srcW;
  let cropH = srcH;
  let rotate = 0;

  if (cropData) {
    cropX = Math.round(cropData.x);
    cropY = Math.round(cropData.y);
    cropW = Math.round(cropData.width);
    cropH = Math.round(cropData.height);
    rotate = cropData.rotate || 0;
  } else {
    // Автоматический crop по центру с нужным aspect ratio
    if (sizingMode === 'fill' && aspectRatio > 0) {
      const srcRatio = srcW / srcH;
      if (srcRatio > aspectRatio) {
        // Исходник шире -> обрезаем по бокам
        cropH = srcH;
        cropW = Math.round(srcH * aspectRatio);
        cropX = Math.round((srcW - cropW) / 2);
        cropY = 0;
      } else {
        // Исходник выше -> обрезаем сверху/снизу
        cropW = srcW;
        cropH = Math.round(srcW / aspectRatio);
        cropX = 0;
        cropY = Math.round((srcH - cropH) / 2);
      }
    }
  }

  // Защита от нулевых или отрицательных размеров
  cropW = Math.max(1, cropW);
  cropH = Math.max(1, cropH);

  if (sizingMode === 'fit' && aspectRatio > 0) {
    // В режиме Fit всё кадрированное изображение помещается внутри холста с целевым соотношением сторон
    let outW: number;
    let outH: number;
    const currentCropRatio = cropW / cropH;

    if (currentCropRatio > aspectRatio) {
      outW = cropW;
      outH = Math.round(cropW / aspectRatio);
    } else {
      outH = cropH;
      outW = Math.round(cropH * aspectRatio);
    }

    canvas.width = outW;
    canvas.height = outH;

    ctx.clearRect(0, 0, outW, outH);

    // Центрируем внутри выходного холста
    const destX = Math.round((outW - cropW) / 2);
    const destY = Math.round((outH - cropH) / 2);

    drawRotatedImage(ctx, sourceImage, cropX, cropY, cropW, cropH, destX, destY, cropW, cropH, rotate);

    const finalCanvas = sheetRotation === 90 ? applySheetRotation(canvas) : canvas;
    const mimeType = 'image/png'; // PNG для сохранения прозрачных полей Fit
    const bytes = await canvasToUint8Array(finalCanvas, mimeType);
    const dataUrl = finalCanvas.toDataURL(mimeType);

    return {
      dataUrl,
      bytes,
      mimeType,
      pixelWidth: finalCanvas.width,
      pixelHeight: finalCanvas.height,
    };
  } else {
    // Режим Crop / Fill: холст равен точно размеру кадрированной области
    canvas.width = cropW;
    canvas.height = cropH;
    ctx.clearRect(0, 0, cropW, cropH);

    drawRotatedImage(ctx, sourceImage, cropX, cropY, cropW, cropH, 0, 0, cropW, cropH, rotate);

    const finalCanvas = sheetRotation === 90 ? applySheetRotation(canvas) : canvas;

    // Сохраняем исходный формат или PNG
    const mimeType = originalMimeType.includes('jpeg') || originalMimeType.includes('jpg')
      ? 'image/jpeg'
      : 'image/png';

    const bytes = await canvasToUint8Array(finalCanvas, mimeType, 0.98);
    const dataUrl = finalCanvas.toDataURL(mimeType, 0.98);

    return {
      dataUrl,
      bytes,
      mimeType,
      pixelWidth: finalCanvas.width,
      pixelHeight: finalCanvas.height,
    };
  }
}

/**
 * Вспомогательная функция поворота холста на 90° по часовой стрелке
 */
function applySheetRotation(sourceCanvas: HTMLCanvasElement): HTMLCanvasElement {
  const rotCanvas = document.createElement('canvas');
  rotCanvas.width = sourceCanvas.height;
  rotCanvas.height = sourceCanvas.width;
  const rotCtx = rotCanvas.getContext('2d');
  if (rotCtx) {
    rotCtx.translate(rotCanvas.width / 2, rotCanvas.height / 2);
    rotCtx.rotate((90 * Math.PI) / 180);
    rotCtx.drawImage(sourceCanvas, -sourceCanvas.width / 2, -sourceCanvas.height / 2);
  }
  return rotCanvas;
}

/**
 * Отрисовка с возможным поворотом вокруг центра
 */
function drawRotatedImage(
  ctx: CanvasRenderingContext2D,
  image: HTMLImageElement,
  sx: number,
  sy: number,
  sw: number,
  sh: number,
  dx: number,
  dy: number,
  dw: number,
  dh: number,
  rotate: number
) {
  if (rotate === 0) {
    ctx.drawImage(image, sx, sy, sw, sh, dx, dy, dw, dh);
    return;
  }

  ctx.save();
  ctx.translate(dx + dw / 2, dy + dh / 2);
  ctx.rotate((rotate * Math.PI) / 180);
  ctx.drawImage(image, sx, sy, sw, sh, -dw / 2, -dh / 2, dw, dh);
  ctx.restore();
}

/**
 * Преобразование HTMLCanvasElement в Uint8Array без лишних конверсий
 */
function canvasToUint8Array(canvas: HTMLCanvasElement, mimeType: string, quality?: number): Promise<Uint8Array> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      async (blob) => {
        if (!blob) {
          reject(new Error('Не удалось сформировать Blob из Canvas.'));
          return;
        }
        const buffer = await blob.arrayBuffer();
        resolve(new Uint8Array(buffer));
      },
      mimeType,
      quality
    );
  });
}
