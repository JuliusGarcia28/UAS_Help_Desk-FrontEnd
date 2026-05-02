import { Component, OnInit } from '@angular/core';
import { TicketService } from '../../../core/services/ticket.service';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css'
})
export class Dashboard implements OnInit {

  tickets: any[] = [];

  openTickets = 0;
  inProgress = 0;

  constructor(private ticketService: TicketService) {}

  ngOnInit() {
    this.ticketService.getTickets().subscribe(res => {
      this.tickets = res;

      this.openTickets = res.filter(t => t.status === 1).length;
      this.inProgress = res.filter(t => t.status === 2).length;
    });
  }
}