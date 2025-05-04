import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnInit,
  Output,
  SimpleChanges,
} from '@angular/core';
import { Product } from '../../models/product';

@Component({
  selector: 'app-bundle-detail',
  templateUrl: './bundle-detail.component.html',
  styleUrl: './bundle-detail.component.sass',
})
export class BundleDetailComponent implements OnInit, OnChanges {
  // Input property to accept a list of products from the parent component
  @Input() products: Product[] = [];

  // EventEmitter to emit when a product is added to the wishlist
  @Output() addToWishlistEvent: EventEmitter<Product> =
    new EventEmitter<Product>();

  // EventEmitter to emit when a product is added to the cart
  @Output() addToCartEvent: EventEmitter<Product> = new EventEmitter<Product>();

  // Lifecycle hook that runs when the component is initialized
  ngOnInit(): void {}

  // Lifecycle hook that detects changes to input properties
  ngOnChanges(changes: SimpleChanges): void {
    // Check if the 'products' input property has changed
    if (changes['products']) {
      // Update the local products array with the new value
      this.products = changes['products'].currentValue;
    }
  }

  // Method to add a product to the wishlist
  addToWishlist(product: Product): void {
    this.addToWishlistEvent.emit(product); // Emit the product to the parent component
  }

  // Method to add a product to the cart
  addToCart(product: Product): void {
    this.addToCartEvent.emit(product); // Emit the product to the parent component
  }
}
