import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration, ChartType } from 'chart.js';

import { AdminService } from '../../../core/services/admin.service';
import { TicketService } from '../../../core/services/ticket.service';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, BaseChartDirective],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css'
})
export class Dashboard implements OnInit {

  users: any[] = [];
  tickets: any[] = [];
  assets: any[] = [];
  departments: any[] = [];

  ticketChartType: ChartType = 'doughnut';

  ticketChartData: ChartConfiguration<'doughnut'>['data'] = {
    labels: ['Abiertos', 'En proceso', 'Cerrados'],
    datasets: [
      {
        data: [0, 0, 0],
        backgroundColor: ['#F59E0B', '#3FA7D6', '#10B981']
      }
    ]
  };

  roleChartType: ChartType = 'bar';

  roleChartData: ChartConfiguration<'bar'>['data'] = {
    labels: ['Admins', 'Técnicos', 'Clientes'],
    datasets: [
      {
        label: 'Usuarios',
        data: [0, 0, 0],
        backgroundColor: '#134074'
      }
    ]
  };

  constructor(
    private adminService: AdminService,
    private ticketService: TicketService
  ) {}

  ngOnInit() {
    this.loadData();
  }

  private unwrap(res: any): any[] {
    // 🔥 Soporta API tipo [] o {results: []}
    return Array.isArray(res) ? res : (res?.results ?? []);
  }

  loadData() {

    // USERS
    this.adminService.getUsers().subscribe(res => {
      this.users = this.unwrap(res);

      const admins = this.users.filter(u => u.role === 'admin').length;
      const techs = this.users.filter(u => u.role === 'technician').length;
      const clients = this.users.filter(u => u.role === 'client').length;

      this.roleChartData = {
        ...this.roleChartData,
        datasets: [
          {
            ...this.roleChartData.datasets[0],
            data: [admins, techs, clients]
          }
        ]
      };
    });

    // ASSETS
    this.adminService.getAssets().subscribe(res => {
      this.assets = this.unwrap(res);
    });

    // DEPARTMENTS
    this.adminService.getDepartments().subscribe(res => {
      this.departments = this.unwrap(res);
    });

    // TICKETS
    this.ticketService.getTickets().subscribe(res => {

      this.tickets = this.unwrap(res);

      const open = this.tickets.filter(t => t.status === 1).length;
      const progress = this.tickets.filter(t => t.status === 2).length;
      const closed = this.tickets.filter(t => t.status === 3).length;

      this.ticketChartData = {
        ...this.ticketChartData,
        datasets: [
          {
            ...this.ticketChartData.datasets[0],
            data: [open, progress, closed]
          }
        ]
      };
    });
  }
}