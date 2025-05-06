import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Product, ProductSize } from '../../../models/product';
import { ProductService } from '../../../services/product.service';
import { AuthService } from '../../../services/auth.service';
import { User } from '../../../models/user';
import { VatService } from '../../../services/vat-service.service';

@Component({
  selector: 'app-product-card-detail',
  templateUrl: './product-card-detail.component.html',
  styleUrls: ['./product-card-detail.component.sass'],
})
export class ProductCardDetailComponent implements OnInit {
  @Input() product!: Product;
  @Input() userSelectedQuantity: number = 1;
  @Input() averageRating: number = 0;

  @Output() addToWishlistEvent = new EventEmitter<Product>();
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
    this.loadUserCountryAndVatRate();

    // Load product images
    if (this.product?.product_image?.length) {
      this.productImages = this.product.product_image.slice(0, 6);
      this.currentImage = this.productImages[0];
    }

    // Calculate initial average rating from embedded comments
    this.calculateAverageRating();
  }

  /**
   * Loads VAT rate from the VatService based on current user country
   */
  loadUserCountryAndVatRate(): void {
    this.authService.getCurrentUser().subscribe((user: User | null) => {
      if (user?.country) {
        this.userCountry = user.country;

        // Wait for the service to finish loading VAT data
        this.vatService.isVatReady().subscribe((ready) => {
          if (ready) {
            this.vatRate = this.vatService.getVatRate();
            this.vatReady = true;
          }
        });
      }
    });
  }

  /**
   * Returns price including VAT
   */
  getPriceWithVat(basePrice: number): number {
    const vatAmount = basePrice * (this.vatRate / 100);
    return +(basePrice + vatAmount).toFixed(2);
  }

  /**
   * Returns a human-readable size unit string
   */
  getUnit(unitType: ProductSize['unitType'], size: number | string, label: string): string {
    return this.productService.getUnit(unitType, size, label);
  }

  /**
   * Emits event to add selected product to cart
   */
  addToCart(selectedSize: ProductSize | null, color: string): void {
    if (!this.product || !selectedSize) return;

    this.addToCartEvent.emit({
      product: this.product,
      selectedSize,
      color,
      purchaseQuantity: this.userSelectedQuantity || 1,
    });
  }

  /**
   * Emits event to add product to wishlist
   */
  addToWishlist(product: Product): void {
    this.addToWishlistEvent.emit(product);
  }

  /**
   * Emits event to add product to compare list
   */
  addToCompare(product: Product): void {
    this.addToCompareEvent.emit(product);
  }

  /**
   * Updates the main product image
   */
  setMainImage(image: string): void {
    this.currentImage = image;
  }

  /**
   * Returns price range (min-max) with VAT included
   */
  getPriceRangeWithVat(product: Product): string {
    if (!product.sizes || product.sizes.length === 0) {
      return 'No sizes available!';
    }

    const pricesWithVat = product.sizes.map(size => {
      const basePrice = product.onSale && size.salePrice != null
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

  /**
   * Calculates average rating from embedded comments
   */
  calculateAverageRating(): void {
    const comments = this.product?.comments || [];

    if (!comments.length) {
      this.averageRating = 0;
      return;
    }

    const total = comments.reduce((sum, comment) => sum + comment.rating, 0);
    this.averageRating = total / comments.length;
  }
}
