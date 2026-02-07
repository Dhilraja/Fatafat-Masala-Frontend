import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { AppService } from '../app.service';

@Component({
  selector: 'app-products',
  imports: [CommonModule],
  templateUrl: './products.component.html',
  styleUrl: './products.component.scss',
})
export class ProductsComponent implements OnInit {
  constructor(private service: AppService) {}

  addToCart(product: any): void {
    const selectedProduct = this.allProducts.find((ele: any) => ele._id == product._id);
    selectedProduct['quantity'] = 1;
    this.service.addItem(this.allProducts);
  }

  increment(id: any): void {
    const selectedProduct = this.allProducts.find((ele: any) => ele._id == id);
    selectedProduct['quantity']++;
    this.service.addItem(this.allProducts);
    // this.service.addRemoveCartProduct(id, true).subscribe((res: any) => {
    //   this.ngOnInit();
    // });
  }

  decrement(id: any): void {
    const selectedProduct = this.allProducts.find((ele: any) => ele._id == id);
    if (selectedProduct['quantity'] > 0) {
      selectedProduct['quantity']--;
      this.service.removeItem(this.allProducts);
    }
    // this.service.addRemoveCartProduct(id, false).subscribe((res: any) => {
    //   this.ngOnInit();
    // });
  }

  allProducts: any;

  ngOnInit(): void {
    // this.allProducts = [
    //   {
    //     id: '1',
    //     name: 'Sambar Powder',
    //     price: '₹129',
    //     mrp: '₹129',
    //     quantity: 0,
    //   },
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
    //     id: '4',
    //     name: 'Coriander Powder',
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
    this.service.getLoginDetails().subscribe((res: any) => {
      this.service.isLoggedIn = res.flag;
      this.service.userDetails = res.data;
      // if (this.service.isLoggedIn) {
      //   this.service.getLoggedInCartProducts().subscribe((res: any) => {});
      // } else
      if (this.service.getAllProducts()) this.allProducts = this.service.getAllProducts();
      else {
        this.service.getProducts().subscribe((res: any) => {
          this.allProducts = res.data.map((ele: any) => {
            ele['quantity'] = 0;
            // ele['mrp'] = '₹' + ele['mrp'];
            // ele['price'] = '₹' + ele['price'];
            return ele;
          });
          this.allProducts = [...this.allProducts];
          // this.service.getCartProducts().subscribe((res: any) => {
          //   for (const cart of res.data) {
          //     const product = this.allProducts.find((product: any) => product._id === cart.productId);
          //     if (product) {
          //       product.quantity = cart.quantity;
          //     }
          //   }
          // });
        });
      }
    });
  }
}
