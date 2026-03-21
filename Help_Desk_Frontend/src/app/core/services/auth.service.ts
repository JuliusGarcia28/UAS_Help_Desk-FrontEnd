import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError, tap } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private API_URL = 'http://127.0.0.1:8000/auth';

  constructor(private http: HttpClient) {}

  login(email: string, password: string): Observable<any> {
    return this.http.post<any>(`${this.API_URL}/login/`, {
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

  private handleError(error: HttpErrorResponse) {

  let message = 'Ocurrió un error inesperado';

  // BACKEND CAÍDO / SIN CONEXIÓN
  if (error.status === 0) {
    message = 'No se pudo conectar con el servidor. Verifica tu conexion.';
  }

  // ERROR 400 (VALIDACIÓN / LOGIN)
  else if (error.status === 400) {
    if (error.error?.non_field_errors) {
      message = error.error.non_field_errors[0];
    } else if (error.error?.detail) {
      message = error.error.detail;
    } else {
      message = 'Datos inválidos';
    }
  }

  // NO AUTORIZADO
  else if (error.status === 401) {
    message = 'Credenciales incorrectas';
  }

  // PROHIBIDO
  else if (error.status === 403) {
    message = 'No tienes permisos para realizar esta acción';
  }

  // ERROR DEL SERVIDOR
  else if (error.status >= 500) {
    message = 'Error interno del servidor';
  }

  return throwError(() => message);
  }
}