import { Component, OnInit, ViewChild } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { AppService } from '../app.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-admin',
  imports: [
    MatTableModule,
    MatPaginatorModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatButtonModule,
    ReactiveFormsModule,
    FormsModule,
    CommonModule,
  ],
  templateUrl: './admin.component.html',
  styleUrl: './admin.component.scss',
})
export class AdminComponent implements OnInit {
  constructor(private service: AppService) {}

  displayedColumns: string[] = ['name', 'mrp', 'price', 'action'];

  products: any[] = [];
  dataSource = new MatTableDataSource<any>([]);

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  formModel = {
    _id: '',
    name: '',
    mrp: '',
    price: '',
    description: '',
  };
  editingIndex: number | null = null;
  showError = false;

  ngOnInit(): void {
    this.getProducts();
  }

  getProducts() {
    this.service.getProducts().subscribe((res: any) => {
      this.products = res.data;
      this.dataSource.data = this.products;
    });
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  onEdit(product: any) {
    this.formModel = { ...product }; // clone
  }

  onDelete(id: string) {
    this.service.onDelete(id).subscribe((res: any) => {
      this.getProducts();
    });
  }
  // this.products[this.editingIndex] = { ...this.formModel };
  onSave() {
    // if (this.editingIndex !== null) {
    if (!this.formModel.name || !this.formModel.mrp || !this.formModel.price || !this.formModel.description) {
      this.showError = true;
      return;
    }
    if (this.formModel._id != '') {
      const payload = {
        id: this.formModel._id,
        name: this.formModel.name,
        mrp: this.formModel.mrp,
        price: this.formModel.price,
        description: this.formModel.description,
      };
      this.service.updateProduct(payload).subscribe((res: any) => {
        this.getProducts();
        this.resetForm();
        this.showError = false;
      });
    } else {
      // add new
      const payload = {
        name: this.formModel.name,
        mrp: this.formModel.mrp,
        price: this.formModel.price,
        description: this.formModel.description,
      };
      this.service.saveProduct(payload).subscribe((res: any) => {
        this.getProducts();
        this.resetForm();
        this.showError = false;
      });
    }
  }

  resetForm() {
    this.formModel = {
      _id: '',
      name: '',
      mrp: '',
      price: '',
      description: '',
    };
    this.editingIndex = null;
  }

  onEnableDisable(id: string, flag: boolean) {
    const payload = {
      id: id,
      flag: flag,
    };
    this.service.enableDisableProduct(payload).subscribe((res: any) => {
      this.getProducts();
    });
  }

  onStopEditing() {
    this.formModel = {
      _id: '',
      name: '',
      mrp: '',
      price: '',
      description: '',
    };
    this.editingIndex = null;
  }
  isGenerating = false;

  onGenerate(input: string) {
    this.isGenerating = true;
    this.service.generateDescription(input).subscribe((res: any) => {
      this.formModel.description = res.data;
      this.isGenerating = false;
    });
  }
}
