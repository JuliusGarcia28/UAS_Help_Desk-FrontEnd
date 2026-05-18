import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Ticket, TicketHistory } from '../models/ticket.model';

@Injectable({
  providedIn: 'root'
})
export class TicketService {

  private API = `${environment.apiUrl}/api/tickets/`;

  constructor(private http: HttpClient) {}

  getTickets(): Observable<Ticket[]> {
    return this.http.get<Ticket[]>(this.API);
  }

  createTicket(data: Partial<Ticket>): Observable<Ticket> {
    return this.http.post<Ticket>(this.API, data);
  }

  updateTicketStatus(id: string, status: number): Observable<Ticket> {
    return this.http.patch<Ticket>(`${this.API}${id}/`, { status });
  }
  getTicketHistory(id: string): Observable<TicketHistory[]> {
    return this.http.get<TicketHistory[]>(`${this.API}${id}/history/`);
  }
}