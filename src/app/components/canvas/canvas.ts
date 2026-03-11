import {
  AfterViewInit,
  Component,
  effect,
  ElementRef,
  HostListener,
  inject,
  OnDestroy,
  signal,
  ViewChild,
} from '@angular/core';
import { fabric } from 'fabric';
import { CanvasService } from './canvas-service';
import { DetailsPanel } from '../details-panel/details-panel';
import { FontService } from '../reusable/font-service';
import { debounceTime, fromEvent, switchMap } from 'rxjs';
import { ObjectOptions } from '../object-options/object-options';
import { StackPanel } from '../stack-panel/stack-panel';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CanvasHistoryService } from './canvas-history-service';
import { HistoryPanel } from '../history-panel/history-panel';

@Component({
  selector: 'app-canvas',
  imports: [DetailsPanel, StackPanel, ObjectOptions, HistoryPanel],
  templateUrl: './canvas.html',
  styleUrl: './canvas.css',
})
export class Canvas implements AfterViewInit, OnDestroy {
  @ViewChild('mainCanvas') mainCanvasRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('canvasContainer', { static: false }) canvasContainerRef!: ElementRef<HTMLDivElement>;
  private mainCanvas!: fabric.Canvas;

  canvasService = inject(CanvasService);
  fontService = inject(FontService);
  historyService = inject(CanvasHistoryService);

  drag = this.canvasService.drag;
  pan = this.canvasService.pan;
  dragStatus = signal<boolean>(false);
  isPannning: boolean = false;

  STEP: number = 1;
  isZoomedOrPanned: boolean = false;

  selectedObjects = signal<fabric.Object[]>([]);

  constructor() {
    fromEvent(window, 'resize')
      .pipe(debounceTime(100), takeUntilDestroyed())
      .subscribe(() => {
        this.handleWindowResize();
      });

    effect(() => {
      this.dragStatus.set(this.drag()?.status || false);
    });

    effect(() => {
      let pan = this.pan();
      if (!this.mainCanvas) return;
      if (pan) {
        this.mainCanvas.discardActiveObject();
        this.mainCanvas.getObjects().forEach((object) => {
          if (
            !object.lockMovementX &&
            !object.lockMovementY &&
            object.selectable &&
            (<any>object).id != 'playground-rect'
          ) {
            object.selectable = false;
          }
        });
      } else {
        this.mainCanvas.getObjects().forEach((object) => {
          if (
            !object.lockMovementX &&
            !object.lockMovementY &&
            !object.selectable &&
            (<any>object).id != 'playground-rect'
          ) {
            object.selectable = true;
          }
        });
      }
      this.mainCanvas.requestRenderAll();
    });
  }

  ngAfterViewInit(): void {
    this.fontService
      .getFonts()
      .pipe(switchMap((fonts) => this.fontService.loadFonts(fonts)))
      .subscribe({
        next: () => {},
        error: (error) => {
          console.error(error);
        },
        complete: () => {
          this.initializeCanvas();
        },
      });
  }

  ngOnDestroy(): void {
    if (this.mainCanvas) {
      this.mainCanvas.dispose();
      this.mainCanvas = null!;
      this.historyService.clearHistory();
    }
  }

  handleWindowResize() {
    let height = this.canvasContainerRef.nativeElement.offsetHeight;
    let width = this.canvasContainerRef.nativeElement.offsetWidth;
    let playRect = this.getMainRect();
    height = height;
    width = (width * 80) / 100;
    this.mainCanvas.setDimensions({ width: width, height: height });

    let oldLeft = playRect.left || 0;
    let oldTop = playRect.top || 0;
    this.mainCanvas.centerObject(playRect);
    let newLeft = playRect.left || 0;
    let newTop = playRect.top || 0;
    let differenceLeft = oldLeft - newLeft;
    let differenceTop = oldTop - newTop;

    this.mainCanvas.discardActiveObject();
    this.mainCanvas.getObjects().forEach((obj) => {
      if ((<any>obj).id !== 'playground-rect') {
        obj.set({
          left: (obj.left || 0) - differenceLeft,
          top: (obj.top || 0) - differenceTop,
        });

        obj.setCoords();
      }
    });

    this.canvasService.updatePlaygroundRect({
      left: playRect.left,
      top: playRect.top,
    });
  }

