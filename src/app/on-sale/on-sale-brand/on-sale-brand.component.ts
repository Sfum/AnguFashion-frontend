import { Component, OnDestroy, OnInit } from '@angular/core';
import { BrandService } from '../../services/brand.service';
import { ProductService } from '../../services/product.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Observable, Subscription } from 'rxjs';
import { Brand } from '../../models/brand';
import { SnackbarService } from '../../services/snackbar.service';

@Component({
  selector: 'app-on-sale-brand',
  templateUrl: './on-sale-brand.component.html',
  styleUrl: './on-sale-brand.component.sass',
})
export class OnSaleBrandComponent implements OnInit, OnDestroy {
  brandOnSaleForm: FormGroup;
  brands$: Observable<Brand[]>;
  private subscriptions: Subscription = new Subscription();

  constructor(
    private fb: FormBuilder,
    private productService: ProductService,
    private snackbarService: SnackbarService,
  ) {
    this.brandOnSaleForm = this.fb.group({
      brandId: ['', Validators.required],
      discountPercentage: [
        0,
        [Validators.required, Validators.min(0), Validators.max(100)],
      ],
    });

    this.brands$ = this.productService.brands$;
  }

  ngOnInit(): void {}

  setBrandOnSale(): void {
    if (this.brandOnSaleForm.invalid) {
      this.snackbarService.showSnackbar('Please fill in all required fields.');
      return;
    }

    const { brandId, discountPercentage } = this.brandOnSaleForm.value;
    this.subscriptions.add(
      this.productService.getProductsByBrand(brandId).subscribe((products) => {
        products.forEach((product) => {
          const salePrice = product.price * (1 - discountPercentage / 100);
          const updatedProduct = {
            ...product,
            salePrice,
            discountPercentage,
            onSale: true,
          };

          this.productService
            // @ts-ignore
            .updateProduct(product.id, updatedProduct)
            .subscribe({
              next: () => {
                console.log(`Product ${product.id} updated successfully.`);
              },
              error: (error) => {
                console.error(`Error updating product ${product.id}: `, error);
              },
            });
        });

        this.snackbarService.showSnackbar('Products set on sale successfully.');
      }),
    );
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
}
