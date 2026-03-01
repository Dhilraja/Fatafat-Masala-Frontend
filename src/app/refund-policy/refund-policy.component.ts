import { Component } from '@angular/core';

@Component({
  selector: 'app-refund-policy',
  imports: [],
  templateUrl: './refund-policy.component.html',
  styleUrl: './refund-policy.component.scss',
})
export class RefundPolicyComponent {
  scrollTo(section: string) {
    document.getElementById(section)?.scrollIntoView({
      behavior: 'smooth',
      block: 'center',
    });
  }
}
