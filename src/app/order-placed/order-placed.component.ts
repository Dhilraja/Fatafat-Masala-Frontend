import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, OnInit } from '@angular/core';
import { LottieComponent } from 'ngx-lottie';
import { AppService } from '../app.service';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-order-placed',
  imports: [CommonModule],
  templateUrl: './order-placed.component.html',
  styleUrl: './order-placed.component.scss',
})
export class OrderPlacedComponent implements OnInit {
  constructor(
    private service: AppService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
  ) {}

  private colors = ['#d9a441', '#f28918', '#6b3e2e', '#3a9a6e', '#fdf6ec'];
  orderDetails: any;

  ngOnInit(): void {
    this.activatedRoute.queryParams.subscribe((params) => {
      const id = params['id'];
      if (!id) this.router.navigateByUrl('/home');
      this.service.getOrderDetails(id).subscribe((res: any) => {
        if (!res?.data) this.router.navigateByUrl('/home');
        this.orderDetails = res?.data;
        this.injectKeyframes();
        setTimeout(() => this.launchConfetti(), 1600);
      });
    });
  }

  private injectKeyframes(): void {
    const style = document.createElement('style');
    style.textContent = `
      @keyframes confettiFall {
        0%   { transform: translateY(0) rotate(0deg) scale(1); opacity: 1; }
        100% { transform: translateY(105vh) rotate(${Math.random() * 720}deg) scale(0.6); opacity: 0; }
      }
      .confetti-piece { position: fixed; pointer-events: none; z-index: 9999; }
    `;
    document.head.appendChild(style);
  }

  private launchConfetti(): void {
    const count = 60;
    for (let i = 0; i < count; i++) {
      setTimeout(() => {
        const el = document.createElement('div');
        el.classList.add('confetti-piece');

        const color = this.colors[Math.floor(Math.random() * this.colors.length)];
        const x = Math.random() * 100;
        const size = 6 + Math.random() * 6;
        const dur = 2.5 + Math.random() * 2;
        const delay = Math.random() * 0.6;
        const isCircle = Math.random() > 0.5;

        el.style.cssText = `
          left: ${x}vw;
          top: -10px;
          width: ${size}px;
          height: ${size}px;
          background: ${color};
          border-radius: ${isCircle ? '50%' : '2px'};
          opacity: 1;
          animation: confettiFall ${dur}s ease ${delay}s forwards;
        `;

        document.body.appendChild(el);
        setTimeout(() => el.remove(), (dur + delay + 0.5) * 1000);
      }, i * 30);
    }
  }
}
