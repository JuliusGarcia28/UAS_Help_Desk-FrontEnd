/*import { inject } from '@angular/core';
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


export const LandingGuard: CanActivateFn = (): Observable<boolean> => {

  const router = inject(Router);
  const authService = inject(AuthService);

  /*
   * Si no hay sesión en memoria, intentamos restaurarla.
   */
  const currentUser = authService.getUser();
  const accessToken = authService.getAccessToken();

  /*
   * No hay sesión cargada.
   *
   * Intentamos recuperar la sesión mediante
   * la cookie HttpOnly.
   */
  if (!currentUser || !accessToken) {

    return authService.restoreSession().pipe(

      map(user => {

        /*
         * Si no existe una sesión válida,
         * dejamos entrar al Landing.
         */
        if (!user) {

          return true;

        }

        /*
         * Si existe una sesión, enviamos al
         * usuario a su dashboard correspondiente.
         */
        switch (user.role) {

          case 'admin':

            router.navigate([
              '/admin/dashboard'
            ]);

            return false;

          case 'client':

            router.navigate([
              '/client/dashboard'
            ]);

            return false;

          case 'technician':

            router.navigate([
              '/technician/dashboard'
            ]);

            return false;

          default:

            authService.clearSession();

            return true;
        }

      }),

      catchError(() => {

        /*
         * Si falla la restauración de sesión,
         * asumimos que no existe una sesión válida.
         */
        authService.clearSession();

        return of(true);

      })

    );

  }

  /*
   * Ya existe una sesión válida en memoria.
   * Redirigimos según el rol.
   */
  switch (currentUser.role) {

    case 'admin':

      router.navigate([
        '/admin/dashboard'
      ]);

      return of(false);

    case 'client':

      router.navigate([
        '/client/dashboard'
      ]);

      return of(false);

    case 'technician':

      router.navigate([
        '/technician/dashboard'
      ]);

      return of(false);

    default:

      authService.clearSession();

      return of(true);
  }
};