import {
  Component,
  OnInit
} from '@angular/core';

import {
  CommonModule
} from '@angular/common';

import {
  FormsModule
} from '@angular/forms';

import {
  forkJoin
} from 'rxjs';

import * as XLSX from 'xlsx';

import jsPDF from 'jspdf';

import autoTable from 'jspdf-autotable';

import {
  TicketService
} from '../../../core/services/ticket.service';

import {
  AdminService
} from '../../../core/services/admin.service';

import {
  ReportService
} from '../../../core/services/report.service';

import { Chart } from 'chart.js';

@Component({
  selector: 'app-reports',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule
  ],
  templateUrl: './reports.html',
  styleUrl: './reports.css'
})

export class Reports implements OnInit {

  /*==================================================
      KPI
  ==================================================*/

  dashboard: any = {};

  averageResolution = 0;

  /* Charts */
  private statusChart?: Chart;
  private priorityChart?: Chart;
  private categoryChart?: Chart;
  private technicianChart?: Chart;
  private departmentChart?: Chart;
  private monthChart?: Chart;

  /*==================================================
      CHART DATA
  ==================================================*/

  ticketsStatus: any[] = [];

  ticketsCategory: any[] = [];

  ticketsPriority: any[] = [];

  ticketsTechnician: any[] = [];

  ticketsDepartment: any[] = [];

  ticketsMonth: any[] = [];

  /*==================================================
      TABLE
  ==================================================*/

  tickets: any[] = [];

  filteredTickets: any[] = [];

  /*==================================================
      FILTERS
  ==================================================*/

  status = '';

  department = '';

  departments: any[] = [];

  loading = true;

  constructor(

    private reportService: ReportService,

    private ticketService: TicketService,

    private adminService: AdminService

  ) {}

  ngOnInit(): void {

    this.loadDashboard();

    this.loadTickets();

    this.loadDepartments();

  }

  formatResolutionTime( resolutionTime: number | string | null | undefined ):
   
    string { 
      if ( resolutionTime === null || resolutionTime === undefined || resolutionTime === '' ) {
        return 'Sin datos'; 
      } 
      
      const hours = Number(resolutionTime); 
      
      if (isNaN(hours)) { 
        return 'Sin datos'; 
      } 
      
      const wholeHours = Math.floor(hours); 
      
      const minutes = Math.round( (hours - wholeHours) * 60 ); 
      
      if (wholeHours === 0 && minutes === 0) { 
        return '0 min'; } if (wholeHours === 0) { 
          return `${minutes} min`; 
        } 
        
        if (minutes === 0) { 
          return `${wholeHours} h`; 
        } 
        
        return `${wholeHours} h ${minutes} min`; 
      }

  /*==================================================
      HELPERS
  ==================================================*/

  private unwrap(res: any): any[] {

    return Array.isArray(res)
      ? res
      : res?.results ?? [];

  }

  /*==================================================
      LOAD DASHBOARD
  ==================================================*/

  loadDashboard(): void {

    this.loading = true;

    forkJoin({

      dashboard:

        this.reportService.getDashboard(),

      status:

        this.reportService.getTicketsByStatus(),

      category:

        this.reportService.getTicketsByCategory(),

      priority:

        this.reportService.getTicketsByPriority(),

      technician:

        this.reportService.getTicketsByTechnician(),

      department:

        this.reportService.getTicketsByDepartment(),

      month:

        this.reportService.getTicketsByMonth(),

      resolution:

        this.reportService.getAverageResolution()

    }).subscribe({

      next: res => {

        this.dashboard =

          res.dashboard;

        this.ticketsStatus =

          res.status;

        this.ticketsCategory =

          res.category;

        this.ticketsPriority =

          res.priority;

        this.ticketsTechnician =

          res.technician;

        this.ticketsDepartment =

          res.department;

        this.ticketsMonth =

          res.month;

        this.averageResolution =
  
          Number(res.resolution.avg ?? 0);

          // Create charts after data is loaded
          this.createStatusChart();
          this.createPriorityChart();
          this.createCategoryChart();
          this.createTechnicianChart();
          this.createDepartmentChart();
          this.createMonthChart();

        this.loading = false;

      },

      error: () => {

        this.loading = false;

      }

    });
  }

  /* Grafica de Estatus */
  createStatusChart() {

  this.statusChart?.destroy();

  this.statusChart = new Chart('chartStatus', {

    type: 'doughnut',

    data: {

      labels: this.ticketsStatus.map(x => x.status),

      datasets: [{

        data: this.ticketsStatus.map(x => x.total),

        backgroundColor: [

          '#ef4444',

          '#f59e0b',

          '#10b981'

        ]

      }]

    }

  });

}

