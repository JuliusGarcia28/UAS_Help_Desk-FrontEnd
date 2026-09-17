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


export const clientGuard: CanActivateFn = (): Observable<boolean> => {

  const router = inject(Router);
  const authService = inject(AuthService);

  // Revisar primero si ya tenemos la sesión disponible en memoria.
  const currentUser = authService.getUser();
  const accessToken = authService.getAccessToken();

  if (currentUser && accessToken) {

    if (currentUser.role === 'client') {

      return of(true);

    }

    router.navigate(['/']);

    return of(false);
  }

  // Si la página fue recargada, restauramos la sesión mediante la cookie HttpOnly.
  return authService.restoreSession().pipe(

    map(user => {

      if (user?.role === 'client') {

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