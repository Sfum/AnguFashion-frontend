import { Component, OnInit } from '@angular/core';
import { Product } from '../models/product';
import { CartService } from '../services/cart.service';
import { WishlistService } from '../services/wishlist.service';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { getVatRateByCountry } from '../models/vat-rates';
import { getDeliveryRateByCountry } from '../models/delivery-rates';

@Component({
  selector: 'app-shopping-cart',
  templateUrl: './shopping-cart.component.html',
  styleUrls: ['./shopping-cart.component.sass'],
})
export class ShoppingCartComponent implements OnInit {
  products: Product[] = [];
  subtotal: number = 0;
  vatTotal: number = 0;
  userCountry: string = '';
  vatRate: number = 0;
  deliveryFee: number = 0;

  userAddress: string = '';
  userPostcode: string = '';
  userEmail: string = '';

  constructor(
    private cartService: CartService,
    private wishlistService: WishlistService,
    private router: Router,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.authService.getCurrentUser().subscribe(user => {
      this.userCountry = user?.country || '';
      this.userAddress = user?.address || '';
      this.userPostcode = user?.postcode || '';
      this.userEmail = user?.email || '';
      this.vatRate = getVatRateByCountry(this.userCountry) ?? 0;
      this.loadCart();
    });
  }

  // Fetch cart data and calculate totals
  loadCart(): void {
    this.cartService.getProductsFromBackend().subscribe({
      next: (products) => {
        this.products = products.map((product) => ({
          ...product,
          id: product.id || 0,
          quantity: product.quantity || 1,
          selectedSize: product.selectedSize || null,
          unitType: product.selectedSize?.unitType || 'size',
          sizeLabel: product.selectedSize?.sizeLabel || 'Size Label',
          sizes: product.sizes || [],
        }));
        this.calculateTotals();
      },
      error: (err) => console.error('Failed to load cart:', err),
    });
  }

  // Calculate subtotal and VAT properly, using sale price if on sale
  calculateTotals(): void {
    this.subtotal = 0;
    this.vatTotal = 0;

    for (const product of this.products) {
      const quantity = product.quantity || 1;
      const basePrice = product.onSale && product.selectedSize?.salePrice != null
        ? product.selectedSize.salePrice
        : product.selectedSize?.price || 0;

      const unitVatAmount = +(basePrice * this.vatRate / 100).toFixed(2);

      this.subtotal += basePrice * quantity;
      this.vatTotal += unitVatAmount * quantity;
    }

    // Apply delivery fee only once (for entire order)
    this.deliveryFee = getDeliveryRateByCountry(this.userCountry) ?? 0;
  }


  get total(): number {
    return this.subtotal + this.vatTotal;
  }

  // Handle quantity change
  onQuantityChange(event: { product: Product, quantity: number }): void {
    const updatedProduct = { ...event.product, quantity: event.quantity };

    this.cartService.updateCartItem(updatedProduct).subscribe({
      next: () => {
        console.log(`Updated quantity for ${updatedProduct.product_name} to ${event.quantity}`);
        this.calculateTotals();
      },
      error: (err) => console.error('Failed to update quantity:', err),
    });
  }

  // Wishlist logic
  addToWishlist(product: Product): void {
    this.removeFromCart(product);
    this.wishlistService.addToWishlist(product).subscribe(() => {
      console.log(`${product.product_name} added to wishlist`);
    });
  }

  // Remove product from cart
  removeFromCart(product: Product): void {
    if (!product.selectedSize?.id) {
      console.error('Selected size is missing.');
      return;
    }

    this.cartService.removeProductFromBackend(product.id.toString(), product.selectedSize.id).subscribe({
      next: () => {
        this.products = this.products.filter(p => !(p.id === product.id && p.selectedSize?.id === product.selectedSize?.id));
        this.calculateTotals();
      },
      error: (err) => console.error('Error removing product:', err),
    });
  }

  // Proceed to checkout
  onCheckout(): void {
    this.cartService.syncCartWithFirestore().subscribe(() => {
      this.router.navigate(['/payment']);
    });
  }
  get grandTotal(): number {
    return this.subtotal + this.vatTotal + this.deliveryFee;
  }

}
