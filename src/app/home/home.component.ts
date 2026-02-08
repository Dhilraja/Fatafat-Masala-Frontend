import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AppService } from '../app.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-home',
  imports: [CommonModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
})
export class HomeComponent implements OnInit {
  constructor(
    private router: Router,
    private service: AppService,
  ) {}

  products: any;

  ngOnInit(): void {
    this.service.getProducts().subscribe((res: any) => {
      this.products = res.data.splice(0, 4);
    });
  }

  gotoProducts() {
    this.router.navigateByUrl('/products');
  }
}
