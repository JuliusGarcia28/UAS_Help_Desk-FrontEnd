import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError, tap } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../environments/environment';

interface LoginResponse {
  user: any;
  access: string;
  refresh: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private API_URL = `${environment.apiUrl}/auth`;

  constructor(private http: HttpClient) {}

  login(email: string, password: string): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.API_URL}/login/`, {
      email,
      password
    }).pipe(
      tap(res => {
        localStorage.setItem('access', res.access);
        localStorage.setItem('refresh', res.refresh);
        localStorage.setItem('user', JSON.stringify(res.user));
      }),
      catchError(this.handleError)
    );
  }

  requestPasswordReset(
    email: string
  ): Observable<any> {

    return this.http.post(
      `${this.API_URL}/request-password-reset/`,
      { email }
    );
  }

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
    const refresh = localStorage.getItem('refresh');

    return this.http.post(`${this.API_URL}/logout/`, { refresh }).pipe(
      tap(() => {
        localStorage.clear();
      }),
      catchError(this.handleError)
    );
  }

  getUser() {
    return JSON.parse(localStorage.getItem('user') || 'null');
  }

  isAdmin(): boolean {
    const user = this.getUser();
    return user?.role === 'admin';
  }

  loadUser(): Observable<any> {

    return this.http.get(
      `${this.API_URL}/user/`
    );
  }

  private handleError(error: HttpErrorResponse) {

    let message = 'Ocurrió un error inesperado';

    if (error.error?.error) {

      if (Array.isArray(error.error.error)) {
        message = error.error.error.join(', ');
      } else {
        message = error.error.error;
      }

    } else if (error.error?.non_field_errors?.length) {

      message = error.error.non_field_errors[0];

    } else if (error.status === 0) {

      message =
        'No se pudo conectar con el servidor';

    } else if (error.status >= 500) {

      message =
        'Error interno del servidor';
    }

    return throwError(() => message);
  }
}