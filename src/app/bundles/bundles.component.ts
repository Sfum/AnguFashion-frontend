import { Component, OnInit } from '@angular/core';
import {Product, ProductSize} from '../models/product';
import { ProductService } from '../services/product.service';
import { WishlistService } from '../services/wishlist.service';
import { CartService } from '../services/cart.service';

@Component({
  selector: 'app-bundles', // The selector for using this component in templates
  templateUrl: './bundles.component.html', // The template file associated with this component
  styleUrl: './bundles.component.sass', // The style file associated with this component
})
export class BundlesComponent implements OnInit {
  products: Product[] = []; // Array to store all products fetched from the service
  filteredProducts: Product[] = []; // Array to store products that belong to bundles

  // Constructor injects the ProductService, WishlistService, and CartService
  constructor(
    private productService: ProductService, // Service for retrieving product data
    private wishlistService: WishlistService, // Service for handling wishlist functionality
    private cartService: CartService, // Service for handling cart functionality
  ) {}

  // ngOnInit lifecycle hook, called after component initialization
  ngOnInit(): void {
    // Subscribe to the product service to get the filtered product collection
    this.productService.getFilteredProductCollection().subscribe((products) => {
      this.products = products; // Store the retrieved products
      this.filterProducts(); // Filter products to display only those in bundles
    });
  }

  // Method to filter products that are part of a bundle
  filterProducts(): void {
    this.filteredProducts = this.products.filter(
      (product) => product.in_bundle, // Filter only products marked as part of a bundle
    );
  }

  // Method to add a product to the wishlist
  onAddToWishlist(product: Product) {
    this.wishlistService.addToWishlist(product); // Call wishlist service to add the product
  }

  // Method to add a product to the cart
  onAddToCart(product: Product) {
    const defaultSize: ProductSize = {
      id: this.generateUniqueId(),
      size: 42, price: product.price,
      quantity: 1, salePrice:
      product.selectedSize.salePrice,
      unitType: product.selectedSize.unitType };
    const defaultColor = 'defaultColor';
    this.cartService.addToCart(product, defaultSize, defaultColor);
  }
  private generateUniqueId(): string {
    return Math.random().toString(36).substr(2, 9); // Simple unique ID generator
  }
}
