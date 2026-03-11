import { Component, inject } from '@angular/core';
import { CanvasService } from '../canvas/canvas-service';
import { TextOptions } from './text-options/text-options';
import { AsyncPipe } from '@angular/common';
import { ImageOptions } from './image-options/image-options';
import { ImageService } from '../canvas/image-service';

@Component({
  selector: 'app-object-options',
  imports: [TextOptions, ImageOptions, AsyncPipe],
  templateUrl: './object-options.html',
  styleUrl: './object-options.css',
})
export class ObjectOptions {
  canvasService = inject(CanvasService);
  imageService = inject(ImageService);

  selectedObject$ = this.canvasService.selectedObject$;
}
