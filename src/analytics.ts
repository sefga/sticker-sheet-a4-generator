/**
 * StickerFit Analytics Module
 * Ультра-легковесный модуль продуктовой аналитики для Vercel Web Analytics и внешних систем.
 * 
 * Особенности:
 * - 0 Кб сторонних тяжелых библиотек
 * - 0 ms задержки UI потока (неблокирующая фоновая отправка)
 * - 0 cookies (полная конфиденциальность и отсутствие навязчивых баннеров)
 * - Безопасная очередь: если скрипт заблокирован AdBlock, ничего не падает и не ломается
 */

declare global {
  interface Window {
    va?: (...args: any[]) => void;
    vaq?: any[];
    ym?: (...args: any[]) => void;
  }
}

// Инициализируем очередь Vercel Analytics в глобальной области
if (typeof window !== 'undefined') {
  window.va =
    window.va ||
    function () {
      (window.vaq = window.vaq || []).push(arguments);
    };
}

export type AnalyticsEvent =
  | {
      name: 'sticker_uploaded';
      data?: {
        format?: string;
        sizeBytes?: number;
      };
    }
  | {
      name: 'pdf_downloaded';
      data: {
        widthMm: number;
        heightMm: number;
        copies: number;
        bleedMm: number;
        orientation?: string;
      };
    }
  | {
      name: 'print_initiated';
      data?: {
        copies: number;
      };
    }
  | {
      name: 'calibration_downloaded';
    };

/**
 * Отправка события в систему аналитики
 */
export function trackEvent(event: AnalyticsEvent): void {
  try {
    // 1. Отправка в Vercel Web Analytics
    if (typeof window !== 'undefined' && typeof window.va === 'function') {
      window.va('event', {
        name: event.name,
        data: 'data' in event ? event.data : undefined,
      });
    }

    // 2. Отправка в Яндекс.Метрику (если в будущем подключен счетчик)
    if (typeof window !== 'undefined' && typeof window.ym === 'function') {
      (window as any).ym?.('reachGoal', event.name, 'data' in event ? event.data : undefined);
    }
  } catch {
    // Изолировано: аналитика никогда не должна прерывать работу UI
  }
}
