import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { LayoutBase } from '../layout-base';

@Component({
  selector: 'app-technician-layout',
  standalone: true,
  imports: [RouterModule],
  templateUrl: './technician-layout.html',
  styleUrl: './technician-layout.css'
})
export class TechnicianLayout extends LayoutBase {}
