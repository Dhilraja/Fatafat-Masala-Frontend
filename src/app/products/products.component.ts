import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { AppService } from '../app.service';
import { Router } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-products',
  imports: [CommonModule, MatIconModule, MatInputModule, FormsModule],
  templateUrl: './products.component.html',
  styleUrl: './products.component.scss',
})
export class ProductsComponent implements OnInit {
  constructor(
    private service: AppService,
    private router: Router,
  ) {}

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
  tempAllProducts: any;
  tempAllProducts2: any;
  search = '';

  ngOnInit(): void {
    this.service.loginStatus$.subscribe((res: any) => {
      // this.service.getLoginDetails().subscribe((res: any) => {
      this.service.isLoggedIn = res.flag;
      this.service.userDetails = res.data;
      if (this.service.isLoggedIn) {
        this.service.totalItems = 0;
        this.service.getProducts().subscribe((res: any) => {
          this.service.tempAllProducts = [...res.data];
          this.allProducts = res.data.map((ele: any) => {
            ele['quantity'] = 0;
            return ele;
          });
          this.tempAllProducts = this.allProducts;
          this.tempAllProducts2 = [...this.allProducts];
          this.service.getLoggedInCartProducts().subscribe((res: any) => {
            this.service.tempLoggedInCartProducts = res.data;
            for (const cartProduct of res.data) {
              const selectedProduct = this.allProducts.find((ele: any) => ele._id == cartProduct.productId);
              for (let i = 0; i < cartProduct.quantity; i++) {
                selectedProduct['quantity']++;
                this.service.addItem(this.allProducts);
              }
            }
          });
        });
      } else if (this.service.getAllProducts()) {
        this.allProducts = this.service.getAllProducts();
        this.tempAllProducts = this.allProducts;
        this.tempAllProducts2 = [...this.allProducts];
      } else {
        this.service.getProducts().subscribe((res: any) => {
          this.service.tempAllProducts = [...res.data];
          this.allProducts = res.data.map((ele: any) => {
            ele['quantity'] = 0;
            return ele;
          });
          this.allProducts = [...this.allProducts];
          this.tempAllProducts = this.allProducts;
          this.tempAllProducts2 = [...this.allProducts];
        });
      }
    });
  }

  onClickProduct(id: string) {
    this.router.navigate(['/product'], { queryParams: { id: id } });
  }

  // onChangeInput() {
  //   this.allProducts = this.tempAllProducts;
  //   if (this.search != '')
  //     this.allProducts = this.tempAllProducts.filter((ele: any) =>
  //       ele.name.toLowerCase().includes(this.search.toLowerCase()),
  //     );
  // }

  get filteredProducts(): any {
    if (!this.search) {
      return this.allProducts;
    }
    return this.allProducts.filter((ele: any) => ele.name.toLowerCase().includes(this.search.toLowerCase()));
  }
}
