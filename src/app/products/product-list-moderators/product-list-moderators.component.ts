import { Component, OnInit, ViewChild } from '@angular/core';
import { Product } from '../../models/product';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { ProductService } from '../../services/product.service';
import { AuthService } from '../../services/auth.service';
import {SnackbarService} from '../../services/snackbar.service';

@Component({
  selector: 'app-product-list-moderators',
  templateUrl: './product-list-moderators.component.html',
  styleUrls: ['./product-list-moderators.component.sass'],
})
export class ProductListModeratorsComponent implements OnInit {
  displayedColumns: string[] = [
    'product_image',
    'product_name',
    'onSale',
    'price',
    'quantityStock',
    'discountPercentage',
    'delete',
  ];
  dataSource!: MatTableDataSource<Product>;
  products: Product[] = [];

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  constructor(
    private productService: ProductService,
    private authService: AuthService,
    private snackbarService: SnackbarService,
  ) {}

  ngOnInit(): void {
    this.authService.user$.subscribe((user) => {
      if (user) {
        this.authService.isModerator().subscribe((isModerator) => {
          if (isModerator) {
            this.productService
              .getProductsByUploader(user.uid)
              .subscribe((products) => {
                this.products = products;
                this.dataSource = new MatTableDataSource<Product>(
                  this.products,
                );
                this.dataSource.paginator = this.paginator;
              });
          }
        });
      }
    });
  }

  deleteProduct(id: string): void {
    // Confirm deletion with user
    if (confirm('Are you sure you want to delete this product?')) {
      // Use subscribe instead of then() as deleteProduct returns an Observable
      this.productService.deleteProduct(id).subscribe(
        () => {
          // Show success notification
          this.snackbarService.showSnackbar('Product deleted successfully');
          // Refresh product list after deletion
          this.productService.getProducts().subscribe((products) => {
            this.products = products;
            this.dataSource.data = this.products; // Update data source
          });
        },
        (error) => {
          // Show error notification in case of failure
          console.error('Error deleting product: ', error);
          this.snackbarService.showSnackbar('Failed to delete product');
        },
      );
    }
  }
}
