import { Component, OnInit } from '@angular/core';
import { CompareService } from '../services/compare.service';
import { Product, ProductSize } from '../models/product';
import { CartService } from '../services/cart.service';

@Component({
  selector: 'app-compare',
  templateUrl: './compare.component.html',
  styleUrls: ['./compare.component.sass'],
})
export class CompareComponent implements OnInit {

  products: Product[] = [];

  constructor(
    private compareService: CompareService,
    private cartService: CartService,
  ) {}

  ngOnInit() {
    this.loadCompare(); // Load products for comparison when the component initializes
  }

  // Method to load products for comparison from the CompareService
  loadCompare() {
    this.compareService.loadCompare().subscribe((products) => {
      console.log('Fetched products for compare:', products); // Log fetched products for debugging
      this.products = products; // Update the local products array with fetched products
    });
  }

  // Method to remove a product from the comparison list
  removeFromCompare(productId: string) {
    this.compareService.removeProduct(productId).subscribe(() => {
      this.loadCompare(); // Reload the comparison list after removal
    });
  }

  // Method to add a product to the cart with default size and color
  onAddToCart(product: Product) {
    const defaultSize: ProductSize = {
      id: this.generateUniqueId(), // Generate a unique ID for the product size
      size: 42, // Default size value
      price: product.price, // Use product's price
      quantity: 1, // Default quantity
      salePrice: product.selectedSize.salePrice,
      unitType: product.selectedSize.unitType
    };
    const defaultColor = 'defaultColor'; // Default color value
    this.cartService.addToCart(product, defaultSize, defaultColor); // Add product to cart using CartService
  }

  // Private method to generate a unique ID
  private generateUniqueId(): string {
    return Math.random().toString(36).substr(2, 9); // Generate a random string as a simple unique ID
  }
}
