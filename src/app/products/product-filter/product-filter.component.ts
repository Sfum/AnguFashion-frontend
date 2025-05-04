import { Component } from '@angular/core';
import { Observable } from 'rxjs';
import { Brand } from '../../models/brand';
import { Category } from '../../models/category';
import { ProductService } from '../../services/product.service';
import { BrandService } from '../../services/brand.service';
import { CategoryService } from '../../services/category.service';

@Component({
  selector: 'app-product-filter',
  templateUrl: './product-filter.component.html',
  styleUrl: './product-filter.component.sass',
})
export class ProductFilterComponent {
  // user$: Observable<firebase.User>;

  filterBrandField$: Observable<Brand[]>;
  filterCategoryField$: Observable<Category[]>;

  constructor(
    private productService: ProductService,
    private brandService: BrandService,
    private categoryService: CategoryService,
  ) {
    this.filterBrandField$ = this.brandService.getBrands();
    this.filterCategoryField$ = this.categoryService.getCategories();
  }

  optionBrandSelected(product: any) {
    return this.productService.optionBrandSelected(product);
  }

  optionCategorySelected(product: any) {
    return this.productService.optionCategorySelected(product);
  }
}
