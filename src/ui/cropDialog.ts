import Cropper from 'cropperjs';
import 'cropperjs/dist/cropper.css';
import { CropData } from '../image/cropEngine';

export interface CropDialogOptions {
  imageSrc: string;
  targetWidthMm: number;
  targetHeightMm: number;
  initialCropData: CropData | null;
  onApply: (cropData: CropData) => void;
  onCancel: () => void;
}

export class CropDialog {
  private modalEl: HTMLElement | null = null;
  private cropper: Cropper | null = null;

  public open(options: CropDialogOptions) {
    this.close();

    const { imageSrc, targetWidthMm, targetHeightMm, initialCropData, onApply, onCancel } = options;
    const targetAspectRatio = targetWidthMm / targetHeightMm;

    // Создаем разметку модального окна
    const modal = document.createElement('div');
    modal.className = 'crop-modal-backdrop';
    modal.innerHTML = `
      <div class="crop-modal-window">
        <div class="crop-modal-header">
          <h3>Кадрирование стикера</h3>
          <span class="crop-badge-ratio">Пропорции: ${targetWidthMm} × ${targetHeightMm} мм (${targetAspectRatio.toFixed(2)})</span>
        </div>
        <div class="crop-modal-body">
          <div class="crop-image-container">
            <img id="cropTargetImage" src="${imageSrc}" alt="Crop Preview" />
          </div>
        </div>
        <div class="crop-modal-toolbar">
          <button type="button" class="btn btn-secondary" id="btnCropRotateLeft" title="Повернуть влево на 90°">
            ↺ -90°
          </button>
          <button type="button" class="btn btn-secondary" id="btnCropRotateRight" title="Повернуть вправо на 90°">
            ↻ +90°
          </button>
          <button type="button" class="btn btn-secondary" id="btnCropReset" title="Сбросить кадрирование">
            Сброс
          </button>
          <div class="spacer"></div>
          <button type="button" class="btn btn-secondary" id="btnCropCancel">
            Отмена
          </button>
          <button type="button" class="btn btn-primary" id="btnCropApply">
            Применить
          </button>
        </div>
      </div>
    `;

    document.body.appendChild(modal);
    this.modalEl = modal;

    const imgEl = modal.querySelector<HTMLImageElement>('#cropTargetImage')!;

    imgEl.onload = () => {
      this.cropper = new Cropper(imgEl, {
        aspectRatio: targetAspectRatio,
        viewMode: 1, // Ограничить crop-box границами холста
        dragMode: 'move',
        autoCropArea: 1,
        restore: false,
        guides: true,
        center: true,
        highlight: false,
        cropBoxMovable: true,
        cropBoxResizable: true,
        toggleDragModeOnDblclick: false,
        ready: () => {
          if (initialCropData && this.cropper) {
            this.cropper.setData(initialCropData);
          }
        },
      });
    };

    // Привязка кнопок
    modal.querySelector('#btnCropRotateLeft')?.addEventListener('click', () => {
      this.cropper?.rotate(-90);
    });

    modal.querySelector('#btnCropRotateRight')?.addEventListener('click', () => {
      this.cropper?.rotate(90);
    });

    modal.querySelector('#btnCropReset')?.addEventListener('click', () => {
      this.cropper?.reset();
    });

    modal.querySelector('#btnCropCancel')?.addEventListener('click', () => {
      this.close();
      onCancel();
    });

    modal.querySelector('#btnCropApply')?.addEventListener('click', () => {
      if (this.cropper) {
        // Получаем точные целочисленные координаты относительно ОРИГИНАЛА
        const data = this.cropper.getData(true);
        const cropData: CropData = {
          x: data.x,
          y: data.y,
          width: data.width,
          height: data.height,
          rotate: data.rotate,
          scaleX: data.scaleX,
          scaleY: data.scaleY,
        };
        this.close();
        onApply(cropData);
      }
    });
  }

  public close() {
    if (this.cropper) {
      this.cropper.destroy();
      this.cropper = null;
    }
    if (this.modalEl && this.modalEl.parentNode) {
      this.modalEl.parentNode.removeChild(this.modalEl);
      this.modalEl = null;
    }
  }
}

export const cropDialog = new CropDialog();
