import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { environment } from '../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class AppService {
  constructor(private http: HttpClient) {}

  url = environment.apiUrl;

  private totalItemsSubject = new BehaviorSubject<number>(0);
  totalItems$ = this.totalItemsSubject.asObservable();

  totalItems = 0;

  private allProducts: any = null;

  isLoggedIn = false;
  userDetails: any = null;

  addItem(allProducts: any): void {
    this.allProducts = allProducts;
    this.totalItems++;
    this.totalItemsSubject.next(this.totalItems);
  }

  removeItem(allProducts: any): void {
    this.allProducts = allProducts;
    if (this.totalItems > 0) {
      this.totalItems--;
      this.totalItemsSubject.next(this.totalItems);
    }
  }

  private _loading = new BehaviorSubject<boolean>(false);
  loading$ = this._loading.asObservable();

  show() {
    this._loading.next(true);
  }

  hide() {
    this._loading.next(false);
  }

  getTotalItems() {
    return this.totalItems;
  }

  getAllProducts() {
    return this.allProducts;
  }

  getCartProducts() {
    return this.allProducts?.filter((ele: any) => ele.quantity > 0) ?? [];
    // return this.http.get(this.url + '/cart-products');
  }

  signup(payload: any) {
    return this.http.post(this.url + '/register', payload);
  }

  login(payload: any) {
    return this.http.post(this.url + '/login', payload, { withCredentials: true });
  }

  getLoginDetails() {
    return this.http.get(this.url + '/login-details', { withCredentials: true });
  }

  logout() {
    return this.http.post(this.url + '/logout', null, { withCredentials: true });
  }

  saveProduct(payload: any) {
    return this.http.post(this.url + '/add-product', payload, { withCredentials: true });
  }

  getProducts() {
    return this.http.get(this.url + '/products');
  }

  updateProduct(payload: any) {
    return this.http.patch(this.url + '/update-product', payload, { withCredentials: true });
  }

  enableDisableProduct(payload: any) {
    return this.http.patch(this.url + '/enable-disable-product', payload, { withCredentials: true });
  }

  onDelete(id: string) {
    const params = new HttpParams().set('id', id);
    return this.http.delete(this.url + '/delete-product', { params: params, withCredentials: true });
  }

  addRemoveCartProduct(id: string, flag: boolean) {
    return this.http.post(this.url + '/add-remove-cart-products', { id: id, flag: flag }, { withCredentials: true });
  }

  setCartProducts(products: any[]) {
    return this.http.post(this.url + '/set-cart-products', products, { withCredentials: true });
  }

  getLoggedInCartProducts() {
    return this.http.get(this.url + '/cart-products', { withCredentials: true });
  }

  generateDescription(input: string) {
    const params = new HttpParams().set('input', input);
    return this.http.get(this.url + '/generate-description', { params: params, withCredentials: true });
  }

  sendOtp(payload: any) {
    return this.http.post(this.url + '/send-otp', payload);
  }

  validateOtp(payload: any) {
    return this.http.post(this.url + '/validate-otp', payload);
  }
}
