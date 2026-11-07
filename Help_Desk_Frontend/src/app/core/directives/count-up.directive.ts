import { Directive, ElementRef, Input, OnChanges, OnDestroy, inject } from '@angular/core';

/**
 * Anima un contador numérico desde su valor actual hasta el nuevo.
 * Uso: <p [appCountUp]="tickets.length"></p>
 */
@Directive({
  selector: '[appCountUp]',
  standalone: true
})
export class CountUpDirective implements OnChanges, OnDestroy {

  @Input('appCountUp') value: number | null | undefined = 0;

  /** Duración de la animación en ms. */
  @Input() countDuration = 900;

  private readonly el = inject<ElementRef<HTMLElement>>(ElementRef);
  private frame = 0;
  private current = 0;

  ngOnChanges(): void {

    const target = Number(this.value) || 0;
    const from = this.current;

    cancelAnimationFrame(this.frame);

    const reduceMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

    if (reduceMotion || from === target) {
      this.render(target);
      return;
    }

    const start = performance.now();

    const step = (now: number) => {
      const progress = Math.min((now - start) / this.countDuration, 1);
      const eased = 1 - Math.pow(1 - progress, 3); // easeOutCubic
      this.render(from + (target - from) * eased);
      if (progress < 1) this.frame = requestAnimationFrame(step);
    };

    this.frame = requestAnimationFrame(step);
  }

  private render(n: number): void {
    this.current = n;
    this.el.nativeElement.textContent = Math.round(n).toLocaleString('es-MX');
  }

  ngOnDestroy(): void {
    cancelAnimationFrame(this.frame);
  }
}
