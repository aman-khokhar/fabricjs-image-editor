import { Component, computed, effect, inject, model, output, Signal, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CanvasService } from '../../canvas/canvas-service';
import { FontService } from '../../reusable/font-service';
import { fabric } from 'fabric';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { SelectAllOnFocusDirective } from '../../reusable/select-all-on-focus.directive';

@Component({
  selector: 'app-text-options',
  imports: [FormsModule, CommonModule, SelectAllOnFocusDirective],
  templateUrl: './text-options.html',
  styleUrl: './text-options.css',
})
export class TextOptions {
  canvasService = inject(CanvasService);
  fontService = inject(FontService);

  selectedObject$ = this.canvasService.selectedObject$;
  loadedFonts = this.fontService.loadedFonts;

  fontWeight = signal<string>('normal');
  fontStyle = signal<string>('normal');
  underline = signal<boolean>(false);
  overline = signal<boolean>(false);
  linethrough = signal<boolean>(false);
  fontFamily = model<string>('Roboto');
  fontSize = model<number>(0);
  strokeWidth = model<number>(0);
  stroke = model<string>('#ffffff');
  fill = model<string>('#ffffff');
  backgroundColor = model<string>('#ffffff');
  transparentBackground = model<boolean>(false);

  selObject: fabric.Text | fabric.Textbox | null = null;
  selectionMode = signal(false);
  selectedStartMap: { lineIndex: number; charIndex: number } = { lineIndex: 0, charIndex: 0 };
  selectedEndMap: { lineIndex: number; charIndex: number } = { lineIndex: 0, charIndex: 0 };

  constructor() {
    this.selectedObject$.pipe(takeUntilDestroyed()).subscribe((selectedObject) => {
      if (selectedObject instanceof fabric.Textbox) {
        this.selObject = selectedObject;
        if (
          (selectedObject.selectionStart || selectedObject.selectionStart == 0) &&
          selectedObject.selectionEnd
        ) {
          if (selectedObject.selectionStart == 0 && selectedObject.selectionEnd == 0) {
            this.selectionMode.set(false);
          } else if (selectedObject.selectionStart == selectedObject.selectionEnd) {
            this.selectionMode.set(false);
          } else {
            this.selectionMode.set(true);
            this.selectedStartMap = this.getSelectionIndices(selectedObject.selectionStart);
            this.selectedEndMap = this.getSelectionIndices(selectedObject.selectionEnd);
          }
        }

        if (
          this.selectionMode() &&
          selectedObject.styles &&
          Object.keys(selectedObject.styles).length > 0
        ) {
          let styles = selectedObject.styles;
          let isStylesUpdated = false;
          for (
            let line = this.selectedStartMap.lineIndex;
            line <= this.selectedEndMap.lineIndex;
            line++
          ) {
            for (
              let char = this.selectedStartMap.charIndex;
              char < this.selectedEndMap.charIndex;
              char++
            ) {
              if (styles[line][char]) {
                this.fontWeight.set(styles[line][char].fontWeight);
                this.fontStyle.set(styles[line][char].fontStyle);
                this.underline.set(styles[line][char].underline);
                this.overline.set(styles[line][char].overline);
                this.linethrough.set(styles[line][char].linethrough);
                this.fontFamily.set(styles[line][char].fontFamily);
                this.fontSize.set(styles[line][char].fontSize);
                this.strokeWidth.set(styles[line][char].strokeWidth);
                this.stroke.set(styles[line][char].stroke);
                this.fill.set(styles[line][char].fill);
                this.backgroundColor.set(styles[line][char].backgroundColor);
                isStylesUpdated = true;
                break;
              }
            }
          }
          if (!isStylesUpdated) {
            this.fontWeight.set(<string>selectedObject.fontWeight);
            this.fontStyle.set(<string>selectedObject.fontStyle);
            this.underline.set(<boolean>selectedObject.underline);
            this.overline.set(<boolean>selectedObject.overline);
            this.linethrough.set(<boolean>selectedObject.linethrough);
            this.fontFamily.set(<string>selectedObject.fontFamily);
            this.fontSize.set(<number>selectedObject.fontSize);
            this.strokeWidth.set(<number>selectedObject.strokeWidth);
            this.stroke.set(<string>selectedObject.stroke);
            this.fill.set(<string>selectedObject.fill);
            this.backgroundColor.set(<string>selectedObject.backgroundColor);
          }
        } else {
          if (this.selectionMode()) {
            this.fontWeight.set(<string>selectedObject.fontWeight);
            this.fontStyle.set(<string>selectedObject.fontStyle);
            this.underline.set(<boolean>selectedObject.underline);
            this.overline.set(<boolean>selectedObject.overline);
            this.linethrough.set(<boolean>selectedObject.linethrough);
            this.fontFamily.set(<string>selectedObject.fontFamily);
            this.fontSize.set(<number>selectedObject.fontSize);
            this.strokeWidth.set(<number>selectedObject.strokeWidth);
            this.stroke.set(<string>selectedObject.stroke);
            this.fill.set(<string>selectedObject.fill);
            this.backgroundColor.set(<string>selectedObject.backgroundColor);
          }
        }
      } else if (selectedObject instanceof fabric.Text) {
        this.selObject = selectedObject;
      }
    });
  }

