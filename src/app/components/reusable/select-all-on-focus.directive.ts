import { Directive, ElementRef, HostListener } from '@angular/core';

@Directive({
  selector: '[selectAllOnFocus]', // The selector for applying the directive
})
export class SelectAllOnFocusDirective {
  constructor(private el: ElementRef) {}

  @HostListener('focus') onFocus() {
    const inputElement: HTMLInputElement = this.el.nativeElement;
    if (inputElement && typeof inputElement.select === 'function') {
      inputElement.select();
    }
  }
}
