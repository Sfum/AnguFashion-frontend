import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ProductService } from '../../../services/product.service';

@Component({
  selector: 'app-price-filter',
  templateUrl: './price-filter.component.html',
  styleUrls: ['./price-filter.component.sass'],
})
export class PriceFilterComponent {

  // FormGroup to manage the price form controls
  priceForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private productService: ProductService,
  ) {
    // Initialize the form with default values and validation rules
    this.priceForm = this.fb.group({
      // Min price initialized to 10 with a minimum value validation of 5
      minPrice: [10, Validators.min(5)],

      // Max price initialized to 20 with a maximum value validation of 30
      maxPrice: [20, [Validators.max(30)]],
    });
  }

  // Method called when the form is submitted
  onSubmit(): void {
    // Check if the form is valid before proceeding
    if (this.priceForm.valid) {
      // Extract the minPrice and maxPrice values from the form
      const { minPrice, maxPrice } = this.priceForm.value;

      // Call the product service to apply the selected price range
      this.productService.optionPriceRangeSelected(minPrice, maxPrice);
    }
  }
}
