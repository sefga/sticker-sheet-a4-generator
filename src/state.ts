import { A4_WIDTH_MM, A4_HEIGHT_MM } from './units/mm';
import { Margins } from './layout/layoutEngine';
import { CutMarksConfig, DEFAULT_CUT_MARKS_CONFIG } from './pdf/cutMarks';
import { CropData, CroppedResult, SizingMode } from './image/cropEngine';
import { LoadedImage } from './image/imageLoader';

export type PageOrientation = 'portrait' | 'landscape';

export interface AppSettings {
  pageOrientation: PageOrientation;
  stickerWidthMm: number;
  stickerHeightMm: number;
  lockAspectRatio: boolean;
  sizingMode: SizingMode;
  margins: Margins;
  linkMargins: boolean;
  gapX: number;
  gapY: number;
  linkGaps: boolean;
  allowRotation: boolean;
  requestedCopies: number | 'AUTO';
  cutMarks: CutMarksConfig;
  bleedMm: number;
}

export interface AppState extends AppSettings {
  // Данные изображения (не сохраняются в LocalStorage)
  loadedImage: LoadedImage | null;
  cropData: CropData | null;
  croppedResult: CroppedResult | null;
  effectiveDpi: number;
  // Флаги интерфейса
  isCropping: boolean;
}

const STORAGE_KEY = 'sticker_sheet_a4_settings_v1';

export const DEFAULT_SETTINGS: AppSettings = {
  pageOrientation: 'portrait',
  stickerWidthMm: 54.0,
  stickerHeightMm: 85.0,
  lockAspectRatio: true,
  sizingMode: 'fill',
  margins: { top: 5, bottom: 5, left: 5, right: 5 },
  linkMargins: true,
  gapX: 3,
  gapY: 3,
  linkGaps: true,
  allowRotation: true,
  requestedCopies: 'AUTO',
  cutMarks: { ...DEFAULT_CUT_MARKS_CONFIG },
  bleedMm: 0,
};

function loadSettings(): AppSettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return {
        ...DEFAULT_SETTINGS,
        ...parsed,
        margins: { ...DEFAULT_SETTINGS.margins, ...(parsed.margins || {}) },
        cutMarks: { ...DEFAULT_SETTINGS.cutMarks, ...(parsed.cutMarks || {}) },
      };
    }
  } catch (e) {
    console.warn('Не удалось загрузить настройки из LocalStorage:', e);
  }
  return { ...DEFAULT_SETTINGS };
}

export function saveSettings(settings: AppSettings): void {
  try {
    const toSave: AppSettings = {
      pageOrientation: settings.pageOrientation,
      stickerWidthMm: settings.stickerWidthMm,
      stickerHeightMm: settings.stickerHeightMm,
      lockAspectRatio: settings.lockAspectRatio,
      sizingMode: settings.sizingMode,
      margins: settings.margins,
      linkMargins: settings.linkMargins,
      gapX: settings.gapX,
      gapY: settings.gapY,
      linkGaps: settings.linkGaps,
      allowRotation: settings.allowRotation,
      requestedCopies: settings.requestedCopies,
      cutMarks: settings.cutMarks,
      bleedMm: settings.bleedMm,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(toSave));
  } catch (e) {
    console.warn('Не удалось сохранить настройки в LocalStorage:', e);
  }
}

export function clearSettings(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (e) {
    console.warn('Не удалось очистить настройки LocalStorage:', e);
  }
}

export class AppStore {
  private state: AppState;
  private listeners: Set<(state: AppState) => void> = new Set();

  constructor() {
    const initialSettings = loadSettings();
    this.state = {
      ...initialSettings,
      loadedImage: null,
      cropData: null,
      croppedResult: null,
      effectiveDpi: 0,
      isCropping: false,
    };
  }

  public getState(): AppState {
    return this.state;
  }

  public getPageDimensions(): { widthMm: number; heightMm: number } {
    if (this.state.pageOrientation === 'landscape') {
      return { widthMm: A4_HEIGHT_MM, heightMm: A4_WIDTH_MM }; // 297 × 210
    }
    return { widthMm: A4_WIDTH_MM, heightMm: A4_HEIGHT_MM }; // 210 × 297
  }

  public update(patch: Partial<AppState>): void {
    this.state = { ...this.state, ...patch };
    saveSettings(this.state);
    this.notify();
  }

  public resetToDefaults(): void {
    clearSettings();
    this.state = {
      ...DEFAULT_SETTINGS,
      loadedImage: this.state.loadedImage,
      cropData: null,
      croppedResult: this.state.croppedResult,
      effectiveDpi: this.state.effectiveDpi,
      isCropping: false,
    };
    saveSettings(this.state);
    this.notify();
  }

  public subscribe(listener: (state: AppState) => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notify(): void {
    for (const listener of this.listeners) {
      try {
        listener(this.state);
      } catch (e) {
        console.error('Ошибка в подписчике состояния:', e);
      }
    }
  }
}

export const store = new AppStore();
