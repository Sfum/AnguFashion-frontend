import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import { Product } from '../../models/product';
import { Observable } from 'rxjs';
import { ProductService } from '../../services/product.service';
@Component({
  selector: 'app-on-sale-detail',
  templateUrl: './on-sale-detail.component.html',
  styleUrls: ['./on-sale-detail.component.sass'],
})
export class OnSaleDetailComponent  implements OnInit {
  onSaleProducts: Product[] = [];

  @Input() products: Product[] = []; // Input property to receive an array of products
  @Output() addToWishlistEvent: EventEmitter<Product> = new EventEmitter<Product>(); // Output event to emit when a product is added to wishlist
  @Output() addToCartEvent: EventEmitter<Product> = new EventEmitter<Product>(); // Output event to emit when a product is added to cart

  constructor(private productService: ProductService) {
    // Initialize the observable with the products on sale from the product service
    this.onSaleProducts$ = this.productService.productsArrayOnSale$;
  }

  ngOnInit(): void {
    this.productService.getOnSaleProducts().subscribe(
      (products) => {
        this.onSaleProducts = products;
      },
      (error) => {
        console.error('Error fetching on-sale products:', error);
      },
    );
  }

  onSaleProducts$: Observable<Product[]> | null; // Observable to hold the list of products on sale

  // Method to emit an event when a product is added to the wishlist
  addToWishlist(product: Product) {
    this.addToWishlistEvent.emit(product);
  }

  // Method to emit an event when a product is added to the cart
  addToCart(product: Product) {
    this.addToCartEvent.emit(product);
  }
}
