import { Route } from "@angular/router";
import { technicianGuard } from "./../../core/guards/technician.guard";
import { Tickets } from "./tickets/tickets";

export const technicianRoutes: Route[] = [
  {
    path: '',
    canActivate: [technicianGuard],
    component: Tickets,
  },
  {
    path: 'tickets',
    canActivate: [technicianGuard],
    component: Tickets,
  },
];
