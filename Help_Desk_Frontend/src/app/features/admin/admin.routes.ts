import { Routes } from '@angular/router';
import { adminGuard } from '../../core/guards/admin.guard';
import { Users } from './users/users';
import { Assets } from './assets/assets';
import { Departments } from './departments/departments';
import { Tickets } from './tickets/tickets';
import { Dashboard } from './dashboard/dashboard';
import { Reports } from './reports/reports';


export const AdminRoutes: Routes = [
  {
    path: 'users',
    canActivate: [adminGuard],
    component: Users
  },
  {
    path: 'assets',
    canActivate: [adminGuard],
    component: Assets
  },
  {
    path: 'departments',
    canActivate: [adminGuard],
    component: Departments
  },
  {
    path: 'tickets',
    canActivate: [adminGuard],
    component: Tickets
  },
  {
    path: 'dashboard',
    canActivate: [adminGuard],
    component: Dashboard
  },
  {
    path: 'reports',
    canActivate: [adminGuard],
    component: Reports
  },
  {
    path: '',
    redirectTo: 'dashboard',
    pathMatch: 'full'
  }
];