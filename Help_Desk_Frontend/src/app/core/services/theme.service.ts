import { Injectable } from '@angular/core';

export type ThemeMode = 'light' | 'dark';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {

  private currentTheme: ThemeMode = 'light';

  constructor() {
    this.loadTheme();
  }

  private loadTheme(): void {

    const savedTheme = localStorage.getItem('theme') as ThemeMode | null;

    if (savedTheme) {
      this.setTheme(savedTheme);
      return;
    }

    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

    this.setTheme(prefersDark ? 'dark' : 'light');
  }

  setTheme(theme: ThemeMode): void {

    this.currentTheme = theme;

    document.body.classList.remove('light-theme', 'dark-theme');
    document.body.classList.add(`${theme}-theme`);

    localStorage.setItem('theme', theme);
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