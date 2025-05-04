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
  @Input() product!: Product;

  isLoading$ = this.productService.isLoading$; // Bind to service observable
  smallScreenColumns: string[] = ['product_name', 'sizesPrices', 'delete']; // Columns to show on small screens
  largeScreenColumns: string[] = [
    'product_image',
    'product_name',
    'quantityStock',
    'discountPercentage',
    'sizesPrices',
    'delete',
  ];
  displayedColumns: string[] = [
    'product_image',
    'product_name',
    'quantityStock',
    'discountPercentage',
    'sizesPrices',
    'delete',
  ];

  dataSource!: MatTableDataSource<Product>;
  products: Product[] = [];
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  private refresh$ = new Subject<void>(); // Subject to trigger refreshes
  private unsubscribe$ = new Subject<void>(); // Subject for unsubscribing
  private productUpdatesSubscription: Subscription | undefined;
  private hasReloaded: boolean = false; // Flag to ensure reload happens only once

  constructor(
    private productService: ProductService,
    public snackbarService: SnackbarService,
    private breakpointObserver: BreakpointObserver
  ) {}

  ngOnInit(): void {
    // Subscribe to product updates and trigger refresh
    this.productService.listenForProductUpdates();
    this.productUpdatesSubscription = this.productService.productUpdates$.subscribe(
      (updatedProduct) => {
        this.refreshAfterUpdate(updatedProduct);
      },
    );

    // Fetch products initially or when refresh$ emits
    this.refresh$
      .pipe(
        switchMap(() => {
          this.productService.setLoading(true);
          return this.productService.getFilteredProductCollection();
        }),
        takeUntil(this.unsubscribe$)
      )
      .subscribe(
        (products) => {
          this.products = products.map((product) => ({
            ...product,
            sizes: product.sizes || [],
          }));
          this.dataSource = new MatTableDataSource<Product>(this.products);
          this.dataSource.paginator = this.paginator;
          this.productService.setLoading(false);

          // Reload the page once after the products load
          if (!this.hasReloaded) {
            this.hasReloaded = true; // Set the flag to prevent multiple reloads
          }
        },
        (error) => {
          console.error('Error fetching products:', error);
          this.productService.setLoading(false);
        }
      );

    // Observe viewport size and adjust displayed columns
    this.breakpointObserver
      .observe([Breakpoints.Handset, Breakpoints.Tablet])
      .subscribe((result) => {
        if (result.matches) {
          // Small screen detected
          this.displayedColumns = this.smallScreenColumns;
        } else {
          // Large screen detected
          this.displayedColumns = this.largeScreenColumns;
        }
      });

    // Trigger initial fetch
    this.refresh$.next();
  }


  ngOnDestroy(): void {
    // Unsubscribe from all subscriptions
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
    if (this.productUpdatesSubscription) {
      this.productUpdatesSubscription.unsubscribe();
    }
  }

  private fetchProducts(): void {
    // Emit a refresh signal
    this.refresh$.next();
  }

  private refreshAfterUpdate(updatedProduct: Product): void {
    const index = this.products.findIndex((p) => p.id === updatedProduct.id);
    if (index !== -1) {
      this.products[index] = updatedProduct; // Update existing product
    } else {
      this.products.push(updatedProduct); // Add new product
    }
    this.dataSource.data = [...this.products]; // Update the table's data source
  }

  deleteProduct(id: string): void {
    if (confirm('Are you sure you want to delete this product?')) {
      this.productService.setLoading(true);
      this.productService.deleteProduct(id).subscribe(
        () => {
          this.snackbarService.showSnackbar('Product deleted successfully');
          this.fetchProducts(); // Trigger refresh after deletion
          this.productService.setLoading(false);
        },
        (error) => {
          console.error('Error deleting product:', error);
          this.snackbarService.showSnackbar('Failed to delete product');
          this.productService.setLoading(false);
        }
      );
    }
  }

  getStockBackgroundColor(quantity: number): string {
    if (quantity === 0) {
      return 'red'; // Out of stock
    } else if (quantity <= 5) {
      return 'lightcoral'; // Low stock
    } else {
      return 'transparent'; // In stock
    }
  }
  // Get the relevant unit
  getUnit(unitType: 'size' | 'waist' | 'length' | 'fit' | 'kidsSize' | 'chest' | 'sleeve', size: number | string, sizeLabel: string): string {
    return this.productService.getUnit(unitType, size, sizeLabel);
  }

}
