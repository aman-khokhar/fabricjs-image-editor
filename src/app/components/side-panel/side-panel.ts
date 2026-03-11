import { CanvasService } from './../canvas/canvas-service';
import { CommonModule } from '@angular/common';
import { Component, inject, signal, ViewChild } from '@angular/core';
import { NgbPopover, NgbPopoverModule } from '@ng-bootstrap/ng-bootstrap';
import { InventoryPanel } from '../inventory-panel/inventory-panel';

@Component({
  selector: 'app-side-panel',
  imports: [CommonModule, NgbPopoverModule, InventoryPanel],
  templateUrl: './side-panel.html',
  styleUrl: './side-panel.css',
})
export class SidePanel {
  @ViewChild('shapePopover') shapePopoverRef!: NgbPopover;
  @ViewChild('textPopover') textPopoverRef!: NgbPopover;
  @ViewChild('imagePopover') imagePopoverRef!: NgbPopover;

  canvasService = inject(CanvasService);
  currentTool = signal<string>('');

  onToolClick(tool: string) {
    if (this.currentTool() == tool) {
      this.currentTool.set('');
      this.canvasService.updatePan(false);
    } else {
      this.currentTool.set(tool);
      if (tool == 'pan') {
        this.canvasService.updatePan(true);
      } else {
        this.canvasService.updatePan(false);
      }
    }

    switch (this.currentTool()) {
      case 'shape':
        this.shapePopoverRef.open();
        this.textPopoverRef.close();
        this.imagePopoverRef.close();
        break;
      case 'text':
        this.shapePopoverRef.close();
        this.textPopoverRef.open();
        this.imagePopoverRef.close();
        break;
      case 'image':
        this.shapePopoverRef.close();
        this.textPopoverRef.close();
        this.imagePopoverRef.open();
        break;
      default:
        this.shapePopoverRef.close();
        this.textPopoverRef.close();
        this.imagePopoverRef.close();
    }
  }
}
