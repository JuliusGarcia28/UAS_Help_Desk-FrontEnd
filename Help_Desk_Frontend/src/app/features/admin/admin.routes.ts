import { Routes } from '@angular/router';
import { Users } from './users/users';
import { Assets } from './assets/assets';

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
    path: '',
    redirectTo: 'users',
    pathMatch: 'full'
  }
];