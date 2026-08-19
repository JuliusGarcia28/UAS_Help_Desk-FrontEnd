import { Injectable, signal, computed } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class LoadingService {

  private requests = signal(0);

  private message = signal('Cargando...');

  readonly isLoading = computed(() => this.requests() > 0);

  readonly loadingMessage = computed(() => this.message());

  show(message = 'Cargando...'): void {

    this.message.set(message);

    this.requests.update(value => value + 1);

  }

  hide(): void {

    this.requests.update(
      value => Math.max(0, value - 1)
    );

  }

  reset(): void {

    this.requests.set(0);

  }

}