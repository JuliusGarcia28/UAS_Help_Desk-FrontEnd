import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { RouterLink } from '@angular/router';
import Swal from 'sweetalert2';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-landing',
  imports: [RouterLink],
  templateUrl: './landing.html',
  styleUrl: './landing.css',
})
export class Landing {

  constructor(private router: Router, private auth: AuthService) {}

  requestSupport() {

    const user = this.auth.getUser();

    if (!user) {
      // Not logged in -> go to login
      this.router.navigate(['/login']);
      return;
    }

    // If user exists but not verified
    if (user.status !== 1) {
      Swal.fire({
        icon: 'warning',
        title: 'Cuenta no verificada',
        text: 'Esta cuenta aún no ha sido verificada',
        confirmButtonText: 'Aceptar'
      });
      return;
    }

    // Verified -> go to client Help Desk
    this.router.navigate(['/client']);

  }

}
