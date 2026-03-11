import { Component, inject, input } from '@angular/core';
import { CanvasService } from '../canvas/canvas-service';

@Component({
  selector: 'app-inventory-panel',
  imports: [],
  templateUrl: './inventory-panel.html',
  styleUrl: './inventory-panel.css',
})
export class InventoryPanel {
  panel = input<string>('');
  canvasService = inject(CanvasService);

  onDragStart(event: DragEvent, data: { metaType: string; type: string; url: string }) {
    this.canvasService.updateDrag(true, data);
  }

  onDragEnd(event: DragEvent) {
    this.canvasService.updateDrag(false, { metaType: '', type: '', url: '' });
  }
}
