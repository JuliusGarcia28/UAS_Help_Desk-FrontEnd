import { User } from './user.model';

export interface Ticket {

  id: string;

  description: string;

  category: string;

  diagnosis: string;

  resolution: string;

  priority: number;

  status: number;

  source: string;

  asset?: string;

  cliente: string;

  technician?: string;

  client?: User;

  technician_data?: User;

  created_at: string;

  updated_at: string;

  finished_at?: string;

  resolution_time?: number;
}

export interface TicketHistory {

  id: string;

  ticket_id: string;

  status: number;

  priority: number;

  changed_by_email: string;

  change_date: string;

}