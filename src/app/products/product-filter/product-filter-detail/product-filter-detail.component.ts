import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CategoryService } from '../../../services/category.service';
import { BrandService } from '../../../services/brand.service';
import { Observable } from 'rxjs';
import { Brand } from '../../../models/brand';
import { Category } from '../../../models/category';
import { Router } from '@angular/router';
import firebase from 'firebase/compat';

@Component({
  selector: 'app-product-filter-detail',
  templateUrl: './product-filter-detail.component.html',
  styleUrl: './product-filter-detail.component.sass',
})
export class ProductFilterDetailComponent {
  // @ts-ignore
  user$: Observable<firebase.User>;

  // Input observables for category and brand fields to receive data from the parent component
  @Input() filterCategoryField$: Observable<Category[]> | undefined;
  @Input() filterBrandField$: Observable<Brand[]> | undefined;

  // Set to store the selected brand IDs
  selectedBrandIds: Set<number> = new Set<number>();

  // Output events to emit selected brand or category to parent component
  @Output() brandSelectedEvent: EventEmitter<any> = new EventEmitter<any>();
  @Output() categorySelectedEvent: EventEmitter<any> = new EventEmitter<any>();

  // Constructor with dependencies injected: Router for navigation, CategoryService and BrandService for data fetching
  constructor(
    public router: Router,
    private categoryService: CategoryService,
    private brandService: BrandService,
  ) {}

  // Lifecycle hook: ngOnInit initializes category and brand observables
  ngOnInit() {
    this.filterCategoryField$ = this.fetchCategories();
    this.filterBrandField$ = this.fetchBrands();
  }

  // Fetches categories from the CategoryService
  fetchCategories(): Observable<Category[]> {
    return this.categoryService.getCategories();
  }

  // Fetches brands from the BrandService
  fetchBrands(): Observable<Brand[]> {
    return this.brandService.getBrands();
  }

  // Method to handle category selection from the dropdown
  optionCategorySelected(selectedCategoryId: number) {
    // Emit the selected category ID to the parent component
    this.categorySelectedEvent.emit(selectedCategoryId);
  }

  optionBrandSelected(selectedBrandId: string | number) {
    const numericBrandId = Number(selectedBrandId);
    if (isNaN(numericBrandId)) {
      console.warn(`Invalid brandId received:`, selectedBrandId);
      return; // Exit early if the value is not a valid number
    }

    if (!this.selectedBrandIds.has(numericBrandId)) {
      this.selectedBrandIds.add(numericBrandId);
    } else {
      this.selectedBrandIds.delete(numericBrandId);
    }

    console.log('Updated brandSelectedIds:', Array.from(this.selectedBrandIds));
    this.brandSelectedEvent.emit(Array.from(this.selectedBrandIds));
  }


  onBrandCheckboxChange(event: any, brandId: number | string): void {
    const numericBrandId = Number(brandId);
    if (isNaN(numericBrandId)) {
      console.warn(`Invalid brandId detected: ${brandId}`);
      return;
    }

    if (event.checked) {
      this.selectedBrandIds.add(numericBrandId);
    } else {
      this.selectedBrandIds.delete(numericBrandId);
    }
    console.log('Selected brand IDs:', Array.from(this.selectedBrandIds));
    this.updateSelectedBrands();
  }

  //Emits the current set of selected brand IDs as an array.
  updateSelectedBrands(): void {
    if (this.selectedBrandIds.size === 0) {
      console.log('No brands selected, emitting null.');
      this.brandSelectedEvent.emit(null); // If no brands are selected, send null to show all products
    } else {
      const selectedBrandsArray = Array.from(this.selectedBrandIds); // Convert the Set to an array
      console.log('Emitting selected brand IDs:', selectedBrandsArray); // Debug log
      this.brandSelectedEvent.emit(selectedBrandsArray); // Emit the selected brand IDs to parent component
    }
  }

}
