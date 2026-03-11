import { Component, HostListener, inject } from '@angular/core';
import { AsyncPipe, CommonModule } from '@angular/common';
import { CanvasService } from '../../canvas/canvas-service';
import { ImageService } from '../../canvas/image-service';
import { fabric } from 'fabric';

@Component({
  selector: 'app-image-options',
  imports: [AsyncPipe, CommonModule],
  templateUrl: './image-options.html',
  styleUrl: './image-options.css',
})
export class ImageOptions {
  canvasService = inject(CanvasService);
  imageService = inject(ImageService);

  selectedObject$ = this.canvasService.selectedObject$;

  isCropMode: boolean = false;

  onCrop() {
    this.isCropMode = !this.isCropMode;
    this.imageService.updateCropMode(this.isCropMode);
  }

  applyCrop() {
    this.isCropMode = false;
    this.imageService.applyCrop();
  }

  cancelCrop() {
    this.isCropMode = false;
    this.imageService.cancelCrop();
  }
}
