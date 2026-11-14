import { Directive, HostListener, inject } from '@angular/core';
import { Router } from '@angular/router';
import Swal from '../core/utils/swal';

import { AuthService } from '../core/services/auth.service';
import { ThemeService } from '../core/services/theme.service';

/**
 * Lógica compartida por los layouts de admin, cliente y técnico:
 * usuario en sesión, tema, menú lateral móvil y cierre de sesión.
 */
@Directive()
export abstract class LayoutBase {

  protected readonly auth = inject(AuthService);
  protected readonly router = inject(Router);
  protected readonly themeService = inject(ThemeService);

  sidebarOpen = false;

  /** Usuario autenticado (vive en memoria dentro de AuthService). */
  get user(): any {
    return this.auth.getUser() ?? {};
  }

  get fullName(): string {
    const { first_name = '', last_name = '' } = this.user;
    return `${first_name} ${last_name}`.trim() || this.user.email || 'Usuario';
  }

  get initials(): string {
    const { first_name = '', last_name = '' } = this.user;
    const letters = `${first_name.charAt(0)}${last_name.charAt(0)}`.trim();
    return (letters || (this.user.email ?? 'U').charAt(0)).toUpperCase();
  }

  toggleSidebar(): void {
    this.sidebarOpen = !this.sidebarOpen;
  }

  closeSidebar(): void {
    this.sidebarOpen = false;
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    this.closeSidebar();
  }

  toggleTheme(): void {
    this.themeService.toggleTheme();
  }

  isDark(): boolean {
    return this.themeService.isDark();
  }

  logout(): void {

    Swal.fire({
      title: '¿Cerrar sesión?',
      text: 'Tu sesión actual se cerrará',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Sí, cerrar sesión',
      cancelButtonText: 'Cancelar',
      reverseButtons: true,
      buttonsStyling: false,
      customClass: {
        popup: 'swal-popup',
        title: 'swal-title',
        confirmButton: 'swal-confirm-btn',
        cancelButton: 'swal-cancel-btn'
      }
    }).then(result => {

      if (!result.isConfirmed) return;

      // Con o sin error del servidor, la sesión local ya se limpió.
      const goToLogin = () => this.router.navigate(['/login']);

      this.auth.logout().subscribe({
        next: goToLogin,
        error: goToLogin
      });
    });
  }
}
