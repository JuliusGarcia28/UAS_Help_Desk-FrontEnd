import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';

export const LandingGuard: CanActivateFn = () => {
  const router = inject(Router);

  const user = JSON.parse(localStorage.getItem('user') || 'null');

  // No hay sesión -> puede entrar al Landing
  if (!user) {
    return true;
  }

  // Hay sesión -> mandar al dashboard correspondiente
  switch (user.role) {
    case 'admin':
      router.navigate(['/admin/dashboard']);
      return false;

    case 'client':
      router.navigate(['/client/dashboard']);
      return false;

    case 'technician':
      router.navigate(['/technician/dashboard']);
      return false;

    default:
      // Sesión inválida
      localStorage.removeItem('user');
      return true;
  }
};