import { Route } from "@angular/router";
import { technicianGuard } from "./../../../core/guards/technician.guard";
import { Dashboard } from "../../client/dashboard/dashboard";

export const technicianRoutes: Route[] = [
  {
    path: '',
    canActivate: [technicianGuard],
    component: Dashboard,
  },
  {
    path: 'tickets',
    canActivate: [technicianGuard],
    component: Dashboard,
  },
];
