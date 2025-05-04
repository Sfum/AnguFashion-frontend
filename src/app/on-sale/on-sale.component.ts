import { Component, OnDestroy, OnInit } from '@angular/core';
import { WishlistService } from '../services/wishlist.service';
import { CartService } from '../services/cart.service';
import {Product, ProductSize} from '../models/product';

@Component({
  selector: 'app-on-sale',
  templateUrl: './on-sale.component.html',
  styleUrl: './on-sale.component.sass',
})
export class OnSaleComponent {
  constructor(
    private wishlistService: WishlistService,
    private cartService: CartService,
  ) {}

  onAddToWishlist(product: any) {
    this.wishlistService.addToWishlist(product);
  }

  onAddToCart(product: Product) {
    const defaultSize: ProductSize = { id: this.generateUniqueId(), size: 42, price: product.price, quantity: 1, salePrice: product.selectedSize.salePrice, unitType: product.selectedSize.unitType };
    const defaultColor = 'defaultColor';
    this.cartService.addToCart(product, defaultSize, defaultColor);
  }
  private generateUniqueId(): string {
    return Math.random().toString(36).substr(2, 9); // Simple unique ID generator
  }
}
