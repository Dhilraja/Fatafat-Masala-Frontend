import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { AppService } from '../app.service';
import { Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { AddressComponent } from '../address/address.component';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

@Component({
  selector: 'app-profile',
  imports: [ReactiveFormsModule, MatInputModule, CommonModule, MatIconModule, MatButtonModule, MatSnackBarModule],
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
  //   {
  //     name: 'Aadhil',
  //     address: 'D-11, 1st Floor, D-Block, Capitol Flora, Sargasan, Gandhinagar, Gujarat - 382421',
  //   },
  // ];

  onAdd() {
    const dialog = this.matDialog.open(AddressComponent, {
      width: '70vw',
      maxWidth: '100vw',
      data: null,
    });
    dialog.afterClosed().subscribe((res: any) => {
      if (res) {
        console.log(res);
        res['flag'] = true;
        this.service.addUpdateAddress(res).subscribe((res: any) => {
          this.snackBar.open(res.message, 'Close', {
            duration: 3000, // 3 seconds
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
      width: '70vw',
      maxWidth: '100vw',
      data: address,
    });
    dialog.afterClosed().subscribe((res: any) => {
      if (res) {
        console.log(res);
        res['flag'] = false;
        res['_id'] = address._id;
        this.service.addUpdateAddress(res).subscribe((res: any) => {
          this.snackBar.open(res.message, 'Close', {
            duration: 3000, // 3 seconds
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
        duration: 3000, // 3 seconds
        horizontalPosition: 'center',
        verticalPosition: 'bottom',
        panelClass: ['error-snackbar'],
      });
      this.ngOnInit();
    });
  }

  activeTab: string = 'orders'; // default tab

  switchTab(tab: string) {
    this.activeTab = tab;
  }
}
