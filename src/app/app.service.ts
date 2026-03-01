import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, ReplaySubject } from 'rxjs';
import { environment } from '../environments/environment';
import { MatSnackBar } from '@angular/material/snack-bar';

@Injectable({
  providedIn: 'root',
})
export class AppService {
  constructor(
    private http: HttpClient,
    private snackBar: MatSnackBar,
  ) {}

  url = environment.apiUrl;

  private totalItemsSubject = new BehaviorSubject<number>(0);
  totalItems$ = this.totalItemsSubject.asObservable();

  totalItems = 0;

  private allProducts: any = null;
  tempAllProducts: any = null;
  tempLoggedInCartProducts: any = null;

  isLoggedIn = false;
  userDetails: any = null;

  fromHomePage = false;

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

  private loginStatus = new ReplaySubject<any>(1);
  loginStatus$ = this.loginStatus.asObservable();

  checkLogin() {
    this.http.get(this.url + '/login-details', { withCredentials: true }).subscribe((res: any) => {
      this.loginStatus.next(res);
      this.isLoggedIn = res.flag;
      this.userDetails = res.data;
    });
  }

  loginNext(data: any) {
    this.loginStatus.next(data);
  }

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

  getCheckoutProducts() {
    return this.http.get(this.url + '/checkout-products', { withCredentials: true });
  }

  getProfile() {
    return this.http.get(this.url + '/profile', { withCredentials: true });
  }

  addUpdateAddress(payload: any) {
    return this.http.post(this.url + '/address', payload, { withCredentials: true });
  }

  deleteAddress(id: string) {
    const params = new HttpParams().set('id', id);
    return this.http.delete(this.url + '/delete-address', { params: params, withCredentials: true });
  }

  placeOrder(payload: any) {
    return this.http.post(this.url + '/place-order', payload, { withCredentials: true });
  }

  getOrders() {
    return this.http.get(this.url + '/get-orders', { withCredentials: true });
  }

  getSnackbar(message: string) {
    this.snackBar.open(message, 'Close', {
      duration: 3000, // 3 seconds
      horizontalPosition: 'center',
      verticalPosition: 'bottom',
      panelClass: ['error-snackbar'],
    });
  }

  uploadImage(formData: any) {
    return this.http.post(this.url + '/upload-image', formData, { withCredentials: true });
  }

  getProductDetails(id: string) {
    const params = new HttpParams().set('id', id);
    return this.http.get(this.url + '/product-details', { params: params });
  }
}
