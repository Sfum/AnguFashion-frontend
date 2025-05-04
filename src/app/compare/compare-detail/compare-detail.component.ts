import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Product } from '../../models/product';
import { Router } from '@angular/router';

@Component({
  selector: 'app-compare-detail',
  templateUrl: './compare-detail.component.html',
  styleUrl: './compare-detail.component.sass',
})
export class CompareDetailComponent {

  @Input() products!: Product[];
  @Output() addToCartEvent: EventEmitter<Product> = new EventEmitter<Product>();
  @Output() removeCompareEvent: EventEmitter<Product> = new EventEmitter<Product>();

  constructor(public router: Router) {}

  // Method to emit the 'addToCartEvent' when a product is added to the cart
  addProductToCart(product: Product) {
    this.addToCartEvent.emit(product);  // Emitting the selected product to the parent component
  }

  // Method to emit the 'removeCompareEvent' when a product is removed from the compare
  removeFromCompare(product: Product) {
    if (product && product.id) {
      this.removeCompareEvent.emit(product); // Ensure you're emitting the whole product, including the id
    } else {
      console.error('Product or product.id is undefined');
    }
  }
  createPlaceholders(currentLength: number, max: number): number[] {
    return Array(max - currentLength).fill(0);
  }
}
