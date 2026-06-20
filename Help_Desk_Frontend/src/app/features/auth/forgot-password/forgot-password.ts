import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  standalone: true,
  imports: [
    CommonModule,
    FormsModule
  ],
  templateUrl: './forgot-password.html',
  styleUrl: './../activate-account/activate-account.css'
})
export class ForgotPassword {

  email = '';

  loading = false;

  success = '';

  error = '';

  constructor(
    private authService: AuthService
  ) {}

  send() {

    this.error = '';
    this.success = '';

    if (!this.email) {

      this.error =
        'Ingrese un correo';

      return;
    }

    this.loading = true;

    this.authService
      .requestPasswordReset(
        this.email
      )
      .subscribe({

        next: () => {

          this.loading = false;

          this.success =
            'Si el correo existe se enviaron instrucciones';
        },

        error: (err) => {

          this.loading = false;

          this.error = err;
        }
      });
  }
}