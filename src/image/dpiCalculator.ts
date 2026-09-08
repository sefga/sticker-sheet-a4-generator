import { calculateDpi } from '../units/mm';

export type DpiGrade = 'excellent' | 'acceptable' | 'low' | 'warning';

export interface DpiInfo {
  dpi: number;
  grade: DpiGrade;
  label: string;
  description: string;
  color: string;
}

/**
 * Расчет DPI и определение градации качества печати:
 * ≥300 DPI — отличное/хорошее качество
 * 200–299 DPI — допустимое качество
 * 150–199 DPI — низкое качество
 * <150 DPI — предупреждение о пикселизации
 */
export function getDpiInfo(pixelWidth: number, widthMm: number): DpiInfo {
  const dpi = calculateDpi(pixelWidth, widthMm);

  if (dpi >= 300) {
    return {
      dpi,
      grade: 'excellent',
      label: 'Отличное качество',
      description: 'Изображение имеет высокую четкость для полиграфии (≥300 DPI).',
      color: '#10b981', // green
    };
  }

  if (dpi >= 200) {
    return {
      dpi,
      grade: 'acceptable',
      label: 'Допустимое качество',
      description: 'Изображение подходит для печати, но мелкий текст может быть слегка размыт (200-299 DPI).',
      color: '#3b82f6', // blue
    };
  }

  if (dpi >= 150) {
    return {
      dpi,
      grade: 'low',
      label: 'Низкое качество',
      description: 'Возможна заметная потеря резкости деталей (150-199 DPI).',
      color: '#f59e0b', // amber
    };
  }

  return {
    dpi,
    grade: 'warning',
    label: 'Внимание: очень низкое разрешение',
    description: 'Изображение будет пикселизированным при печати (<150 DPI). Рекомендуется использовать исходник большего размера.',
    color: '#ef4444', // red
  };
}