  /* Grafica de categoria */
  createCategoryChart(){

  this.categoryChart?.destroy();

  this.categoryChart = new Chart('chartCategory',{

    type:'pie',

    data:{

      labels:this.ticketsCategory.map(x=>x.category),

      datasets:[{

        data:this.ticketsCategory.map(x=>x.total)

      }]

    }

 });

}

/* Grafica de Prioridad */
createPriorityChart() {

  this.priorityChart?.destroy();

  this.priorityChart = new Chart('chartPriority', {

    type:'bar',

    data:{

      labels:this.ticketsPriority.map(x=>'Prioridad '+x.priority),

      datasets:[{

        label:'Tickets',

        data:this.ticketsPriority.map(x=>x.total),

        backgroundColor:'#2563eb'

      }]

    }

  });

}

/* Grafica de Tecnico */
createTechnicianChart(){

 this.technicianChart?.destroy();

 this.technicianChart = new Chart('chartTechnician',{

   type:'bar',

   data:{

      labels:this.ticketsTechnician.map(

      x=>`${x.technician__first_name} ${x.technician__last_name}`),

      datasets:[{

         data:this.ticketsTechnician.map(x=>x.total),

         label:'Tickets'

      }]

   }

 });

}

/* Grafica de Departamento */
createDepartmentChart(){

 this.departmentChart?.destroy();

 this.departmentChart = new Chart('chartDepartment',{

   type:'bar',

   data:{

      labels:this.ticketsDepartment.map(

      x=>x["cliente__department__name"]),

      datasets:[{

        data:this.ticketsDepartment.map(x=>x.total),

        label:'Tickets'

      }]

   }

 });

}

/* Grafica de Mes */
createMonthChart(){

 this.monthChart?.destroy();

 this.monthChart = new Chart('chartMonth',{

   type:'line',

   data:{

      labels:this.ticketsMonth.map(x=>

      new Date(x.month).toLocaleDateString('es-MX',{

         month:'short',

         year:'numeric'

      })),

      datasets:[{

          label:'Tickets',

          data:this.ticketsMonth.map(x=>x.total),

          borderColor:'#2563eb',

          fill:false,

          tension:.4

      }]

   }

 });

}

  /*==================================================
      LOAD TABLE
  ==================================================*/

  loadTickets(): void {

    this.ticketService
      .getTickets()
      .subscribe(res => {

        this.tickets =

          this.unwrap(res);

        this.filteredTickets =

          [...this.tickets];

      });

  }

  /*==================================================
      DEPARTMENTS
  ==================================================*/

  loadDepartments(): void {

    this.adminService
      .getDepartments()
      .subscribe(res => {

        this.departments =

          this.unwrap(res);

      });
  }

  /*==================================================
      FILTERS
  ==================================================*/

  applyFilters(): void {

    this.filteredTickets =

      this.tickets.filter(ticket => {

        const statusMatch =

          this.status

          ? String(ticket.status) === this.status

          : true;

        const departmentMatch =

          this.department

          ? String(ticket.client?.department?.id) === this.department

          : true;

        return (

          statusMatch &&

          departmentMatch

        );

      });

  }

  /*==================================================
      EXPORT EXCEL
  ==================================================*/

  exportExcel(): void {

    const data =

      this.filteredTickets.map(ticket => ({

        Código:

          ticket.code,

        Descripción:

          ticket.description,

        Estado:

          ticket.status === 1

            ? 'Abierto'

            : ticket.status === 2

            ? 'En proceso'

            : 'Resuelto',

        Departamento:

          ticket.client?.department?.name ??

          'N/A'

      }));

    const ws =

      XLSX.utils.json_to_sheet(data);

    const wb =

      XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(

      wb,

      ws,

      'Tickets'

    );

    XLSX.writeFile(

      wb,

      'ReporteTickets.xlsx'

    );

  }

  /*==================================================
      EXPORT PDF
  ==================================================*/

  exportPDF(): void {

    const pdf =

      new jsPDF();

    pdf.setFontSize(18);

    pdf.text(

      'Reporte General de Tickets',

      14,

      20

    );

    autoTable(pdf, {

      startY: 30,

      head: [[
        'Código',

        'Descripción',

        'Estado',

        'Departamento'

      ]],

      body:

        this.filteredTickets.map(t => [
          t.code,

          t.description,

          t.status === 1

            ? 'Abierto'

            : t.status === 2

            ? 'En proceso'

            : 'Resuelto',

          t.client?.department?.name ??

          'N/A'

        ])

    });

    pdf.save(

      'ReporteTickets.pdf'

    );

  }

}