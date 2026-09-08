export interface LoadedImage {
  name: string;
  mimeType: string;
  sourceWidthPx: number;
  sourceHeightPx: number;
  dataUrl: string;
  imageElement: HTMLImageElement;
  rawBytes: Uint8Array;
}

const SUPPORTED_MIME_TYPES = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'];

/**
 * Проверка типа файла
 */
export function isSupportedImageType(file: File | Blob): boolean {
  return SUPPORTED_MIME_TYPES.includes(file.type.toLowerCase()) ||
    /\.(png|jpe?g|webp)$/i.test((file as File).name || '');
}

/**
 * Загрузка изображения из объекта File или Blob
 */
export async function loadSourceImage(file: File | Blob, customName?: string): Promise<LoadedImage> {
  const arrayBuffer = await file.arrayBuffer();
  const rawBytes = new Uint8Array(arrayBuffer);
  const blob = new Blob([rawBytes], { type: file.type || 'image/png' });
  const dataUrl = await blobToDataUrl(blob);

  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      resolve({
        name: customName || (file as File).name || 'image',
        mimeType: file.type || 'image/png',
        sourceWidthPx: img.naturalWidth,
        sourceHeightPx: img.naturalHeight,
        dataUrl,
        imageElement: img,
        rawBytes,
      });
    };
    img.onerror = () => reject(new Error('Не удалось декодировать изображение.'));
    img.src = dataUrl;
  });
}

/**
 * Вспомогательная функция конвертации Blob в Base64 Data URL
 */
function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error('Ошибка чтения файла.'));
    reader.readAsDataURL(blob);
  });
}

/**
 * Извлечение первого изображения из ClipboardEvent
 */
export function extractImageFromClipboard(event: ClipboardEvent): File | null {
  const items = event.clipboardData?.items;
  if (!items) return null;

  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    if (item.type.indexOf('image') !== -1) {
      const file = item.getAsFile();
      if (file && isSupportedImageType(file)) {
        return file;
      }
    }
  }
  return null;
}
