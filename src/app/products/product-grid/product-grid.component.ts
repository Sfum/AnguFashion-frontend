import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {Product, ProductSize} from '../../models/product';

@Component({
  selector: 'app-product-grid',
  templateUrl: './product-grid.component.html',
  styleUrl: './product-grid.component.sass',
})
export class ProductGridComponent {
  selectedSize: ProductSize | null = null; // Selected size
  selectedColor: string | null = null;     // Selected color

  @Input() product!: Product;
  @Input() products: Product[] = [];

  // Output event to emit a product when added to the wishlist & cart
  @Output() addToWishlistEvent: EventEmitter<Product> = new EventEmitter<Product>();
  @Output() addToCartEvent: EventEmitter<Product> = new EventEmitter<Product>();

  // Method to emit the selected product to the parent component for adding to the wishlist
  onAddToWishlist(product: Product) {
    this.addToWishlistEvent.emit(product);
  }

  // Method to emit the selected product to the parent component for adding to the cart
  addToCart(product: Product) {
  }

}
