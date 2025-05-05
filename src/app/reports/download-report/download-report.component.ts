import { Component, HostListener, OnInit, ViewChild } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { Sale, SaleStatus } from '../../models/sale';
import { SalesService } from '../../services/sales.service';
import { AuthService } from '../../services/auth.service';
import firebase from 'firebase/compat/app';
import { ModalService } from '../../services/modal.service';
import { DateService } from '../../services/date.service';
import { MatPaginator } from '@angular/material/paginator';

// Alias for Firebase user type
import User = firebase.User;

// Extended interface to ensure saleDate is converted to Date object
export interface MappedSale extends Sale {
  saleDate: Date;
}

@Component({
  selector: 'app-download-report',
  templateUrl: './download-report.component.html',
  styleUrls: ['./download-report.component.sass'],
})
export class DownloadReportComponent implements OnInit {

  // Columns shown in the table, dynamically updated based on screen size
  displayedColumns: string[] = [
    'product_name',
    'totalPrice',
    'quantitySold',
    'saleDate',
    'orderStatus',
    'view',
  ];

  // Enum reference for template usage
  SaleStatus = SaleStatus;

  // Table data source
  dataSource = new MatTableDataSource<MappedSale>();

  // Local array to store all sales
  sales: MappedSale[] = [];

  // Internal map for toggling grey background styling by timestamp
  private timestampToggleMap: { [key: string]: boolean } = {};

  // Totals for sales data
  totalQuantitySold: number = 0;
  totalPrice: number = 0;

  // Responsive column flags
  showQuantity: boolean = true;
  showPrice: boolean = true;
  showDate: boolean = true;
  showInvoice: boolean = true;

  // Paginator reference for Material table
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  constructor(
    private salesService: SalesService,
    private authService: AuthService,
    private modalService: ModalService,
    private dateService: DateService
  ) {
    this.adjustColumns(window.innerWidth);
  }

  ngOnInit(): void {
    // Get current user and load their sales
    this.authService.getCurrentUser().subscribe((user: User | null) => {
      if (user) {
        const userId = user.uid;

        // Get all downloadable sales for current user
        this.salesService.getDownloadsByUser(userId).subscribe((sales) => {
          this.sales = sales.map((sale) => ({
            ...sale,
            saleDate: this.dateService.convertToDate(sale.saleDate),
          }));

          // Sort by most recent sale
          this.sales.sort((a, b) => b.saleDate.getTime() - a.saleDate.getTime());

          // Populate data table
          this.dataSource.data = this.sales;
          this.dataSource.paginator = this.paginator;

          // Calculate initial totals
          this.calculateTotals(this.sales);
        });
      }
    });
  }

  // Handle window resize to adjust table columns responsively
  @HostListener('window:resize', ['$event'])
  onResize(event: Event): void {
    const width = (event.target as Window).innerWidth;
    this.adjustColumns(width);
  }

  // Dynamically control which columns should be shown based on screen size
  private adjustColumns(width: number): void {
    this.showQuantity = width > 768;  // Show quantity for medium+ screens
    this.showPrice = width > 576;     // Show price for small+ screens
    this.showDate = width > 480;      // Show date for very small+ screens

    // Always show product name column
    this.displayedColumns = ['product_name'];

    // Conditionally add other columns based on flags
    if (this.showQuantity) this.displayedColumns.push('quantitySold');
    if (this.showPrice) this.displayedColumns.push('totalPrice');
    if (this.showDate) this.displayedColumns.push('saleDate');

    // Always show status and invoice view
    this.displayedColumns.push('orderStatus');
    if (this.showInvoice) this.displayedColumns.push('view');
  }

  // Apply a string-based filter to the table
  applyFilter(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    // Update totals based on filtered results
    this.calculateTotals(this.dataSource.filteredData);
  }

  // Open modal dialog with invoice details
  viewInvoice(sale: MappedSale): void {
    this.modalService.openInvoiceDialog(sale);
  }

  // Filter sales based on selected time period using DateService
  filterByDate(period: string): void {
    const filteredData = this.dateService.filterByDate(this.sales, period);
    this.dataSource.data = filteredData;

    // Recalculate totals on filtered data
    this.calculateTotals(filteredData);
  }

  // Calculate total quantity and price from a given array of sales
  calculateTotals(data: MappedSale[]): void {
    this.totalQuantitySold = data.reduce((sum, sale) => sum + sale.quantitySold, 0);

    this.totalPrice = data.reduce((sum, sale) => {
      const total = sale.totalPrice || 0;
      const delivery = sale.deliveryRate || 0;
      return sum + (total - delivery);
    }, 0);
  }


  // Check if this is the first appearance of a given saleDate (per page)
  isFirstTimestamp(date: Date, index: number): boolean {
    const currentPageData = this.dataSource._pageData(this.dataSource.filteredData);
    return currentPageData.findIndex(
      (sale) => sale.saleDate.getTime() === date.getTime()
    ) === index;
  }

  // Determine if this row should have grey background (alternating rows)
  isTimestampGreyed(row: MappedSale, index: number): boolean {
    return index % 2 !== 0;
  }
  getAdjustedPrice(sale: Sale): number {
    const total = sale.totalPrice || 0;
    const delivery = sale.deliveryRate || 0;
    return +(total - delivery).toFixed(2);
  }

}
