import { Component, OnDestroy, OnInit, effect, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { forkJoin } from 'rxjs';

import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Chart, ChartConfiguration } from 'chart.js';

import { TicketService } from '../../../core/services/ticket.service';
import { AdminService } from '../../../core/services/admin.service';
import { ReportService } from '../../../core/services/report.service';
import { ThemeService } from '../../../core/services/theme.service';
import { CountUpDirective } from '../../../core/directives/count-up.directive';
import { toastError, toastSuccess } from '../../../core/utils/swal';
import {
  PRIORITY_LABEL,
  STATUS_LABEL,
  priorityClass,
  statusClass
} from '../../../core/utils/modal-html';

interface ChartCard {
  id: string;
  title: string;
  icon: string;
}

@Component({
  selector: 'app-reports',
  standalone: true,
  imports: [CommonModule, FormsModule, CountUpDirective],
  templateUrl: './reports.html',
  styleUrl: './reports.css'
})
export class Reports implements OnInit, OnDestroy {

  private readonly reportService = inject(ReportService);
  private readonly ticketService = inject(TicketService);
  private readonly adminService = inject(AdminService);
  private readonly themeService = inject(ThemeService);

  /*==================================================
      KPI
  ==================================================*/

  dashboard: any = {};

  averageResolution = 0;

  loading = true;

  /** Tarjetas de gráficas (el orden define el layout). */
  readonly chartCards: ChartCard[] = [
    { id: 'chartStatus', title: 'Tickets por estado', icon: 'donut_large' },
    { id: 'chartPriority', title: 'Tickets por prioridad', icon: 'flag' },
    { id: 'chartMonth', title: 'Evolución mensual', icon: 'show_chart' },
    { id: 'chartCategory', title: 'Tickets por categoría', icon: 'category' },
    { id: 'chartTechnician', title: 'Tickets por técnico', icon: 'engineering' },
    { id: 'chartDepartment', title: 'Tickets por departamento', icon: 'apartment' }
  ];

  /** Gráficas sin datos: se muestra un mensaje en lugar del canvas vacío. */
  emptyCharts = new Set<string>();

  private charts = new Map<string, Chart>();

  /*==================================================
      DATOS PARA GRÁFICAS
  ==================================================*/

  ticketsStatus: any[] = [];
  ticketsCategory: any[] = [];
  ticketsPriority: any[] = [];
  ticketsTechnician: any[] = [];
  ticketsDepartment: any[] = [];
  ticketsMonth: any[] = [];

  /*==================================================
      TABLA
  ==================================================*/

  tickets: any[] = [];
  filteredTickets: any[] = [];

  /*==================================================
      FILTROS
  ==================================================*/

  search = '';
  status = '';
  department = '';
  departments: any[] = [];

  readonly statusLabel = STATUS_LABEL;
  readonly priorityLabel = PRIORITY_LABEL;
  readonly statusCss = statusClass;
  readonly priorityCss = priorityClass;

  private dataReady = false;

  constructor() {

    // Las gráficas leen colores del tema: se redibujan al cambiarlo.
    effect(() => {
      this.themeService.theme();
      if (this.dataReady) {
        setTimeout(() => this.renderCharts());
      }
    });

  }

  ngOnInit(): void {
    this.loadDashboard();
    this.loadTickets();
    this.loadDepartments();
  }

  ngOnDestroy(): void {
    this.charts.forEach(chart => chart.destroy());
    this.charts.clear();
  }

  /*==================================================
      HELPERS
  ==================================================*/

  private unwrap(res: any): any[] {
    return Array.isArray(res) ? res : res?.results ?? [];
  }

  private css(name: string): string {
    return getComputedStyle(document.body).getPropertyValue(name).trim();
  }

  formatResolutionTime(resolutionTime: number | string | null | undefined): string {

    if (resolutionTime === null || resolutionTime === undefined || resolutionTime === '') {
      return 'Sin datos';
    }

    const hours = Number(resolutionTime);

    if (isNaN(hours)) {
      return 'Sin datos';
    }

    const wholeHours = Math.floor(hours);
    const minutes = Math.round((hours - wholeHours) * 60);

    if (wholeHours === 0 && minutes === 0) return '0 min';
    if (wholeHours === 0) return `${minutes} min`;
    if (minutes === 0) return `${wholeHours} h`;

    return `${wholeHours} h ${minutes} min`;
  }

  /** Estados/prioridades pueden llegar como número o ya como texto. */
  private labelFor(map: Record<number, string>, value: any, prefix = ''): string {
    const n = Number(value);
    return !isNaN(n) && map[n] ? map[n] : `${prefix}${value}`;
  }

  /*==================================================
      CARGA DE DATOS
  ==================================================*/

