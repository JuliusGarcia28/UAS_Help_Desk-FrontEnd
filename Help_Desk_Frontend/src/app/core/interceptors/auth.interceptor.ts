import { HttpInterceptorFn } from '@angular/common/http';
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
};