import { CanvasHistoryService } from './canvas-history-service';
import { Injectable, signal, inject } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { fabric } from 'fabric';

@Injectable({
  providedIn: 'root',
})
export class CanvasService {
  historyService = inject(CanvasHistoryService);

  private _selectedObject = new BehaviorSubject<fabric.Object | null>(null);
  public readonly selectedObject$: Observable<fabric.Object | null> =
    this._selectedObject.asObservable();

  private _playgroundRect = new BehaviorSubject<fabric.Rect | null>(null);
  public readonly playgroundRect$: Observable<fabric.Object | null> =
    this._playgroundRect.asObservable();

  private _canvasObjects = new BehaviorSubject<fabric.Object[]>([]);
  public readonly canvasObjects$: Observable<fabric.Object[]> = this._canvasObjects.asObservable();

  private _drag = signal<{
    status: boolean;
    data: { metaType: string; type: string; url: string };
  } | null>(null);
  public drag = this._drag.asReadonly();

  private _pan = signal<boolean>(false);
  public pan = this._pan.asReadonly();

  updateDrag(status: boolean, data: { metaType: string; type: string; url: string }) {
    this._drag.set({ status, data });
  }

  updatePan(status: boolean) {
    this._pan.set(status);
  }

  setSelectedObject(obj: fabric.Object | null) {
    this._selectedObject.next(obj);
  }

  updateSelectedProps(
    props:
      | Partial<fabric.Object>
      | Partial<fabric.Textbox>
      | Partial<fabric.Circle>
      | Partial<fabric.Ellipse>
      | Partial<any>,
  ) {
    const current = this._selectedObject.getValue();
    if (!current) return;

    current.set(props);
    this.historyService.saveState(current.name + ' modified');
    current.canvas?.requestRenderAll();

    this._selectedObject.next(current);
  }

  clearSelected() {
    this._selectedObject.next(null);
  }

  setPlaygroundRect(rect: fabric.Rect | null) {
    this._playgroundRect.next(rect);
  }

  updatePlaygroundRect(rectProps: Partial<fabric.Rect>) {
    const current = this._playgroundRect.getValue();
    if (!current) return;

    current.set(rectProps);
    current.canvas?.requestRenderAll();

    this._playgroundRect.next(current);
  }

  setCanvasObjects(objects: fabric.Object[]) {
    this._canvasObjects.next([...objects]);
  }

  clearCanvasObjects() {
    this._canvasObjects.next([]);
  }
}
