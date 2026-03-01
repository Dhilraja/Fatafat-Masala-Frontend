import { AfterViewInit, Component, OnInit } from '@angular/core';
import { AppService } from '../app.service';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-home2',
  imports: [CommonModule, MatIconModule, RouterLink],
  templateUrl: './home2.component.html',
  styleUrl: './home2.component.scss',
})
export class Home2Component implements AfterViewInit, OnInit {
  constructor(
    private service: AppService,
    private router: Router,
  ) {}

  ngAfterViewInit(): void {
    const reveals = document.querySelectorAll('.reveal');
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add('visible');
            observer.unobserve(e.target);
          }
        });
      },
      { threshold: 0.1 },
    );
    reveals.forEach((el) => observer.observe(el));
  }

  products: any;

  ngOnInit(): void {
    this.service.getProducts().subscribe((res: any) => {
      this.products = res.data.splice(0, 3);
    });
  }

  gotoProducts() {
    this.router.navigateByUrl('/products');
  }
  onClickProduct(id: string) {
    this.service.fromHomePage = true;
    this.router.navigate(['/product'], { queryParams: { id: id } });
  }
  gotoAboutUs() {
    this.router.navigateByUrl('/about-us');
  }
}
