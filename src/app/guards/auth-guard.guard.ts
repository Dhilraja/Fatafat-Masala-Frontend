import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AppService } from '../app.service';
import { catchError, map, Observable, of } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';
import { LoginComponent } from '../login/login.component';

@Injectable({ providedIn: 'root' })
export class AuthGuard implements CanActivate {
  constructor(
    private service: AppService,
    private router: Router,
    private dialog: MatDialog,
  ) {}

  canActivate(): Observable<boolean> | boolean {
    // Already loaded → fast path
    if (this.service.userDetails?.role) {
      return this.handleAccess();
    }

    // Fetch from server (cookie-based)
    return this.service.getLoginDetails().pipe(
      map((res: any) => {
        if (res.flag) {
          this.service.userDetails = res.data;
          return this.handleAccess();
        }
        this.router.navigate(['/home']);
        this.dialog.open(LoginComponent, {
          width: '500px',
          maxWidth: '95vw',
          panelClass: 'addr-dialog-panel',
          data: {
            redirectTo: '/admin',
          },
        });
        return false;
      }),
      catchError(() => {
        this.router.navigate(['/home']);
        this.dialog.open(LoginComponent, {
          width: '500px',
          maxWidth: '95vw',
          panelClass: 'addr-dialog-panel',
          data: {
            redirectTo: '/admin',
          },
        });
        return of(false);
      }),
    );
  }

  private handleAccess(): boolean {
    if (this.service.userDetails.role === 'ADMIN') {
      return true;
    }
    this.router.navigate(['/home']);
    if (!this.service.isLoggedIn) {
      this.dialog.open(LoginComponent, {
        width: '70%',
        data: {
          redirectTo: '/admin',
        },
      });
    }
    return false;
  }
}
