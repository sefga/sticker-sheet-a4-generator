import { AppSettings } from './state';

/**
 * Вспомогательная функция для извлечения числового параметра из списка возможных ключей (алиасов).
 * Корректно обрабатывает запятые и точки как десятичные разделители, валидирует диапазон [min, max].
 */
function parseNumber(params: URLSearchParams, keys: string[], min: number, max: number): number | null {
  for (const key of keys) {
    const raw = params.get(key);
    if (raw !== null && raw.trim() !== '') {
      const sanitized = raw.trim().replace(',', '.');
      const num = parseFloat(sanitized);
      if (!isNaN(num) && isFinite(num)) {
        return Math.min(max, Math.max(min, Math.round(num * 10) / 10));
      }
    }
  }
  return null;
}

/**
 * Вспомогательная функция для извлечения логического (boolean) параметра.
 */
function parseBoolean(params: URLSearchParams, keys: string[]): boolean | null {
  for (const key of keys) {
    const raw = params.get(key);
    if (raw !== null) {
      const lower = raw.trim().toLowerCase();
      if (['true', '1', 'yes', 'y', 'on'].includes(lower)) return true;
      if (['false', '0', 'no', 'n', 'off'].includes(lower)) return false;
    }
  }
  return null;
}

/**
 * Разбор параметров строки запроса (URL Query Parameters) для предварительной настройки StickerFit.
 * Поддерживает алиасы для совместимости с внешними ссылками от AI-агентов (ChatGPT) и пользователей.
 * 
 * @param queryString Строка запроса (например: "?width=50&height=50&gap=2" или "width=50")
 * @returns Частичный объект настроек Partial<AppSettings> для наложения на текущее состояние.
 */
export function parseUrlSettings(queryString: string): Partial<AppSettings> {
  if (!queryString || typeof queryString !== 'string') {
    return {};
  }

  // Удаляем начальный знак вопроса, если он есть
  const search = queryString.startsWith('?') ? queryString.substring(1) : queryString;
  if (!search.trim()) {
    return {};
  }

  const params = new URLSearchParams(search);
  const patch: Partial<AppSettings> = {};

  // 1. Размеры наклейки (мм)
  const width = parseNumber(params, ['width', 'w', 'stickerWidth', 'stickerWidthMm'], 5, 297);
  if (width !== null) {
    patch.stickerWidthMm = width;
  }

  const height = parseNumber(params, ['height', 'h', 'stickerHeight', 'stickerHeightMm'], 5, 297);
  if (height !== null) {
    patch.stickerHeightMm = height;
  }

  // Связка пропорций (lockAspectRatio)
  const lockRatio = parseBoolean(params, ['lockAspectRatio', 'lockRatio', 'lock']);
  if (lockRatio !== null) {
    patch.lockAspectRatio = lockRatio;
  }

  // 2. Ориентация листа A4
  for (const key of ['orientation', 'orient', 'pageOrientation', 'o']) {
    const raw = params.get(key);
    if (raw) {
      const lower = raw.trim().toLowerCase();
      if (['landscape', 'land', 'l', 'horizontal', 'h'].includes(lower)) {
        patch.pageOrientation = 'landscape';
        break;
      } else if (['portrait', 'port', 'p', 'vertical', 'v'].includes(lower)) {
        patch.pageOrientation = 'portrait';
        break;
      }
    }
  }

  // 3. Зазоры между наклейками (Gap)
  const uniformGap = parseNumber(params, ['gap', 'g', 'spacing', 'gapAll'], 0, 50);
  const gapX = parseNumber(params, ['gapX', 'gx'], 0, 50);
  const gapY = parseNumber(params, ['gapY', 'gy'], 0, 50);

  if (gapX !== null || gapY !== null) {
    const finalGapX = gapX !== null ? gapX : (uniformGap !== null ? uniformGap : 3);
    const finalGapY = gapY !== null ? gapY : (uniformGap !== null ? uniformGap : 3);
    patch.gapX = finalGapX;
    patch.gapY = finalGapY;
    patch.linkGaps = finalGapX === finalGapY;
  } else if (uniformGap !== null) {
    patch.gapX = uniformGap;
    patch.gapY = uniformGap;
    patch.linkGaps = true;
  }

  // 4. Поля листа (Margins)
  const uniformMargin = parseNumber(params, ['margin', 'm', 'margins', 'marginAll'], 0, 50);
  const marginTop = parseNumber(params, ['marginTop', 'mt'], 0, 50);
  const marginBottom = parseNumber(params, ['marginBottom', 'mb'], 0, 50);
  const marginLeft = parseNumber(params, ['marginLeft', 'ml'], 0, 50);
  const marginRight = parseNumber(params, ['marginRight', 'mr'], 0, 50);

  const hasIndividualMargins =
    marginTop !== null || marginBottom !== null || marginLeft !== null || marginRight !== null;

  if (hasIndividualMargins) {
    const base = uniformMargin !== null ? uniformMargin : 5;
    const top = marginTop !== null ? marginTop : base;
    const bottom = marginBottom !== null ? marginBottom : base;
    const left = marginLeft !== null ? marginLeft : base;
    const right = marginRight !== null ? marginRight : base;

    patch.margins = { top, bottom, left, right };
    patch.linkMargins = top === bottom && bottom === left && left === right;
  } else if (uniformMargin !== null) {
    patch.margins = {
      top: uniformMargin,
      bottom: uniformMargin,
      left: uniformMargin,
      right: uniformMargin,
    };
    patch.linkMargins = true;
  }

  // 5. Количество копий на листе
  for (const key of ['copies', 'c', 'requestedCopies', 'count']) {
    const raw = params.get(key);
    if (raw !== null && raw.trim() !== '') {
      const lower = raw.trim().toLowerCase();
      if (lower === 'auto' || lower === 'all' || lower === 'max') {
        patch.requestedCopies = 'AUTO';
        break;
      }
      const num = parseInt(lower, 10);
      if (!isNaN(num) && num > 0) {
        patch.requestedCopies = Math.min(1000, num);
        break;
      }
    }
  }

  // 6. Разрешить поворот на 90°
  const rotation = parseBoolean(params, ['rotation', 'allowRotation', 'rot']);
  if (rotation !== null) {
    patch.allowRotation = rotation;
  }

  // 7. Режим кадрирования / заполнения (sizingMode: 'fill' | 'fit')
  for (const key of ['sizing', 'mode', 'sizingMode']) {
    const raw = params.get(key);
    if (raw) {
      const lower = raw.trim().toLowerCase();
      if (lower === 'fit' || lower === 'contain') {
        patch.sizingMode = 'fit';
        break;
      } else if (lower === 'fill' || lower === 'cover') {
        patch.sizingMode = 'fill';
        break;
      }
    }
  }

  // 8. Вылеты под обрез (Bleed mm: 0, 1, 2, 3)
  const bleed = parseNumber(params, ['bleed', 'bleedMm'], 0, 3);
  if (bleed !== null) {
    patch.bleedMm = bleed;
  }

  return patch;
}
