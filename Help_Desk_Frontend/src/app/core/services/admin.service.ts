import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AdminService {

  private USERS_API = `${environment.apiUrl}/users/`;
  private ASSETS_API = `${environment.apiUrl}/inventory/`;
  private DEPARTMENTS_API = `${environment.apiUrl}/departments/`;

  constructor(private http: HttpClient) {}

  // ================= USERS =================

  getUsers(): Observable<any> {
    return this.http.get(this.USERS_API);
  }

  createUser(data: any): Observable<any> {
    return this.http.post(this.USERS_API, data);
  }

  updateUser(id: string, data: any): Observable<any> {
    return this.http.patch(`${this.USERS_API}${id}/`, data);
  }

  toggleUser(id: string, status: number): Observable<any> {
    return this.http.patch(`${this.USERS_API}${id}/`, { status });
  }

  // ================= ASSETS =================

  getAssets(): Observable<any> {
    return this.http.get(this.ASSETS_API);
  }

  createAsset(data: any): Observable<any> {
    return this.http.post(this.ASSETS_API, data);
  }

  updateAsset(id: string, data: any): Observable<any> {
    return this.http.patch(`${this.ASSETS_API}${id}/`, data);
  }

  toggleAsset(id: string, status: number): Observable<any> {
    return this.http.patch(`${this.ASSETS_API}${id}/`, { status });
  }

  // ================= DEPARTMENTS =================

  getDepartments(): Observable<any> {
    return this.http.get(this.DEPARTMENTS_API);
  }

  createDepartment(data: any): Observable<any> {
    return this.http.post(this.DEPARTMENTS_API, data);
  }

  updateDepartment(id: string, data: any): Observable<any> {
    return this.http.patch(`${this.DEPARTMENTS_API}${id}/`, data);
  }

  toggleDepartment(id: string, status: number): Observable<any> {
    return this.http.patch(`${this.DEPARTMENTS_API}${id}/`, { status });
  }
}