  animateZoomToFit() {
    // FIXME: fix zoom to fit if rect is bigger than canvas, adjusting canvas zoom will work
    let canvas = this.mainCanvas;
    if (this.isZoomedOrPanned) {
      canvas.setZoom(1);
      const vpt = [...(<number[]>canvas.viewportTransform)];
      vpt[4] = 0;
      vpt[5] = 0;
      canvas.setViewportTransform(vpt);
      canvas.requestRenderAll();
      this.isZoomedOrPanned = false;
      return;
    }
  }

  getCanvasBoundingRect() {
    return this.mainCanvasRef.nativeElement.getBoundingClientRect();
  }

  getMainRect() {
    return this.mainCanvas
      .getObjects()
      .find((obj) => (<any>obj).id == 'playground-rect') as fabric.Rect;
  }

  // Need to use this method to add any object.
  // As we need to configure the x, y of the playground rect.
  addToCanvas(object: fabric.Object) {
    // FIXME: when canvas is zoomed, drop at proper location
    const rect = this.getMainRect();
    if (object.top == 0 || object.left == 0) {
      (<any>object).innerTop = Number(object.height) / 2;
      (<any>object).innerLeft = Number(object.width) / 2;
      object.top = Math.abs(Number(rect.top)) + Number(object.height) / 2;
      object.left = Math.abs(Number(rect.left)) + Number(object.width) / 2;
    } else {
      (<any>object).innerTop = Number(object.top) - Number(object.height) / 2;
      (<any>object).innerLeft = Number(object.left) - Number(object.width) / 2;
      object.top = Number(object.top) + Number(rect.top);
      object.left = Number(object.left) + Number(rect.left);
    }

    object.clipPath = rect;
    (object as any).id = `object-${crypto.randomUUID()}`;
    this.mainCanvas.add(object);
    this.mainCanvas.requestRenderAll();
  }

  getMouseDropPoints(clientX: number, clientY: number) {
    let rect = this.getMainRect();
    let canvasLeft = this.getCanvasBoundingRect().left;
    let canvasTop = this.getCanvasBoundingRect().top;
    let rectLeft = rect.left;
    let rectTop = rect.top;
    let totalLeft = Number(canvasLeft) + Number(rectLeft);
    let totalTop = Number(canvasTop) + Number(rectTop);
    if (
      clientX < totalLeft ||
      clientX > totalLeft + (rect.width || 0) ||
      clientY < totalTop ||
      clientY > totalTop + (rect.height || 0)
    ) {
      return { x: 0, y: 0 };
    } else {
      let x = clientX - (Number(canvasLeft) + Number(rectLeft));
      let y = clientY - (Number(canvasTop) + Number(rectTop));
      return { x, y };
    }
  }

  // Handle all keyboard events here
  @HostListener('window:keydown', ['$event'])
  handleKeyDown(event: KeyboardEvent) {
    if (event.ctrlKey || event.altKey || event.shiftKey) {
      event.preventDefault();
    }
    if (!this.mainCanvas) return;
    let activeObject = this.mainCanvas.getActiveObject();

    switch (event.key) {
      case 'ArrowLeft':
        if (!activeObject) return;
        activeObject.set({ left: activeObject.left! - this.STEP });
        this.canvasService.updateSelectedProps({ left: activeObject.left });
        break;
      case 'ArrowRight':
        if (!activeObject) return;
        activeObject.set({ left: activeObject.left! + this.STEP });
        this.canvasService.updateSelectedProps({ left: activeObject.left });
        break;
      case 'ArrowUp':
        if (!activeObject) return;
        activeObject.set({ top: activeObject.top! - this.STEP });
        this.canvasService.updateSelectedProps({ top: activeObject.top });
        break;
      case 'ArrowDown':
        if (!activeObject) return;
        activeObject.set({ top: activeObject.top! + this.STEP });
        this.canvasService.updateSelectedProps({ top: activeObject.top });
        break;
      case 'Delete':
        this.onDelete();
        break;
      case 'a':
        if (event.ctrlKey) {
          this.mainCanvas.discardActiveObject();
          let activeSelection = new fabric.ActiveSelection(
            this.mainCanvas.getObjects().filter((obj) => obj.selectable),
            {
              canvas: this.mainCanvas,
            },
          );
          this.mainCanvas.setActiveObject(activeSelection);
          this.mainCanvas.requestRenderAll();
        }
        break;
      case '0':
        if (event.ctrlKey) {
          this.animateZoomToFit();
        }
        break;
      case 'z':
        if (event.ctrlKey) {
          if (!event.altKey) {
            this.historyService.undo(this.getMainRect());
          } else {
            this.historyService.redo(this.getMainRect());
          }
        }
        break;
      default:
        return;
    }
  }

