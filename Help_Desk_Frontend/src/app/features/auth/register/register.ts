import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { AbstractControl, FormBuilder, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

function strongPasswordValidator(control: AbstractControl): ValidationErrors | null {
  const value = control.value as string;

  if (!value) {
    return null;
  }

  const passwordStrengthRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).{8,}$/;
  return passwordStrengthRegex.test(value) ? null : { weakPassword: true };
}

function passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
  const password = control.get('password')?.value;
  const confirmPassword = control.get('confirmPassword')?.value;

  if (!password || !confirmPassword) {
    return null;
  }

  return password === confirmPassword ? null : { passwordMismatch: true };
}

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, CommonModule],
  templateUrl: './register.html',
  styleUrl: './register.css'
})
export class Register {

  loading = false;
  error = '';
  success = '';

  registerForm;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.registerForm = this.fb.group(
      {
        email: ['', [Validators.required, Validators.email]],
        password: ['', [Validators.required, strongPasswordValidator]],
        confirmPassword: ['', [Validators.required]]
      },
      { validators: passwordMatchValidator }
    );
  }

  get emailCtrl() {
    return this.registerForm.get('email');
  }

  get passwordCtrl() {
    return this.registerForm.get('password');
  }

  get confirmPasswordCtrl() {
    return this.registerForm.get('confirmPassword');
  }

  register() {
    this.error = '';
    this.success = '';

    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      return;
    }

    const email = this.emailCtrl?.value?.trim() ?? '';
    const password = this.passwordCtrl?.value ?? '';

    this.loading = true;

    this.authService.register(email, password).subscribe({
      next: () => {
        this.loading = false;
        this.success = 'Cuenta creada correctamente. Ahora puedes iniciar sesión.';
        this.registerForm.reset();

        setTimeout(() => {
          this.router.navigate(['/login']);
        }, 1400);
      },
      error: (err: string) => {
        this.loading = false;
        this.error = err;

        setTimeout(() => {
          this.error = '';
        }, 5000);
      }
    });
  }

}