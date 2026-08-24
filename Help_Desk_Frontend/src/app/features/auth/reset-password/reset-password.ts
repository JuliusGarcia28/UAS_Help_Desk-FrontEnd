import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  standalone: true,
  imports: [
    CommonModule,
    FormsModule
  ],
  templateUrl: './reset-password.html',
  styleUrl: './../activate-account/activate-account.css'
})
export class ResetPasswordComponent
implements OnInit {

  uid = '';
  token = '';

  password = '';
  confirmPassword = '';

  showPassword = false;
  showConfirmPassword = false;

  loading = false;

  error = '';

  success = '';

  constructor(
    private route: ActivatedRoute,
    private authService: AuthService
  ) {}

  togglePasswordVisibility(): void {

    this.showPassword =
      !this.showPassword;

  }

  toggleConfirmPasswordVisibility(): void {

    this.showConfirmPassword =
      !this.showConfirmPassword;

  }

  ngOnInit() {

    this.uid =
      this.route.snapshot
      .queryParamMap
      .get('uid') || '';

    this.token =
      this.route.snapshot
      .queryParamMap
      .get('token') || '';
  }

  reset() {

    if (
      this.password !==
      this.confirmPassword
    ) {

      this.error =
      'Las contraseñas no coinciden';

      return;
    }

    this.loading = true;

    this.authService
      .resetPassword(
        this.uid,
        this.token,
        this.password
      )
      .subscribe({

        next: () => {

          this.loading = false;

          this.success =
          'Contraseña actualizada';
        },

        error: (err) => {

          this.loading = false;

          this.error = err;
        }
      });
  }
}