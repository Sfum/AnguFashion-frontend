import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Product, ProductSize } from '../../../models/product';
import { ProductService } from '../../../services/product.service';
import { AuthService } from '../../../services/auth.service';
import { getVatRateByCountry } from '../../../models/vat-rates';
import { User } from '../../../models/user';
import {VatService} from '../../../services/vat-service.service';

@Component({
  selector: 'app-product-card-detail',
  templateUrl: './product-card-detail.component.html',
  styleUrls: ['./product-card-detail.component.sass'],
})
export class ProductCardDetailComponent implements OnInit {

  @Input() product!: Product;
  @Input() userSelectedQuantity: number = 1;
  @Input() averageRating: number = 0;

  @Output() addToWishlistEvent: EventEmitter<Product> = new EventEmitter<Product>();
  @Output() addToCartEvent = new EventEmitter<{
    product: Product;
    selectedSize: ProductSize | null;
    color: string;
    purchaseQuantity: number;
  }>();
  @Output() addToCompareEvent = new EventEmitter<Product>();

  selectedSize: ProductSize | null = null;
  selectedColor: string | null = null;

  productImages: string[] = [];
  currentImage: string = '';

  userCountry: string = 'Unknown';
  vatRate: number = 0;
  vatReady: boolean = false;

  constructor(
    private productService: ProductService,
    private authService: AuthService,
    private vatService: VatService
  ) {}

  ngOnInit(): void {
    this.authService.getCurrentUser().subscribe(user => {
      if (user && user.country) {
        this.userCountry = user.country;
        this.vatRate = getVatRateByCountry(user.country) ?? 0;
      }
      this.vatReady = true; // ✅ Mark ready to display
    });
    this.loadUserCountryAndVatRate();

    this.vatService.isVatReady().subscribe(ready => {
      if (ready) {
        this.vatRate = this.vatService.getVatRate();
        this.vatReady = true;
      }
    });

    if (this.product && Array.isArray(this.product.product_image)) {
      this.productImages = this.product.product_image.slice(0, 6);
      this.currentImage = this.productImages.length > 0 ? this.productImages[0] : '';
    } else {
      console.warn('Invalid or missing product images.');
    }
    this.calculateAverageRating();
  }

  /**
   * Load user country and determine VAT rate.
   */
  /**
   * Calculate and return a price including VAT.
   */
  getPriceWithVat(basePrice: number): number {
    const vatAmount = basePrice * (this.vatRate / 100);
    return +(basePrice + vatAmount).toFixed(2);
  }

  /**
   * Retrieve the display unit for a product size.
   */
  getUnit(unitType: ProductSize['unitType'], size: number | string, label: string): string {
    return this.productService.getUnit(unitType, size, label);
  }

  /**
   * Handle adding a product to the cart.
   */
  addToCart(selectedSize: ProductSize | null, color: string): void {
    if (!this.product || !selectedSize) return;

    const quantity = this.userSelectedQuantity || 1;
    this.addToCartEvent.emit({
      product: this.product,
      selectedSize,
      color,
      purchaseQuantity: quantity,
    });
  }

  /**
   * Handle wishlist event.
   */
  addToWishlist(product: Product): void {
    this.addToWishlistEvent.emit(product);
  }

  /**
   * Handle compare event.
   */
  addToCompare(product: Product): void {
    this.addToCompareEvent.emit(product);
  }

  /**
   * Set the main image from thumbnail click.
   */
  setMainImage(image: string): void {
    this.currentImage = image;
  }

  /**
   * Show price range (VAT included).
   */
  getPriceRange(product: Product): string {
    if (!product.sizes?.length) return 'No sizes available!';

    const pricesWithVat = product.sizes.map(size => {
      const price = product.onSale && size.salePrice !== null && size.salePrice !== undefined
        ? size.salePrice
        : size.price;
      return this.getPriceWithVat(price);
    });

    const min = Math.min(...pricesWithVat);
    const max = Math.max(...pricesWithVat);

    return min === max ? `${min.toFixed(2)}$` : `${min.toFixed(2)}$ - ${max.toFixed(2)}$`;
  }
  loadUserCountryAndVatRate(): void {
    this.authService.getCurrentUser().subscribe((user: User | null) => {
      if (user?.country) {
        this.userCountry = user.country;
        this.vatRate = getVatRateByCountry(this.userCountry) || 0;
      }
      this.vatReady = true; // ✅ Trigger UI rendering only when ready
    });
  }
  getPriceRangeWithVat(product: Product): string {
    if (!product.sizes || product.sizes.length === 0) {
      return 'No sizes available!';
    }

    const pricesWithVat = product.sizes.map(size => {
      const basePrice = product.onSale && size.salePrice !== null && size.salePrice !== undefined
        ? size.salePrice
        : size.price;

      return this.getPriceWithVat(basePrice);
    });

    const min = Math.min(...pricesWithVat);
    const max = Math.max(...pricesWithVat);
    const label = this.vatRate === 0 ? ' (excl. VAT)' : '';

    return min === max
      ? `${min.toFixed(2)}$${label}`
      : `${min.toFixed(2)}$ - ${max.toFixed(2)}$${label}`;
  }
  calculateAverageRating(): void {
    const comments = this.product?.comments || [];

    if (comments.length === 0) {
      this.averageRating = 0;
      return;
    }

    const total = comments.reduce((sum, comment) => sum + comment.rating, 0);
    this.averageRating = total / comments.length;
  }


}
