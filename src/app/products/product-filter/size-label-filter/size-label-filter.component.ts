import {ChangeDetectorRef, Component, OnInit} from '@angular/core';
import { ProductService } from '../../../services/product.service';
import {Observable} from 'rxjs';
import {Product} from '../../../models/product';

@Component({
  selector: 'app-size-label-filter',
  templateUrl: './size-label-filter.component.html',
  styleUrls: ['./size-label-filter.component.sass']
})
export class SizeLabelFilterComponent implements OnInit {
  fetchAvailableSizeLabels: string[] = [];
  products$: Observable<Product[]>;

  availableSizeLabels: string[] = [];
  selectedSizeLabels: string[] = [];

  constructor(private productService: ProductService,
              private cdRef: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.productService.fetchAvailableSizeLabels().subscribe((sizes) => {
      this.fetchAvailableSizeLabels = sizes;
      if (sizes.length === 0) {
        console.log('No available sizes found');
      } else {
        console.log('Available Sizes:', this.fetchAvailableSizeLabels);
      }
    });
    this.products$ = this.productService.filteredProducts$;
    this.productService.fetchProducts(); // Fetch products initially

    this.productService.availableSizeLabels$.subscribe(labels => {
      this.availableSizeLabels = labels;
      this.cdRef.detectChanges(); // Force UI update
    });

    this.productService.selectedSizeLabelsAction$.subscribe(selected => {
      this.selectedSizeLabels = selected;
      this.cdRef.detectChanges(); // Force UI update
    });
  }


  // Check if size label is selected
  isSelected(sizeLabel: string): boolean {
    return this.selectedSizeLabels.includes(sizeLabel);
  }

  // Toggle selection and trigger filtering
  onSizeClick(sizeLabel: string): void {
    this.selectedSizeLabels = this.selectedSizeLabels.includes(sizeLabel)
      ? this.selectedSizeLabels.filter(label => label !== sizeLabel)
      : [...this.selectedSizeLabels, sizeLabel];

    this.productService.updateSelectedSizeLabels(this.selectedSizeLabels);
  }

}
