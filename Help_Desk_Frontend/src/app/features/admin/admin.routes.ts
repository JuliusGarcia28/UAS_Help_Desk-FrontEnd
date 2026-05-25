import { Routes } from '@angular/router';
import { adminGuard } from '../../core/guards/admin.guard';
import { Users } from './users/users';
import { Assets } from './assets/assets';
import { Departments } from './departments/departments';
import { Tickets } from './tickets/tickets';


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
    path: '',
    redirectTo: 'users',
    pathMatch: 'full'
  }
];