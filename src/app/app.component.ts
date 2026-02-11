import { Component, OnInit } from '@angular/core';
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
    this.service.getLoginDetails().subscribe((res: any) => {
      this.service.isLoggedIn = res.flag;
      this.isLoggedIn = res.flag;
      this.service.userDetails = res.data;
      // alert(res.flag ? 'User is logged in' : 'User is not logged in');
    });
  }

  showCart(): boolean {
    return this.router.url !== '/cart';
  }

  onLogin() {
    this.dialog.open(LoginComponent, {
      width: '70%',
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
}
