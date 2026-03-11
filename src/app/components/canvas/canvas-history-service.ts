import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { fabric } from 'fabric';

interface CanvasState {
  name: string;
  data: any;
}

@Injectable({
  providedIn: 'root',
})
export class CanvasHistoryService {
  private _undoStack = new BehaviorSubject<CanvasState[]>([]);
  public readonly undoStack$: Observable<CanvasState[]> = this._undoStack.asObservable();

  private _redoStack = new BehaviorSubject<CanvasState[]>([]);
  public readonly redoStack$: Observable<CanvasState[]> = this._redoStack.asObservable();

  canvas: fabric.Canvas | undefined;
  isLoading: boolean = false;
  maxHistory: number = 50;
  private readonly FABRIC_PROPS_TO_SAVE = [
    'id',
    'name',
    'selectable',
    'evented',
    'visible',
    'opacity',
    'fill',
    'stroke',
    'strokeWidth',
    'objectCaching',
    'customData',
    'data',
    'scaleX',
    'scaleY',
    'angle',
    'left',
    'innerLeft',
    'top',
    'innerTop',
    'width',
    'height',
    'originX',
    'originY',
    'absolutePositioned',
    'rx',
    'ry',
    'radius',
    'fontFamily',
    'fontWeight',
    'styles',
    'fontStyle',
    'underline',
    'overline',
    'linethrough',
    'textBackgroundColor',
    'textAlign',
    'perPixelTargetFind',
    'dirty',
    'lockMovementX',
    'lockMovementY',
  ];

  // This function needs to be called whenever we initialize the editor.
  init(canvas: fabric.Canvas, rect: fabric.Rect) {
    this.canvas = canvas;
    this.loadFromStorage(rect);
  }

  // We need to call this function whenever we want to save the state of the editor.
  saveState(name: string) {
    if (this.isLoading) return;
    if (!this.canvas) return;
    if (name.includes('crop')) return;

    let data = this.canvas.toJSON(this.FABRIC_PROPS_TO_SAVE);
    let undoStack = this._undoStack.getValue();
    undoStack.push({ name, data });
    if (undoStack.length > this.maxHistory) {
      undoStack.shift();
    }
    this._undoStack.next(undoStack);
    this._redoStack.next([]);
    localStorage.setItem('canvasData', JSON.stringify(data));
  }

  undo(rect: fabric.Rect) {
    if (this._undoStack.getValue().length < 2) return;
    this.isLoading = true;

    let undoStack = this._undoStack.getValue();
    let redoStack = this._redoStack.getValue();
    let current = undoStack.pop();
    if (!current) {
      this.isLoading = false;
      return;
    }
    redoStack.push(current);
    let prev = undoStack[undoStack.length - 1];
    this.canvas?.getObjects().forEach((obj) => {
      if ((<any>obj).id != 'playground-rect') {
        this.canvas?.remove(obj);
      }
    });
    fabric.util.enlivenObjects(
      prev.data.objects,
      (objects: fabric.Object[]) => {
        objects.forEach((obj) => {
          if ((<any>obj).id != 'playground-rect' && !(<string>(<any>obj).id).includes('crop')) {
            if ((<any>obj.clipPath).id != 'crop-rect') {
              obj.clipPath = rect;
            }
            obj.setCoords();
            this.canvas?.add(obj);
          }
        });
        this.canvas?.renderAll();
        this.isLoading = false;
        this._undoStack.next(undoStack);
        this._redoStack.next(redoStack);
        localStorage.setItem('canvasData', JSON.stringify(prev.data));
      },
      '',
    );
  }

  redo(rect: fabric.Rect) {
    this.isLoading = true;

    let undoStack = this._undoStack.getValue();
    let redoStack = this._redoStack.getValue();
    let state = redoStack.pop();
    if (!state) {
      this.isLoading = false;
      return;
    }
    undoStack.push(state);
    this.canvas?.getObjects().forEach((obj) => {
      if ((<any>obj).id != 'playground-rect') {
        this.canvas?.remove(obj);
      }
    });
    fabric.util.enlivenObjects(
      state.data.objects,
      (objects: fabric.Object[]) => {
        objects.forEach((obj) => {
          if ((<any>obj).id != 'playground-rect' && !(<string>(<any>obj).id).includes('crop')) {
            if ((<any>obj.clipPath).id != 'crop-rect') {
              obj.clipPath = rect;
            }
            obj.setCoords();
            this.canvas?.add(obj);
          }
        });
        this.canvas?.renderAll();
        this.isLoading = false;
        this._undoStack.next(undoStack);
        this._redoStack.next(redoStack);
        localStorage.setItem('canvasData', JSON.stringify(state.data));
      },
      '',
    );
  }

  // This function clear the history in editor and local storage.
  clearHistory() {
    this._undoStack.next([]);
    this._redoStack.next([]);
    this.isLoading = false;
    localStorage.removeItem('canvasData');
  }

  loadFromStorage(rect: fabric.Rect) {
    let stringData = localStorage.getItem('canvasData');
    if (stringData) {
      let data = JSON.parse(stringData);
      fabric.util.enlivenObjects(
        data.objects,
        (objects: fabric.Object[]) => {
          objects.forEach((obj) => {
            if ((<any>obj).id != 'playground-rect' && !(<string>(<any>obj).id).includes('crop')) {
              if ((<any>obj.clipPath).id != 'crop-rect') {
                obj.clipPath = rect;
              }
              obj.left = rect.left + (<any>obj).innerLeft + (obj.width || 1) / 2;
              obj.top = rect.top + (<any>obj).innerTop + (obj.height || 1) / 2;
              obj.visible = true;
              this.canvas?.add(obj);
            }
          });
          this.canvas?.renderAll();
          let data = this.canvas?.toJSON(this.FABRIC_PROPS_TO_SAVE);
          this._undoStack.next([{ name: 'Open', data }]);
          this._redoStack.next([]);
          localStorage.setItem('canvasData', JSON.stringify(data));
        },
        '',
      );
    } else {
      let data = this.canvas?.toJSON(this.FABRIC_PROPS_TO_SAVE);
      this._undoStack.next([{ name: 'Open', data }]);
      this._redoStack.next([]);
      localStorage.setItem('canvasData', JSON.stringify(data));
    }
  }
}
