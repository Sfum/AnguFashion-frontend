import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Product } from '../models/product';
import { CartService } from '../services/cart.service';
import { WishlistService } from '../services/wishlist.service';
import { AuthService } from '../services/auth.service';
import { VatService } from '../services/vat-service.service';
import { DeliveryRateService } from '../services/delivery-rate.service';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-shopping-cart',
  templateUrl: './shopping-cart.component.html',
  styleUrls: ['./shopping-cart.component.sass'],
})
export class ShoppingCartComponent implements OnInit {
  products: Product[] = [];
  deliveryFee: number = 0;
  deliveryMode: string = '';

  subtotal = 0;
  vatTotal = 0;

  userCountry = '';
  vatRate = 0;

  userAddress = '';
  userPostcode = '';
  userEmail = '';

  editingAddress = false;
  countries: string[] = [];

  constructor(
    private cartService: CartService,
    private wishlistService: WishlistService,
    private router: Router,
    private authService: AuthService,
    private vatService: VatService,
    private deliveryRateService: DeliveryRateService,
    private http: HttpClient
  ) {}

  ngOnInit(): void {
    // Fetch current user details
    this.authService.getCurrentUser().subscribe(user => {
      if (user) {
        this.userCountry = user.country || '';
        this.userAddress = user.address || '';
        this.userPostcode = user.postcode || '';
        this.userEmail = user.email || '';

        // Fetch delivery info after setting userCountry
        this.fetchDeliveryRates();
      }

      // Wait for VAT data to be ready
      this.vatService.isVatReady().subscribe(ready => {
        if (ready) {
          this.vatRate = this.vatService.getVatRate();
          this.loadCart();
        }
      });
    });

    // Load country list for dropdown
    this.http.get<string[]>('/assets/countries.json').subscribe({
      next: (data) => this.countries = data,
      error: (err) => console.error('Failed to load countries:', err),
    });
  }

  /**
   * Fetch delivery rates based on selected user country
   */
  fetchDeliveryRates(): void {
    this.deliveryRateService.getAll().subscribe({
      next: (rates) => {
        const matched = rates.find(r =>
          r.country.toLowerCase() === this.userCountry.toLowerCase()
        );
        this.deliveryFee = matched ? matched.rate : 0;
        this.deliveryMode = matched?.delivery_mode || '';
      },
      error: (err) => {
        console.error('Failed to fetch delivery rates:', err);
        this.deliveryFee = 0;
        this.deliveryMode = '';
      }
    });
  }

  /**
   * Loads cart data and triggers total calculation
   */
  loadCart(): void {
    this.cartService.getProductsFromBackend().subscribe({
      next: (products) => {
        this.products = products.map(product => ({
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
      error: (err) => console.error('Failed to load cart:', err)
    });
  }

  /**
   * Calculates subtotal, VAT, and delivery
   */
  calculateTotals(): void {
    this.subtotal = 0;
    this.vatTotal = 0;

    for (const product of this.products) {
      const quantity = product.quantity || 1;
      const basePrice = product.onSale && product.selectedSize?.salePrice != null
        ? product.selectedSize.salePrice
        : product.selectedSize?.price || 0;

      const vatAmount = +(basePrice * this.vatRate / 100).toFixed(2);

      this.subtotal += basePrice * quantity;
      this.vatTotal += vatAmount * quantity;
    }

    // Fetch delivery rate dynamically
    this.fetchDeliveryRates();
  }

  /**
   * Triggered when quantity changes for a product
   */
  onQuantityChange(event: { product: Product; quantity: number }): void {
    const updated = { ...event.product, quantity: event.quantity };

    this.cartService.updateCartItem(updated).subscribe({
      next: () => {
        console.log(`Updated quantity for ${updated.product_name}`);
        this.calculateTotals();
      },
      error: (err) => console.error('Failed to update quantity:', err),
    });
  }

  /**
   * Removes a product from the cart
   */
  removeFromCart(product: Product): void {
    if (!product.selectedSize?.id) {
      console.error('Missing selected size');
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

  /**
   * Moves a product to the wishlist
   */
  addToWishlist(product: Product): void {
    this.removeFromCart(product);
    this.wishlistService.addToWishlist(product).subscribe(() => {
      console.log(`${product.product_name} added to wishlist`);
    });
  }

  /**
   * Proceed to payment
   */
  onCheckout(): void {
    this.cartService.syncCartWithFirestore().subscribe(() => {
      this.router.navigate(['/payment']);
    });
  }

  /**
   * Computed property for grand total
   */
  get grandTotal(): number {
    return this.subtotal + this.vatTotal + this.deliveryFee;
  }

  get total(): number {
    return this.subtotal + this.vatTotal;
  }

  /**
   * Toggle address editing mode
   */
  toggleAddressEdit(): void {
    this.editingAddress = !this.editingAddress;
  }

  /**
   * Save the updated address
   */
  saveAddress(): void {
    this.authService.getCurrentUser().subscribe(user => {
      if (!user) return;

      const updated = {
        address: this.userAddress,
        postcode: this.userPostcode,
        country: this.userCountry
      };

      this.authService.updateUserAddress(user.uid, updated).subscribe({
        next: () => {
          this.editingAddress = false;
          console.log('Address updated');
        },
        error: (err) => {
          console.error('Error updating address:', err);
        }
      });
    });
  }
}
