import {Component, OnInit} from '@angular/core';
import {ProductService} from '../../../services/product.service';

@Component({
  selector: 'app-color-filter',
  templateUrl: './color-filter.component.html',
  styleUrl: './color-filter.component.sass',
})
export class ColorFilterComponent implements OnInit {
  availableColors: string[] = [];
  selectedColors: string[] = [];

  constructor(private productService: ProductService) {}

  ngOnInit() {
    // Fetch available colors from the service
    this.productService.getAvailableColors().subscribe((colors) => {
      this.availableColors = colors;
      if (colors.length === 0) {
        console.log('No available colors found');
      } else {
        console.log('Available Colors:', this.availableColors);
      }
    });
  }
  // Check if color is selected
  isSelected(color: string): boolean {
    return this.selectedColors.includes(color);
  }

  // Method to handle color selection
  onColorClick(color: string) {
    const index = this.selectedColors.indexOf(color);
    if (index === -1) {
      // Add color to selected colors
      this.selectedColors.push(color);
    } else {
      // Remove color from selected colors
      this.selectedColors.splice(index, 1);
    }

    // Update the selected colors in the service
    this.productService.updateSelectedColors(this.selectedColors);
  }
}
