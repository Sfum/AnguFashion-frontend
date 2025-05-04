import {Component, OnInit} from '@angular/core';
import {Observable} from 'rxjs';
import {Product} from '../models/product';
import {ProductService} from '../services/product.service';
import {Category} from '../models/category';
import {CategoryService} from '../services/category.service';
import {SnackbarService} from '../services/snackbar.service';
import {MatTableDataSource} from '@angular/material/table';

@Component({
  selector: 'app-categories',
  templateUrl: './categories.component.html',
  styleUrl: './categories.component.sass',
})
export class CategoriesComponent implements OnInit {

  products$!: Observable<Product[]>;
  categories$!: Observable<Category[]>;
  dataSource!: MatTableDataSource<Product>;
  products: Product[] = [];

  constructor(
    private productService: ProductService,
    private categoryService: CategoryService,
    public snackbarService: SnackbarService,
  ) {
  }

  // Lifecycle hook called on component initialization.
  ngOnInit(): void {
    // Fetch categories and products from their respective services.
    this.categories$ = this.categoryService.getCategories();  // Observable for categories.
    this.products$ = this.productService.getProducts();  // Observable for products.
  }

  // Method to handle product deletion.
  deleteProduct(id: string) {
    return this.categoryService.deleteCategory(id);
  }
}
