import { Component, OnDestroy, OnInit } from '@angular/core';
import { ProductService } from '../../services/product.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Observable, Subscription } from 'rxjs';
import { Category } from '../../models/category';
import { SnackbarService } from '../../services/snackbar.service';

@Component({
  selector: 'app-on-sale-category',
  templateUrl: './on-sale-category.component.html',
  styleUrls: ['./on-sale-category.component.sass'],
})
export class OnSaleCategoryComponent implements OnInit, OnDestroy {

  categoryOnSaleForm: FormGroup;
  categories$: Observable<Category[]>;
  private subscriptions: Subscription = new Subscription();

  constructor(
    private fb: FormBuilder, // FormBuilder for creating reactive forms
    private productService: ProductService, // ProductService for fetching and updating products
    private snackbarService: SnackbarService, // SnackbarService for showing notifications
  ) {
    // Initialize the form group with controls and validators
    this.categoryOnSaleForm = this.fb.group({
      categoryId: ['', Validators.required], // Category ID field with required validation
      discountPercentage: [
        0,
        [Validators.required, Validators.min(0), Validators.max(100)], // Discount percentage field with required, min, and max validation
      ],
    });

    // Initialize the categories observable with data from ProductService
    this.categories$ = this.productService.categories$;
  }

  ngOnInit(): void {
    // OnInit lifecycle hook (currently not used, but can be implemented if needed)
  }

  // Method to apply a discount to products of a selected category
  setCategoryOnSale(): void {
    // Check if the form is valid
    if (this.categoryOnSaleForm.invalid) {
      // Show an error message if the form is invalid
      this.snackbarService.showSnackbar('Please fill in all required fields.');
      return;
    }

    // Extract form values
    const { categoryId, discountPercentage } = this.categoryOnSaleForm.value;

    // Subscribe to the product service to get products by category
    this.subscriptions.add(
      this.productService.getProductsByCategory(categoryId).subscribe((products) => {
        products.forEach((product) => {
          // Calculate the sale price based on discount percentage
          const salePrice = product.price * (1 - discountPercentage / 100);
          const updatedProduct = {
            ...product,
            salePrice,
            discountPercentage,
            onSale: true,
          };

          // Update each product with new sale information
          this.productService
            // @ts-ignore
            .updateProduct(product.id, updatedProduct)
            .subscribe({
              next: () => {
                // Log success message
                console.log(`Product ${product.id} updated successfully.`);
              },
              error: (error) => {
                // Log error message
                console.error(`Error updating product ${product.id}: `, error);
              },
            });
        });
      }),
    );
  }

  // Cleanup subscriptions to prevent memory leaks
  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
}
