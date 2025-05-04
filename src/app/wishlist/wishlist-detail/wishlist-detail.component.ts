import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Product, ProductSize } from '../../models/product';
import { Router } from '@angular/router';
import { ProductService } from '../../services/product.service';

@Component({
  selector: 'app-wishlist-detail',
  templateUrl: './wishlist-detail.component.html',
  styleUrls: ['./wishlist-detail.component.sass'],
})
export class WishlistDetailComponent {
  @Input() products!: Product[];
  @Output() addToCartEvent: EventEmitter<Product> = new EventEmitter();
  @Output() removeWishlistEvent: EventEmitter<Product> = new EventEmitter();

  constructor(public router: Router, private productService: ProductService) {}

  trackByProductId(index: number, product: Product): number {
    return product?.id || index; // Use index if ID is missing
  }

  addProductToCart(product: Product) {
    if (product.selectedSize) {
      this.addToCartEvent.emit(product);
    } else {
      console.error('Cannot add to cart. No size selected for product:', product);
    }
  }

  removeFromWishlist(product: Product) {
    this.removeWishlistEvent.emit(product);
  }

  getUnit(unitType: 'size' | 'waist' | 'length' | 'fit' | 'kidsSize' | 'chest' | 'sleeve', size: number | string, sizeLabel: string): string {
    return this.productService.getUnit(unitType, size, sizeLabel);
  }

}
