import { Component, OnInit, ViewChild } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';

// Project models and services
import { Sale, SaleStatus } from '../../models/sale';
import { SalesService } from '../../services/sales.service';
import { SnackbarService } from '../../services/snackbar.service';
import { AuthService } from '../../services/auth.service';
import { DateService } from '../../services/date.service';
import { OrderStatusService } from '../../services/order-status.service';
import { ProductService } from '../../services/product.service';

@Component({
  selector: 'app-moderator-report',
  templateUrl: './moderator-report.component.html',
  styleUrls: ['./moderator-report.component.sass'],
})
export class ModeratorReportComponent implements OnInit {

  // Define table columns to be displayed
  displayedColumns: string[] = [
    'product_name',
    'buyerName',
    'moreInfo',
    'status',
    'complete'
  ];

  // Data source for the table
  dataSource = new MatTableDataSource<Sale>();

  // Array to hold all fetched sales
  sales: Sale[] = [];

  // UI loading state
  loading = false;

  // Totals for sales summary section
  totalQuantitySold: number = 0;  // Total number of items sold
  totalPrice: number = 0;         // Total revenue from sales

  // Sale status enum used in template
  SaleStatus = SaleStatus;

  // Selected date filter (default '0' = all)
  selectedDateFilter: string = '0';

  // Search filter string
  currentFilterValue: string = '';

  // Filtered list of sales used for display
  filteredSales: Sale[] = [];

  // Reference to the table paginator
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  // Constructor injecting all required services
  constructor(
    private salesService: SalesService,
    private snackbarService: SnackbarService,
    private authService: AuthService,
    private dateService: DateService,
    private orderStatusService: OrderStatusService,
    private productService: ProductService
  ) {}

  // Component lifecycle hook: runs on component init
  ngOnInit(): void {
    // First, get current logged-in user
    this.authService.getCurrentUser().subscribe(
      (user) => {
        const uploaderId = user?.uid;

        // If user is authenticated, fetch their sales data
        if (uploaderId) {
          this.fetchSales(uploaderId);
        } else {
          // Handle missing uploader ID
          console.error('Uploader ID not found for authenticated user.');
          this.snackbarService.showSnackbar('Unable to retrieve uploader ID.');
        }
      },
      (error) => {
        console.error('Failed to get authenticated user:', error);
      }
    );
  }

  // Fetch sales from the backend for a specific uploader
  fetchSales(uploaderId: string): void {
    this.salesService.getSalesByUploader(uploaderId).subscribe(
      (sales) => {
        // Convert string dates to Date objects and assign to component property
        this.sales = sales.map((sale) => ({
          ...sale,
          saleDate: this.dateService.convertToDate(sale.saleDate),
        }));

        // Apply filters (date/search) to loaded sales
        this.applyFilters();

        // Assign paginator to table dataSource
        this.dataSource.paginator = this.paginator;
      },
      (error) => {
        console.error('Failed to fetch sales:', error);
      }
    );
  }

  // Apply both date and search filters
  applyFilters(): void {
    // Start with a fresh copy of sales array
    this.filteredSales = [...this.sales];

    // If a specific date filter is selected (not '0'), apply it
    if (this.selectedDateFilter !== '0') {
      this.filteredSales = this.dateService.filterByDate(
        this.filteredSales,
        this.selectedDateFilter
      );
    }

    // If search text is entered, filter by product name
    if (this.currentFilterValue) {
      this.filteredSales = this.filteredSales.filter((sale) =>
        sale.product_name.toLowerCase().includes(this.currentFilterValue.toLowerCase())
      );
    }

    // Assign the final filtered array to the table
    this.dataSource.data = this.filteredSales;

    // Recalculate the summary totals
    this.calculateTotals(this.filteredSales);
  }

  // Triggered on key press inside search input
  applyFilter(event: Event): void {
    // Extract the value from input element
    this.currentFilterValue = (event.target as HTMLInputElement).value.trim().toLowerCase();

    // Reapply filters after search text is updated
    this.applyFilters();
  }

  // Called when date filter buttons change
  filterByDate(period: string): void {
    this.selectedDateFilter = period; // Set the selected filter value
    this.applyFilters(); // Apply updated filters
  }

  // Calculate total quantity sold and total price from the filtered list
  calculateTotals(data: Sale[]): void {
    this.totalQuantitySold = data.reduce(
      (sum, sale) => sum + sale.quantitySold,
      0
    );

    let deliveryDeducted = false;

    this.totalPrice = data.reduce((sum, sale) => {
      const delivery = sale.deliveryRate || 0;
      const adjusted = deliveryDeducted ? sale.totalPrice : (sale.totalPrice - delivery);
      deliveryDeducted = true;
      return sum + (adjusted || 0);
    }, 0);
  }


  // Update the order status for a sale (e.g., pending, completed)
  updateBuyerOrderStatus(userId: string, saleId: string, newStatus: SaleStatus): void {
    this.orderStatusService.updateOrderStatus(this.sales, userId, saleId, newStatus).subscribe(
      () => {
        // On success, refresh filters to update the table
        this.applyFilters();
      },
      (error) => console.error('Error updating order status:', error)
    );
  }

  // Notify customer of completed order (delegates to service)
  handleOrderCompletion(sale: Sale): void {
    this.orderStatusService.handleOrderCompletion(sale);
  }
  // Get the relevant unit
  getUnit(unitType: 'size' | 'waist' | 'length' | 'fit' | 'kidsSize' | 'chest' | 'sleeve', size: number | string, sizeLabel: string): string {
    return this.productService.getUnit(unitType, size, sizeLabel);
  }
  getAdjustedPrice(sale: Sale): number {
    const delivery = sale.deliveryRate || 0;
    return +(sale.totalPrice - delivery).toFixed(2);
  }

}