  initializeCanvas() {
    let height = this.canvasContainerRef.nativeElement.offsetHeight;
    let width = this.canvasContainerRef.nativeElement.offsetWidth;
    height = height;
    width = (width * 80) / 100;
    this.mainCanvas = new fabric.Canvas(this.mainCanvasRef.nativeElement, {
      backgroundColor: '#606060',
      height: height,
      width: width,
    });

    const playGroundRect: fabric.Rect = new fabric.Rect({
      name: 'playground-rect',
      height: 800,
      width: 600,
      fill: '#fff',
      selectable: false,
      evented: false,
      objectCaching: true,
      absolutePositioned: true,
    });
    (playGroundRect as any).id = 'playground-rect';

    this.initializeCanvasEvents();
    this.mainCanvas.add(playGroundRect);
    // FIXME: This will not work if rect is bigger than canvas, adjust canvas zoom if rect is bigger
    this.mainCanvas.centerObject(playGroundRect);
    this.mainCanvas.renderAll();
    this.historyService.init(this.mainCanvas, this.getMainRect());
    this.canvasService.setPlaygroundRect(playGroundRect);
  }

  initializeCanvasEvents() {
    this.mainCanvas.on('object:added', (e) => {
      this.canvasService.setCanvasObjects(this.mainCanvas.getObjects());
      this.historyService.saveState((e.target?.name || '') + ' added');
    });

    this.mainCanvas.on('selection:created', (e) => {
      let selObjs = <fabric.Object[]>e.selected;
      this.selectedObjects.set(selObjs);
      if (selObjs.length < 2) {
        this.canvasService.setSelectedObject(selObjs[0]);

        selObjs[0].on('selection:changed', (e) => {
          this.canvasService.setSelectedObject(selObjs[0]);
        });
      }
    });

    this.mainCanvas.on('selection:updated', (e) => {
      let selObjs = <fabric.Object[]>e.selected;
      this.selectedObjects.set(selObjs);
      if (selObjs.length < 2) {
        this.canvasService.setSelectedObject(selObjs[0]);

        selObjs[0].on('selection:changed', (e) => {
          this.canvasService.setSelectedObject(selObjs[0]);
        });
      }
    });

    this.mainCanvas.on('selection:cleared', (e) => {
      this.canvasService.clearSelected();
      this.selectedObjects.set([]);
      this.mainCanvas.getObjects().forEach((obj) => obj.off());
    });

    this.mainCanvas.on('object:modified', (e) => {
      let rect = this.getMainRect();
      if (e.target instanceof fabric.Object) {
        (<any>e.target).innerLeft =
          <number>e.target.left - <number>rect.left - <number>e.target.width / 2;
        (<any>e.target).innerTop =
          <number>e.target.top - <number>rect.top - <number>e.target.height / 2;
      }
      this.canvasService.updateSelectedProps({ ...e.target });
      this.canvasService.setCanvasObjects(this.mainCanvas.getObjects());
    });

    this.mainCanvas.on('object:removed', (e) => {
      this.canvasService.setCanvasObjects(this.mainCanvas.getObjects());
      this.historyService.saveState((e.target?.name || '') + ' removed');
    });

    this.mainCanvas.on('object:moving', (e) => {
      let object = <fabric.Object>e.target;
      this.handleCropboxMove(object);
    });

    this.mainCanvas.on('object:scaling', (e) => {
      let object = <fabric.Object>e.target;
      this.handleCropboxScaling(object);
    });

    this.mainCanvas.off('mouse:down');
    this.mainCanvas.on('mouse:down', (e) => {
      if (this.pan()) {
        this.isPannning = true;
        this.mainCanvas.selection = false;
      }
    });

    this.mainCanvas.off('mouse:up');
    this.mainCanvas.on('mouse:up', (e) => {
      this.isPannning = false;
      this.mainCanvas.selection = true;
    });

    this.mainCanvas.off('mouse:move');
    this.mainCanvas.on('mouse:move', (e) => {
      if (this.pan() && this.isPannning) {
        let delta = new fabric.Point(e.e.movementX, e.e.movementY);
        this.mainCanvas.relativePan(delta);
        this.isZoomedOrPanned = true;
      }
    });

    this.mainCanvas.on('mouse:wheel', (e) => {
      if (!this.pan()) return;
      this.isZoomedOrPanned = true;
      let delta = e.e.deltaY;
      let zoom = this.mainCanvas.getZoom();
      zoom *= 0.999 ** delta;

      if (zoom > 10) zoom = 10;
      if (zoom < 0.1) zoom = 0.1;

      let point = new fabric.Point(<number>e?.pointer?.x, <number>e?.pointer?.y);
      this.mainCanvas.zoomToPoint(point, zoom);
      e.e.preventDefault();
      e.e.stopPropagation();
    });
  }