  loadDashboard(): void {

    this.loading = true;

    forkJoin({
      dashboard: this.reportService.getDashboard(),
      status: this.reportService.getTicketsByStatus(),
      category: this.reportService.getTicketsByCategory(),
      priority: this.reportService.getTicketsByPriority(),
      technician: this.reportService.getTicketsByTechnician(),
      department: this.reportService.getTicketsByDepartment(),
      month: this.reportService.getTicketsByMonth(),
      resolution: this.reportService.getAverageResolution()
    }).subscribe({

      next: res => {

        this.dashboard = res.dashboard;
        this.ticketsStatus = res.status;
        this.ticketsCategory = res.category;
        this.ticketsPriority = res.priority;
        this.ticketsTechnician = res.technician;
        this.ticketsDepartment = res.department;
        this.ticketsMonth = res.month;
        this.averageResolution = Number(res.resolution?.avg ?? 0);

        this.loading = false;
        this.dataReady = true;

        // Los canvas existen cuando termina el ciclo de detección de cambios.
        setTimeout(() => this.renderCharts());
      },

      error: () => {
        this.loading = false;
        toastError('No se pudieron cargar los reportes');
      }

    });
  }

  loadTickets(): void {

    this.ticketService.getTickets().subscribe(res => {
      this.tickets = this.unwrap(res);
      this.applyFilters();
    });

  }

  loadDepartments(): void {

    this.adminService.getDepartments().subscribe(res => {
      this.departments = this.unwrap(res);
    });

  }

  /*==================================================
      GRÁFICAS
  ==================================================*/

  private palette(): string[] {
    return ['#3FA7D6', '#134074', '#F59E0B', '#10B981', '#8B5CF6', '#EF4444', '#06B6D4', '#EC4899'];
  }

  private baseOptions(withScales: boolean): ChartConfiguration['options'] {

    const text = this.css('--text-secondary');
    const grid = this.css('--border');

    return {
      responsive: true,
      maintainAspectRatio: false,
      animation: { duration: 900, easing: 'easeOutQuart' },
      plugins: {
        legend: {
          display: !withScales,
          position: 'bottom',
          labels: { color: text, usePointStyle: true, padding: 16 }
        },
        tooltip: { padding: 10, cornerRadius: 8 }
      },
      ...(withScales
        ? {
            scales: {
              x: { ticks: { color: text }, grid: { display: false } },
              y: { beginAtZero: true, ticks: { color: text, precision: 0 }, grid: { color: grid } }
            }
          }
        : {})
    };
  }

  private build(
    id: string,
    rows: any[],
    config: (labels: string[], values: number[]) => ChartConfiguration,
    labelOf: (row: any) => string
  ): void {

    this.charts.get(id)?.destroy();
    this.charts.delete(id);

    const total = rows.reduce((acc, r) => acc + Number(r.total ?? 0), 0);

    if (!rows.length || total === 0) {
      this.emptyCharts.add(id);
      return;
    }

    this.emptyCharts.delete(id);

    // El canvas aparece al quitar el estado vacío: se espera al siguiente ciclo.
    setTimeout(() => {

      const canvas = document.getElementById(id) as HTMLCanvasElement | null;
      if (!canvas) return;

      const labels = rows.map(labelOf);
      const values = rows.map(r => Number(r.total ?? 0));

      this.charts.set(id, new Chart(canvas, config(labels, values)));

    });
  }

