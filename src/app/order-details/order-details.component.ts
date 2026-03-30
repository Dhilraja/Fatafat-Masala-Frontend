import { CommonModule, Location } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AppService } from '../app.service';

@Component({
  selector: 'app-order-details',
  imports: [CommonModule],
  templateUrl: './order-details.component.html',
  styleUrl: './order-details.component.scss',
})
export class OrderDetailsComponent implements OnInit {
  constructor(
    private service: AppService,
    private route: ActivatedRoute,
    private router: Router,
    private location: Location,
  ) {}

  order: any;
  isLoaded = false;
  totalItems = 0;

  readonly steps = [
    { key: 'PLACED',     label: 'Order\nPlaced',     icon: '🛒' },
    { key: 'PROCESSING', label: 'Being\nPrepared',   icon: '🫙' },
    { key: 'SHIPPED',    label: 'Packed &\nShipped', icon: '📦' },
    { key: 'DELIVERED',  label: 'Delivered\nto You', icon: '🏠' },
  ];

  ngOnInit(): void {
    const id = this.route.snapshot.queryParamMap.get('id');
    if (!id) {
      this.router.navigateByUrl('/profile');
      return;
    }
    this.service.getOrderDetails(id).subscribe({
      next: (res: any) => {
        if (!res?.data) {
          this.router.navigateByUrl('/profile');
          return;
        }
        this.order = res.data;
        res?.data?.items?.forEach((ele: any) => {
          this.totalItems += ele.quantity;
        });
        setTimeout(() => (this.isLoaded = true), 60);
      },
      error: () => this.router.navigateByUrl('/profile'),
    });
  }

  get currentStepIndex(): number {
    return this.steps.findIndex((s) => s.key === this.order?.status);
  }

  get isCancelled(): boolean {
    return this.order?.status === 'CANCELLED';
  }

  getItemImage(item: any): string {
    return item?.productId?.images?.[0]?.url ?? '../../assets/images/fatafat-masala-logo.jpg';
  }

  goBack(): void {
    this.location.back();
  }
}
