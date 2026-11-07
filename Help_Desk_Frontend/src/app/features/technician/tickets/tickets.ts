import {
  Component,
  OnInit
} from '@angular/core';

import {
  CommonModule
} from '@angular/common';

import Swal, { toastSuccess, toastError, esc } from '../../../core/utils/swal';
import { detailHtml, timelineHtml, statusBadge, priorityBadge, formatDate } from '../../../core/utils/modal-html';

import {
  TicketService
} from '../../../core/services/ticket.service';

import {
  Ticket
} from '../../../core/models/ticket.model';

@Component({
  standalone: true,
  imports: [CommonModule],
  templateUrl: './tickets.html',
  styleUrl: './tickets.css'
})
export class Tickets implements OnInit {

  tickets: Ticket[] = [];

  selected = 'asignados';

  statusMap: any = {
    1: 'Abierto',
    2: 'En proceso',
    3: 'Resuelto'
  };

  priorityMap: any = {
    1: 'Baja',
    2: 'Media',
    3: 'Alta',
    4: 'Crítica'
  };

  constructor(
    private ticketService: TicketService
  ) {}

  ngOnInit(): void {
    this.loadTickets();
  }

  // =========================
  // CARGAR TICKETS
  // =========================

  loadTickets(): void {

    this.ticketService
      .getTickets()
      .subscribe({

        next: (res: any) => {

          // Por si DRF devuelve paginación
          if (Array.isArray(res)) {
            this.tickets = res;
          } else if (res.results) {
            this.tickets = res.results;
          } else {
            this.tickets = [];
          }

        },

        error: (err) => {

          console.error(
            'Error cargando tickets:',
            err
          );

          this.tickets = [];

        }

      });

  }

  // =========================
  // FILTRAR POR ESTADO
  // =========================

  filteredTickets(): Ticket[] {

    if (this.selected === 'asignados') {

      return this.tickets.filter(
        t => t.status === 1
      );

    }

    if (this.selected === 'proceso') {

      return this.tickets.filter(
        t => t.status === 2
      );

    }

    if (this.selected === 'resueltos') {

      return this.tickets.filter(
        t => t.status === 3
      );

    }

    return this.tickets;

  }

  // =========================
  // CONTADORES
  // =========================

  countAssigned(): number {

    return this.tickets.filter(
      t => t.status === 1
    ).length;

  }

  countInProgress(): number {

    return this.tickets.filter(
      t => t.status === 2
    ).length;

  }

  countResolved(): number {

    return this.tickets.filter(
      t => t.status === 3
    ).length;

  }

  // =========================
  // VER TICKET
  // =========================

  viewTicket(ticket: Ticket): void {

    const client = ticket.client
      ? `${ticket.client.first_name || ''} ${ticket.client.last_name || ''}`.trim()
      : '';

    Swal.fire({
      title: `Ticket ${ticket.code}`,
      width: 780,
      confirmButtonText: 'Cerrar',
      html: detailHtml([
        {
          title: 'Información general',
          icon: 'description',
          fields: [
            { label: 'Descripción', value: ticket.description, wide: true },
            { label: 'Categoría', value: String(ticket.category || 'N/A') },
            { label: 'Prioridad', value: priorityBadge(ticket.priority), html: true },
            { label: 'Estado', value: statusBadge(ticket.status), html: true }
          ]
        },
        {
          title: 'Cliente',
          icon: 'person',
          fields: [
            { label: 'Nombre', value: client || 'Sin cliente' },
            { label: 'Correo', value: ticket.client?.email || '' }
          ]
        },
        {
          title: 'Diagnóstico y resolución',
          icon: 'build_circle',
          fields: [
            { label: 'Diagnóstico', value: ticket.diagnosis || 'Sin diagnóstico', wide: true },
            { label: 'Resolución', value: ticket.resolution || 'Pendiente', wide: true }
          ]
        },
        {
          title: 'Fechas',
          icon: 'event',
          fields: [
            { label: 'Creado', value: formatDate(ticket.created_at) },
            { label: 'Actualizado', value: formatDate(ticket.updated_at) }
          ]
        }
      ])
    });

  }

  // =========================
  // INICIAR TICKET
  // =========================

  startTicket(ticket: Ticket): void {

    Swal.fire({

      title: '¿Iniciar atención?',

      text: ticket.code,

      icon: 'question',

      showCancelButton: true,

      confirmButtonText: 'Iniciar',

      cancelButtonText: 'Cancelar'

    }).then(result => {

      if (!result.isConfirmed) {
        return;
      }

      this.ticketService
        .updateTicket(
          ticket.id,
          {
            status: 2
          }
        )
        .subscribe({

          next: () => {

            toastSuccess('Ticket en proceso');

            this.loadTickets();

          },

          error: (err) => {

            console.error(
              'Error actualizando ticket:',
              err
            );

            toastError('No se pudo actualizar el ticket');

          }

        });

    });

  }

  // =========================
  // RESOLVER TICKET
  // =========================

  resolveTicket(ticket: Ticket): void {

    Swal.fire({

      title: `Resolver ${ticket.code}`,

      width: 640,

      html: `

        <div class="swal-form">
          <label class="swal-field">
            <span>Diagnóstico</span>
            <textarea id="diagnosis" class="swal2-textarea" placeholder="¿Cuál fue la causa del problema?">${esc(ticket.diagnosis)}</textarea>
          </label>

          <label class="swal-field">
            <span>Resolución aplicada *</span>
            <textarea id="resolution" class="swal2-textarea" placeholder="Describe la solución aplicada">${esc(ticket.resolution)}</textarea>
          </label>
        </div>

      `,

      showCancelButton: true,

      confirmButtonText: 'Resolver',

      cancelButtonText: 'Cancelar',

      preConfirm: () => {

        const diagnosis =
          (
            document.getElementById(
              'diagnosis'
            ) as HTMLTextAreaElement
          ).value;

        const resolution =
          (
            document.getElementById(
              'resolution'
            ) as HTMLTextAreaElement
          ).value;

        if (!resolution) {

          Swal.showValidationMessage(
            'Debe capturar la resolución'
          );

          return false;

        }

        return {
          diagnosis,
          resolution,
          status: 3
        };

      }

    }).then(result => {

      if (!result.isConfirmed) {
        return;
      }

      this.ticketService
        .updateTicket(
          ticket.id,
          result.value
        )
        .subscribe({

          next: () => {

            toastSuccess('Ticket resuelto');

            this.loadTickets();

          },

          error: (err) => {

            console.error(
              'Error resolviendo ticket:',
              err
            );

            toastError('No se pudo resolver el ticket');

          }

        });

    });

  }

  // =========================
  // HISTORIAL
  // =========================

  viewHistory(ticket: Ticket): void {

    this.ticketService
      .getTicketHistory(ticket.id)
      .subscribe({

        next: (history) => {

          Swal.fire({
            title: `Historial · ${ticket.code}`,
            html: timelineHtml(history.map((h: any) => ({
              date: h.change_date,
              badge: statusBadge(h.status),
              rows: [
                { label: 'Estado', value: statusBadge(h.status), html: true },
                { label: 'Usuario', value: h.changed_by_email || 'Sistema' }
              ]
            }))),
            width: 640,
            confirmButtonText: 'Cerrar'
          });

        },

        error: (err) => {

          console.error(
            'Error obteniendo historial:',
            err
          );

          toastError('No se pudo obtener el historial');

        }

      });

  }

}
