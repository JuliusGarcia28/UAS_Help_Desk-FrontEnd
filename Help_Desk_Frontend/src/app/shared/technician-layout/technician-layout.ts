import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

import Swal from 'sweetalert2';

@Component({
  selector: 'app-technician-layout',
  standalone: true,
  imports: [RouterModule],
  templateUrl: './technician-layout.html',
  styleUrl: './technician-layout.css'
})
export class TechnicianLayout {

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
      confirmButtonColor: '#0B2545',
      cancelButtonColor: '#E4E7EB',
      background: '#FFFFFF',
      color: '#1F2933',
      reverseButtons: true,
    }).then(result => {

      if (result.isConfirmed) {

        this.auth.logout().subscribe(() => {
          this.router.navigate(['/login']);
        });

      }

    });

  }

}