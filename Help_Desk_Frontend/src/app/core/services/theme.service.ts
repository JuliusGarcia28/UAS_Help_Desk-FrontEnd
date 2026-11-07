import { Injectable, signal } from '@angular/core';

export type ThemeMode = 'light' | 'dark';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {

  private currentTheme: ThemeMode = 'light';

  /** Señal reactiva para componentes que dependen del tema (p. ej. gráficas). */
  readonly theme = signal<ThemeMode>('light');

  constructor() {
    this.loadTheme();
  }

  private loadTheme(): void {

    let savedTheme: ThemeMode | null = null;

    try {
      savedTheme = localStorage.getItem('theme') as ThemeMode | null;
    } catch {
      savedTheme = null;
    }

    if (savedTheme === 'light' || savedTheme === 'dark') {
      this.setTheme(savedTheme);
      return;
    }

    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

    this.setTheme(prefersDark ? 'dark' : 'light');
  }

  setTheme(theme: ThemeMode): void {

    this.currentTheme = theme;
    this.theme.set(theme);

    document.body.classList.remove('light-theme', 'dark-theme');
    document.body.classList.add(`${theme}-theme`);

    try {
      localStorage.setItem('theme', theme);
    } catch {
      /* almacenamiento no disponible: se ignora */
    }
  }

  toggleTheme(): void {

    const nextTheme =
      this.currentTheme === 'light'
        ? 'dark'
        : 'light';

    this.setTheme(nextTheme);
  }

  getTheme(): ThemeMode {
    return this.currentTheme;
  }

  isDark(): boolean {
    return this.currentTheme === 'dark';
  }
}