// Angular core imports
import { Component, OnInit, ViewChild } from '@angular/core';

// Angular Material table and paginator
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';

// Models and enums
import { Sale, SaleStatus } from '../../models/sale';

// Services for handling logic
import { SalesService } from '../../services/sales.service';
import { BrandService } from '../../services/brand.service';
import { SnackbarService } from '../../services/snackbar.service';
import { DateService } from '../../services/date.service';
import { OrderStatusService } from '../../services/order-status.service';
import { ProductService } from '../../services/product.service';

@Component({
  selector: 'app-admin-report',
  templateUrl: './admin-report.component.html',
  styleUrls: ['./admin-report.component.sass'],
})
export class AdminReportComponent implements OnInit {

  // Columns displayed in the sales data table
  displayedColumns: string[] = [
    'product_name',
    'sellerName',
    'buyerName',
    'moreInfo',
    'complete',
    'status',
  ];

  dataSource = new MatTableDataSource<Sale>(); // Angular Material data source
  sales: Sale[] = [];                          // Holds all fetched sales
  filteredSales: Sale[] = [];                  // Holds filtered sales data

  totalQuantitySold: number = 0;               // Total quantity sold (calculated)
  totalPrice: number = 0;                      // Total price from all sales (calculated)

  selectedBrandId: string | null = null;       // Brand selected from filter dropdown
  selectedDateFilter: string = '0';            // Selected period filter (e.g., "Last 7 days")

  brands$ = this.brandService.getBrands();     // Observable list of brands for dropdown
  brands: any[] = [];                          // Brand list after subscription

  currentFilterValue: string = '';             // Value entered in search box

  @ViewChild(MatPaginator) paginator!: MatPaginator; // Reference to Angular Material paginator

  SaleStatus = SaleStatus;                     // Sale status enum available to template
  loading = false;                             // Loading state toggle

  constructor(
    private salesService: SalesService,           // Inject sales service
    private brandService: BrandService,           // Inject brand service
    private snackbarService: SnackbarService,     // Inject snackbar service
    private dateService: DateService,             // Inject date filter service
    private orderStatusService: OrderStatusService, // Inject order status service
    private productService: ProductService        // Inject product unit service
  ) {}

  ngOnInit(): void {
    // Load all sales on component init
    this.salesService.getAllSales().subscribe((sales) => {
      this.sales = sales.map((sale) => ({
        ...sale,
        saleDate: this.dateService.convertToDate(sale.saleDate), // Convert sale date to readable format
      }));
      this.applyFilters(); // Apply filters on initial data load
    });

    // Load all brands on component init
    this.brandService.getBrands().subscribe((brands) => {
      this.brands = brands;
    });

    // Assign paginator to the data table
    this.dataSource.paginator = this.paginator;
  }

  // Filters sales data based on date, brand, and text input
  applyFilters(): void {
    let filteredData = [...this.sales]; // Create a copy of sales for filtering

    // Apply date-based filtering
    if (this.selectedDateFilter !== '0') {
      filteredData = this.dateService.filterByDate(
        filteredData,
        this.selectedDateFilter
      );
    }

    // Apply brand filter if selected
    if (this.selectedBrandId && this.selectedBrandId !== '0') {
      filteredData = filteredData.filter(
        (sale) => sale.sellerName === this.selectedBrandId
      );
    }

    // Apply search text filter (by product name)
    if (this.currentFilterValue) {
      filteredData = filteredData.filter((sale) =>
        sale.product_name
          .toLowerCase()
          .includes(this.currentFilterValue.toLowerCase())
      );
    }

    // Store filtered results
    this.filteredSales = filteredData;

    // Assign filtered results to table data source
    this.dataSource.data = this.filteredSales;

    // Update total price and quantity sold based on filtered data
    this.calculateTotals(this.filteredSales);

    // Reapply paginator to updated data source
    this.dataSource.paginator = this.paginator;
  }

  // Calculate total quantity and total price
  calculateTotals(data: Sale[]): void {
    // Sum total quantity
    this.totalQuantitySold = data.reduce(
      (sum, sale) => sum + sale.quantitySold,
      0
    );

    // Sum total price
    this.totalPrice = data.reduce(
      (sum, sale) => sum + Number(sale.totalPrice),
      0
    );
  }

  // Triggered when user selects a time period (e.g., today, this week)
  filterByDate(period: string): void {
    this.selectedDateFilter = period; // Save selected period
    this.applyFilters();              // Reapply filters
  }

  // Triggered when user selects a brand from dropdown
  filterByBrand(brandId: string): void {
    this.selectedBrandId = brandId; // Save selected brand
    this.applyFilters();            // Reapply filters
  }

  // Triggered on text input in search field
  applyFilter(event: Event): void {
    this.currentFilterValue = (event.target as HTMLInputElement).value
      .trim()
      .toLowerCase(); // Normalize input
    this.applyFilters(); // Apply text filter
  }

  // Admin can update buyer's order status from table
  updateBuyerOrderStatus(
    userId: string,
    saleId: string,
    newStatus: SaleStatus
  ): void {
    this.orderStatusService
      .updateOrderStatus(this.sales, userId, saleId, newStatus)
      .subscribe(
        () => {
          this.applyFilters(); // Refresh view after status change
        },
        (error) =>
          console.error('Error updating order status:', error) // Log errors
      );
  }

  // Handle complete logic of marking a sale as fulfilled
  handleOrderCompletion(sale: Sale): void {
    this.orderStatusService.handleOrderCompletion(sale); // Logic inside service
  }
  // Get the relevant unit
  getUnit(unitType: 'size' | 'waist' | 'length' | 'fit' | 'kidsSize' | 'chest' | 'sleeve', size: number | string, sizeLabel: string): string {
    return this.productService.getUnit(unitType, size, sizeLabel);
  }

}
