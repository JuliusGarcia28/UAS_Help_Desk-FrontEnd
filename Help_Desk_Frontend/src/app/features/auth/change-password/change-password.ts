import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  standalone:true,
  imports:[
    CommonModule,
    FormsModule
  ],
  templateUrl:'./change-password.html',
  styleUrl:'./../activate-account/activate-account.css'
})
export class ChangePasswordComponent {

  currentPassword = '';

  newPassword = '';

  confirmPassword = '';

  loading = false;

  success = '';

  error = '';

  constructor(
    private authService: AuthService
  ) {}

  save() {

    if (
      this.newPassword !==
      this.confirmPassword
    ) {

      this.error =
      'Las contraseñas no coinciden';

      return;
    }

    this.loading = true;

    this.authService
      .changePassword(
        this.currentPassword,
        this.newPassword
      )
      .subscribe({

        next: () => {

          this.loading = false;

          this.success =
            'Contraseña actualizada';

          this.currentPassword = '';
          this.newPassword = '';
          this.confirmPassword = '';
        },

        error: (err) => {

          this.loading = false;

          this.error = err;
        }
      });
  }
}