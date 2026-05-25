import { Component, OnInit } from '@angular/core';
import { TicketService } from '../../../core/services/ticket.service';
import { CommonModule } from '@angular/common';
import Swal from 'sweetalert2';

@Component({
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css'
})
export class Tickets implements OnInit {

  user: any = JSON.parse(localStorage.getItem('user') || '{}');
  tickets: any[] = [];
  selected: string = 'pendientes';

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

  filteredTickets() {
    if (this.selected === 'pendientes') {
      return this.tickets.filter(t => t.status === 1);
    }

    if (this.selected === 'asignados') {
      return this.tickets.filter(t => this.isAssigned(t));
    }

    if (this.selected === 'resueltos') {
      return this.tickets.filter(t => t.status === 3);
    }

    return this.tickets;
  }

  isAssigned(t: any) {
    return t.assigned_to === this.user.id || (t.assigned_to && t.assigned_to.id === this.user.id) || t.assigned_to_email === this.user.email;
  }

  countPending() { return this.tickets.filter(t => t.status === 1).length; }
  countAssigned() { return this.tickets.filter(t => this.isAssigned(t)).length; }
  countResolved() { return this.tickets.filter(t => t.status === 3).length; }

  getStatusColor(status: number) {
    return status === 1 ? 'orange' :
           status === 2 ? '#3FA7D6' :
           'green';
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