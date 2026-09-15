/*import { inject } from '@angular/core';
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
};*/

import { inject } from '@angular/core';
import {
  CanActivateFn,
  Router
} from '@angular/router';

import {
  Observable,
  catchError,
  map,
  of
} from 'rxjs';

import { AuthService } from '../services/auth.service';


export const adminGuard: CanActivateFn = (): Observable<boolean> => {

  const router = inject(Router);
  const authService = inject(AuthService);

  /*
   * Si ya tenemos usuario y token en memoria,
   * podemos validar directamente.
   */
  const currentUser = authService.getUser();
  const accessToken = authService.getAccessToken();

  if (currentUser && accessToken) {

    if (currentUser.role === 'admin') {

      return of(true);

    }

    router.navigate(['/']);

    return of(false);
  }

  /*
   * Si no hay sesión en memoria, intentamos
   * restaurarla utilizando la cookie HttpOnly.
   */
  return authService.restoreSession().pipe(

    map(user => {

      if (user?.role === 'admin') {

        return true;

      }

      router.navigate(['/']);

      return false;

    }),

    catchError(() => {

      authService.clearSession();

      router.navigate(['/login']);

      return of(false);

    })

  );
};