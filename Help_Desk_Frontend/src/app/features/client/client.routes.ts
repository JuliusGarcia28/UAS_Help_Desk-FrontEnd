import { Route } from "@angular/router";
import { clientGuard } from "./../../core/guards/client.guard";
import { Dashboard } from "./dashboard/dashboard";
import { Tickets } from "./tickets/tickets";

export const clientRoutes: Route[] = [
  {
    path: '',
    canActivate: [clientGuard],
    component: Dashboard,
  },
  {
    path: 'tickets',
    canActivate: [clientGuard],
    component: Tickets,
  },
  {
    path: '',
    redirectTo: 'client',
    pathMatch: 'full'
  }
];