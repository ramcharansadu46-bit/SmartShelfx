import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { DOCUMENT } from '@angular/common';
export const portRedirectGuard: CanActivateFn = () => {
    const router = inject(Router);
    const document = inject(DOCUMENT);
    const port = document.defaultView?.location.port ?? '';
    if (port === '4201') {
        return router.createUrlTree(['/auth/admin']);
    }
    return router.createUrlTree(['/auth/login']);
};
