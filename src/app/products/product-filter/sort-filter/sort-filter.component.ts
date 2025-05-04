import { Component, Input, OnInit } from '@angular/core';
import { map } from 'rxjs/operators';
import { BehaviorSubject, Observable } from 'rxjs';
import { Product } from '../../../models/product';
import { ProductService } from '../../../services/product.service';
import { WishlistService } from '../../../services/wishlist.service';
import { CartService } from '../../../services/cart.service';

@Component({
  selector: 'app-sort-filter',
  templateUrl: './sort-filter.component.html',
  styleUrl: './sort-filter.component.sass',
})
export class SortFilterComponent implements OnInit {
  // @ts-ignore
  products$: Observable<Product[]>;
  filteredProducts$ = new BehaviorSubject<Product[]>([]);
  paginatedProducts: Product[] = [];
  currentPage = 0;
  itemsPerPage = 8;
  searchQuery: string = '';

  @Input() products!: Product[];
  @Input() product!: Product;

  constructor(private productService: ProductService) {}

  ngOnInit() {
    this.products$ = this.productService.productsArrayFiltered$;
    this.products$.subscribe((products) => {
      this.applyFilter(products);
    });
  }
  applyFilter(products: Product[]) {
    const filtered = products.filter((product) => {
      return product.product_name
        .toLowerCase()
        .includes(this.searchQuery.toLowerCase());
    });
    this.filteredProducts$.next(filtered);
    this.paginate(filtered);
  }

  sortByPrice(order: 'asc' | 'desc') {
    this.filteredProducts$
      .pipe(
        map((products) =>
          products.sort((a, b) => {
            if (order === 'asc') {
              return a.price - b.price;
            } else {
              return b.price - a.price;
            }
          }),
        ),
      )
      .subscribe((sortedProducts) => {
        this.filteredProducts$.next(sortedProducts);
        this.paginate(sortedProducts);
      });
  }

  sortByPopularity() {
    this.filteredProducts$
      .pipe(map((products) => products.sort((a, b) => b.quantity - a.quantity)))
      .subscribe((sortedProducts) => {
        this.filteredProducts$.next(sortedProducts);
        this.paginate(sortedProducts);
      });
  }
  paginate(products: Product[]) {
    const start = this.currentPage * this.itemsPerPage;
    const end = start + this.itemsPerPage;
    this.paginatedProducts = products.slice(start, end);
  }
}