  isText(obj: fabric.Object) {
    return obj instanceof fabric.Textbox || obj instanceof fabric.Text;
  }

  boldClick() {
    if (this.selectionMode()) {
      if (this.fontWeight() == 'normal') {
        this.fontWeight.set('bold');
      } else {
        this.fontWeight.set('normal');
      }
    } else {
      if (this.selObject?.fontWeight == 'normal') {
        this.canvasService.updateSelectedProps({ fontWeight: 'bold' });
      } else {
        this.canvasService.updateSelectedProps({ fontWeight: 'normal' });
      }
    }
  }

  italicClick() {
    if (this.selectionMode()) {
      if (this.fontStyle() == 'normal') {
        this.fontStyle.set('italic');
      } else {
        this.fontStyle.set('normal');
      }
    } else {
      if (this.selObject?.fontStyle == 'normal') {
        this.canvasService.updateSelectedProps({ fontStyle: 'italic' });
      } else {
        this.canvasService.updateSelectedProps({ fontStyle: 'normal' });
      }
    }
  }

  underlineClick() {
    if (this.selectionMode()) {
      this.underline.set(!this.underline());
    } else {
      this.canvasService.updateSelectedProps({ underline: !this.selObject?.underline });
    }
  }

  overlineClick() {
    if (this.selectionMode()) {
      this.overline.set(!this.overline());
    } else {
      this.canvasService.updateSelectedProps({ overline: !this.selObject?.overline });
    }
  }

  lineThroughClick() {
    if (this.selectionMode()) {
      this.linethrough.set(!this.linethrough());
    } else {
      this.canvasService.updateSelectedProps({ linethrough: !this.selObject?.linethrough });
    }
  }

  alignClick(align: string) {
    this.canvasService.updateSelectedProps({ textAlign: align });
  }

  getSelectionIndices(index: number) {
    const txt = this.selObject?.text || '';
    const lines = txt.split('\n');
    let counter = 0;
    for (let lineIndex = 0; lineIndex < lines.length; lineIndex++) {
      const line = lines[lineIndex];

      if (index <= counter + line.length) {
        const charIndex = index - counter;
        return { lineIndex, charIndex };
      }

      counter += line.length + 1;
    }
    return { lineIndex: lines.length - 1, charIndex: lines[lines.length - 1].length };
  }

  applyStyles() {
    let styles = this.selObject?.styles;
    for (
      let line = this.selectedStartMap.lineIndex;
      line <= this.selectedEndMap.lineIndex;
      line++
    ) {
      if (styles[line]) {
        styles[line] = {
          ...styles[line],
        };
      } else {
        styles[line] = {};
      }
      for (
        let char = this.selectedStartMap.charIndex;
        char < this.selectedEndMap.charIndex;
        char++
      ) {
        styles[line][char] = {
          fontWeight: this.fontWeight(),
          fontFamily: this.fontFamily(),
          fontStyle: this.fontStyle(),
          fontSize: this.fontSize(),
          underline: this.underline(),
          overline: this.overline(),
          linethrough: this.linethrough(),
          textBackgroundColor: this.backgroundColor(),
          fill: this.fill(),
          strokeWidth: this.strokeWidth(),
          stroke: this.stroke(),
        };
      }
    }
    this.canvasService.updateSelectedProps({ styles: styles });
  }

  onPropChange(value: any, prop: string) {
    this.canvasService.updateSelectedProps({ [prop]: value });
  }
}
