import { Component, HostListener, OnInit } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive, Router } from '@angular/router';
import { FloatingCartComponent } from './floating-cart/floating-cart.component';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { HttpClient } from '@angular/common/http';
import { AppService } from './app.service';
import { CommonModule } from '@angular/common';
import { MatDialog } from '@angular/material/dialog';
import { LoginComponent } from './login/login.component';
import { LoaderComponent } from './loader/loader.component';
import { MatMenuModule } from '@angular/material/menu';

@Component({
  selector: 'app-root',
  imports: [
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    FloatingCartComponent,
    MatIconModule,
    MatButtonModule,
    CommonModule,
    LoaderComponent,
    MatMenuModule,
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent implements OnInit {
  constructor(
    private router: Router,
    public service: AppService,
    private dialog: MatDialog,
  ) {}

  title = 'fatafat-masala';
  isLoggedIn = false;
  name = null;

  ngOnInit(): void {
    this.service.checkLogin();
    this.service.loginStatus$.subscribe((res: any) => {
      this.isLoggedIn = res.flag;
    });
    // this.service.getLoginDetails().subscribe((res: any) => {
    //   this.service.isLoggedIn = res.flag;
    //   this.isLoggedIn = res.flag;
    //   this.service.userDetails = res.data;
    //   // alert(res.flag ? 'User is logged in' : 'User is not logged in');
    // });
  }

  isMenuOpen = false;

  toggleMenu() {
    this.isMenuOpen = !this.isMenuOpen;
  }

  closeMenu() {
    this.isMenuOpen = false;
  }

  @HostListener('window:resize', [])
  onResize() {
    if (window.innerWidth > 768) {
      this.closeMenu();
    }
  }

  showCart(): boolean {
    return this.router.url !== '/cart';
  }

  onLogin() {
    this.dialog.open(LoginComponent, {
      width: '95%',
    });
  }

  onLogout() {
    this.service.logout().subscribe((res: any) => {
      this.service.isLoggedIn = false;
      this.service.userDetails = null;
      this.router.navigate(['/home']);
      setTimeout(() => {
        window.location.reload();
      });
    });
    // this.router.navigateByUrl('/home');
  }

  onProfile() {
    this.router.navigateByUrl('/profile');
  }
}
