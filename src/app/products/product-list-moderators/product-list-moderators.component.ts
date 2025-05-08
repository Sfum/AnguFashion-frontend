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

  // Initialization lifecycle hook to set up the component to fetch products by the logged-in user
  ngOnInit(): void {
    // Subscribe to the user observable to get the current logged-in user
    this.authService.user$.subscribe((user) => {
      if (user) {
        // Check if the logged-in user is a moderator
        this.authService.isModerator().subscribe((isModerator) => {
          if (isModerator) {
            // Fetch the products uploaded by the logged-in user if they are a moderator
            this.productService
              .getProductsByUploader(user.uid)
              .subscribe((products) => {
                this.products = products;  // Store fetched products in the products array
                this.dataSource = new MatTableDataSource<Product>(this.products);  // Set the data source for the table
                this.dataSource.paginator = this.paginator;  // Attach the paginator to the data source
              });
          }
        });
      }
    });
  }
  // Method to delete a product by its ID
  deleteProduct(id: string): void {
    // Ask the user to confirm the deletion of the product
    if (confirm('Are you sure you want to delete this product?')) {
      // Call deleteProduct from ProductService to delete the product
      this.productService.deleteProduct(id).subscribe(
        () => {
          // On successful deletion, show a success notification
          this.snackbarService.showSnackbar('Product deleted successfully');

          // Refresh the product list after deletion
          this.productService.getProducts().subscribe((products) => {
            this.products = products;  // Update the product list
            this.dataSource.data = this.products;  // Refresh the table's data source with the updated product list
          });
        },
        (error) => {
          // Show an error notification if the deletion fails
          console.error('Error deleting product: ', error);
          this.snackbarService.showSnackbar('Failed to delete product');
        },
      );
    }
  }
}
