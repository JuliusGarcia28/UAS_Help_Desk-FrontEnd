import {
  Component,
  OnInit
} from '@angular/core';

import {
  CommonModule
} from '@angular/common';

import Swal from 'sweetalert2';

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

  user: any =
    JSON.parse(
      localStorage.getItem('user') || '{}'
    );

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

  loadTickets() {

    this.ticketService
      .getTickets()
      .subscribe(res => {

        this.tickets = res;

      });

  }

  isAssigned(ticket: Ticket): boolean {

    return (
      ticket.technician_data?.id ===
      this.user.id
    );

  }

  filteredTickets() {

    const myTickets =
      this.tickets.filter(
        t => this.isAssigned(t)
      );

    if (
      this.selected === 'asignados'
    ) {

      return myTickets.filter(
        t => t.status === 1
      );

    }

    if (
      this.selected === 'proceso'
    ) {

      return myTickets.filter(
        t => t.status === 2
      );

    }

    if (
      this.selected === 'resueltos'
    ) {

      return myTickets.filter(
        t => t.status === 3
      );

    }

    return myTickets;

  }

  countAssigned() {

    return this.tickets.filter(
      t =>
        this.isAssigned(t)
        &&
        t.status === 1
    ).length;

  }

  countInProgress() {

    return this.tickets.filter(
      t =>
        this.isAssigned(t)
        &&
        t.status === 2
    ).length;

  }

  countResolved() {

    return this.tickets.filter(
      t =>
        this.isAssigned(t)
        &&
        t.status === 3
    ).length;

  }

  viewHistory(ticket: Ticket) {

    this.ticketService
      .getTicketHistory(ticket.id)
      .subscribe(history => {

        const html = history
          .map(h => `

            <div class="history-item">

              <div class="history-date">

                ${new Date(
                  h.change_date
                ).toLocaleString()}

              </div>

              <div class="history-body">

                Estado:
                ${this.statusMap[h.status]}

                <br>

                Usuario:
                ${h.changed_by_email || 'Sistema'}

              </div>

            </div>

          `)
          .join('');

        Swal.fire({

          title: `Historial Ticket #${ticket.id}`,

          html: `
            <div class="history-container">
              ${html}
            </div>
          `,

          width: 700

        });

      });

  }

}