  handleCropboxScaling(cropbox: fabric.Object) {
    if ((<any>cropbox).id.includes('crop') && cropbox instanceof fabric.Rect) {
      let image = <fabric.Image>(
        this.mainCanvas.getObjects().find((obj) => (<any>obj).id == 'crop-image')
      );

      let isOut = false;

      if (<number>cropbox.scaleX > <any>image.scaleX) {
        cropbox.scaleX = image.scaleX;
        cropbox.left = image.left;
        isOut = true;
      }
      if (<number>cropbox.scaleY > <any>image.scaleY) {
        cropbox.scaleY = image.scaleY;
        cropbox.top = image.top;
        isOut = true;
      }

      if (isOut) {
        cropbox.setCoords();
        this.mainCanvas.requestRenderAll();
      }
    }
  }

  handleCropboxMove(cropbox: fabric.Object) {
    if ((<any>cropbox).id.includes('crop') && cropbox instanceof fabric.Rect) {
      let image = <fabric.Image>(
        this.mainCanvas.getObjects().find((obj) => (<any>obj).id == 'crop-image')
      );
      const imgBounds = image.getBoundingRect(true, true);
      const cropBounds = cropbox.getBoundingRect(true, true);

      const deltaX =
        cropBounds.left < imgBounds.left
          ? imgBounds.left - cropBounds.left
          : cropBounds.left + cropBounds.width > imgBounds.left + imgBounds.width
            ? imgBounds.left + imgBounds.width - (cropBounds.left + cropBounds.width)
            : 0;

      const deltaY =
        cropBounds.top < imgBounds.top
          ? imgBounds.top - cropBounds.top
          : cropBounds.top + cropBounds.height > imgBounds.top + imgBounds.height
            ? imgBounds.top + imgBounds.height - (cropBounds.top + cropBounds.height)
            : 0;

      if (deltaX !== 0 || deltaY !== 0) {
        cropbox.left = <number>cropbox.left + deltaX;
        cropbox.top = <number>cropbox.top + deltaY;

        cropbox.setCoords();
        this.mainCanvas.requestRenderAll();
      }
    }
  }

  onDragOver(event: DragEvent) {
    event.preventDefault();
  }

