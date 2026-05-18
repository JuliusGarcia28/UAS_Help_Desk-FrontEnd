import { Injectable } from '@angular/core';

import { HttpClient } from '@angular/common/http';

import { Observable } from 'rxjs';

import { environment } from '../../environments/environment';

import { Asset } from '../models/asset.model';


@Injectable({
  providedIn: 'root'
})
export class AssetService {

  private API = `${environment.apiUrl}/inventory`;

  constructor(
    private http: HttpClient
  ) {}

  getAssets(): Observable<Asset[]> {

    return this.http.get<Asset[]>(
      `${this.API}/`
    );

  }

  getAssetById(
    id: string
  ): Observable<Asset> {

    return this.http.get<Asset>(
      `${this.API}/${id}/`
    );

  }

}