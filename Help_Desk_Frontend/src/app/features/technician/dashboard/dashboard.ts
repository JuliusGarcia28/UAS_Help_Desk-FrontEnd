import {
  Component,
  OnInit
} from '@angular/core';

import {
  CommonModule
} from '@angular/common';

import {
  RouterModule
} from '@angular/router';

import {
  TicketService
} from '../../../core/services/ticket.service';

import { Ticket } from '../../../core/models/ticket.model';

@Component({
  standalone: true,
  imports: [
    CommonModule,
    RouterModule
  ],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css'
})
export class Dashboard implements OnInit {

  tickets: any[] = [];

  openTickets = 0;

  inProgress = 0;

  closed = 0;

  totalTickets = 0;

  constructor(
    private ticketService: TicketService
  ) {}

  ngOnInit(): void {

    this.loadTickets();

  }

  loadTickets(): void {

    this.ticketService
    .getTickets()
    .subscribe({

      next: (res: any) => {

        const tickets = Array.isArray(res)
          ? res
          : res.results || [];

        this.tickets = tickets;

        this.openTickets =
          tickets.filter(
            (t: Ticket) => t.status === 1
          ).length;

        this.inProgress =
          tickets.filter(
            (t: Ticket) => t.status === 2
          ).length;

        this.closed =
          tickets.filter(
            (t: Ticket) => t.status === 3
          ).length;

        this.totalTickets =
          tickets.length;

        console.log(
          'Tickets del técnico:',
          tickets
        );

      },

      error: (err) => {

        console.error(
          'Error cargando tickets',
          err
        );

      }

    });

  }


}