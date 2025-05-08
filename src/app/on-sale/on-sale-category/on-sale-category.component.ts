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
export class OnSaleCategoryComponent implements OnDestroy {

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

  // Method to apply a discount to products of a selected category
  setCategoryOnSale(): void {
    if (this.categoryOnSaleForm.invalid) {
      this.snackbarService.showSnackbar('Please fill in all required fields.');
      return;
    }

    const { categoryId, discountPercentage } = this.categoryOnSaleForm.value;

    this.subscriptions.add(
      this.productService.getProductsByCategory(categoryId).subscribe((products) => {
        products.forEach((product) => {
          const salePrice = product.price * (1 - discountPercentage / 100);
          const updatedProduct = {
            ...product,
            salePrice,
            discountPercentage,
            onSale: true,
          };

          // Update the product with the new sale price
          this.productService.updateProduct(product.id.toString(), updatedProduct).subscribe({
            next: () => {
              console.log(`Product ${product.id} updated successfully.`);
            },
            error: (error) => {
              console.error(`Error updating product ${product.id}: `, error);
            },
          });

          // Update each size with the new sale price
          product.sizes.forEach((size) => {
            const updatedSize = {
              ...size,
              salePrice: size.price * (1 - discountPercentage / 100)
            };

            // Pass 3 arguments to updateProductSize: productId, sizeId, updatedSize
            this.productService.updateProductSize(
              product.id.toString(),  // productId as string
              size.id.toString(),      // sizeId as string
              updatedSize              // updated size object
            ).subscribe({
              next: () => {
                console.log(`Size ${size.id} updated for product ${product.id}.`);
              },
              error: (err) => {
                console.error(`Error updating size ${size.id}:`, err);
              },
            });
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
