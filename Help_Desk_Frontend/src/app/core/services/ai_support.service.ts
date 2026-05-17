import { Injectable } from '@angular/core';

import { HttpClient } from '@angular/common/http';

import { Observable } from 'rxjs';

import { environment } from '../../environments/environment';


@Injectable({
  providedIn: 'root'
})
export class AiSupportService {

  private API = `${environment.apiUrl}/support-ai`;

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

}