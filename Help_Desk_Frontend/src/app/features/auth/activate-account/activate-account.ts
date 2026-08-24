import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-activate-account',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule
  ],
  templateUrl: './activate-account.html',
  styleUrl: './activate-account.css'
})
export class ActivateAccountComponent implements OnInit {

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
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {

    this.uid =
      this.route.snapshot.queryParamMap.get('uid') || '';

    this.token =
      this.route.snapshot.queryParamMap.get('token') || '';

  }

  togglePasswordVisibility(): void {

    this.showPassword =
      !this.showPassword;

  }

  toggleConfirmPasswordVisibility(): void {

    this.showConfirmPassword =
      !this.showConfirmPassword;

  }

  activate(): void {

    this.error = '';

    if (
      !this.password ||
      !this.confirmPassword
    ) {

      this.error =
        'Todos los campos son obligatorios';

      return;

    }

    if (this.password.length < 6) {

      this.error =
        'La contraseña debe tener al menos 6 caracteres';

      return;

    }

    if (this.password !== this.confirmPassword) {

      this.error =
        'Las contraseñas no coinciden';

      return;

    }

    this.loading = true;

    this.authService
      .activateAccount(
        this.uid,
        this.token,
        this.password
      )
      .subscribe({

        next: () => {

          this.loading = false;

          this.success =
            'Cuenta activada correctamente';

          setTimeout(() => {

            this.router.navigate([
              '/login'
            ]);

          }, 2000);

        },

        error: (err) => {

          this.loading = false;

          this.error = err;

        }

      });

  }

}