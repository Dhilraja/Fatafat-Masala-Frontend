import { AfterViewInit, Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AppService } from '../app.service';

@Component({
  selector: 'app-contact-us',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './contact-us.component.html',
  styleUrl: './contact-us.component.scss',
})
export class ContactUsComponent implements AfterViewInit {
  constructor(private service: AppService) {}

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

  submitted = false;
  loading = false;
  errorMsg = '';

  form = new FormGroup({
    name: new FormControl('', [Validators.required]),
    email: new FormControl('', [Validators.required, Validators.email]),
    phone: new FormControl('', [Validators.pattern(/^[6-9]\d{9}$/)]),
    message: new FormControl('', [Validators.required, Validators.minLength(10)]),
  });

  onSubmit() {
    if (this.form.invalid) return;
    this.loading = true;
    this.errorMsg = '';
    const { name, email, phone, message } = this.form.value;
    this.service.submitContact({ name: name!, email: email!, phone: phone || '', message: message! })
      .subscribe({
        next: () => {
          this.loading = false;
          this.submitted = true;
          this.form.reset();
          setTimeout(() => (this.submitted = false), 5000);
        },
        error: (err: any) => {
          this.loading = false;
          this.errorMsg = err?.error?.message ?? 'Something went wrong. Please try again.';
        },
      });
  }
}
