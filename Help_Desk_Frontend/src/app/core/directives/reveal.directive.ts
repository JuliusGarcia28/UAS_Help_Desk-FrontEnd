import { AfterViewInit, Directive, ElementRef, Input, OnDestroy, inject } from '@angular/core';

/**
 * Anima la entrada de un elemento cuando aparece en pantalla.
 * Uso: <div appReveal [revealDelay]="120">…</div>
 * Las clases .reveal / .visible viven en styles.css.
 */
@Directive({
  selector: '[appReveal]',
  standalone: true
})
export class RevealDirective implements AfterViewInit, OnDestroy {

  /** Retraso en ms, útil para escalonar elementos hermanos. */
  @Input() revealDelay = 0;

  private readonly el = inject<ElementRef<HTMLElement>>(ElementRef);
  private observer?: IntersectionObserver;

  ngAfterViewInit(): void {

    const node = this.el.nativeElement;

    // Sin soporte para IntersectionObserver el contenido se muestra directamente.
    if (typeof IntersectionObserver === 'undefined') return;

    node.classList.add('reveal');
    if (this.revealDelay) node.style.transitionDelay = `${this.revealDelay}ms`;

    this.observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        node.classList.add('visible');
        this.observer?.disconnect();
      }
    }, { threshold: 0.12 });

    this.observer.observe(node);
  }

  ngOnDestroy(): void {
    this.observer?.disconnect();
  }
}
