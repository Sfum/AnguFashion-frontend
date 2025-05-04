import { Component, OnInit } from '@angular/core';
import { ProductService } from '../../../services/product.service';

@Component({
  selector: 'app-sizes-filter',
  templateUrl: './sizes-filter.component.html',
  styleUrls: ['./sizes-filter.component.sass'],
})
export class SizesFilterComponent implements OnInit {
  availableSizes: string[] = [];
  selectedSizes: string[] = [];
  useLb: boolean = false; // Toggle state for weight units

  constructor(private productService: ProductService) {}

  ngOnInit() {
    // Fetch available sizes from the service
    this.productService.getAvailableSizes().subscribe((sizes) => {
      this.availableSizes = sizes;
      if (sizes.length === 0) {
        console.log('No available sizes found');
      } else {
        console.log('Available Sizes:', this.availableSizes);
      }
    });
  }

  // Check if size is selected
  isSelected(size: string): boolean {
    return this.selectedSizes.includes(size);
  }

  // Method to handle size selection
  onSizeClick(size: string) {
    const index = this.selectedSizes.indexOf(size);
    if (index === -1) {
      this.selectedSizes.push(size); // Add size to selected sizes
    } else {
      this.selectedSizes.splice(index, 1); // Remove size from selected sizes
    }

    // Update the selected sizes in the service
    this.productService.updateSelectedSizes(this.selectedSizes);
  }
}
