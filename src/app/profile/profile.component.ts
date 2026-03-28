import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { AppService } from '../app.service';
import { Router, RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { AddressComponent } from '../address/address.component';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

@Component({
  selector: 'app-profile',
  imports: [ReactiveFormsModule, MatInputModule, CommonModule, MatIconModule, MatButtonModule, MatSnackBarModule, RouterLink],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.scss',
})
export class ProfileComponent implements OnInit {
  constructor(
    private service: AppService,
    private router: Router,
    private matDialog: MatDialog,
    private snackBar: MatSnackBar,
  ) {}

  ngOnInit(): void {
    this.service.loginStatus$.subscribe((res: any) => {
      if (!res?.flag) this.router.navigateByUrl('/home');
      else {
        this.service.getProfile().subscribe((res: any) => {
          this.data = res?.data;
        });
      }
    });
  }

  data: any;
  orders: any[] = [];

  // ── CHANGE PASSWORD ──
  pwForm = new FormGroup({
    currentPassword: new FormControl('', [Validators.required]),
    newPassword: new FormControl('', [Validators.required, Validators.minLength(8)]),
    confirmPassword: new FormControl('', [Validators.required]),
  });

  showCurrentPw = false;
  showNewPw = false;
  showConfirmPw = false;
  pwSuccess = false;
  pwLoading = false;

  get pwStrength(): { score: number; label: string } {
    const val = this.pwForm.get('newPassword')?.value ?? '';
    let score = 0;
    if (val.length >= 8) score++;
    if (/[A-Z]/.test(val)) score++;
    if (/[0-9]/.test(val)) score++;
    if (/[^A-Za-z0-9]/.test(val)) score++;
    const labels = ['', 'Weak', 'Fair', 'Good', 'Strong'];
    return { score, label: val.length ? labels[score] : 'Enter a password' };
  }

  get pwRules() {
    const val = this.pwForm.get('newPassword')?.value ?? '';
    return {
      len: val.length >= 8,
      upper: /[A-Z]/.test(val),
      num: /[0-9]/.test(val),
      special: /[^A-Za-z0-9]/.test(val),
    };
  }

  onChangePassword() {
    if (this.pwForm.invalid) return;
    const { currentPassword, newPassword, confirmPassword } = this.pwForm.value;
    if (newPassword !== confirmPassword) {
      this.snackBar.open('New passwords do not match', 'Close', { duration: 3000 });
      return;
    }
    this.pwLoading = true;
    this.service.changePassword({ currentPassword: currentPassword!, newPassword: newPassword! }).subscribe({
      next: () => {
        this.pwLoading = false;
        this.pwSuccess = true;
        this.pwForm.reset();
        this.service.logout().subscribe((res: any) => {
          this.service.isLoggedIn = false;
          this.service.userDetails = null;
          this.router.navigate(['/home']);
          setTimeout(() => {
            window.location.reload();
          });
        });
      },
      error: (err: any) => {
        this.pwLoading = false;
        this.snackBar.open(err?.error?.message ?? 'Failed to update password', 'Close', { duration: 3000 });
      },
    });
  }

  // ── ADDRESSES ──
  onAdd() {
    const dialog = this.matDialog.open(AddressComponent, {
      width: '560px',
      maxWidth: '95vw',
      panelClass: 'addr-dialog-panel',
      data: null,
    });
    dialog.afterClosed().subscribe((res: any) => {
      if (res) {
        res['flag'] = true;
        this.service.addUpdateAddress(res).subscribe((res: any) => {
          this.snackBar.open(res.message, 'Close', {
            duration: 3000,
            horizontalPosition: 'center',
            verticalPosition: 'bottom',
            panelClass: ['error-snackbar'],
          });
          this.ngOnInit();
        });
      }
    });
  }

  onEditAddress(address: any) {
    const dialog = this.matDialog.open(AddressComponent, {
      width: '560px',
      maxWidth: '95vw',
      panelClass: 'addr-dialog-panel',
      data: address,
    });
    dialog.afterClosed().subscribe((res: any) => {
      if (res) {
        res['flag'] = false;
        res['_id'] = address._id;
        this.service.addUpdateAddress(res).subscribe((res: any) => {
          this.snackBar.open(res.message, 'Close', {
            duration: 3000,
            horizontalPosition: 'center',
            verticalPosition: 'bottom',
            panelClass: ['error-snackbar'],
          });
          this.ngOnInit();
        });
      }
    });
  }

  onDeleteAddress(id: string) {
    this.service.deleteAddress(id).subscribe((res: any) => {
      this.snackBar.open(res.message, 'Close', {
        duration: 3000,
        horizontalPosition: 'center',
        verticalPosition: 'bottom',
        panelClass: ['error-snackbar'],
      });
      this.ngOnInit();
    });
  }

  activeTab: string = 'orders';

  switchTab(tab: string) {
    this.activeTab = tab;
  }

  viewOrderDetails(id: string) {
    this.router.navigate(['/order-details'], { queryParams: { id } });
  }
}
