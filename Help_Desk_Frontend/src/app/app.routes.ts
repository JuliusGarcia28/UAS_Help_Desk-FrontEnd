import { Routes } from '@angular/router';
import { LandingRoutes } from './features/landing/landing.routes';
import { loginRoutes } from './features/auth/login.routes';
import { AdminLayout } from './shared/admin-layout/admin-layout';
import { adminGuard } from './core/guards/admin.guard';
import { AdminRoutes } from './features/admin/admin.routes';

export const routes: Routes = [
  {
    path: 'admin',
    component: AdminLayout,
    canActivate: [adminGuard],
    children: AdminRoutes
  },

  ...LandingRoutes,
  ...loginRoutes,

  // FALLBACK
  {
    path: '**',
    redirectTo: ''
  }
];