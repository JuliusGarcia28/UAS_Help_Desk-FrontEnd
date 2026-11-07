import { CountUpDirective } from '../../../core/directives/count-up.directive';
import { Component, OnInit, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';

import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration, ChartOptions, ChartType } from 'chart.js';
import { ThemeService } from '../../../core/services/theme.service';

import { AdminService } from '../../../core/services/admin.service';
import { TicketService } from '../../../core/services/ticket.service';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, BaseChartDirective, CountUpDirective],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css'
})
export class Dashboard implements OnInit {

  private readonly themeService = inject(ThemeService);

  /** Lee un token de color del tema activo. */
  private cssVar(name: string): string {
    return getComputedStyle(document.body).getPropertyValue(name).trim();
  }

  readonly doughnutOptions = computed<ChartOptions>(() => {
    this.themeService.theme(); // se recalcula al cambiar el tema
    return {
      responsive: true,
      maintainAspectRatio: false,
      cutout: '68%',
      animation: { duration: 900, easing: 'easeOutQuart' },
      plugins: {
        legend: {
          position: 'bottom',
          labels: { color: this.cssVar('--text-secondary'), usePointStyle: true, padding: 18 }
        }
      }
    };
  });

  readonly barOptions = computed<ChartOptions>(() => {
    this.themeService.theme();
    const grid = this.cssVar('--border');
    const text = this.cssVar('--text-secondary');
    return {
      responsive: true,
      maintainAspectRatio: false,
      animation: { duration: 900, easing: 'easeOutQuart' },
      plugins: { legend: { display: false } },
      scales: {
        x: { ticks: { color: text }, grid: { display: false } },
        y: { beginAtZero: true, ticks: { color: text, precision: 0 }, grid: { color: grid } }
      }
    };
  });

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
        backgroundColor: ['#F59E0B', '#3FA7D6', '#10B981'],
        borderWidth: 0,
        hoverOffset: 8
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
        backgroundColor: ['#134074', '#3FA7D6', '#7FD1F5'],
        borderRadius: 8,
        maxBarThickness: 56
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