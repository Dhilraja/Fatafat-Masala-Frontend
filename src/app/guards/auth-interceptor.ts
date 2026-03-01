import { inject } from '@angular/core';
import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { MatDialog } from '@angular/material/dialog';
import { catchError, finalize, throwError, timeout } from 'rxjs';
import { LoginComponent } from '../login/login.component';
import { AppService } from '../app.service';

let dialogOpen = false;

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const dialog = inject(MatDialog);
  const service = inject(AppService);

  service.show(); // 🌶️ START SPICE COOKING

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401) {
        const timedOut = service.isLoggedIn;
        service.isLoggedIn = false;
        const payload = {
          flag: false,
          data: null,
        };
        if (timedOut) {
          service.getAllProducts;
          service.loginNext(payload);
          service.userDetails = null;
        }

        if (!dialogOpen) {
          dialogOpen = true;
          dialog
            .open(LoginComponent, {
              width: '70%',
              data: { timedOut },
            })
            .afterClosed()
            .subscribe(() => {
              dialogOpen = false;
              if (!service.isLoggedIn) {
                window.location.reload();
              }
            });
        }
      }

      return throwError(() => error);
    }),
    finalize(() => {
      service.hide(); // 🧂 DONE COOKING
    }),
  );
};
