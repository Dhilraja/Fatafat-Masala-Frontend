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
  allProducts: any;

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

    // this.totalPrice = 0;
    // if (this.service.getCartProducts()?.length > 0) {
    //   this.cartProducts = this.service.getCartProducts();
    //   this.cartProducts.forEach((ele: any) => {
    //     this.totalPrice += Number(ele.price) * Number(ele.quantity);
    //   });
    // } else {
    //   this.router.navigate(['/products']);
    // }

    this.service.totalItems = 0;
    this.service.getLoginDetails().subscribe((res: any) => {
      this.service.isLoggedIn = res.flag;
      this.service.userDetails = res.data;
      if (this.service.isLoggedIn) {
        this.service.getProducts().subscribe((res: any) => {
          this.allProducts = res.data.map((ele: any) => {
            ele['quantity'] = 0;
            return ele;
          });
          this.service.getLoggedInCartProducts().subscribe((res: any) => {
            if (res?.data?.length == 0) this.router.navigate(['/products']);
            for (const cartProduct of res.data) {
              const selectedProduct = this.allProducts.find((ele: any) => ele._id == cartProduct.productId);
              for (let i = 0; i < cartProduct.quantity; i++) {
                selectedProduct['quantity']++;
                this.service.addItem(this.allProducts);
              }
            }
            this.totalPrice = 0;
            if (this.service.getCartProducts()?.length > 0) {
              this.cartProducts = this.service.getCartProducts();
              this.cartProducts.forEach((ele: any) => {
                this.totalPrice += Number(ele.price) * Number(ele.quantity);
              });
            } else {
              this.router.navigate(['/products']);
            }
          });
        });
      } else if (this.service.getAllProducts()) this.allProducts = this.service.getAllProducts();
      else {
        // this.service.getProducts().subscribe((res: any) => {
        //   this.allProducts = res.data.map((ele: any) => {
        //     ele['quantity'] = 0;
        //     return ele;
        //   });
        //   this.allProducts = [...this.allProducts];
        // });
        this.router.navigate(['/products']);
      }
    });
  }

  onIncrement(id: any) {
    // const selectedProduct = this.service.getAllProducts().find((ele: any) => ele._id == id);
    // selectedProduct['quantity']++;
    // this.service.addItem(this.service.getAllProducts());
    // this.ngOnInit();

    if (this.service.isLoggedIn) {
      this.service.addRemoveCartProduct(id, true).subscribe((res: any) => {
        const selectedProduct = this.allProducts.find((ele: any) => ele._id == id);
        selectedProduct['quantity']++;
        this.service.addItem(this.allProducts);
      });
    } else {
      const selectedProduct = this.allProducts.find((ele: any) => ele._id == id);
      selectedProduct['quantity']++;
      this.service.addItem(this.allProducts);
    }
  }

  onDecrement(id: any) {
    // const selectedProduct = this.service.getAllProducts().find((ele: any) => ele._id == id);
    // selectedProduct['quantity']--;
    // this.service.removeItem(this.service.getAllProducts());
    // this.ngOnInit();

    if (this.service.isLoggedIn) {
      this.service.addRemoveCartProduct(id, false).subscribe((res: any) => {
        const selectedProduct = this.allProducts.find((ele: any) => ele._id == id);
        if (selectedProduct['quantity'] > 0) {
          selectedProduct['quantity']--;
          this.service.removeItem(this.allProducts);
        }
        this.cartProducts = this.cartProducts.filter((ele: any) => ele.quantity > 0);
      });
    } else {
      const selectedProduct = this.allProducts.find((ele: any) => ele._id == id);
      if (selectedProduct['quantity'] > 0) {
        selectedProduct['quantity']--;
        this.service.removeItem(this.allProducts);
      }
      this.cartProducts = this.cartProducts.filter((ele: any) => ele.quantity > 0);
    }
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
