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

interface RegisterPayload {
  email: string;
  password: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private API_URL = `${environment.apiUrl}/api/auth`;

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

  register(email: string, password: string): Observable<any> {
    const normalizedEmail = email.trim().toLowerCase();

    const payload: RegisterPayload = {
      email: normalizedEmail,
      password
    };

    return this.http.post(`${this.API_URL}/register/`, payload).pipe(
      catchError(this.handleError)
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

  changePassword(password: string): Observable<any> {
    return this.http.post(`${this.API_URL}/change-password/`, { password }).pipe(
      tap(() => {
        // no-op
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

  private handleError(error: HttpErrorResponse) {

    let message = 'Ocurrió un error inesperado';

    if (error.status === 0) {
      message = 'No se pudo conectar con el servidor.';
    }
    else if (error.status === 400) {
      message = error.error?.non_field_errors?.[0] || 'Datos inválidos';
    }
    else if (error.status === 401) {
      message = 'Credenciales incorrectas';
    }
    else if (error.status === 403) {
      message = 'No autorizado';
    }
    else if (error.status === 409) {
      message = 'Ya existe una cuenta con este correo';
    }
    else if (error.status >= 500) {
      message = 'Error del servidor';
    }

    if (error.status === 400 && error.error) {
      const firstError = Object.values(error.error).find(value => Array.isArray(value)) as string[] | undefined;
      if (firstError?.[0]) {
        message = firstError[0];
      }
    }

    return throwError(() => message);
  }
}