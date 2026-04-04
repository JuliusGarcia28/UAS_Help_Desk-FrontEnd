import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';

@Component({
  standalone: true,
  imports: [CommonModule],
  templateUrl: './assets.html'
})
export class Assets implements OnInit {

  assets: any[] = [];

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.getAssets();
  }

  getAssets() {
    this.http.get<any>('http://127.0.0.1:8000/inventory/')
      .subscribe(res => this.assets = res);
  }

}