import { Injectable, NgZone, effect, inject } from '@angular/core';
import { Router } from '@angular/router';
import { Capacitor } from '@capacitor/core';
import { App } from '@capacitor/app';
import { StatusBar, Style } from '@capacitor/status-bar';
import { Directory, Filesystem } from '@capacitor/filesystem';
import { Share } from '@capacitor/share';

import Swal from '../utils/swal';
import { ThemeService } from './theme.service';

/**
 * Integración con la app nativa (Capacitor / Ionic).
 * En navegador y en Electron no hace nada.
 */
@Injectable({
  providedIn: 'root'
})
export class NativeService {

  private readonly router = inject(Router);
  private readonly zone = inject(NgZone);
  private readonly themeService = inject(ThemeService);

  readonly isNative = Capacitor.isNativePlatform();
  readonly platform = Capacitor.getPlatform(); // 'android' | 'ios' | 'web'

  /** Pantallas desde las que "atrás" sale de la app en lugar de navegar. */
  private readonly rootRoutes = new Set([
    '/', '/login',
    '/admin/dashboard', '/client/dashboard', '/technician/dashboard'
  ]);

  constructor() {

    if (!this.isNative) return;

    document.body.classList.add('native', `platform-${this.platform}`);

    this.handleBackButton();

    // La barra de estado sigue al tema claro/oscuro de la app.
    effect(() => {
      const dark = this.themeService.theme() === 'dark';
      this.updateStatusBar(dark);
    });
  }

  private async updateStatusBar(dark: boolean): Promise<void> {
    try {
      // Style.Dark = texto claro (fondo oscuro); Style.Light = texto oscuro.
      await StatusBar.setStyle({ style: dark ? Style.Dark : Style.Light });

      if (this.platform === 'android') {
        await StatusBar.setBackgroundColor({ color: dark ? '#151F32' : '#FFFFFF' });
      }
    } catch {
      // Algunas versiones de Android (edge-to-edge) ignoran el color: no es crítico.
    }
  }

  /** Botón "atrás" de Android: cierra modales/menús antes de navegar o salir. */
  private handleBackButton(): void {

    App.addListener('backButton', ({ canGoBack }) => {

      this.zone.run(() => {

        // 1. Un modal abierto se cierra primero.
        if (Swal.isVisible()) {
          Swal.close();
          return;
        }

        // 2. El menú lateral (si está abierto) escucha la tecla Escape.
        const sidebarOpen = document.querySelector('.sidebar.open');
        if (sidebarOpen) {
          document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
          return;
        }

        // 3. En pantallas raíz se minimiza la app; en el resto se regresa.
        const path = this.router.url.split('?')[0];

        if (this.rootRoutes.has(path) || !canGoBack) {
          App.minimizeApp();
        } else {
          window.history.back();
        }
      });

    });
  }

  /**
   * Guarda un archivo generado en la app (Excel, PDF...) y abre el menú
   * "Compartir" del sistema para enviarlo o guardarlo donde el usuario quiera.
   * En el WebView las descargas por enlace (<a download>) no funcionan.
   */
  async saveAndShare(fileName: string, base64: string, title: string): Promise<void> {

    const written = await Filesystem.writeFile({
      path: fileName,
      data: base64,
      directory: Directory.Cache
    });

    await Share.share({
      title,
      files: [written.uri],
      dialogTitle: title
    });
  }
}
