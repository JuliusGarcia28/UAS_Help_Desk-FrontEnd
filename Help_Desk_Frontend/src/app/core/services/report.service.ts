import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { Observable } from 'rxjs';

import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ReportService {

  private API =
    `${environment.apiUrl}/reports/`;

  constructor(
    private http: HttpClient
  ) {}

  getDashboard(): Observable<any> {

    return this.http.get(
      `${this.API}dashboard/`
    );

  }

  getTicketsReport(filters?: any): Observable<any> {

    return this.http.get(
      `${this.API}tickets/`,
      {
        params: filters || {}
      }
    );

  }

  getUsersReport(): Observable<any> {

    return this.http.get(
      `${this.API}users/`
    );

  }

  getAssetsReport(): Observable<any> {

    return this.http.get(
      `${this.API}assets/`
    );

  }

}