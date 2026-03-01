import { CommonModule, Location } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { AppService } from '../app.service';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-product-details',
  imports: [CommonModule],
  templateUrl: './product-details.component.html',
  styleUrl: './product-details.component.scss',
})
export class ProductDetailsComponent implements OnInit, OnDestroy {
  constructor(
    private service: AppService,
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private location: Location,
  ) {}

  isLoaded = false;
  imgLoaded = false;
  features = [
    'Hand-picked from certified organic farms across India',
    'Stone-ground to preserve natural oils and aroma',
    'No artificial preservatives, colors, or additives',
    'Sealed in airtight packaging to lock in freshness',
  ];

  product: any;
  productDetails: any;
  allProducts: any;
  backTo = 'Products';

  ngOnInit(): void {
    // Trigger entry animation after brief delay
    setTimeout(() => (this.isLoaded = true), 80);
    if (this.service.fromHomePage) this.backTo = 'Home';
    const id = this.activatedRoute.snapshot.queryParamMap.get('id');
    if (id)
      this.service.getProductDetails(id).subscribe({
        next: (res: any) => {
          if (!res?.flag) this.router.navigate(['/products']);
          this.productDetails = res.data;
          if (!res.data?.images?.[0]?.url)
            this.productDetails.images = [
              {
                url: '../../assets/images/fatafat-masala-logo.jpg',
              },
            ];
          this.productDetails.discount = (
            ((Number(res.data.mrp) - Number(res.data.price)) / Number(res.data.mrp)) *
            100
          ).toFixed(0);
          this.productDetails.quantity = 0;
        },
        error: (error) => {
          this.router.navigate(['/products']);
        },
      });
    else {
      this.router.navigate(['/products']);
    }
    this.service.loginStatus$.subscribe((res: any) => {
      this.service.isLoggedIn = res.flag;
      this.service.userDetails = res.data;
      if (this.service.isLoggedIn) {
        this.service.totalItems = 0;
        if (!this.service.tempAllProducts?.length) {
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
              this.product = { ...this.allProducts.find((ele: any) => ele._id == id) };
            });
          });
        } else {
          this.allProducts = [...this.service.tempAllProducts];
          this.product = { ...this.allProducts.find((ele: any) => ele._id == id) };
        }
      } else if (this.service.getAllProducts()) {
        this.allProducts = this.service.getAllProducts();
        this.product = { ...this.allProducts.find((ele: any) => ele._id == id) };
      } else {
        this.service.getProducts().subscribe((res: any) => {
          this.allProducts = res.data.map((ele: any) => {
            ele['quantity'] = 0;
            return ele;
          });
          this.allProducts = [...this.allProducts];
          this.product = { ...this.allProducts.find((ele: any) => ele._id == id) };
          this.product.quantity = 0;
        });
      }
    });
  }

  ngOnDestroy(): void {
    this.service.fromHomePage = false;
  }

  onImageLoad(): void {
    this.imgLoaded = true;
  }

  addToCart(id: any): void {
    if (this.service.isLoggedIn) {
      this.service.addRemoveCartProduct(id, true).subscribe((res: any) => {
        const selectedProduct = this.allProducts.find((ele: any) => ele._id == id);
        selectedProduct['quantity'] = 1;
        this.product['quantity'] = 1;
        this.service.addItem(this.allProducts);
      });
    } else {
      const selectedProduct = this.allProducts.find((ele: any) => ele._id == id);
      selectedProduct['quantity'] = 1;
      this.product['quantity'] = 1;
      this.service.addItem(this.allProducts);
    }
  }

  increment(id: any): void {
    if (this.service.isLoggedIn) {
      this.service.addRemoveCartProduct(id, true).subscribe((res: any) => {
        const selectedProduct = this.allProducts.find((ele: any) => ele._id == id);
        selectedProduct['quantity']++;
        this.product['quantity']++;
        this.service.addItem(this.allProducts);
      });
    } else {
      const selectedProduct = this.allProducts.find((ele: any) => ele._id == id);
      selectedProduct['quantity']++;
      this.product['quantity']++;
      this.service.addItem(this.allProducts);
    }
  }

  decrement(id: any): void {
    if (this.service.isLoggedIn) {
      this.service.addRemoveCartProduct(id, false).subscribe((res: any) => {
        const selectedProduct = this.allProducts.find((ele: any) => ele._id == id);
        if (selectedProduct['quantity'] > 0) {
          selectedProduct['quantity']--;
          this.product['quantity']--;
          this.service.removeItem(this.allProducts);
        }
      });
    } else {
      const selectedProduct = this.allProducts.find((ele: any) => ele._id == id);
      if (selectedProduct['quantity'] > 0) {
        selectedProduct['quantity']--;
        this.product['quantity']--;
        this.service.removeItem(this.allProducts);
      }
    }
  }

  goBack(): void {
    if (this.service.fromHomePage) this.router.navigate(['/home']);
    else this.router.navigate(['/products']);
  }
}
