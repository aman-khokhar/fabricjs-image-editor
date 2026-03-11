import { effect, inject, Injectable, signal } from '@angular/core';
import { CanvasService } from './canvas-service';
import { fabric } from 'fabric';
import { take } from 'rxjs';
import { CanvasHistoryService } from './canvas-history-service';

@Injectable({
  providedIn: 'root',
})
export class ImageService {
  canvasService = inject(CanvasService);
  historyService = inject(CanvasHistoryService);

  private _isCropMode = signal<boolean>(false);
  public isCropMode = this._isCropMode.asReadonly();

  selectedObject$ = this.canvasService.selectedObject$;
  selObject: fabric.Image | null = null;

  cropRect: fabric.Rect = new fabric.Rect({
    name: 'crop-rect',
    strokeWidth: 1,
    stroke: '#00FFFF',
    strokeDashArray: [5, 5],
    fill: 'tranparent',
    opacity: 0.5,
    hasBorders: true,
    hasControls: true,
    selectable: true,
    originX: 'center',
    originY: 'center',
    lockScalingFlip: true,
  });

  constructor() {
    effect(() => {
      if (this.isCropMode()) {
        this.selectedObject$.pipe(take(1)).subscribe((selectedObject) => {
          if (selectedObject instanceof fabric.Image) {
            this.selObject = selectedObject;
            this.removeCropObjects();
            this.onCrop();
          }
        });
      }
    });
  }

  updateCropMode(status: boolean) {
    this._isCropMode.set(status);
  }

  removeCropObjects() {
    if (!this.selObject) return;
    let canvas = this.selObject.canvas;
    canvas?.getObjects().forEach((object) => {
      if ((<any>object).id.includes('crop')) {
        canvas?.remove(object);
      }
    });
  }

  onCrop() {
    if (!this.selObject) return;
    let canvas = this.selObject.canvas;
    this.selObject.visible = false;
    if (this.isAlreadyCropped()) {
      this.cropRect.set({
        left: <number>this.selObject?.left + <number>this.selObject.clipPath?.left,
        top: <number>this.selObject?.top + <number>this.selObject.clipPath?.top,
        width: this.selObject.clipPath?.width,
        height: this.selObject.clipPath?.height,
        scaleX: this.selObject.clipPath?.scaleX,
        scaleY: this.selObject.clipPath?.scaleY,
      });
    } else {
      this.cropRect.set({
        left: this.selObject?.left,
        top: this.selObject?.top,
        width: this.selObject?.width,
        height: this.selObject?.height,
        scaleX: this.selObject?.scaleX,
        scaleY: this.selObject?.scaleY,
      });
    }

    this.cropRect.clipPath = this.selObject.canvas?._objects[0];

    this.cropRect.setControlsVisibility({
      mtr: false,
    });
    (<any>this.cropRect).id = 'crop-rect';
    this.selObject.clone(
      (img: fabric.Image) => {
        img.name = 'crop-image';
        img.visible = true;
        img.selectable = false;
        img.clipPath = undefined;
        (<any>img).id = 'crop-image';
        canvas?.add(img);
        canvas?.add(this.cropRect);
        canvas?.setActiveObject(this.cropRect);
        canvas?.requestRenderAll();
      },
      ['originX', 'originY'],
    );
  }

  applyCrop() {
    if (!this.selObject) return;
    this.selObject.visible = true;
    this.selObject.dirty = true;
    let rect = new fabric.Rect({
      left: <number>this.cropRect.left - <number>this.selObject.left,
      top: <number>this.cropRect.top - <number>this.selObject.top,
      width: this.cropRect.width,
      height: this.cropRect.height,
      scaleX: this.cropRect.scaleX,
      scaleY: this.cropRect.scaleY,
      originX: 'center',
      originY: 'center',
      objectCaching: false,
      name: 'crop-rect',
    });
    (<any>rect).id = 'crop-rect';
    this.selObject.clipPath = rect;
    this.selObject.canvas?.add(rect);
    this.removeCropObjects();
    this.selObject.canvas?.discardActiveObject();
    this.selObject.canvas?.requestRenderAll();
    this.historyService.saveState(this.selObject.name + ' clipped');
    this._isCropMode.set(false);
  }

  cancelCrop() {
    if (!this.selObject) return;
    this.removeCropObjects();
    this.selObject.visible = true;
    this.selObject.canvas?.discardActiveObject();
    this.selObject.canvas?.requestRenderAll();
    this._isCropMode.set(false);
  }

  isAlreadyCropped() {
    if (!this.selObject) return;
    if ((<any>this.selObject.clipPath).id == 'crop-rect') return true;
    else return false;
  }
}
