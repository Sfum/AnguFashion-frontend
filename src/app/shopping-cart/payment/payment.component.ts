import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AngularFireAuth } from '@angular/fire/compat/auth';

import { CartService } from '../../services/cart.service';
import { SalesService } from '../../services/sales.service';
import { AuthService } from '../../services/auth.service';
import { VatService } from '../../services/vat-service.service';

import { Sale, SaleStatus } from '../../models/sale';
import { Product, ProductSize } from '../../models/product';
import { User } from '../../models/user';

@Component({
  selector: 'app-payment',
  templateUrl: './payment.component.html',
  styleUrls: ['./payment.component.sass'],
})
export class PaymentComponent {
  loading = false;
  errorMessage: string | null = null;

  vatRate: number = 0;

  constructor(
    private cartService: CartService,
    private salesService: SalesService,
    private router: Router,
    private afAuth: AngularFireAuth,
    private authService: AuthService,
    private vatService: VatService
  ) {}

  /**
   * Handles the simulated payment process
   */
  simulatePayment(): void {
    this.loading = true;
    this.errorMessage = null;

    // Ensure cart is synced first
    this.cartService.syncCartWithFirestore().subscribe({
      next: () => {
        this.cartService.getProductsFromBackend().subscribe({
          next: (products) => {
            if (!products.length) {
              this.errorMessage = 'No products found in the cart';
              this.loading = false;
              return;
            }

            // Get user
            this.authService.getCurrentUser().subscribe((user) => {
              if (!user) {
                this.errorMessage = 'Please, login to your account to access this feature!';
                this.loading = false;
                return;
              }

              // Fetch VAT rate (or use fallback if not ready)
              this.vatService.isVatReady().subscribe((ready) => {
                this.vatRate = ready ? this.vatService.getVatRate() : 0;

                try {
                  const salesPayload: Sale[] = products.map((product) => {
                    const selectedSizeId = product.selectedSize?.id;
                    const selectedSize = product.sizes.find(size => size.id === selectedSizeId);

                    if (!selectedSize) {
                      throw new Error('Cart item must have a valid selected size');
                    }

                    return this.createSaleData(product, user, product.quantity, selectedSize);
                  });

                  // Send purchase request
                  this.salesService.handlePurchase(salesPayload).subscribe({
                    next: () => {
                      console.log('All purchases processed successfully');
                      this.loading = false;
                      this.router.navigate(['/orders']).then(() => localStorage.clear());
                    },
                    error: (error) => {
                      console.error('Error processing purchases:', error);
                      this.errorMessage = error.message || 'Failed to process payment';
                      this.loading = false;
                    }
                  });
                } catch (error) {
                  console.error('Error building sale data:', error);
                  this.errorMessage = (error as Error).message;
                  this.loading = false;
                }
              });
            });
          },
          error: (err) => {
            console.error('Error fetching cart products:', err);
            this.errorMessage = err.message || 'Failed to fetch cart products';
            this.loading = false;
          }
        });
      },
      error: (err) => {
        console.error('Error syncing cart:', err);
        this.errorMessage = err.message || 'Failed to sync cart';
        this.loading = false;
      }
    });
  }

  /**
   * Constructs the Sale object for a given product
   */
  createSaleData(
    product: Product,
    user: User,
    quantity: number,
    selectedSize: ProductSize
  ): Sale {
    const price = product.onSale && selectedSize.salePrice != null
      ? selectedSize.salePrice
      : selectedSize.price;

    const vatRate = selectedSize.vatRate ?? this.vatRate;
    const unitVatAmount = +(price * vatRate / 100).toFixed(2);
    const vatAmount = +(unitVatAmount * quantity).toFixed(2);
    const totalPrice = +((price * quantity) + vatAmount).toFixed(2);

    return {
      id: '',
      productId: product.id,
      product_name: product.product_name,
      quantitySold: quantity,
      quantityStock: product.quantityStock,
      selectedSize: {
        id: selectedSize.id,
        size: selectedSize.size,
        quantity: selectedSize.quantity,
        price: selectedSize.price,
        salePrice: selectedSize.salePrice,
        vatAmount: unitVatAmount,
        vatRate,
        unitType: selectedSize.unitType,
        sizeLabel: selectedSize.sizeLabel,
      },
      status: SaleStatus.OPEN,
      saleDate: new Date(),
      buyerName: user.displayName || 'Current Buyer',
      buyerAddress: user.address || 'Unknown Address',
      buyerPostcode: user.postcode || 'Unknown Postcode',
      buyerCountry: user.country || 'Unknown Country',
      buyerEmail: user.email || 'buyer@example.com',
      sellerName: product.uploaderId || 'Unknown Seller',
      uploaderId: product.uploaderId || '',
      userId: user.uid,
      vatAmount,
      vatRate,
      totalPrice // Delivery fee added server-side to one item
    };
  }
}
