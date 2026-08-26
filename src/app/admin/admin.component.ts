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
import { BaseChartDirective } from 'ng2-charts';
import { ChartData, ChartOptions, Chart, registerables } from 'chart.js';

Chart.register(...registerables);

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
    BaseChartDirective,
  ],
  templateUrl: './admin.component.html',
  styleUrl: './admin.component.scss',
})
export class AdminComponent implements OnInit, AfterViewInit {
  constructor(
    private service: AppService,
    private zone: NgZone,
  ) {}

  displayedColumns: string[] = ['name', 'mrp', 'price', 'action'];
  displayedColumns2: string[] = [
    'orderId',
    'customerName',
    'quantities',
    'totalAmount',
    'date',
    'status',
    'orderActions',
  ];
  displayedColumns3: string[] = [
    'contactName',
    'contactEmail',
    'contactPhone',
    'contactMessage',
    'contactDate',
    'contactAction',
  ];

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
    variant: '',
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

  // ── Extra insight stats ──
  avgOrderValue = 0;
  pendingOrders = 0;
  cancelledOrders = 0;
  cancellationRate = 0;

  // ── Revenue over time (Line) ──
  revenuePeriod: '7d' | '30d' | '90d' = '30d';
  revenueChartData: ChartData<'line'> = { labels: [], datasets: [] };
  revenueChartOptions: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (ctx) => ` ₹${(ctx.parsed.y as number).toLocaleString('en-IN')}`,
        },
      },
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { font: { family: 'DM Sans', size: 11 }, color: '#9b8a7a', maxTicksLimit: 10 },
      },
      y: {
        beginAtZero: true,
        grid: { color: 'rgba(0,0,0,0.05)' },
        ticks: {
          font: { family: 'DM Sans', size: 11 },
          color: '#9b8a7a',
          callback: (v) => `₹${v}`,
        },
      },
    },
  };

  // ── Orders by status (Doughnut) ──
  statusChartData: ChartData<'doughnut'> = { labels: [], datasets: [] };
  statusChartOptions: ChartOptions<'doughnut'> = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '70%',
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          font: { family: 'DM Sans', size: 12 },
          padding: 16,
          usePointStyle: true,
          pointStyleWidth: 10,
        },
      },
      tooltip: {
        callbacks: {
          label: (ctx) => ` ${ctx.label}: ${ctx.parsed} orders`,
        },
      },
    },
  };

  // ── Top selling products (Horizontal Bar) ──
  topProductsChartData: ChartData<'bar'> = { labels: [], datasets: [] };
  topProductsChartOptions: ChartOptions<'bar'> = {
    indexAxis: 'y',
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
      x: {
        beginAtZero: true,
        grid: { color: 'rgba(0,0,0,0.05)' },
        ticks: { font: { family: 'DM Sans', size: 11 }, color: '#9b8a7a', stepSize: 1 },
      },
      y: {
        grid: { display: false },
        ticks: { font: { family: 'DM Sans', size: 12 }, color: '#4a3728' },
      },
    },
  };

  // ── Orders per day (Bar) ──
  ordersPerDayChartData: ChartData<'bar'> = { labels: [], datasets: [] };
  ordersPerDayChartOptions: ChartOptions<'bar'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
      x: {
        grid: { display: false },
        ticks: { font: { family: 'DM Sans', size: 11 }, color: '#9b8a7a', maxTicksLimit: 10 },
      },
      y: {
        beginAtZero: true,
        grid: { color: 'rgba(0,0,0,0.05)' },
        ticks: { font: { family: 'DM Sans', size: 11 }, color: '#9b8a7a', stepSize: 1 },
      },
    },
  };

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
        if (!this.distinctOrderIds.includes(ele?.userId?._id)) this.distinctOrderIds.push(ele?.userId?._id);
        return ele;
      });
      res.data.forEach((ele: any) => {
        this.totalRevenue += ele.totalAmount;
      });
      this.dataSource2.data = [...this.orders].reverse();
      if (this.paginator2) this.dataSource2.paginator = this.paginator2;
      this.buildCharts();
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

  // ── Chart builders ──

  private buildCharts() {
    this.computeExtraStats();
    this.buildRevenueChart();
    this.buildStatusChart();
    this.buildTopProductsChart();
    this.buildOrdersPerDayChart();
  }

  private computeExtraStats() {
    this.avgOrderValue = this.orders.length ? Math.round(this.totalRevenue / this.orders.length) : 0;
    this.pendingOrders = this.orders.filter((o) => o.status === 'PLACED').length;
    this.cancelledOrders = this.orders.filter((o) => o.status === 'CANCELLED').length;
    this.cancellationRate = this.orders.length ? Math.round((this.cancelledOrders / this.orders.length) * 100) : 0;
  }

  private buildRevenueChart() {
    const days = this.revenuePeriod === '7d' ? 7 : this.revenuePeriod === '30d' ? 30 : 90;
    const now = new Date();
    const map = new Map<string, number>();
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      map.set(this.fmtDate(d), 0);
    }
    const cutoff = new Date(now);
    cutoff.setDate(cutoff.getDate() - days);
    for (const order of this.orders) {
      const d = new Date(order.createdAt);
      if (d >= cutoff) {
        const key = this.fmtDate(d);
        if (map.has(key)) map.set(key, (map.get(key) ?? 0) + order.totalAmount);
      }
    }
    this.revenueChartData = {
      labels: Array.from(map.keys()).map((k) => this.shortDate(k)),
      datasets: [
        {
          data: Array.from(map.values()),
          label: 'Revenue',
          borderColor: '#d9a441',
          backgroundColor: 'rgba(217,164,65,0.08)',
          fill: true,
          tension: 0.4,
          pointBackgroundColor: '#d9a441',
          pointRadius: days > 30 ? 2 : 4,
          pointHoverRadius: 6,
        },
      ],
    };
  }

  private buildStatusChart() {
    const counts = { PLACED: 0, PROCESSING: 0, SHIPPED: 0, DELIVERED: 0, CANCELLED: 0 };
    for (const o of this.orders) {
      if (o.status in counts) counts[o.status as keyof typeof counts]++;
    }
    this.statusChartData = {
      labels: ['Placed', 'Processing', 'Shipped', 'Delivered', 'Cancelled'],
      datasets: [
        {
          data: [counts.PLACED, counts.PROCESSING, counts.SHIPPED, counts.DELIVERED, counts.CANCELLED],
          backgroundColor: ['#6366f1', '#f28918', '#3b82f6', '#3a9a6e', '#e05252'],
          borderWidth: 0,
          hoverOffset: 6,
        },
      ],
    };
  }

  private buildTopProductsChart() {
    const map = new Map<string, number>();
    for (const order of this.orders) {
      for (const item of order.items) {
        map.set(item.name, (map.get(item.name) ?? 0) + item.quantity);
      }
    }
    const sorted = Array.from(map.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8);
    this.topProductsChartData = {
      labels: sorted.map(([name]) => (name.length > 24 ? name.substring(0, 22) + '…' : name)),
      datasets: [
        {
          data: sorted.map(([, qty]) => qty),
          label: 'Units Sold',
          backgroundColor: sorted.map(
            (_, i) => `rgba(217,164,65,${(0.45 + ((sorted.length - i) / sorted.length) * 0.5).toFixed(2)})`,
          ),
          borderColor: '#d9a441',
          borderWidth: 1,
          borderRadius: 6,
        },
      ],
    };
  }

  private buildOrdersPerDayChart() {
    const now = new Date();
    const map = new Map<string, number>();
    for (let i = 29; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      map.set(this.fmtDate(d), 0);
    }
    const cutoff = new Date(now);
    cutoff.setDate(cutoff.getDate() - 30);
    for (const order of this.orders) {
      const d = new Date(order.createdAt);
      if (d >= cutoff) {
        const key = this.fmtDate(d);
        if (map.has(key)) map.set(key, (map.get(key) ?? 0) + 1);
      }
    }
    this.ordersPerDayChartData = {
      labels: Array.from(map.keys()).map((k) => this.shortDate(k)),
      datasets: [
        {
          data: Array.from(map.values()),
          label: 'Orders',
          backgroundColor: 'rgba(107,62,46,0.7)',
          borderColor: '#6b3e2e',
          borderWidth: 0,
          borderRadius: 6,
        },
      ],
    };
  }

  private fmtDate(d: Date): string {
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  }

  private shortDate(dateStr: string): string {
    const [, m, day] = dateStr.split('-');
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${parseInt(day)} ${months[parseInt(m) - 1]}`;
  }

  setRevenuePeriod(period: '7d' | '30d' | '90d') {
    this.revenuePeriod = period;
    this.buildRevenueChart();
  }

  // ── Existing methods ──

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource2.paginator = this.paginator2;
    this.dataSource3.paginator = this.paginator3;
    this.dataSource.sort = this.sort;

    const els = document.querySelectorAll<HTMLElement>('[class*="anim-"]');
    els.forEach((el) => {
      const delay = parseInt(el.className.match(/anim-(\d+)/)?.[1] ?? '1', 10);
      el.style.animationDelay = `${(delay - 1) * 0.12}s`;
    });

    const observer = new IntersectionObserver(
      (entries) =>
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add('visible');
            observer.unobserve(e.target);
          }
        }),
      { threshold: 0.08 },
    );
    document.querySelectorAll('.section').forEach((el) => observer.observe(el));
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
    if (this.dataSource.paginator) this.dataSource.paginator.firstPage();
  }

  applyFilterOrders(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource2.filter = filterValue.trim().toLowerCase();
    if (this.dataSource2.paginator) this.dataSource2.paginator.firstPage();
  }

  onEdit(product: any) {
    this.formModel = { ...product };
    this.previewUrl = product.images?.[0]?.url;
    this.selectedFile = product.images?.[0]?.url;
    if (this.previewUrl) this.imageLoading = true;
  }

  onDelete(id: string) {
    this.service.onDelete(id).subscribe((res: any) => {
      this.getProducts();
    });
  }

  onSave() {
    if (
      !this.formModel.name ||
      !this.formModel.mrp ||
      !this.formModel.price ||
      !this.formModel.description ||
      !this.formModel.variant ||
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
      formData.append('variant', this.formModel.variant);
      formData.append('image', this.selectedFile);
      this.service.updateProduct(formData).subscribe((res: any) => {
        this.getProducts();
        this.resetForm();
        this.showError = false;
      });
    } else {
      const formData = new FormData();
      formData.append('name', this.formModel.name);
      formData.append('mrp', this.formModel.mrp);
      formData.append('price', this.formModel.price);
      formData.append('description', this.formModel.description);
      formData.append('variant', this.formModel.variant);
      formData.append('image', this.selectedFile);
      this.service.saveProduct(formData).subscribe((res: any) => {
        this.getProducts();
        this.resetForm();
        this.showError = false;
      });
    }
  }

  resetForm() {
    this.formModel = { _id: '', name: '', mrp: '', price: '', description: '', variant: '', images: [] };
    this.editingIndex = null;
    this.previewUrl = '';
    this.selectedFile = null;
    this.fileInputVariable.nativeElement.value = null;
  }

  onEnableDisable(id: string, flag: boolean) {
    this.service.enableDisableProduct({ id, flag }).subscribe((res: any) => {
      this.getProducts();
    });
  }

  onStopEditing() {
    this.formModel = { _id: '', name: '', mrp: '', price: '', description: '', variant: '', images: [] };
    this.editingIndex = null;
    this.selectedFile = null;
    this.previewUrl = '';
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
    const options = { maxSizeMB: 0.5, maxWidthOrHeight: 1200, useWebWorker: true };
    try {
      const compressedFile = await imageCompression(file, options);
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
    this.service.uploadImage(formData).subscribe((res: any) => {
      this.service.getSnackbar(res.url);
    });
  }

  onImageLoad() {
    this.imageLoading = false;
  }

  updateOrderStatus(id: string, event: any) {}

  activeTab = 'orders';
  switchTab(tab: string) {
    this.activeTab = tab;
  }

  expandedContact: any = null;
  openMessage(contact: any) {
    this.expandedContact = contact;
  }
  closeMessage() {
    this.expandedContact = null;
  }

  orderStatuses = ['PLACED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'];
  expandedOrder: any = null;
  orderLoading = false;

  openOrder(order: any) {
    this.orderLoading = true;
    this.expandedOrder = { ...order, _loadedDetails: false };
    this.service.getOrderDetails(order._id).subscribe({
      next: (res: any) => {
        this.expandedOrder = { ...res.data, _loadedDetails: true };
        this.orderLoading = false;
      },
      error: () => {
        this.orderLoading = false;
      },
    });
  }

  closeOrder() {
    this.expandedOrder = null;
  }

  onStatusChange(status: string) {
    if (!this.expandedOrder) return;
    this.service.updateOrderStatus({ id: this.expandedOrder._id, status }).subscribe({
      next: () => {
        this.expandedOrder.status = status;
        const row = this.orders.find((o: any) => o._id === this.expandedOrder._id);
        if (row) row.status = status;
        if (status == 'PLACED') this.pendingOrders++;
        else this.pendingOrders--;
        this.service.getSnackbar('Status updated to ' + status);
      },
      error: () => {
        this.service.getSnackbar('Failed to update status');
      },
    });
  }

  getOrderSubtotal(order: any): number {
    return order.totalAmount > 299 ? order.totalAmount : order.totalAmount - 50;
  }

  getOrderDelivery(order: any): number {
    return order.totalAmount > 299 ? 0 : 50;
  }

  getItemImage(item: any): string {
    return item?.productId?.images?.[0]?.url || '../../assets/images/fatafat-masala-logo.jpg';
  }
}
