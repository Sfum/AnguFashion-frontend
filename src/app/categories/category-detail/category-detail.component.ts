import {Component, Input} from '@angular/core';
import {Product} from '../../models/product';
import {Category} from '../../models/category';

@Component({
  selector: 'app-category-detail',
  templateUrl: './category-detail.component.html',
  styleUrl: './category-detail.component.sass',
})
export class CategoryDetailComponent {
  @Input() category!: Category;
  @Input() products!: Product[] | null;

  // Method to filter and return products that match the current category.
  getCategoryProducts(): Product[] {
    // Filter the products based on whether the product's categoryId matches the current category's id.
    return (
      this.products?.filter((product) => product.categoryId === this.category.id) || []
    );
    // If there are no products, return an empty array.
  }
}
