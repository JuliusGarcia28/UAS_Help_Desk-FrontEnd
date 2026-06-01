import { Route } from "@angular/router";
import { clientGuard } from "./../../core/guards/client.guard";
import { Dashboard } from "./dashboard/dashboard";
import { Tickets } from "./tickets/tickets";
import { AiSupport } from "./ai-support/ai-support";
import { AiHistory } from "./ai-history/ai-history";

export const clientRoutes: Route[] = [
  {
    path: 'dashboard',
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
    path: 'ai-history',
    canActivate: [clientGuard],
    component: AiHistory,
  },
  {
    path: '',
    redirectTo: 'client/dashboard',
    pathMatch: 'full'
  }
];