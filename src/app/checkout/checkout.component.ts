import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { AppService } from '../app.service';
import { Router } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-checkout',
  imports: [CommonModule, FormsModule, ReactiveFormsModule, MatIconModule],
  templateUrl: './checkout.component.html',
  styleUrl: './checkout.component.scss',
})
export class CheckoutComponent implements OnInit {
  constructor(
    private service: AppService,
    private router: Router,
    private snackBar: MatSnackBar,
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
          this.addresses = res?.data?.addresses;
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
      this.router.navigateByUrl('/order-placed');
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
