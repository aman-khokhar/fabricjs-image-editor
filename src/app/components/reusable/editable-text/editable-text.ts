import {
  Component,
  effect,
  ElementRef,
  input,
  model,
  OnDestroy,
  output,
  signal,
  ViewChild,
} from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-editable-text',
  imports: [FormsModule],
  templateUrl: './editable-text.html',
  styleUrl: './editable-text.css',
})
export class EditableText implements OnDestroy {
  @ViewChild('inputControl') inputControlRef!: ElementRef<HTMLInputElement>;

  readonly value = input<string>();
  outputValue = output<string | undefined>();

  currentState = signal<string>('text');
  inputValue = model<string>();

  private tmpTimer: any;

  constructor() {
    effect(() => {
      this.inputValue.set(this.value());
    });
  }

  onTextClick() {
    this.currentState.set('input');
    this.tmpTimer = setTimeout(() => {
      this.inputControlRef.nativeElement.focus();
    });
  }

  onBlur() {
    this.currentState.set('text');
    this.outputValue.emit(this.inputValue());
  }

  ngOnDestroy() {
    if (this.tmpTimer) {
      clearTimeout(this.tmpTimer);
    }
  }
}
