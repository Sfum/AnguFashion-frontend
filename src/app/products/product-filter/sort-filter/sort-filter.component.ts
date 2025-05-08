import { Component, Input, OnInit } from '@angular/core';
import { map } from 'rxjs/operators';
import { BehaviorSubject, Observable } from 'rxjs';
import { Product } from '../../../models/product';
import { ProductService } from '../../../services/product.service';

@Component({
  selector: 'app-sort-filter',
  templateUrl: './sort-filter.component.html',
  styleUrl: './sort-filter.component.sass',
})
export class SortFilterComponent implements OnInit {
  products$: Observable<Product[]>;
  filteredProducts$ = new BehaviorSubject<Product[]>([]);
  paginatedProducts: Product[] = [];
  currentPage = 0;
  itemsPerPage = 8;
  searchQuery: string = '';

  @Input() products!: Product[];
  @Input() product!: Product;

  constructor(private productService: ProductService) {
  }

  ngOnInit() {
    // Initialize the products$ observable with the filtered products from the ProductService
    this.products$ = this.productService.productsArrayFiltered$;

    // Subscribe to the products$ observable to apply the filter when products are available
    this.products$.subscribe((products) => {
      this.applyFilter(products);  // Apply the filter on the fetched products
    });
  }

  applyFilter(products: Product[]) {
    // Filter products based on the search query input by the user (case-insensitive)
    const filtered = products.filter((product) => {
      return product.product_name
        .toLowerCase()
        .includes(this.searchQuery.toLowerCase());  // Check if product name includes search query
    });

    // Update the filtered products BehaviorSubject with the new filtered list
    this.filteredProducts$.next(filtered);

    // Call the paginate method to apply pagination after filtering
    this.paginate(filtered);
  }

  sortByPrice(order: 'asc' | 'desc') {
    // Sort the filtered products by price based on the specified order ('asc' or 'desc')
    this.filteredProducts$
      .pipe(
        map((products) =>
          products.sort((a, b) => {
            // Compare the product prices to sort them
            if (order === 'asc') {
              return a.price - b.price;  // Ascending order: lower price first
            } else {
              return b.price - a.price;  // Descending order: higher price first
            }
          }),
        ),
      )
      .subscribe((sortedProducts) => {
        // Update the filtered products BehaviorSubject with the sorted list
        this.filteredProducts$.next(sortedProducts);

        // Apply pagination to the sorted products
        this.paginate(sortedProducts);
      });
  }

  sortByPopularity() {
    // Sort the filtered products by popularity (based on quantity) in descending order
    this.filteredProducts$
      .pipe(map((products) => products.sort((a, b) => b.quantity - a.quantity)))  // Higher quantity comes first
      .subscribe((sortedProducts) => {
        // Update the filtered products BehaviorSubject with the sorted products
        this.filteredProducts$.next(sortedProducts);

        // Apply pagination to the sorted products
        this.paginate(sortedProducts);
      });
  }

  paginate(products: Product[]) {
    // Calculate the starting and ending index for the current page of products
    const start = this.currentPage * this.itemsPerPage;
    const end = start + this.itemsPerPage;

    // Slice the products array to get the products for the current page
    this.paginatedProducts = products.slice(start, end);
  }
}
