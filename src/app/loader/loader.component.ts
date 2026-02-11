import { Component } from '@angular/core';
import { AppService } from '../app.service';
import { Observable } from 'rxjs';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-loader',
  imports: [CommonModule],
  templateUrl: './loader.component.html',
  styleUrl: './loader.component.scss',
})
export class LoaderComponent {
  loading$!: Observable<boolean>;

  constructor(private service: AppService) {
    this.loading$ = this.service.loading$;
  }
}
