import { Routes } from '@angular/router';
import { LandingRoutes } from './features/landing/landing.routes';
import { loginRoutes } from './features/auth/login.routes';

export const routes: Routes = [
    ...LandingRoutes,
    ...loginRoutes,
];