  private renderCharts(): void {

    const colors = this.palette();
    const surface = this.css('--surface');

    // Estado
    this.build('chartStatus', this.ticketsStatus, (labels, values) => ({
      type: 'doughnut',
      data: {
        labels,
        datasets: [{
          data: values,
          backgroundColor: colors,
          borderColor: surface,
          borderWidth: 3,
          hoverOffset: 8
        }]
      },
      options: { ...this.baseOptions(false), cutout: '66%' }
    }), r => this.labelFor(STATUS_LABEL, r.status));

    // Prioridad
    this.build('chartPriority', this.ticketsPriority, (labels, values) => ({
      type: 'bar',
      data: {
        labels,
        datasets: [{
          label: 'Tickets',
          data: values,
          backgroundColor: ['#94A3B8', '#3FA7D6', '#F59E0B', '#EF4444'],
          borderRadius: 8,
          maxBarThickness: 54
        }]
      },
      options: this.baseOptions(true)
    }), r => this.labelFor(PRIORITY_LABEL, r.priority, 'Prioridad '));

    // Categoría
    this.build('chartCategory', this.ticketsCategory, (labels, values) => ({
      type: 'pie',
      data: {
        labels,
        datasets: [{
          data: values,
          backgroundColor: colors,
          borderColor: surface,
          borderWidth: 3,
          hoverOffset: 8
        }]
      },
      options: this.baseOptions(false)
    }), r => String(r.category ?? 'Sin categoría'));

    // Técnico
    this.build('chartTechnician', this.ticketsTechnician, (labels, values) => ({
      type: 'bar',
      data: {
        labels,
        datasets: [{
          label: 'Tickets',
          data: values,
          backgroundColor: '#134074',
          borderRadius: 8,
          maxBarThickness: 46
        }]
      },
      options: { ...this.baseOptions(true), indexAxis: 'y' }
    }), r => `${r.technician__first_name ?? ''} ${r.technician__last_name ?? ''}`.trim() || 'Sin asignar');

    // Departamento
    this.build('chartDepartment', this.ticketsDepartment, (labels, values) => ({
      type: 'bar',
      data: {
        labels,
        datasets: [{
          label: 'Tickets',
          data: values,
          backgroundColor: '#3FA7D6',
          borderRadius: 8,
          maxBarThickness: 46
        }]
      },
      options: this.baseOptions(true)
    }), r => r['cliente__department__name'] || 'Sin departamento');

    // Mes
    this.build('chartMonth', this.ticketsMonth, (labels, values) => {

      const accent = this.css('--accent');

      return {
        type: 'line',
        data: {
          labels,
          datasets: [{
            label: 'Tickets',
            data: values,
            borderColor: accent,
            backgroundColor: accent + '26',
            pointBackgroundColor: accent,
            pointRadius: 4,
            pointHoverRadius: 6,
            fill: true,
            tension: 0.38
          }]
        },
        options: this.baseOptions(true)
      };

    }, r => new Date(r.month).toLocaleDateString('es-MX', { month: 'short', year: 'numeric' }));
  }

  /*==================================================
      FILTROS
  ==================================================*/

  applyFilters(): void {

    const term = this.search.trim().toLowerCase();

    this.filteredTickets = this.tickets.filter(ticket => {

      const statusMatch = this.status ? String(ticket.status) === this.status : true;

      const departmentMatch = this.department
        ? String(ticket.client?.department?.id) === this.department
        : true;

      const searchMatch = term
        ? `${ticket.code} ${ticket.description} ${ticket.client?.email ?? ''}`.toLowerCase().includes(term)
        : true;

      return statusMatch && departmentMatch && searchMatch;
    });

  }

  clearFilters(): void {
    this.search = '';
    this.status = '';
    this.department = '';
    this.applyFilters();
  }

  get hasFilters(): boolean {
    return !!(this.search || this.status || this.department);
  }

  /*==================================================
      EXPORTACIÓN
  ==================================================*/

  private exportRows(): any[][] {

    return this.filteredTickets.map(t => [
      t.code,
      t.description,
      this.labelFor(PRIORITY_LABEL, t.priority, ''),
      this.labelFor(STATUS_LABEL, t.status),
      t.client?.email ?? 'N/A',
      t.client?.department?.name ?? 'N/A'
    ]);

  }

  private readonly exportHead = ['Código', 'Descripción', 'Prioridad', 'Estado', 'Cliente', 'Departamento'];

  exportExcel(): void {

    if (!this.filteredTickets.length) {
      toastError('No hay tickets para exportar');
      return;
    }

    const data = this.exportRows().map(row =>
      Object.fromEntries(this.exportHead.map((h, i) => [h, row[i]]))
    );

    const ws = XLSX.utils.json_to_sheet(data);
    ws['!cols'] = [{ wch: 12 }, { wch: 60 }, { wch: 12 }, { wch: 14 }, { wch: 30 }, { wch: 26 }];

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Tickets');
    XLSX.writeFile(wb, 'ReporteTickets.xlsx');

    toastSuccess('Excel generado');
  }

  exportPDF(): void {

    if (!this.filteredTickets.length) {
      toastError('No hay tickets para exportar');
      return;
    }

    const pdf = new jsPDF({ orientation: 'landscape' });

    pdf.setFontSize(18);
    pdf.text('Reporte General de Tickets', 14, 18);

    pdf.setFontSize(10);
    pdf.setTextColor(110);
    pdf.text(
      `Generado: ${new Date().toLocaleString('es-MX')}  ·  ${this.filteredTickets.length} tickets`,
      14,
      25
    );

    autoTable(pdf, {
      startY: 31,
      head: [this.exportHead],
      body: this.exportRows(),
      headStyles: { fillColor: [11, 37, 69] },
      styles: { fontSize: 9, cellPadding: 3 },
      columnStyles: { 1: { cellWidth: 90 } }
    });

    pdf.save('ReporteTickets.pdf');

    toastSuccess('PDF generado');
  }

}
