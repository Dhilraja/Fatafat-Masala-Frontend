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

  addToCart(id: any): void {
    if (this.service.isLoggedIn) {
      this.service.addRemoveCartProduct(id, true).subscribe((res: any) => {
        const selectedProduct = this.allProducts.find((ele: any) => ele._id == id);
        selectedProduct['quantity'] = 1;
        this.service.addItem(this.allProducts);
      });
    } else {
      const selectedProduct = this.allProducts.find((ele: any) => ele._id == id);
      selectedProduct['quantity'] = 1;
      this.service.addItem(this.allProducts);
    }
  }

  increment(id: any): void {
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

  decrement(id: any): void {
    if (this.service.isLoggedIn) {
      this.service.addRemoveCartProduct(id, false).subscribe((res: any) => {
        const selectedProduct = this.allProducts.find((ele: any) => ele._id == id);
        if (selectedProduct['quantity'] > 0) {
          selectedProduct['quantity']--;
          this.service.removeItem(this.allProducts);
        }
      });
    } else {
      const selectedProduct = this.allProducts.find((ele: any) => ele._id == id);
      if (selectedProduct['quantity'] > 0) {
        selectedProduct['quantity']--;
        this.service.removeItem(this.allProducts);
      }
    }
  }

  trackByProductId(index: number, product: any): string {
    return product._id; // or product._id if using MongoDB
  }

  allProducts: any;

  ngOnInit(): void {
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
            for (const cartProduct of res.data) {
              const selectedProduct = this.allProducts.find((ele: any) => ele._id == cartProduct.productId);
              for (let i = 0; i < cartProduct.quantity; i++) {
                selectedProduct['quantity']++;
                this.service.addItem(this.allProducts);
              }
            }
          });
        });
      } else if (this.service.getAllProducts()) this.allProducts = this.service.getAllProducts();
      else {
        this.service.getProducts().subscribe((res: any) => {
          this.allProducts = res.data.map((ele: any) => {
            ele['quantity'] = 0;
            return ele;
          });
          this.allProducts = [...this.allProducts];
        });
      }
    });
  }
}
