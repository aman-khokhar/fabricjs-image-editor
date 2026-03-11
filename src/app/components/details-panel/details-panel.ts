import { CanvasService } from './../canvas/canvas-service';
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AsyncPipe } from '@angular/common';
import { fabric } from 'fabric';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { SelectAllOnFocusDirective } from '../reusable/select-all-on-focus.directive';

@Component({
  selector: 'app-details-panel',
  imports: [FormsModule, AsyncPipe, SelectAllOnFocusDirective],
  templateUrl: './details-panel.html',
  styleUrl: './details-panel.css',
})
export class DetailsPanel {
  canvasService = inject(CanvasService);

  selectedObject$ = this.canvasService.selectedObject$;
  playgroundRect$ = this.canvasService.playgroundRect$;
  playgroundRect: fabric.Rect | null = null;

  constructor() {
    this.playgroundRect$.pipe(takeUntilDestroyed()).subscribe((rect) => {
      this.playgroundRect = rect;
    });
  }

  isCircle(obj: fabric.Object | null): obj is fabric.Circle {
    return obj instanceof fabric.Circle;
  }

  isEllipse(obj: fabric.Object | null): obj is fabric.Ellipse {
    return obj instanceof fabric.Ellipse;
  }

  setAngle(value: any | undefined, obj: fabric.Object) {
    let angle = Number(value);
    angle = angle % 360;
    this.canvasService.updateSelectedProps({ angle });
  }

  getWidth(obj: fabric.Object) {
    return (obj.width || 1) * (obj.scaleX || 1);
  }

  getHeight(obj: fabric.Object) {
    return (obj.height || 1) * (obj.scaleY || 1);
  }

  getLeft(obj: fabric.Object) {
    return (<any>obj).innerLeft;
  }

  getTop(obj: fabric.Object) {
    return (<any>obj).innerTop;
  }

  setWidth(value: any | undefined, obj: fabric.Object) {
    let scaleX = Number(value) / Number(obj.width || 1);
    this.canvasService.updateSelectedProps({ scaleX });
  }

  setHeight(value: any | undefined, obj: fabric.Object) {
    let scaleY = Number(value) / Number(obj.height || 1);
    this.canvasService.updateSelectedProps({ scaleY });
  }

  setLeft(value: any | undefined, obj: fabric.Object) {
    let left =
      Number(value) +
      ((this.playgroundRect && this.playgroundRect.left) || 0) +
      (this.getWidth(obj) || 0) / 2;
    this.canvasService.updateSelectedProps({ left: left, innerLeft: value });
  }

  setTop(value: any | undefined, obj: fabric.Object) {
    let top =
      Number(value) +
      ((this.playgroundRect && this.playgroundRect.top) || 0) +
      (this.getHeight(obj) || 0) / 2;
    this.canvasService.updateSelectedProps({ top, innerTop: value });
  }

  getTransparent(obj: fabric.Object) {
    if (obj.fill == 'transparent') {
      return true;
    } else {
      return false;
    }
  }

  setTransparent(value: any | undefined) {
    if (value) {
      this.canvasService.updateSelectedProps({ fill: 'transparent' });
    } else {
      this.canvasService.updateSelectedProps({ fill: '#000000' });
    }
  }

  getFill(obj: fabric.Object) {
    if (obj.fill == 'transparent') {
      return '#000000';
    } else {
      return obj.fill;
    }
  }

  setFill(value: any | undefined, obj: fabric.Object) {
    if (!this.getTransparent(obj)) {
      this.canvasService.updateSelectedProps({ fill: value });
    } else {
      this.canvasService.updateSelectedProps({ fill: '#000000' });
    }
  }

  getDashedStroke(obj: fabric.Object) {
    if (obj.strokeDashArray && obj.strokeDashArray.length > 0) {
      return true;
    } else {
      return false;
    }
  }

  setDashedStroke(value: any | undefined) {
    if (value) {
      this.canvasService.updateSelectedProps({ strokeDashArray: [5, 5] });
    } else {
      this.canvasService.updateSelectedProps({ strokeDashArray: [] });
    }
  }

  onPropChange(value: any, prop: string) {
    this.canvasService.updateSelectedProps({ [prop]: value });
  }

  onValueIncrease(value: any, prop: string) {
    let data = Math.round(value) + 1;
    if (prop == 'angle') {
      data = data % 360;
    }
    this.canvasService.updateSelectedProps({ [prop]: data });
  }

  onValueDecrease(value: any, prop: string) {
    let data = 0;
    if (Number(value) > 0) {
      data = Math.round(value) - 1;
    }
    this.canvasService.updateSelectedProps({ [prop]: data });
  }
}
