import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { LayoutBase } from '../layout-base';

@Component({
  selector: 'app-client-layout',
  standalone: true,
  imports: [RouterModule],
  templateUrl: './client-layout.html',
  styleUrl: './client-layout.css'
})
export class ClientLayout extends LayoutBase {}
