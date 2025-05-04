import {Component, Input, OnInit} from '@angular/core';
import {Product, ProductSize} from '../../models/product';
import { ProductService } from '../../services/product.service';
import { Observable } from 'rxjs';
import { Category } from '../../models/category';
import { CategoryService } from '../../services/category.service';
import { WishlistService } from '../../services/wishlist.service';
import { CartService } from '../../services/cart.service';

@Component({
  selector: 'app-product-page',
  templateUrl: './product-page.component.html',
  styleUrls: ['./product-page.component.sass'],
})
export class ProductPageComponent implements OnInit {
  products$!: Observable<Product[]>;
  categories$!: Observable<Category[]>;

  constructor(
    private productService: ProductService,
    private categoriesService: CategoryService,
  ) {}

  @Input() selectedSize!: ProductSize | null; // Allow null if no size is selected
  @Input() selectedColor!: string; // Color as a string

  // Lifecycle hook that is called after Angular has initialized all data-bound properties
  ngOnInit(): void {
    // Fetch categories from the category service and assign it to categories$
    this.categories$ = this.categoriesService.getCategories();
    // Fetch products from the product service and assign it to products$
    this.products$ = this.productService.getProducts();
  }

}
