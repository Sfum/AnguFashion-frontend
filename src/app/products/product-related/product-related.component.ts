import {Component, Input} from '@angular/core';
import {Product} from '../../models/product';
import {ProductsService} from '../../../../backend/src/products/products.service';

@Component({
  selector: 'app-product-related',
  templateUrl: './product-related.component.html',
  styleUrl: './product-related.component.sass'
})
export class ProductRelatedComponent {
  //
  // @Input() categoryId!: string; // Input from parent to specify category
  // @Input() brandId!: string; // Input from parent to specify brand
  //
  // relatedProductsByCategory: Product[] = [];
  // relatedProductsByBrand: Product[] = [];
  //
  // constructor(private productsService: ProductsService) {}
  //
  // ngOnInit(): void {
  //   // Fetch related products by category and brand
  //   if (this.categoryId) {
  //     this.fetchRelatedProductsByCategory(this.categoryId);
  //   }
  //   if (this.brandId) {
  //     this.fetchRelatedProductsByBrand(this.brandId);
  //   }
  // }
  //
  // fetchRelatedProductsByCategory(categoryId: string): void {
  //   this.productsService.getProductsByCategory(categoryId).subscribe(
  //     (products) => {
  //       this.relatedProductsByCategory = products;
  //     },
  //     (error) => console.error('Error fetching related products by category:', error)
  //   );
  // }
  //
  // fetchRelatedProductsByBrand(brandId: string): void {
  //   this.productsService.getProductsByBrand(brandId).subscribe(
  //     (products) => {
  //       this.relatedProductsByBrand = products;
  //     },
  //     (error) => console.error('Error fetching related products by brand:', error)
  //   );
  // }
  //
}
