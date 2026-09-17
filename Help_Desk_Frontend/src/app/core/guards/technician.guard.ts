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


export const technicianGuard: CanActivateFn = (): Observable<boolean> => {

  const router = inject(Router);
  const authService = inject(AuthService);

  // Revisar primero si ya tenemos la sesión disponible en memoria.
  const currentUser = authService.getUser();
  const accessToken = authService.getAccessToken();

  if (currentUser && accessToken) {

    if (currentUser.role === 'technician') {

      return of(true);

    }

    router.navigate(['/']);

    return of(false);
  }

  // Si se recargó la aplicación, intentamos restaurar la sesión mediante la cookie HttpOnly.
  return authService.restoreSession().pipe(

    map(user => {

      if (user?.role === 'technician') {

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