/*import { inject } from '@angular/core';
import { Router } from '@angular/router';

export const authGuard = () => {

  const router = inject(Router);

  const user = JSON.parse(
    localStorage.getItem('user') || 'null'
  );

  if (!user) {

    router.navigate(['/login']);

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


export const authGuard: CanActivateFn = (): Observable<boolean> => {

  const router = inject(Router);
  const authService = inject(AuthService);

  /*
   * Primero revisamos si ya existe una sesión
   * cargada en memoria.
   */
  const currentUser = authService.getUser();
  const accessToken = authService.getAccessToken();

  if (currentUser && accessToken) {

    return of(true);

  }

  /*
   * Si no existe información en memoria, intentamos
   * recuperar la sesión utilizando la cookie HttpOnly.
   */
  return authService.restoreSession().pipe(

    map(user => {

      if (user) {

        return true;

      }

      router.navigate(['/login']);

      return false;

    }),

    catchError(() => {

      authService.clearSession();

      router.navigate(['/login']);

      return of(false);

    })

  );
};