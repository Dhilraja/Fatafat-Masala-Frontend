import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { AppService } from '../app.service';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { Router } from '@angular/router';

@Component({
  selector: 'app-floating-cart',
  imports: [CommonModule, MatIconModule],
  templateUrl: './floating-cart.component.html',
  styleUrl: './floating-cart.component.scss',
})
export class FloatingCartComponent implements OnInit {
  totalItems = 0;
  animate = false;

  constructor(
    private service: AppService,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.service.totalItems$.subscribe((count) => {
      this.totalItems = count;

      // Trigger animation every change
      this.animate = false;
      setTimeout(() => {
        this.animate = true;
      }, 0);
    });
  }

  goToCart() {
    this.router.navigateByUrl('/cart');
  }
}
