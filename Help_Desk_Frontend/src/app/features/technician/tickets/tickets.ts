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

    if (this.selected === 'asignados') {

      return myTickets.filter(
        t => t.status === 1
      );

    }

    if (this.selected === 'proceso') {

      return myTickets.filter(
        t => t.status === 2
      );

    }

    if (this.selected === 'resueltos') {

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

  viewTicket(ticket: Ticket) {

    Swal.fire({

      title: ticket.code,

      width: '900px',

      html: `

        <div style="text-align:left">

          <h3>Información general</h3>

          <p>
            <b>Descripción:</b><br>
            ${ticket.description}
          </p>

          <p>
            <b>Categoría:</b>
            ${ticket.category || 'N/A'}
          </p>

          <p>
            <b>Prioridad:</b>
            ${this.priorityMap[ticket.priority]}
          </p>

          <p>
            <b>Estado:</b>
            ${this.statusMap[ticket.status]}
          </p>

          <hr>

          <h3>Cliente</h3>

          <p>
            ${ticket.client?.first_name || ''}
            ${ticket.client?.last_name || ''}
          </p>

          <p>
            ${ticket.client?.email || ''}
          </p>

          <hr>

          <h3>Diagnóstico</h3>

          <p>
            ${ticket.diagnosis || 'Sin diagnóstico'}
          </p>

          <hr>

          <h3>Resolución</h3>

          <p>
            ${ticket.resolution || 'Pendiente'}
          </p>

          <hr>

          <h3>Fechas</h3>

          <p>
            <b>Creado:</b>
            ${new Date(ticket.created_at).toLocaleString()}
          </p>

          <p>
            <b>Actualizado:</b>
            ${new Date(ticket.updated_at).toLocaleString()}
          </p>

        </div>

      `

    });

  }

  startTicket(ticket: Ticket) {

    Swal.fire({

      title: '¿Iniciar atención?',

      text: ticket.code,

      icon: 'question',

      showCancelButton: true,

      confirmButtonText: 'Iniciar'

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

            Swal.fire(
              'Correcto',
              'Ticket en proceso',
              'success'
            );

            this.loadTickets();

          }

        });

    });

  }

  resolveTicket(ticket: Ticket) {

    Swal.fire({

      title: `Resolver ${ticket.code}`,

      width: 800,

      html: `

        <textarea
          id="diagnosis"
          class="swal2-textarea"
          placeholder="Diagnóstico"
        >${ticket.diagnosis || ''}</textarea>

        <textarea
          id="resolution"
          class="swal2-textarea"
          placeholder="Resolución aplicada"
        >${ticket.resolution || ''}</textarea>

      `,

      showCancelButton: true,

      confirmButtonText: 'Resolver',

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

            Swal.fire(
              'Correcto',
              'Ticket resuelto',
              'success'
            );

            this.loadTickets();

          }

        });

    });

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

          title: `Historial ${ticket.code}`,

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