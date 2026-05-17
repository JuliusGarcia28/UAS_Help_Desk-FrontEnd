import { Route } from "@angular/router";
import { clientGuard } from "./../../core/guards/client.guard";
import { Dashboard } from "./dashboard/dashboard";
import { Tickets } from "./tickets/tickets";
import { AiSupport } from "./ai-support/ai-support";

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
    path: 'ai-support',
    canActivate: [clientGuard],
    component: AiSupport,
  },
  {
    path: '',
    redirectTo: 'client',
    pathMatch: 'full'
  }
];