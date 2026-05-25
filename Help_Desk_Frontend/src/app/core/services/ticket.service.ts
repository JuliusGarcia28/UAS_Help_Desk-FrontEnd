import { Injectable } from '@angular/core';

import { HttpClient } from '@angular/common/http';

import { Observable } from 'rxjs';

import { environment } from '../../environments/environment';

import {
  Ticket,
  TicketHistory
} from '../models/ticket.model';

@Injectable({
  providedIn: 'root'
})
export class TicketService {

  private API = `${environment.apiUrl}/tickets/`;

  constructor(
    private http: HttpClient
  ) {}

  getTickets(): Observable<Ticket[]> {

    return this.http.get<Ticket[]>(this.API);

  }

  createTicket(
    data: Partial<Ticket>
  ): Observable<Ticket> {

    return this.http.post<Ticket>(
      this.API,
      data
    );

  }

  updateTicket(
    id: string,
    data: any
  ): Observable<any> {

    return this.http.patch(
      `${this.API}${id}/`,
      data
    );

  }

  getTicketHistory(
    id: string
  ): Observable<TicketHistory[]> {

    return this.http.get<TicketHistory[]>(
      `${this.API}${id}/history/`
    );

  }

}