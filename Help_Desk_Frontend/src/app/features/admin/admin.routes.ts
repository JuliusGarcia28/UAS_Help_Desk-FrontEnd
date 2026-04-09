import { Routes } from '@angular/router';
import { Users } from './users/users';
import { Assets } from './assets/assets';
import { Departments } from './departments/departments';

export const AdminRoutes: Routes = [
  {
    path: 'users',
    component: Users
  },
  {
    path: 'assets',
    component: Assets
  },
  {
    path: 'departments',
    component: Departments
  },
  {
    path: '',
    redirectTo: 'users',
    pathMatch: 'full'
  }
];