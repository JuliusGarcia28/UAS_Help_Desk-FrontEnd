/*import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, switchMap, throwError } from 'rxjs';
import { environment } from '../../environments/environment';

export const authInterceptor: HttpInterceptorFn = (req, next) => {

  const http = inject(HttpClient);

  const access = localStorage.getItem('access');
  const refresh = localStorage.getItem('refresh');

  // NO enviar token en las siguientes rutas
  if (
    req.url.includes('/auth/login') ||
    req.url.includes('/auth/activate-account') ||
    req.url.includes('/auth/request-password-reset') ||
    req.url.includes('/auth/reset-password')
  ) {
    return next(req);
  }

  // AGREGAR TOKEN
  if (access) {
    req = req.clone({
      setHeaders: {
        Authorization: `Bearer ${access}`
      }
    });
  }

  return next(req).pipe(

    catchError((error) => {

      // TOKEN REFRESH
      if (error.status === 401 && refresh) {

        return http.post<any>(`${environment.apiUrl}/auth/refresh/`, {
          refresh
        }).pipe(

          switchMap((res) => {

            localStorage.setItem('access', res.access);

            // REINTENTAR REQUEST ORIGINAL
            const newReq = req.clone({
              setHeaders: {
                Authorization: `Bearer ${res.access}`
              }
            });

            return next(newReq);
          }),

          catchError(() => {
            // LOGOUT FORZADO
            localStorage.clear();
            location.replace('/login');
            return throwError(() => error);
          })
        );
      }

      return throwError(() => error);
    })
  );
};*/

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

  /**
   * Rutas que NO necesitan access token.
   *
   * IMPORTANTE:
   *
   * /auth/refresh/ también está aquí porque si el refresh
   * devuelve 401 NO debemos intentar hacer otro refresh.
   *
   * Eso evitaría un loop infinito.
   */
  const publicRoutes = [

    '/auth/login',

    '/auth/activate-account',

    '/auth/request-password-reset',

    '/auth/reset-password',

    '/auth/refresh'

  ];

  /**
   * Comprobar si la petición corresponde
   * a una ruta pública.
   */
  const isPublicRoute =
    publicRoutes.some(
      route => req.url.includes(route)
    );

  /**
   * Siempre enviamos credentials.
   *
   * Esto permite que el navegador envíe
   * la cookie HttpOnly del refresh token.
   */
  let request = req.clone({
    withCredentials: true
  });

  /**
   * Si NO es una ruta pública,
   * agregamos el access token.
   */
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

  /**
   * Ejecutar petición.
   */
  return next(request).pipe(

    catchError(error => {

      /**
       * Si no es 401,
       * simplemente devolvemos el error.
       */
      if (
        error.status !== 401
        ||
        isPublicRoute
      ) {

        return throwError(
          () => error
        );

      }

      /**
       * Llegamos aquí cuando:
       *
       * - La petición necesitaba autenticación.
       * - Django respondió 401.
       *
       * Por lo tanto intentamos obtener
       * un nuevo access token.
       */
      console.log(
        'ACCESS TOKEN EXPIRADO. INTENTANDO REFRESH...'
      );

      return authService.refreshToken().pipe(

        switchMap(res => {

          console.log(
            'REFRESH EXITOSO. REINTENTANDO PETICIÓN.'
          );

          /**
           * Crear nuevamente la petición original
           * pero utilizando el nuevo access token.
           */
          const retryRequest =
            request.clone({

              setHeaders: {

                Authorization:
                  `Bearer ${res.access}`

              }

            });

          /**
           * Volver a ejecutar la petición.
           */
          return next(
            retryRequest
          );

        }),

        catchError(refreshError => {

          console.error(
            'REFRESH TOKEN FALLÓ:',
            refreshError
          );

          /**
           * Si el refresh también falla,
           * la sesión ya no es válida.
           */
          authService.clearSession();

          /**
           * Mandar al login.
           */
          location.replace('/login');

          return throwError(
            () => refreshError
          );

        })

      );

    })

  );

};