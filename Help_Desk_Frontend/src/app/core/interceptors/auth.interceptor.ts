import {
  HttpInterceptorFn
} from '@angular/common/http';

import {
  inject
} from '@angular/core';

import {
  catchError,
  switchMap,
  throwError
} from 'rxjs';

import { AuthService } from '../services/auth.service';


export const authInterceptor: HttpInterceptorFn = (
  req,
  next
) => {

  const authService = inject(AuthService);

  // Rutas que NO necesitan access token.
  const publicRoutes = [

    '/auth/login',

    '/auth/activate-account',

    '/auth/request-password-reset',

    '/auth/reset-password',

    '/auth/refresh'

  ];

  // Comprobar si la petición corresponde a una ruta pública.
  const isPublicRoute =
    publicRoutes.some(
      route => req.url.includes(route)
    );


  // Siempre enviamos credentials.
  let request = req.clone({
    withCredentials: true
  });

  // Si NO es una ruta pública, agregamos el access token.
  if (!isPublicRoute) {

    const access =
      authService.getAccessToken();

    if (access) {

      request = request.clone({

        setHeaders: {

          Authorization:
            `Bearer ${access}`

        }

      });

    }

  }

  // Ejecutar petición.
  return next(request).pipe(

    catchError(error => {

      // Si no es 401, simplemente devolvemos el error.
      if (
        error.status !== 401
        ||
        isPublicRoute
      ) {

        return throwError(
          () => error
        );

      }

      return authService.refreshToken().pipe(

        switchMap(res => {

          // Crear nuevamente la petición original pero utilizando el nuevo access token.
          const retryRequest =
            request.clone({

              setHeaders: {

                Authorization:
                  `Bearer ${res.access}`

              }

            });

          // Volver a ejecutar la petición.
          return next(
            retryRequest
          );

        }),

        catchError(refreshError => {

          console.error(
            'REFRESH TOKEN FALLÓ:',
            refreshError
          );

          // Si el refresh también falla, la sesión ya no es válida.
           
          authService.clearSession();

          // Mandar al login.
          location.replace('/login');

          return throwError(
            () => refreshError
          );

        })

      );

    })

  );

};