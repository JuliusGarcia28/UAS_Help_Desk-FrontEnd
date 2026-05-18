import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-change-password',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './change-password.html',
  styleUrl: './change-password.css'
})
export class ChangePassword {

  password: string = '';
  password2: string = '';
  error: string = '';
  loading: boolean = false;

  constructor(private auth: AuthService, private router: Router) {}

  submit() {
    this.error = '';

    if (!this.password || this.password.length < 6) {
      this.error = 'La contraseña debe tener al menos 6 caracteres';
      return;
    }

    if (this.password !== this.password2) {
      this.error = 'Las contraseñas no coinciden';
      return;
    }

    this.loading = true;

    this.auth.changePassword(this.password).subscribe({
      next: () => {
        this.loading = false;
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        if (user) {
          user.must_change_password = false;
          localStorage.setItem('user', JSON.stringify(user));
          if (user.role === 'technician') {
            this.router.navigate(['/tech']);
            return;
          }
        }
        this.router.navigate(['/']);
      },
      error: (err) => {
        this.loading = false;
        this.error = err;
        setTimeout(() => this.error = '', 4000);
      }
    });
  }

}
