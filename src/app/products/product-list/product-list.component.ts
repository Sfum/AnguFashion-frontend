import {Product} from '../../models/product';
import {Component, Input, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {MatTableDataSource} from '@angular/material/table';
import {MatPaginator} from '@angular/material/paginator';
import {Subject, Subscription, takeUntil} from 'rxjs';
import {ProductService} from '../../services/product.service';
import {SnackbarService} from '../../services/snackbar.service';
import {switchMap} from 'rxjs/operators';
import {BreakpointObserver, Breakpoints} from '@angular/cdk/layout';

@Component({
  selector: 'app-product-list',
  templateUrl: './product-list.component.html',
  styleUrls: ['./product-list.component.sass'],
})
export class ProductListComponent implements OnInit, OnDestroy {
  @Input() product!: Product;  // Input property for individual product (not used directly in this component)
  timestamp: number = new Date().getTime();  // Get current timestamp

  isLoading$ = this.productService.isLoading$;  // Bind to service observable for loading state
  smallScreenColumns: string[] = ['product_name', 'sizesPrices', 'delete'];  // Columns to show on small screens
  largeScreenColumns: string[] = [
    'product_image',
    'product_name',
    'quantityStock',
    'discountPercentage',
    'sizesPrices',
    'delete',
  ];  // Columns to show on large screens
  displayedColumns: string[] = [
    'product_image',
    'product_name',
    'quantityStock',
    'discountPercentage',
    'sizesPrices',
    'delete',
  ];  // Default columns to be displayed in the table

  dataSource!: MatTableDataSource<Product>;  // DataSource for the table
  products: Product[] = [];  // Array to hold the list of products

  @ViewChild(MatPaginator) paginator!: MatPaginator;  // Reference to MatPaginator for pagination

  private refresh$ = new Subject<void>();  // Subject to trigger refresh actions
  private unsubscribe$ = new Subject<void>();  // Subject to handle unsubscription logic
  private productUpdatesSubscription: Subscription | undefined;  // Subscription for product updates
  private hasReloaded: boolean = false;  // Flag to prevent multiple reloads

  constructor(
    private productService: ProductService,  // Inject ProductService for managing products
    public snackbarService: SnackbarService,  // Inject SnackbarService for notifications
    private breakpointObserver: BreakpointObserver  // Inject BreakpointObserver for handling responsive design
  ) {}

  ngOnInit(): void {
    // Subscribe to product updates to refresh the list when a product is updated
    this.productService.listenForProductUpdates();
    this.productUpdatesSubscription = this.productService.productUpdates$.subscribe(
      (updatedProduct) => {
        this.refreshAfterUpdate(updatedProduct);  // Refresh table after a product update
      },
    );

    // Fetch products initially or when refresh$ emits a value
    this.refresh$
      .pipe(
        switchMap(() => {
          this.productService.setLoading(true);  // Set loading state to true
          return this.productService.getFilteredProductCollection();  // Fetch filtered product collection
        }),
        takeUntil(this.unsubscribe$)  // Unsubscribe when component is destroyed
      )
      .subscribe(
        (products) => {
          // Map over products to ensure 'sizes' is always an array
          this.products = products.map((product) => ({
            ...product,
            sizes: product.sizes || [],  // Set default empty array if sizes is undefined
          }));
          this.dataSource = new MatTableDataSource<Product>(this.products);  // Set the dataSource with the fetched products
          this.dataSource.paginator = this.paginator;  // Set paginator for the table
          this.productService.setLoading(false);  // Set loading state to false

          // Reload page once after products are fetched
          if (!this.hasReloaded) {
            this.hasReloaded = true;  // Prevent multiple reloads
          }
        },
        (error) => {
          console.error('Error fetching products:', error);
          this.productService.setLoading(false);  // Set loading state to false if there's an error
        }
      );

    // Observe screen size and adjust displayed columns for small or large screens
    this.breakpointObserver
      .observe([Breakpoints.Handset, Breakpoints.Tablet])
      .subscribe((result) => {
        if (result.matches) {
          // If small screen is detected, show fewer columns
          this.displayedColumns = this.smallScreenColumns;
        } else {
          // If large screen is detected, show more columns
          this.displayedColumns = this.largeScreenColumns;
        }
      });

    // Trigger initial fetch for products
    this.refresh$.next();
  }

  ngOnDestroy(): void {
    // Cleanup and unsubscribe from observables
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
    if (this.productUpdatesSubscription) {
      this.productUpdatesSubscription.unsubscribe();  // Unsubscribe from product updates subscription
    }
  }

  private fetchProducts(): void {
    // Emit refresh signal to trigger fetching of products
    this.refresh$.next();
  }

  private refreshAfterUpdate(updatedProduct: Product): void {
    // Find the index of the updated product in the existing products array
    const index = this.products.findIndex((p) => p.id === updatedProduct.id);
    if (index !== -1) {
      this.products[index] = updatedProduct;  // Update the existing product
    } else {
      this.products.push(updatedProduct);  // Add the new product to the array
    }
    this.dataSource.data = [...this.products];  // Update the table's data source with the new list
  }

  deleteProduct(id: string): void {
    // Confirm product deletion and then delete the product
    if (confirm('Are you sure you want to delete this product?')) {
      this.productService.setLoading(true);  // Set loading state to true
      this.productService.deleteProduct(id).subscribe(
        () => {
          this.snackbarService.showSnackbar('Product deleted successfully');  // Show success message
          this.fetchProducts();  // Refresh the products list
          this.productService.setLoading(false);  // Set loading state to false
        },
        (error) => {
          console.error('Error deleting product:', error);
          this.snackbarService.showSnackbar('Failed to delete product');  // Show error message
          this.productService.setLoading(false);  // Set loading state to false
        }
      );
    }
  }

  // Get background color based on stock quantity (red for out of stock, light coral for low stock)
  getStockBackgroundColor(quantity: number): string {
    if (quantity === 0) {
      return 'red';  // Out of stock
    } else if (quantity <= 5) {
      return 'lightcoral';  // Low stock
    } else {
      return 'transparent';  // In stock
    }
  }

  // Get the relevant unit based on product size type and label
  getUnit(unitType: 'size' | 'waist' | 'length' | 'fit' | 'kidsSize' | 'chest' | 'sleeve', size: number | string, sizeLabel: string): string {
    return this.productService.getUnit(unitType, size, sizeLabel);
  }
}
