import { Component } from '@angular/core';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from './../../core/services/auth.service';
import { ThemeService } from '../../core/services/theme.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-client-layout',
  standalone: true,
  imports: [RouterModule],
  templateUrl: './client-layout.html',
  styleUrl: './client-layout.css'
})
export class ClientLayout {

  user = JSON.parse(localStorage.getItem('user') || '{}');

  constructor(
    private auth: AuthService,
    private router: Router,
    private theme: ThemeService
  ) {}

  toggleTheme(): void {
    this.theme.toggleTheme();
  }

  isDark(): boolean {
    return this.theme.isDark();
  }

  logout() {

    Swal.fire({
      title: '¿Cerrar sesión?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#0B2545',
      cancelButtonColor: '#E4E7EB'
    }).then(result => {

      if (result.isConfirmed) {

        this.auth.logout().subscribe(() => {
          this.router.navigate(['/login']);
        });

      }

    });
  }
}