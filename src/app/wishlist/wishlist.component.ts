import { Component, OnInit } from '@angular/core';
import { WishlistService } from '../services/wishlist.service';
import { Product, ProductSize } from '../models/product';
import { CartService } from '../services/cart.service';

@Component({
  selector: 'app-wishlist',
  templateUrl: './wishlist.component.html',
  styleUrls: ['./wishlist.component.sass'],
})
export class WishlistComponent implements OnInit {
  products: Product[] = [];

  constructor(
    private wishlistService: WishlistService,
    private cartService: CartService,
  ) {}

  ngOnInit() {
    this.loadWishlist();
  }

  loadWishlist() {
    this.wishlistService.loadWishlist().subscribe((products) => {
      this.products = products.filter((product) => product && product.id);
      this.products = [...this.products]; // Trigger change detection
    });
  }

  removeFromWishlist(productId: string) {
    this.products = this.products.filter((product) => product.id.toString() !== productId);
    this.wishlistService.removeProduct(productId).subscribe({
      next: () => console.log('Product removed'),
      error: (err) => console.error('Failed to remove product:', err),
    });
  }

  onAddToCart(product: Product) {
    if (!product.selectedSize) {
      console.error('No size selected for product:', product);
      return;
    }

    this.cartService.addToCart(
      product,
      product.selectedSize,
      'defaultColor', // You can replace this with the selected color if implemented
    ).subscribe({
      next: () => console.log('Product added to cart successfully'),
      error: (err) => console.error('Failed to add product to cart:', err),
    });
  }
}
