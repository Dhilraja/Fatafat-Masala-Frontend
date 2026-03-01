import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
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
import imageCompression from 'browser-image-compression';

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
  @ViewChild('fileInput') fileInputVariable!: ElementRef;

  formModel = {
    _id: '',
    name: '',
    mrp: '',
    price: '',
    description: '',
    images: [],
  };
  editingIndex: number | null = null;
  showError = false;
  statuses = ['Placed', 'Confirmed', 'Processing', 'Shipped', 'Delivered'];
  orders: any[] = [];
  imageLoading = false;

  ngOnInit(): void {
    this.getProducts();
    this.getOrders();
  }

  getProducts() {
    this.service.getProducts().subscribe((res: any) => {
      this.previewUrl = '';
      this.selectedFile = null;
      this.products = res.data;
      this.dataSource.data = this.products;
    });
  }

  getOrders() {
    this.service.getOrders().subscribe((res: any) => {
      this.orders = res.data;
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
    this.previewUrl = product.images?.[0]?.url;
    if (this.previewUrl) this.imageLoading = true;
  }

  onDelete(id: string) {
    this.service.onDelete(id).subscribe((res: any) => {
      this.getProducts();
    });
  }
  // this.products[this.editingIndex] = { ...this.formModel };
  onSave() {
    // if (this.editingIndex !== null) {
    if (
      !this.formModel.name ||
      !this.formModel.mrp ||
      !this.formModel.price ||
      !this.formModel.description ||
      !this.selectedFile
    ) {
      this.showError = true;
      return;
    }
    if (this.formModel._id != '') {
      const formData = new FormData();
      formData.append('id', this.formModel._id);
      formData.append('name', this.formModel.name);
      formData.append('mrp', this.formModel.mrp);
      formData.append('price', this.formModel.price);
      formData.append('description', this.formModel.description);
      formData.append('image', this.selectedFile);
      this.service.updateProduct(formData).subscribe((res: any) => {
        this.getProducts();
        this.resetForm();
        this.showError = false;
      });
    } else {
      // add new
      const formData = new FormData();
      formData.append('name', this.formModel.name);
      formData.append('mrp', this.formModel.mrp);
      formData.append('price', this.formModel.price);
      formData.append('description', this.formModel.description);
      formData.append('image', this.selectedFile);
      this.service.saveProduct(formData).subscribe((res: any) => {
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
      images: [],
    };
    this.editingIndex = null;
    this.previewUrl = '';
    this.selectedFile = null;
    this.fileInputVariable.nativeElement.value = null;
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
      images: [],
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

  selectedFile!: File | null;
  previewUrl!: string;

  async onFileSelect(event: any) {
    const file: File = event.target.files[0];
    const options = {
      maxSizeMB: 0.5, // compress to max 500KB
      maxWidthOrHeight: 1200, // resize large images
      useWebWorker: true,
    };
    try {
      const compressedFile = await imageCompression(file, options);
      console.log('Original size:', file.size / 1024, 'KB');
      console.log('Compressed size:', compressedFile.size / 1024, 'KB');
      this.selectedFile = compressedFile.size < file.size ? compressedFile : file;
      this.previewUrl = URL.createObjectURL(compressedFile);
    } catch (error) {
      console.error(error);
      this.service.getSnackbar('Please upload only image file');
    }
  }

  upload() {
    const formData = new FormData();
    if (this.selectedFile) formData.append('image', this.selectedFile);
    console.log('formData-------->', formData);
    this.service.uploadImage(formData).subscribe((res: any) => {
      this.service.getSnackbar(res.url);
    });
  }

  onImageLoad() {
    this.imageLoading = false;
  }

  updateOrderStatus(id: string, event: any) {}
}
