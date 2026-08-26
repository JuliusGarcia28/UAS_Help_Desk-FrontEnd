import { Routes } from '@angular/router';
import { LandingRoutes } from './features/landing/landing.routes';
import { loginRoutes } from './features/auth/login.routes';
import { AdminLayout } from './shared/admin-layout/admin-layout';
import { adminGuard } from './core/guards/admin.guard';
import { AdminRoutes } from './features/admin/admin.routes';
import { ClientLayout } from './shared/client-layout/client-layout';
import { clientGuard } from './core/guards/client.guard';
import { clientRoutes } from './features/client/client.routes';
import { TechnicianLayout } from './shared/technician-layout/technician-layout';
import { technicianRoutes } from './features/technician/technician.routes';
import { technicianGuard } from './core/guards/technician.guard';

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
  {
    path: 'technician',
    component: TechnicianLayout,
    canActivate: [technicianGuard],
    children: technicianRoutes
  },

  //...LandingRoutes,
  ...loginRoutes,

  // FALLBACK
  {
    path: '**',
    redirectTo: ''
  }
];