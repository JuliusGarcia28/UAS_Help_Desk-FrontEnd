import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class Login {

  email: string = '';
  password: string = '';

  loading: boolean = false;
  error: string = '';

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  login() {

    this.error = '';

    if (!this.email || !this.password) {
      this.error = 'Todos los campos son obligatorios';
      return;
    }

    this.loading = true;

    this.authService.login(this.email, this.password).subscribe({
      next: (res) => {
        this.loading = false;

        const user = res.user;

        //  REDIRECCIÓN POR ROL
        if (user.must_change_password) {
          this.router.navigate(['/change-password']);
          return;
        }

        //  REDIRECCIÓN POR ROL
        if (user.role === 'admin') {
          this.router.navigate(['/admin']);
        } else if (user.role === 'client') {
          this.router.navigate(['/client']);
        } else if (user.role === 'technician') {
          this.router.navigate(['/tech']);
        } else {
          this.router.navigate(['/']); // luego puedes hacer dashboard user
        }
      },
      error: (err) => {
        this.loading = false;
        this.error = err;

        setTimeout(() => {
          this.error = '';
        }, 4000);
      }
    });
  }
}