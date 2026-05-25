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

import Swal from 'sweetalert2';

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
    3: 'Cerrado'
  };

  priorityMap: any = {
    1: 'Baja',
    2: 'Media',
    3: 'Alta'
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
      .subscribe(history => {

        const html = history.map(h => `
          <div class="history-item">
            <div class="history-date">
              ${new Date(h.change_date).toLocaleString()}
            </div>

            <div class="history-body">
              Estado:
              ${this.statusMap[h.status]}
              <br>

              Usuario:
              ${h.changed_by_email || 'Sistema'}
            </div>
          </div>
        `).join('');

        Swal.fire({
          title: 'Historial',
          html: `
            <div class="history-container">
              ${html}
            </div>
          `,
          width: 600
        });

      });

  }

}