  onDrop(event: DragEvent) {
    event.preventDefault();

    let data = <{ metaType: string; type: string; url: string }>this.drag()?.data;
    if (!data.metaType || !data.type) {
      return;
    }
    let coords = this.getMouseDropPoints(event.clientX, event.clientY);
    if (data.metaType == 'shape') {
      switch (data.type) {
        case 'rect':
          this.addDefaultRectangle(coords);
          break;
        case 'circle':
          this.addDefaultCircle(coords);
          break;
        case 'ellipse':
          this.addDefaultEllipse(coords);
          break;
        case 'line':
          this.addDefaultLine(coords);
          break;
        case 'triangle':
          this.addDefaultTriangle(coords);
          break;
      }
    } else if (data.metaType == 'text') {
      switch (data.type) {
        case 'text':
          this.addDefaultText(coords);
          break;
        case 'textbox':
          this.addDefaultTextbox(coords);
          break;
      }
    } else if (data.metaType == 'image') {
      this.addDefaultImage(data.url, coords);
    }
  }

  addDefaultRectangle(coords: { x: number; y: number }) {
    let index = this.mainCanvas.getObjects().filter((obj) => obj.type == 'rect').length;
    let rect = new fabric.Rect({
      name: 'rect-' + index,
      width: 150,
      height: 100,
      fill: 'transparent',
      left: coords.x,
      top: coords.y,
      opacity: 1,
      stroke: '#000000',
      strokeWidth: 1,
      originX: 'center',
      originY: 'center',
      objectCaching: false,
    });
    this.addToCanvas(rect);
  }

  addDefaultCircle(coords: { x: number; y: number }) {
    let index = this.mainCanvas.getObjects().filter((obj) => obj.type == 'circle').length + 1;
    let circle = new fabric.Circle({
      name: 'circle-' + index,
      fill: 'transparent',
      left: coords.x,
      top: coords.y,
      radius: 50,
      opacity: 1,
      stroke: '#000000',
      strokeWidth: 1,
      originX: 'center',
      originY: 'center',
      objectCaching: false,
    });
    this.addToCanvas(circle);
  }

  addDefaultEllipse(coords: { x: number; y: number }) {
    let index = this.mainCanvas.getObjects().filter((obj) => obj.type == 'ellipse').length + 1;
    let ellipse = new fabric.Ellipse({
      name: 'ellipse-' + index,
      fill: 'transparent',
      left: coords.x,
      top: coords.y,
      rx: 100,
      ry: 50,
      opacity: 1,
      stroke: '#000000',
      strokeWidth: 1,
      originX: 'center',
      originY: 'center',
      objectCaching: false,
    });
    this.addToCanvas(ellipse);
  }

  addDefaultLine(coords: { x: number; y: number }) {
    let index = this.mainCanvas.getObjects().filter((obj) => obj.type == 'line').length + 1;
    let line = new fabric.Line([coords.x, coords.y, coords.x + 210, coords.y], {
      name: 'line-' + index,
      stroke: '#000000',
      strokeWidth: 2,
      opacity: 1,
      fill: 'transparent',
      originX: 'center',
      originY: 'center',
      objectCaching: false,
    });
    this.addToCanvas(line);
  }

  addDefaultTriangle(coords: { x: number; y: number }) {
    let index = this.mainCanvas.getObjects().filter((obj) => obj.type == 'triangle').length + 1;
    let triangle = new fabric.Triangle({
      name: 'triangle-' + index,
      width: 230,
      height: 90,
      fill: 'transparent',
      left: coords.x,
      top: coords.y,
      opacity: 1,
      stroke: '#000000',
      strokeWidth: 1,
      originX: 'center',
      originY: 'center',
      objectCaching: false,
    });
    this.addToCanvas(triangle);
  }

  addDefaultText(coords: { x: number; y: number }) {
    let index = this.mainCanvas.getObjects().filter((obj) => obj.type == 'text').length + 1;
    let text = new fabric.Text('Text', {
      name: 'text-' + index,
      fontSize: 50,
      left: coords.x,
      top: coords.y,
      opacity: 1,
      fill: '#000000',
      stroke: '#000000',
      strokeWidth: 1,
      originX: 'center',
      originY: 'center',
      fontFamily: 'Roboto',
      fontWeight: 'normal',
      fontStyle: 'normal',
      underline: false,
      overline: false,
      linethrough: false,
      textBackgroundColor: 'transparent',
      objectCaching: false,
      textAlign: 'left',
    });
    this.addToCanvas(text);
  }

