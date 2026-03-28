import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { AppService } from '../app.service';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { AddressComponent } from '../address/address.component';

@Component({
  selector: 'app-checkout',
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './checkout.component.html',
  styleUrl: './checkout.component.scss',
})
export class CheckoutComponent implements OnInit {
  constructor(
    private service: AppService,
    private router: Router,
    private snackBar: MatSnackBar,
    private matDialog: MatDialog,
  ) {}

  totalQuantity = 0;
  totalPrice = 0;
  deliveryFees = 0;
  checkoutProducts: any[] = [];
  addresses: any[] = [];
  selectedAddress: any;

  ngOnInit(): void {
    this.service.loginStatus$.subscribe((res: any) => {
      if (!res.flag) this.router.navigateByUrl('/cart');
      this.service.getLoggedInCartProducts().subscribe((res: any) => {
        if (res.data?.length == 0) {
          if (this.service.getCartProducts()?.length > 0) {
            const products = this.service.getCartProducts()?.map((ele: any) => {
              return {
                id: ele._id,

                quantity: ele.quantity,
              };
            });
            this.service.setCartProducts(products).subscribe((res: any) => {
              this.service.getCheckoutProducts().subscribe((res: any) => {
                this.checkoutProducts = res?.data?.products ?? [];
                this.deliveryFees = res?.data?.deliveryFees;
                this.totalPrice = res?.data?.totalPrice;
                this.totalQuantity = res?.data?.totalQuantity;
              });
            });
          }
        } else {
          this.service.getCheckoutProducts().subscribe((res: any) => {
            this.checkoutProducts = res?.data?.products ?? [];
            this.deliveryFees = res?.data?.deliveryFees;
            this.totalPrice = res?.data?.totalPrice;
            this.totalQuantity = res?.data?.totalQuantity;
          });
        }
        this.service.getProfile().subscribe((res: any) => {
          this.addresses = res?.data?.userDetails?.addresses;
        });
      });
    });
  }

  onPlaceOrder() {
    if (!this.selectedAddress) {
      this.snackBar.open('Please select an address', 'Close', {
        duration: 3000, // 3 seconds
        horizontalPosition: 'center',
        verticalPosition: 'bottom',
        panelClass: ['error-snackbar'],
      });
      return;
    }
    const payload = {
      address: this.selectedAddress,
    };
    this.service.placeOrder(payload).subscribe((res: any) => {
      this.snackBar.open(res.message, 'Close', {
        duration: 3000, // 3 seconds
        horizontalPosition: 'center',
        verticalPosition: 'bottom',
        panelClass: ['error-snackbar'],
      });
      this.router.navigate(['/order-placed'], {
        queryParams: { id: res?.data?._id },
      });
    });
  }

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
        this.service.addUpdateAddress(res).subscribe(() => {
          this.service.getProfile().subscribe((res: any) => {
            this.addresses = res?.data?.userDetails?.addresses ?? [];
          });
        });
      }
    });
  }

  onClickAddress(address: any) {
    this.addresses.forEach((ele: any) => {
      ele.selected = false;
    });
    address.selected = true;
    this.selectedAddress = address;
  }
}
