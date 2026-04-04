import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

export const adminGuard: CanActivateFn = () => {

  const router = inject(Router);

  const user = JSON.parse(localStorage.getItem('user') || 'null');

  // VALIDACIONES
  if (!user) {
    router.navigate(['/login']);
    return false;
  }

  if (user.role !== 'admin') {
    router.navigate(['/']);
    return false;
  }

  return true;
};