  addDefaultTextbox(coords: { x: number; y: number }) {
    let index = this.mainCanvas.getObjects().filter((obj) => obj.type == 'textbox').length + 1;
    let textbox = new fabric.Textbox('Textbox', {
      name: 'textbox-' + index,
      fontSize: 50,
      left: coords.x,
      top: coords.y,
      opacity: 1,
      fill: '#000000',
      stroke: '#000000',
      strokeWidth: 1,
      originX: 'center',
      originY: 'center',
      fontFamily: 'Roboto',
      fontWeight: 'normal',
      fontStyle: 'normal',
      underline: false,
      overline: false,
      linethrough: false,
      textBackgroundColor: 'transparent',
      objectCaching: false,
      textAlign: 'left',
    });
    this.addToCanvas(textbox);
  }

  addDefaultImage(url: string, coords: { x: number; y: number }) {
    let index = this.mainCanvas.getObjects().filter((obj) => obj.type == 'image').length + 1;
    fabric.Image.fromURL(url, (img) => {
      img.set({
        name: 'image-' + index,
        left: coords.x,
        top: coords.y,
        opacity: 1,
        stroke: '#000000',
        originX: 'center',
        originY: 'center',
        objectCaching: false,
        perPixelTargetFind: false,
      });
      this.addToCanvas(img);
      URL.revokeObjectURL(url);
    });
  }

  onDelete() {
    let activeObjects = this.mainCanvas.getActiveObjects();

    if (activeObjects.length <= 0) return;

    activeObjects.forEach((obj) => {
      obj.set('clipPath', undefined);
      this.mainCanvas.remove(obj);
    });
    this.mainCanvas.discardActiveObject();
    this.mainCanvas.requestRenderAll();
  }

  moveToIndex(currentId: string, targetId: string) {
    let currentIndex = this.mainCanvas._objects.findIndex((obj) => (<any>obj).id == currentId);
    let targetIndex = this.mainCanvas._objects.findIndex((obj) => (<any>obj).id == targetId);
    const objects = this.mainCanvas.getObjects();
    let obj = this.mainCanvas._objects[currentIndex];
    if (currentIndex === -1 || targetIndex < 0 || targetIndex >= objects.length) return;
    objects.splice(currentIndex, 1);
    objects.splice(targetIndex, 0, obj);
    this.mainCanvas._objects = objects;
    this.mainCanvas.requestRenderAll();
    this.canvasService.setCanvasObjects(objects);
    this.historyService.saveState('Layer order updated ' + targetIndex + ' -> ' + currentIndex);
  }

  onSelectObject(id: string) {
    let index = this.mainCanvas._objects.findIndex((obj) => (<any>obj).id == id);
    let obj = this.mainCanvas._objects[index];
    this.mainCanvas.setActiveObject(obj);
    this.mainCanvas.requestRenderAll();
  }

  onLockUnlock(id: string, lock: boolean) {
    let index = this.mainCanvas._objects.findIndex((obj) => (<any>obj).id == id);
    let obj = this.mainCanvas._objects[index];
    let activeObject = this.mainCanvas.getActiveObject();
    let stateString = '';
    if (lock) {
      obj.set({
        lockMovementX: true,
        lockMovementY: true,
        selectable: false,
      });
      stateString = 'Locked ' + obj.name;
    } else {
      obj.set({
        lockMovementX: false,
        lockMovementY: false,
        selectable: true,
      });
      stateString = 'Unlocked ' + obj.name;
    }
    this.mainCanvas._objects[index] = obj;
    if ((activeObject && (<any>activeObject).id) == (<any>obj).id) {
      this.mainCanvas.discardActiveObject();
    }
    this.canvasService.setCanvasObjects(this.mainCanvas.getObjects());
    this.mainCanvas.requestRenderAll();
    this.historyService.saveState(stateString);
  }
}
