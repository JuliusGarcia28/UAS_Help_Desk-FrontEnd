import { Injectable } from '@angular/core';

import {
  HttpClient
} from '@angular/common/http';

import {
  Observable
} from 'rxjs';

import {
  environment
} from '../../environments/environment';

import {
  Ticket
} from '../models/ticket.model';


@Injectable({
  providedIn: 'root'
})
export class AiSupportService {

  private API = `${environment.apiUrl}/support-ai`;

  private TICKET_API = `${environment.apiUrl}/tickets/`;

  constructor(
    private http: HttpClient
  ) {}

  sendMessage(
    message: string,
    asset_id: string
  ): Observable<any> {

    return this.http.post(
      `${this.API}/chat/`,
      {
        message,
        asset_id
      }
    );

  }

  escalate(
    sessionId: string
  ): Observable<any> {

    return this.http.post(
      `${this.API}/${sessionId}/escalate/`,
      {}
    );

  }

  solved(
    sessionId: string
  ): Observable<any> {

    return this.http.post(
      `${this.API}/${sessionId}/solved/`,
      {}
    );

  }

  /*
    CREAR TICKET MANUAL
  */
  createManualTicket(
    description: string
  ): Observable<Ticket> {

    return this.http.post<Ticket>(
      this.TICKET_API,
      {
        description,
        priority: 2
      }
    );

  }

  getSessions(): Observable<any[]> {

    return this.http.get<any[]>(
      `${this.API}/sessions/`
    );

  }

  getSession(id: string): Observable<any> {

    return this.http.get(
      `${this.API}/sessions/${id}/`
    );

  }

}