import { Directive, ElementRef, Input, OnChanges, Renderer2 } from '@angular/core';

@Directive({
  selector: '[appProductStatus]',
  standalone: true
})
export class ProductStatusDirective implements OnChanges {
  @Input({ required: true }) stock = 0;
  @Input({ required: true }) discountPercent = 0;

  constructor(
    private readonly host: ElementRef<HTMLElement>,
    private readonly renderer: Renderer2
  ) {}

  ngOnChanges(): void {
    const element = this.host.nativeElement;
    const highlight = this.stock === 0 ? '#fbe9e9' : this.discountPercent >= 20 ? '#e8f6ee' : '#fff';
    const border = this.stock === 0 ? '#d9534f' : this.discountPercent >= 20 ? '#3ca66b' : '#d8deea';

    this.renderer.setStyle(element, 'backgroundColor', highlight);
    this.renderer.setStyle(element, 'borderColor', border);
  }
}
