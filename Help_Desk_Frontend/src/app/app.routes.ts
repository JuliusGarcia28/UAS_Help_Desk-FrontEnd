import { Routes } from '@angular/router';
import { LandingRoutes } from './features/landing/landing.routes';
import { loginRoutes } from './features/auth/login.routes';
import { AdminLayout } from './shared/admin-layout/admin-layout';
import { adminGuard } from './core/guards/admin.guard';
import { AdminRoutes } from './features/admin/admin.routes';
import { ClientLayout } from './shared/client-layout/client-layout';
import { clientGuard } from './core/guards/client.guard';
import { clientRoutes } from './features/client/client.routes';

export const routes: Routes = [
  {
    path: 'admin',
    component: AdminLayout,
    canActivate: [adminGuard],
    children: AdminRoutes
  },
  {
    path: 'client',
    component: ClientLayout,
    canActivate: [clientGuard],
    children: clientRoutes
  },

  ...LandingRoutes,
  ...loginRoutes,

  // FALLBACK
  {
    path: '**',
    redirectTo: ''
  }
];