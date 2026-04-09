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
    else if (error.status >= 500) {
      message = 'Error del servidor';
    }

    return throwError(() => message);
  }
}