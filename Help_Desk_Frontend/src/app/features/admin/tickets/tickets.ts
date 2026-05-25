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

import Swal from 'sweetalert2';

import {
  TicketService
} from '../../../core/services/ticket.service';

import {
  AdminService
} from '../../../core/services/admin.service';

@Component({
  standalone: true,
  imports: [
    CommonModule,
    FormsModule
  ],
  templateUrl: './tickets.html',
  styleUrl: './../users/users.css'
})
export class Tickets implements OnInit {

  tickets: any[] = [];

  filteredTickets: any[] = [];

  technicians: any[] = [];

  searchTerm = '';

  filterPriority = '';

  filterStatus = '';

  priorityMap: any = {
    1: 'Baja',
    2: 'Media',
    3: 'Alta',
    4: 'Crítica'
  };

  statusMap: any = {
    1: 'Abierto',
    2: 'En proceso',
    3: 'Resuelto',
    4: 'Escalado',
    0: 'Cerrado'
  };

  constructor(
    private ticketService: TicketService,
    private adminService: AdminService
  ) {}

  ngOnInit(): void {

    this.getTickets();

    this.getTechnicians();

  }

  // =========================
  // GET DATA
  // =========================

  getTickets() {

    this.ticketService
      .getTickets()
      .subscribe({

        next: (res) => {

          this.tickets = res;

          this.applyFilters();

        },

        error: () => {

          this.error('Error al obtener tickets');

        }

      });

  }

  getTechnicians() {

    this.adminService
      .getUsers()
      .subscribe({

        next: (res) => {

          this.technicians = res.filter(
            (u: any) =>
              u.role === 'technician' &&
              u.status === 1
          );

        },

        error: () => {

          this.error('Error al obtener técnicos');

        }

      });

  }

  // =========================
  // FILTERS
  // =========================

  applyFilters() {

    this.filteredTickets =
      this.tickets.filter(ticket => {

        const matchSearch =
          (
            ticket.description || ''
          )
          .toLowerCase()
          .includes(
            this.searchTerm.toLowerCase()
          );

        const matchPriority =
          this.filterPriority !== ''
            ? ticket.priority === Number(this.filterPriority)
            : true;

        const matchStatus =
          this.filterStatus !== ''
            ? ticket.status === Number(this.filterStatus)
            : true;

        return (
          matchSearch &&
          matchPriority &&
          matchStatus
        );

      });

  }

  // =========================
  // HELPERS
  // =========================

  success(msg: string) {

    Swal.fire({

      title: msg,

      icon: 'success',

      confirmButtonColor: '#0B2545'

    });

  }

  error(msg: string) {

    Swal.fire({

      title: 'Error',

      text: msg,

      icon: 'error',

      confirmButtonColor: '#0B2545'

    });

  }

  getPriorityClass(priority: number): string {

    switch(priority) {

      case 1:
        return 'active';

      case 2:
        return 'maintenance';

      case 3:
        return 'inactive';

      case 4:
        return 'inactive';

      default:
        return '';

    }

  }

  // =========================
  // HISTORY
  // =========================

  viewHistory(ticket: any) {

    this.ticketService
      .getTicketHistory(ticket.id)
      .subscribe({

        next: (history) => {

          const html = `

            <div class="history-container">

              <div class="history-timeline">

                ${history.map((h: any) => `

                  <div class="timeline-item">

                    <div class="timeline-dot"></div>

                    <div class="timeline-card">

                      <div class="timeline-header">

                        <span class="timeline-date">

                          ${new Date(
                            h.change_date
                          ).toLocaleString()}

                        </span>

                      </div>

                      <div class="timeline-body">

                        <div class="timeline-row">
                          <b>Status:</b>
                          ${this.statusMap[h.status]}
                        </div>

                        <div class="timeline-row">
                          <b>Prioridad:</b>
                          ${this.priorityMap[h.priority]}
                        </div>

                        <div class="timeline-row">
                          <b>Modificado por:</b>
                          ${h.changed_by_email}
                        </div>

                      </div>

                    </div>

                  </div>

                `).join('')}

              </div>

            </div>

          `;

          Swal.fire({

            title: `Historial Ticket #${ticket.id}`,

            html,

            width: '700px',

            confirmButtonColor: '#0B2545'

          });

        },

        error: () => {

          this.error(
            'No se pudo obtener historial'
          );

        }

      });

  }

// =========================
// EDIT
// =========================

editTicket(ticket: any) {

  const technicianOptions =
    this.technicians.map((tech: any) => `

      <option
        value="${tech.id}"
        ${ticket.technician?.id === tech.id ? 'selected' : ''}
      >

        ${tech.first_name}
        ${tech.last_name}

      </option>

    `).join('');

  Swal.fire({

    title: `Ticket #${ticket.id}`,

    html: `

      <div class="swal-form">

        <textarea
          id="description"
          class="swal2-textarea"
          readonly
        >${ticket.description}</textarea>

        <input
          class="swal2-input"
          readonly
          value="${ticket.client?.email || ticket.cliente}"
        >

        <select
          id="technician"
          class="swal2-select"
        >

          <option value="">
            Sin técnico
          </option>

          ${technicianOptions}

        </select>

        <select
          id="priority"
          class="swal2-select"
        >

          <option value="1" ${ticket.priority === 1 ? 'selected' : ''}>
            Baja
          </option>

          <option value="2" ${ticket.priority === 2 ? 'selected' : ''}>
            Media
          </option>

          <option value="3" ${ticket.priority === 3 ? 'selected' : ''}>
            Alta
          </option>

          <option value="4" ${ticket.priority === 4 ? 'selected' : ''}>
            Crítica
          </option>

        </select>

        <select
          id="status"
          class="swal2-select"
        >

          <option value="1" ${ticket.status === 1 ? 'selected' : ''}>
            Abierto
          </option>

          <option value="2" ${ticket.status === 2 ? 'selected' : ''}>
            En proceso
          </option>

          <option value="3" ${ticket.status === 3 ? 'selected' : ''}>
            Resuelto
          </option>

          <option value="4" ${ticket.status === 4 ? 'selected' : ''}>
            Escalado
          </option>

          <option value="0" ${ticket.status === 0 ? 'selected' : ''}>
            Cerrado
          </option>

        </select>

      </div>

    `,

    width: '700px',

    showCancelButton: true,

    confirmButtonColor: '#0B2545',

    preConfirm: () => {

      const technicianElement =
        document.getElementById('technician') as HTMLSelectElement;

      const priorityElement =
        document.getElementById('priority') as HTMLSelectElement;

      const statusElement =
        document.getElementById('status') as HTMLSelectElement;

      return {

        technician:
          technicianElement.value || null,

        priority:
          Number(priorityElement.value),

        status:
          Number(statusElement.value)

      };

    }

  }).then((result) => {

    if (result.isConfirmed) {

      this.ticketService
        .updateTicket(
          ticket.id,
          result.value
        )
        .subscribe({

          next: () => {

            this.success(
              'Ticket actualizado'
            );

            this.getTickets();

          },

          error: () => {

            this.error(
              'No se pudo actualizar'
            );

          }

        });

    }

  });

}

}