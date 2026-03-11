import { ImageService } from './../canvas/image-service';
import { Component, inject, output } from '@angular/core';
import { CanvasService } from '../canvas/canvas-service';
import { AsyncPipe, CommonModule } from '@angular/common';
import { DndDropEvent, DndModule } from 'ngx-drag-drop';
import { fabric } from 'fabric';

@Component({
  selector: 'app-stack-panel',
  imports: [AsyncPipe, DndModule, CommonModule],
  templateUrl: './stack-panel.html',
  styleUrl: './stack-panel.css',
})
export class StackPanel {
  updateStackOrder = output<{ currentId: string; targetId: string }>();
  selectObject = output<string>();
  updateObjectLock = output<{ id: string; lock: boolean }>();

  canvasService = inject(CanvasService);
  imageService = inject(ImageService);

  canvasObjects$ = this.canvasService.canvasObjects$;
  selectedObject$ = this.canvasService.selectedObject$;

  constructor() {}

  onDrop(e: DndDropEvent, id: string) {
    if (this.imageService.isCropMode()) return;
    this.updateStackOrder.emit({ currentId: e.data, targetId: id });
  }

  onSelect(id: string, object: fabric.Object) {
    if (this.imageService.isCropMode()) return;
    if (!object.lockMovementX && !object.lockMovementY && object.selectable) {
      this.selectObject.emit(id);
    }
  }

  onLock(id: string) {
    if (this.imageService.isCropMode()) return;
    this.updateObjectLock.emit({ id, lock: true });
  }

  onUnlock(id: string) {
    if (this.imageService.isCropMode()) return;
    this.updateObjectLock.emit({ id, lock: false });
  }
}
