import { Route } from "@angular/router";
import { technicianGuard } from "../../core/guards/technician.guard";
import { Dashboard } from "./dashboard/dashboard";
import { Tickets } from "./tickets/tickets";

export const technicianRoutes: Route[] = [
  {
    path: 'dashboard',
    canActivate: [technicianGuard],
    component: Dashboard
  },
  {
    path: 'tickets',
    canActivate: [technicianGuard],
    component: Tickets,
  },
  {
    path: '',
    redirectTo: 'technician/dashboard',
    pathMatch: 'full'
  }
];
