import { Component, OnInit } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { AppService } from '../app.service';
import { CommonModule } from '@angular/common';
import { MatDialog } from '@angular/material/dialog';
import { LoginComponent } from '../login/login.component';
import { Router } from '@angular/router';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './cart.component.html',
  styleUrl: './cart.component.scss',
})
export class CartComponent implements OnInit {
  constructor(
    public service: AppService,
    private matDialog: MatDialog,
    private router: Router,
  ) {}

  cartProducts: any;
  totalPrice: number = 0;
  deliveryFees = 50;

  ngOnInit(): void {
    // this.cartProducts = [
    //   {
    //     id: '2',
    //     name: 'Chilli Powder',
    //     price: '₹129',
    //     mrp: '₹129',
    //     quantity: 0,
    //   },
    //   {
    //     id: '3',
    //     name: 'Chicken Powder',
    //     price: '₹129',
    //     mrp: '₹129',
    //     quantity: 0,
    //   },
    //   {
    //     id: '5',
    //     name: 'Garam Masala',
    //     price: '₹129',
    //     mrp: '₹129',
    //     quantity: 0,
    //   },
    // ];
    this.totalPrice = 0;
    if (this.service.getCartProducts()?.length > 0) {
      this.cartProducts = this.service.getCartProducts();
      this.cartProducts.forEach((ele: any) => {
        this.totalPrice += Number(ele.price) * Number(ele.quantity);
      });
    } else {
      this.router.navigate(['/products']);
    }
  }

  onIncrement(id: any) {
    const selectedProduct = this.service.getAllProducts().find((ele: any) => ele._id == id);
    selectedProduct['quantity']++;
    this.service.addItem(this.service.getAllProducts());
    this.ngOnInit();
  }

  onDecrement(id: any) {
    const selectedProduct = this.service.getAllProducts().find((ele: any) => ele._id == id);
    selectedProduct['quantity']--;
    this.service.removeItem(this.service.getAllProducts());
    this.ngOnInit();
  }

  onRemove(id: any) {}

  onCheckout() {
    if (this.service.isLoggedIn) {
      const products = this.service.getCartProducts()?.map((ele: any) => {
        return {
          id: ele._id,
          quantity: ele.quantity,
        };
      });
      this.service.setCartProducts(products).subscribe((res: any) => {
        // alert('Success!');
      });
    } else {
      this.matDialog.open(LoginComponent, {
        width: '70%',
      });
    }
  }
}
