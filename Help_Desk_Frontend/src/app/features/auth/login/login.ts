import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';

import { AuthService } from '../../../core/services/auth.service';


@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    FormsModule,
    CommonModule,
  ],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class Login {

  email: string = '';

  password: string = '';

  loading: boolean = false;

  error: string = '';

  showPassword: boolean = false;


  constructor(
    private authService: AuthService,
    private router: Router
  ) {}


  // Mostrar / ocultar contraseña.
  togglePasswordVisibility(): void {

    this.showPassword =
      !this.showPassword;

  }

  // Realizar login.
  login(): void {

    // Limpiar error anterior.
    this.error = '';

    // Validación básica
    if (
      !this.email.trim()
      ||
      !this.password
    ) {

      this.error =
        'Todos los campos son obligatorios';

      return;

    }

    // Activar loading.
    this.loading = true;

    // Ejecutar login.
    this.authService
      .login(
        this.email.trim(),
        this.password
      )
      .subscribe({

        // LOGIN EXITOSO
        next: (res) => {

          // Detener loading.
          this.loading = false;


          //  Usuario recibido desde Django.
          const user = res.user;

          // Verificación de seguridad.
          if (!user) {

            this.error =
              'El servidor no devolvió información del usuario';

            return;

          }

          // REDIRECCIÓN SEGÚN ROL
          if (
            user.role === 'admin'
          ) {

            this.router.navigate([
              '/admin'
            ]);

            return;

          }


          if (
            user.role === 'client'
          ) {

            this.router.navigate([
              '/client/dashboard'
            ]);

            return;

          }


          if (
            user.role === 'technician'
          ) {

            this.router.navigate([
              '/technician/dashboard'
            ]);

            return;

          }

          this.router.navigate([
            '/'
          ]);

        },

        // LOGIN CON ERROR
        error: (err) => {

          console.error(
            'ERROR EN LOGIN:',
            err
          );

          // Detener loading.
          this.loading = false;

          // Mostrar mensaje.
          this.error =
            typeof err === 'string'
              ? err
              : 'No se pudo iniciar sesión';


          // Ocultar mensaje después de 4 segundos.
          setTimeout(() => {

            this.error = '';

          }, 4000);

        }

      });

  }

}
