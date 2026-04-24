import { inject } from '@angular/core';
import { Router } from '@angular/router';

export const clientGuard = () => {

  const router = inject(Router);
  const user = JSON.parse(localStorage.getItem('user') || 'null');

  if (!user) {
    router.navigate(['/login']);
    return false;
  }

  if (user.role !== 'client') {
    router.navigate(['/']);
    return false;
  }

  return true;
};