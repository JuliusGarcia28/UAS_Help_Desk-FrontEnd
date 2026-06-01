import { inject } from '@angular/core';
import { Router } from '@angular/router';

export const LandingGuard = () => {
    const router = inject(Router);
    const user = JSON.parse(localStorage.getItem('user') || 'null');

    if (!user) {
        router.navigate(['/login']);
        return false;
    }

    if (user.role === 'admin') {
        router.navigate(['admin/dashboard']);
        return false;
    }

    if (user.role === 'client') {
        router.navigate(['client/dashboard']);
        return false;
    }

    if (user.role === 'technician') {
        router.navigate(['technician/dashboard']);
        return false;
    }

    return true;
};