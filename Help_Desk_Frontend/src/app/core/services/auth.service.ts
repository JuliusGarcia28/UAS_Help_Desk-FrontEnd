import { Injectable } from '@angular/core';
import {
  HttpClient,
  HttpErrorResponse
} from '@angular/common/http';

import {
  Observable,
  throwError,
  tap,
  catchError,
  switchMap,
  of
} from 'rxjs';

import { environment } from '../../environments/environment';

interface LoginResponse {
  user: any;
  access: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private API_URL = `${environment.apiUrl}/auth`;

  // El access token se mantiene solamente en memoria.
   
  // El refresh token está almacenado por Django en una cookie HttpOnly.
  private accessToken: string | null = null;

  // Usuario actualmente autenticado.
  private currentUser: any = null;

  // Indica si ya intentamos restaurar la sesión al iniciar la aplicación.
  private sessionInitialized = false;

  constructor(
    private http: HttpClient
  ) {}

  login(
    email: string,
    password: string
  ): Observable<LoginResponse> {

    return this.http.post<LoginResponse>(
      `${this.API_URL}/login/`,
      {
        email,
        password
      },
      {
        withCredentials: true
      }
    ).pipe(

      tap(res => {

        this.accessToken = res.access;

        this.currentUser = res.user;

        this.sessionInitialized = true;

      }),

      catchError(this.handleError)
    );
  }

  restoreSession(): Observable<any> {
    // Si ya inicializamos la sesión, no hacemos otra petición.
     
    if (this.sessionInitialized) {

      if (this.currentUser) {
        return of(this.currentUser);
      }

      return of(null);
    }

    return this.refreshToken().pipe(

      // Una vez obtenido el nuevo access token, solicitamos los datos del usuario.
      switchMap(() => {

        return this.loadUser();

      }),

      tap(user => {

        this.currentUser = user;

        this.sessionInitialized = true;

      }),

      catchError(error => {

        console.log(
          'No existe una sesión válida:',
          error
        );

        this.clearSession();

        this.sessionInitialized = true;

        return throwError(() => error);

      })

    );
  }

  refreshToken(): Observable<{ access: string }> {

    return this.http.post<{ access: string }>(
      `${this.API_URL}/refresh/`,
      {},
      {
        withCredentials: true
      }
    ).pipe(

      tap(res => {

        this.accessToken = res.access;
      }),

      catchError(this.handleError)
    );
  }

  // Obtener access token actual.
  getAccessToken(): string | null {

    return this.accessToken;

  }

  // Establecer access token.
  setAccessToken(token: string): void {

    this.accessToken = token;

  }

  // Limpiar sesión local.
  clearSession(): void {

    this.accessToken = null;

    this.currentUser = null;

    this.sessionInitialized = false;

  }

  // Solicitar recuperación de contraseña.
  requestPasswordReset(
    email: string
  ): Observable<any> {

    return this.http.post(
      `${this.API_URL}/request-password-reset/`,
      {
        email
      }
    );

  }

  // Restablecer contraseña.
  resetPassword(
    uid: string,
    token: string,
    password: string
  ): Observable<any> {

    return this.http.post(
      `${this.API_URL}/reset-password/`,
      {
        uid,
        token,
        password
      }
    );

  }

  // Cambiar contraseña.
  changePassword(
    current_password: string,
    new_password: string
  ): Observable<any> {

    return this.http.post(
      `${this.API_URL}/change-password/`,
      {
        current_password,
        new_password
      }
    );

  }

  // Activar cuenta.
  activateAccount(
    uid: string,
    token: string,
    password: string
  ): Observable<any> {

    return this.http.post(
      `${this.API_URL}/activate-account/`,
      {
        uid,
        token,
        password
      }
    );

  }

  logout(): Observable<any> {

    return this.http.post(
      `${this.API_URL}/logout/`,
      {},
      {
        withCredentials: true
      }
    ).pipe(

      tap(() => {

        this.clearSession();

      }),

      catchError(error => {

        // Aunque Django responda con error, limpiamos la sesión local.
        this.clearSession();

        return this.handleError(error);

      })
    );
  }

  // Obtener usuario actual.   
  getUser(): any {

    return this.currentUser;

  }

  // Comprobar si el usuario es administrador.
  isAdmin(): boolean {

    return this.currentUser?.role === 'admin';

  }

  // Obtener usuario nuevamente desde Django.
  loadUser(): Observable<any> {

    return this.http.get(
      `${this.API_URL}/user/`,
      {
        withCredentials: true
      }
    ).pipe(

      tap(user => {

        this.currentUser = user;

      })

    );

  }

  // Saber si tenemos access token.
  isAuthenticated(): boolean {

    return !!this.accessToken;

  }

  // Saber si la sesión ya fue inicializada.
  isSessionInitialized(): boolean {

    return this.sessionInitialized;

  }

  // Manejo de errores.   
  private handleError(
    error: HttpErrorResponse
  ) {

    let message =
      'Ocurrió un error inesperado';

    if (error.error?.error) {

      if (
        Array.isArray(
          error.error.error
        )
      ) {

        message =
          error.error.error.join(', ');

      } else {

        message =
          error.error.error;

      }

    } else if (
      error.error?.non_field_errors?.length
    ) {

      message =
        error.error.non_field_errors[0];

    } else if (
      error.status === 0
    ) {

      message =
        'No se pudo conectar con el servidor';

    } else if (
      error.status === 401
    ) {

      message =
        'Sesión expirada';

    } else if (
      error.status >= 500
    ) {

      message =
        'Error interno del servidor';

    }

    return throwError(
      () => message
    );

  }

}