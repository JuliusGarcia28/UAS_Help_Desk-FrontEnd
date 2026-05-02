import { Component, OnInit } from '@angular/core';
import { TicketService } from '../../../core/services/ticket.service';
import { CommonModule } from '@angular/common';
import Swal from 'sweetalert2';

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

  constructor(private ticketService: TicketService) {}

  ngOnInit() {
    this.loadTickets();
  }

  loadTickets() {
    this.ticketService.getTickets().subscribe(res => {
      this.tickets = res;
    });
  }

  getStatusColor(status: number) {
    return status === 1 ? 'orange' :
           status === 2 ? '#3FA7D6' :
           'green';
  }

  createTicket() {

    Swal.fire({
      title: 'Nuevo ticket',
      html: `
        <textarea id="desc" class="swal2-textarea" placeholder="Describe el problema"></textarea>
        <select id="priority" class="swal2-select">
          <option value="1">Baja</option>
          <option value="2">Media</option>
          <option value="3">Alta</option>
        </select>
      `,
      showCancelButton: true,
      confirmButtonColor: '#0B2545',
      preConfirm: () => {

        const description = (document.getElementById('desc') as HTMLTextAreaElement).value;
        const priority = (document.getElementById('priority') as HTMLSelectElement).value;

        if (!description) {
          Swal.showValidationMessage('Descripción requerida');
          return;
        }

        return { description, priority };
      }
    }).then(res => {
      if (res.isConfirmed) {
        this.ticketService.createTicket(res.value).subscribe(() => {
          this.loadTickets();
        });
      }
    });
  }

  viewHistory(ticket: any) {

    this.ticketService.getTicketHistory(ticket.id).subscribe(history => {

      const html = history.map(h => `
        <div class="history-item">
          <div class="history-date">${new Date(h.change_date).toLocaleString()}</div>
          <div class="history-body">
            Estado: ${this.statusMap[h.status]}<br>
            Usuario: ${h.changed_by_email || 'Sistema'}
          </div>
        </div>
      `).join('');

      Swal.fire({
        title: 'Historial',
        html: `<div class="history-container">${html}</div>`,
        width: 600
      });

    });
  }
}