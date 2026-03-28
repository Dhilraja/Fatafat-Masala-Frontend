import { AfterViewInit, Component, ElementRef, NgZone, OnInit, ViewChild } from '@angular/core';
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
export class AdminComponent implements OnInit, AfterViewInit {
  constructor(private service: AppService, private zone: NgZone) {}

  displayedColumns: string[] = ['name', 'mrp', 'price', 'action'];
  displayedColumns2: string[] = ['orderId', 'customerName', 'quantities', 'totalAmount', 'date'];
  displayedColumns3: string[] = ['contactName', 'contactEmail', 'contactPhone', 'contactMessage', 'contactDate', 'contactAction'];

  products: any[] = [];
  dataSource = new MatTableDataSource<any>([]);
  dataSource2 = new MatTableDataSource<any>([]);
  dataSource3 = new MatTableDataSource<any>([]);
  unreadCount = 0;

  @ViewChild('paginator1') paginator!: MatPaginator;
  @ViewChild('paginator2') paginator2!: MatPaginator;
  @ViewChild('paginator3') paginator3!: MatPaginator;
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
  totalRevenue = 0;
  totalQuantities = 0;
  distinctOrderIds: any[] = [];

  ngOnInit(): void {
    this.getProducts();
    this.getOrders();
    this.getContacts();
  }

  getProducts() {
    this.service.getProducts().subscribe((res: any) => {
      this.previewUrl = '';
      this.selectedFile = null;
      this.products = res.data;
      this.dataSource.data = this.products;
      if (this.paginator) this.dataSource.paginator = this.paginator;
    });
  }

  getOrders() {
    this.service.getOrders().subscribe((res: any) => {
      this.orders = res.data.map((ele: any) => {
        let totalQuantities = 0;
        ele.items.forEach((ele: any) => {
          totalQuantities += ele.quantity;
        });
        ele['totalQuantities'] = totalQuantities;
        this.totalQuantities += totalQuantities;
        if (!this.distinctOrderIds.includes(ele?.userId)) this.distinctOrderIds.push(ele?.userId);
        return ele;
      });
      res.data.forEach((ele: any) => {
        this.totalRevenue += ele.totalAmount;
      });
      this.dataSource2.data = this.orders;
      if (this.paginator2) this.dataSource2.paginator = this.paginator2;
    });
  }

  getContacts() {
    this.service.getContacts().subscribe((res: any) => {
      this.dataSource3.data = res.data;
      this.unreadCount = res.data.filter((c: any) => !c.isRead).length;
      if (this.paginator3) this.dataSource3.paginator = this.paginator3;
    });
  }

  markRead(contact: any) {
    if (contact.isRead) return;
    this.service.markContactRead(contact._id).subscribe(() => {
      contact.isRead = true;
      this.unreadCount = Math.max(0, this.unreadCount - 1);
    });
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource2.paginator = this.paginator2;
    this.dataSource3.paginator = this.paginator3;
    this.dataSource.sort = this.sort;

    // Staggered entrance animations
    const els = document.querySelectorAll<HTMLElement>('[class*="anim-"]');
    els.forEach((el) => {
      const delay = parseInt(el.className.match(/anim-(\d+)/)?.[1] ?? '1', 10);
      el.style.animationDelay = `${(delay - 1) * 0.12}s`;
    });

    // Scroll-reveal for sections
    const observer = new IntersectionObserver(
      (entries) => entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('visible'); observer.unobserve(e.target); } }),
      { threshold: 0.08 },
    );
    document.querySelectorAll('.section').forEach((el) => observer.observe(el));
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  applyFilterOrders(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource2.filter = filterValue.trim().toLowerCase();

    if (this.dataSource2.paginator) {
      this.dataSource2.paginator.firstPage();
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

  activeTab = 'orders';
  switchTab(tab: string) { this.activeTab = tab; }
}
