import { User } from './user.model';

export interface Ticket {

  id: string;

  description: string;

  priority: number;

  status: number;

  created_at?: string;

  finished_at?: string;

  cliente: string;

  technician?: User | null;

  client?: User | null;

}

export interface TicketHistory {

  id: string;

  ticket_id: string;

  status: number;

  priority: number;

  changed_by_email: string;

  change_date: string;

}