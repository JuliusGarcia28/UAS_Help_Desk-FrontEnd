import { Component } from '@angular/core';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

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
    private router: Router
  ) {}

  logout() {

    Swal.fire({
      title: '¿Cerrar sesión?',
      text: 'Tu sesión actual se cerrará',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, cerrar sesión',
      cancelButtonText: 'Cancelar',

      // COLORES PERSONALIZADOS
      confirmButtonColor: '#0B2545', // primary
      cancelButtonColor: '#E4E7EB',  // border

      background: '#FFFFFF',
      color: '#1F2933',

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

          /*Swal.fire({
            title: 'Sesión cerrada',
            text: 'Has salido correctamente',
            icon: 'success',
            confirmButtonColor: '#0B2545'
          });*/

          this.router.navigate(['/login']);
        });

      }

    });
  }
}