import { Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { ProductsComponent } from './products/products.component';
import { CartComponent } from './cart/cart.component';
import { AdminComponent } from './admin/admin.component';
import { AuthGuard } from './guards/auth-guard.guard';
import { CheckoutComponent } from './checkout/checkout.component';
import { ProfileComponent } from './profile/profile.component';
import { OrderPlacedComponent } from './order-placed/order-placed.component';
import { ProductDetailsComponent } from './product-details/product-details.component';
import { RefundPolicyComponent } from './refund-policy/refund-policy.component';
import { TermsComponent } from './terms/terms.component';
import { PrivacyPolicyComponent } from './privacy-policy/privacy-policy.component';
import { AboutUsComponent } from './about-us/about-us.component';
import { Home2Component } from './home2/home2.component';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full',
  },
  {
    path: 'home',
    component: Home2Component,
  },
  {
    path: 'home-two',
    component: HomeComponent,
  },
  {
    path: 'products',
    component: ProductsComponent,
  },
  {
    path: 'cart',
    component: CartComponent,
  },
  {
    path: 'checkout',
    component: CheckoutComponent,
  },
  {
    path: 'admin',
    canActivate: [AuthGuard],
    component: AdminComponent,
  },
  {
    path: 'profile',
    component: ProfileComponent,
  },
  {
    path: 'order-placed',
    component: OrderPlacedComponent,
  },
  {
    path: 'product',
    component: ProductDetailsComponent,
  },
  {
    path: 'refund-policy',
    component: RefundPolicyComponent,
  },
  {
    path: 'terms-of-use',
    component: TermsComponent,
  },
  {
    path: 'privacy-policy',
    component: PrivacyPolicyComponent,
  },
  {
    path: 'about-us',
    component: AboutUsComponent,
  },
  {
    path: '**',
    redirectTo: 'home',
  },
];
