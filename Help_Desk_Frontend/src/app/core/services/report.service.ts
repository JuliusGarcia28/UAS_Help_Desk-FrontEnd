import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { Observable } from 'rxjs';

import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ReportService {

  private readonly API =
    `${environment.apiUrl}/reports/`;

  constructor(
    private http: HttpClient
  ) {}

  /* ==========================================================
      DASHBOARD
  ========================================================== */

  getDashboard(): Observable<any> {

    return this.http.get(
      `${this.API}dashboard/`
    );

  }

  /* ==========================================================
      TICKETS POR ESTADO
  ========================================================== */

  getTicketsByStatus(): Observable<any[]> {

    return this.http.get<any[]>(
      `${this.API}tickets-status/`
    );

  }

  /* ==========================================================
      TICKETS POR CATEGORÍA
  ========================================================== */

  getTicketsByCategory(): Observable<any[]> {

    return this.http.get<any[]>(
      `${this.API}tickets-category/`
    );

  }

  /* ==========================================================
      TICKETS POR PRIORIDAD
  ========================================================== */

  getTicketsByPriority(): Observable<any[]> {

    return this.http.get<any[]>(
      `${this.API}tickets-priority/`
    );

  }

  /* ==========================================================
      TICKETS POR TÉCNICO
  ========================================================== */

  getTicketsByTechnician(): Observable<any[]> {

    return this.http.get<any[]>(
      `${this.API}tickets-technician/`
    );

  }

  /* ==========================================================
      TICKETS POR DEPARTAMENTO
  ========================================================== */

  getTicketsByDepartment(): Observable<any[]> {

    return this.http.get<any[]>(
      `${this.API}tickets-department/`
    );

  }

  /* ==========================================================
      TICKETS POR MES
  ========================================================== */

  getTicketsByMonth(): Observable<any[]> {

    return this.http.get<any[]>(
      `${this.API}tickets-month/`
    );

  }

  /* ==========================================================
      TIEMPO PROMEDIO DE RESOLUCIÓN
  ========================================================== */

  getAverageResolution(): Observable<any> {

    return this.http.get(
      `${this.API}avg-resolution/`
    );

  }

}