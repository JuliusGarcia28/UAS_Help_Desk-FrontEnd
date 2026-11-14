import {
  Component,
  OnInit
} from '@angular/core';

import {
  TicketService
} from '../../../core/services/ticket.service';

import {
  CommonModule
} from '@angular/common';

import Swal, { toastError } from '../../../core/utils/swal';
import { timelineHtml, statusBadge } from '../../../core/utils/modal-html';

import {
  Router
} from '@angular/router';


@Component({
  standalone: true,
  imports: [CommonModule],
  templateUrl: './tickets.html',
  styleUrl: './tickets.css'
})
export class Tickets implements OnInit {

  tickets: any[] = [];

  statusMap: any = {
    1: 'Abierto',
    2: 'En proceso',
    3: 'Resuelto',
    4: 'Escalado',
    0: 'Cerrado'
  };

  priorityMap: any = {
    1: 'Baja',
    2: 'Media',
    3: 'Alta',
    4: 'Crítica'
  };

  constructor(
    private ticketService: TicketService,
    private router: Router
  ) {}

  ngOnInit() {

    this.loadTickets();

  }

  loadTickets() {

    this.ticketService.getTickets()
      .subscribe(res => {

        this.tickets = res;

      });

  }

  createTicket() {

    this.router.navigate([
      '/client/ai-support'
    ]);

  }

  viewHistory(ticket: any) {

    this.ticketService
      .getTicketHistory(ticket.id)
      .subscribe({

        next: history => {

          Swal.fire({
            title: 'Historial del ticket',
            html: timelineHtml(history.map((h: any) => ({
              date: h.change_date,
              badge: statusBadge(h.status),
              rows: [
                { label: 'Estado', value: statusBadge(h.status), html: true },
                { label: 'Atendido por', value: h.changed_by_email || 'Sistema' }
              ]
            }))),
            width: 600,
            confirmButtonText: 'Cerrar'
          });

        },

        error: () => toastError('No se pudo obtener el historial')

      });

  }

}
