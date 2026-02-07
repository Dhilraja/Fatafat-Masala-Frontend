import { inject } from '@angular/core';
import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { MatDialog } from '@angular/material/dialog';
import { catchError, throwError, timeout } from 'rxjs';
import { LoginComponent } from '../login/login.component';
import { AppService } from '../app.service';

let dialogOpen = false;

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const dialog = inject(MatDialog);
  const service = inject(AppService);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      if (
        error.status === 401
        // && !req.url.includes('/auth/login')
      ) {
        const timedOut = service.isLoggedIn;
        service.isLoggedIn = false;
        service.userDetails = null;
        if (!dialogOpen) {
          dialogOpen = true;
          dialog
            .open(LoginComponent, {
              width: '70%',
              data: {
                timedOut,
              },
            })
            .afterClosed()
            .subscribe(() => {
              dialogOpen = false;
            });
        }
      }

      return throwError(() => error);
    }),
  );
};
