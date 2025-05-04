import { Component, EventEmitter, Input, Output } from '@angular/core';
import {Product, ProductSize} from '../../models/product';
import {ProductService} from '../../services/product.service';
import {CartService} from '../../services/cart.service';
import {AuthService} from '../../services/auth.service';
import {User} from '../../models/user';

interface CartSizeDetails extends ProductSize {
  vatAmount: number;
}

interface CartProduct extends Product {
  selectedSize: CartSizeDetails;
  quantity: number;
  onSale: boolean;
}

@Component({
  selector: 'app-shopping-cart-detail',
  templateUrl: './shopping-cart-detail.component.html',
  styleUrls: ['./shopping-cart-detail.component.sass'],
})
export class ShoppingCartDetailComponent {

  userCountry: string = '';

  constructor(private cartService: CartService,
              private productService: ProductService,
              private authService: AuthService) {
    this.authService.getCurrentUser().subscribe((user: User | null) => {
      if (user) {
        this.userCountry = user.country || '';
      }
    });
  }

  @Input() products!: Product[];
  @Output() addToWishListEvent: EventEmitter<Product> = new EventEmitter<Product>();
  @Output() removeFromCartEvent: EventEmitter<Product> = new EventEmitter<Product>();
  @Output() quantityChangeEvent: EventEmitter<{ product: Product, quantity: number }> = new EventEmitter();

  // Emit event to remove product from the cart
  removeFromCart(product: Product) {
    this.removeFromCartEvent.emit(product);
  }

  // Emit event to add product to the wishlist
  addToWishlist(product: Product) {
    this.addToWishListEvent.emit(product);
  }

  // Emit event when quantity changes
  onQuantityChange(product: Product, quantity: number) {
    this.quantityChangeEvent.emit({ product, quantity });
  }

  // Get available quantities for each product
  getAvailableQuantities(product: Product): number[] {
    const selectedSizeStock = product.selectedSize?.quantity || 0;
    const maxAllowed = Math.min(10, selectedSizeStock); // Limit dropdown to max 10
    return Array.from({ length: maxAllowed }, (_, i) => i + 1);
  }

  // Get the relevant unit
  getUnit(unitType: 'size' | 'waist' | 'length' | 'fit' | 'kidsSize' | 'chest' | 'sleeve', size: number | string, sizeLabel: string): string {
    return this.productService.getUnit(unitType, size, sizeLabel);
  }

}
