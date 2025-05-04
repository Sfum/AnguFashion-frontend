import { Component, Input, OnInit } from '@angular/core';
import { Product, ProductSize } from '../../models/product';
import { Observable, BehaviorSubject } from 'rxjs';
import { ProductService } from '../../services/product.service';
import { WishlistService } from '../../services/wishlist.service';
import { CartService } from '../../services/cart.service';
import { map } from 'rxjs/operators';
import { Timestamp } from 'firebase/firestore';
import { CompareService } from '../../services/compare.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-product-card',
  templateUrl: './product-card.component.html',
  styleUrls: ['./product-card.component.sass'],
})
export class ProductCardComponent implements OnInit {
  products$: Observable<Product[]>; // Observable to hold the list of products
  filteredProducts$: BehaviorSubject<Product[]> = new BehaviorSubject<Product[]>([]); // BehaviorSubject for filtered products
  paginatedProducts: Product[] = []; // Array to hold the paginated products
  currentPage = 0; // Current page index
  itemsPerPage = 8; // Number of items per page
  searchQuery: string = ''; // Search query for filtering products
  selectedSize!: ProductSize;
  userId!: string;
  userId$: Observable<string | null>;
  isLoading$ = this.productService.isLoading$; // Bind to service observable

  @Input() products!: Product[]; // Input property for products array
  @Input() product!: Product; // Input property for a single product

  constructor(
    private productService: ProductService, // Injecting ProductService
    private wishlistService: WishlistService, // Injecting WishlistService
    private cartService: CartService, // Injecting CartService
    private authService: AuthService, // Injecting AuthService
    private compareService: CompareService, // Injecting Compare Service
  ) {
    this.userId$ = this.authService.getCurrentUser().pipe(
      map((user) => (user ? user.uid : null)) // Transform User object to userId string or null
    );
  }

  ngOnInit() {
    // Subscribe to the filtered products observable and handle filtering
    this.products$ = this.productService.productsArrayFiltered$
    // Subscribe to products and handle updates
    this.products$.subscribe((products) => {
      this.filteredProducts$.next(products); // Update filtered products
      this.currentPage = 0; // Reset current page on new product list
      this.paginate(products); // Handle pagination
    });

    this.productService.applyDiscount(this.product);
    this.selectedSize = this.product.sizes[0];
    this.productService.setLoading(true);
  }

  applyFilter(products: Product[]): void {
    this.productService.setLoading(true); // Show spinner while loading
    const filtered = products.filter((product) =>
      product.product_name.toLowerCase().includes(this.searchQuery.toLowerCase())
    );
    this.filteredProducts$.next(filtered); // Update filtered products
    this.paginate(filtered); // Handle pagination for filtered products
    this.productService.setLoading(false); // Hide spinner after filtering
  }

  filterProducts(products: Product[]) {
    this.applyFilter(products); // Wrapper method for applyFilter
  }

  sortByPrice(order: 'asc' | 'desc') {
    this.filteredProducts$
      .pipe(
        map((products) =>
          products.sort((a, b) => {
            if (order === 'asc') {
              return a.price - b.price && a.salePrice - b.salePrice; // Ascending order
            } else {
              return b.price - a.price && b.salePrice - a.salePrice; // Descending order
            }
          })
        )
      )
      .subscribe((sortedProducts) => {
        this.filteredProducts$.next(sortedProducts); // Update filtered products
        this.paginate(sortedProducts); // Paginate sorted products
      });
  }

  sortByDiscount(order: 'asc' | 'desc') {
    this.filteredProducts$
      .pipe(
        map((products) =>
          products.sort((a, b) => {
            if (order === 'desc') {
              return (b.discountPercentage || 0) - (a.discountPercentage || 0); // Descending order
            } else {
              return (a.discountPercentage || 0) - (b.discountPercentage || 0); // Ascending order
            }
          })
        )
      )
      .subscribe((sortedProducts) => {
        this.filteredProducts$.next(sortedProducts); // Update filtered products
        this.paginate(sortedProducts); // Paginate sorted products
      });
  }

  sortByPopularity() {
    this.filteredProducts$
      .pipe(
        map((products) =>
          products.sort((a, b) => (b.quantitySold || 0) - (a.quantitySold || 0)) // Sorting by quantity sold
        )
      )
      .subscribe((sortedProducts) => {
        this.filteredProducts$.next(sortedProducts); // Update filtered products
        this.paginate(sortedProducts); // Paginate sorted products
      });
  }

  onPageChange(event: any): void {
    this.productService.setLoading(true); // Show spinner
    this.currentPage = event.pageIndex; // Set current page index
    this.filteredProducts$.subscribe((products) => {
      this.paginate(products); // Paginate products based on page change
      this.productService.setLoading(false); // Hide spinner after pagination
    });
  }

  paginate(products: Product[]) {
    const start = this.currentPage * this.itemsPerPage;
    const end = start + this.itemsPerPage;
    this.paginatedProducts = products.slice(start, end); // Slice products for pagination
  }

  addToWishlist(product: Product) {
    this.wishlistService.addToWishlist(product).subscribe({
      next: () => console.log(`${product.product_name} added to wishlist`),
      error: (error) => console.error('Failed to add product to wishlist:', error),
    });
  }

  addToCart(event: { product: Product; selectedSize: ProductSize | null; color: string; purchaseQuantity: number }): void {
    const { product, selectedSize, color, purchaseQuantity } = event;

    if (!product || !selectedSize) {
      console.error('Product and selected size are required.');
      return;
    }

    this.cartService.addToCart(product, selectedSize, color, purchaseQuantity).subscribe({
      next: () => {
        console.log(`Product added to cart: ${product.product_name} (Quantity: ${purchaseQuantity})`);
      },
      error: (error) => {
        console.error(`Failed to add product to cart: ${product.product_name}`, error);
      },
    });
  }

  sortByNewArrival(order: 'asc' | 'desc'): void {
    this.paginatedProducts.sort((a, b) => {
      const dateA = this.getDate(a.date_created);
      const dateB = this.getDate(b.date_created);

      return order === 'asc' ? dateB.getTime() - dateA.getTime() : dateA.getTime() - dateB.getTime();
    });
  }

  private getDate(date?: Timestamp | Date): Date {
    if (date instanceof Timestamp) {
      return date.toDate();
    } else if (date instanceof Date) {
      return date;
    } else {
      return new Date(0); // Default to epoch if no date is provided
    }
  }

  removeFromCart(product: Product, sizeId: string) {
    this.cartService.removeProductFromBackend(product.id.toString(), sizeId).subscribe(() => {
      this.products = this.products.filter(p => p.id !== product.id); // Remove product locally
    });
  }

  onAddToWishlist(product: Product) {
    this.wishlistService.addToWishlist(product);
  }

  onAddToCompare(product: Product): void {
    this.compareService.addToCompare(product).subscribe({
      next: (response) => console.log(response),
      error: (error) => console.error('Error adding product to compare:', error),
    });
  }
}
