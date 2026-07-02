import { Component } from '@angular/core';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { ThemeService } from '../../core/services/theme.service';

import Swal from 'sweetalert2';

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [RouterModule],
  templateUrl: './admin-layout.html',
  styleUrl: './admin-layout.css'
})
export class AdminLayout {

  user = JSON.parse(localStorage.getItem('user') || '{}');

  constructor(
    private auth: AuthService,
    private router: Router,
    public themeService: ThemeService
  ) {}

  sidebarOpen = false;

  toggleSidebar(): void {

    this.sidebarOpen = !this.sidebarOpen;

  }

  closeSidebar(): void {

    this.sidebarOpen = false;

  }

  toggleTheme(): void {
    this.themeService.toggleTheme();
  }

  isDark(): boolean {
    return this.themeService.isDark();
  }

  logout() {

    Swal.fire({
      title: '¿Cerrar sesión?',
      text: 'Tu sesión actual se cerrará',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, cerrar sesión',
      cancelButtonText: 'Cancelar',

      confirmButtonColor: '#0B2545',
      cancelButtonColor: '#E4E7EB',

      background: getComputedStyle(document.body)
        .getPropertyValue('--surface'),

      color: getComputedStyle(document.body)
        .getPropertyValue('--text-primary'),

      reverseButtons: true,

      customClass: {
        popup: 'swal-popup',
        title: 'swal-title',
        confirmButton: 'swal-confirm-btn',
        cancelButton: 'swal-cancel-btn'
      }

    }).then((result) => {

      if (result.isConfirmed) {

        this.auth.logout().subscribe(() => {
          this.router.navigate(['/login']);
        });

      }

    });
  }
}