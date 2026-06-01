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

  user: any =
    JSON.parse(
      localStorage.getItem('user') || '{}'
    );

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

        next: (res) => {

          const myTickets = res.filter(
            (ticket: any) =>
              ticket.technician_data?.id ===
              this.user.id
          );

          this.tickets = myTickets;

          this.openTickets =
            myTickets.filter(
              (t: any) => t.status === 1
            ).length;

          this.inProgress =
            myTickets.filter(
              (t: any) => t.status === 2
            ).length;

          this.closed =
            myTickets.filter(
              (t: any) => t.status === 3
            ).length;

          this.totalTickets =
            this.openTickets +
            this.inProgress +
            this.closed;

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