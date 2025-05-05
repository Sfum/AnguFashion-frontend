import { Component } from '@angular/core';
import { CartService } from '../../services/cart.service';
import { SalesService } from '../../services/sales.service';
import { Router } from '@angular/router';
import { Sale, SaleStatus } from '../../models/sale';
import { Product, ProductSize } from '../../models/product';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import {getVatRateByCountry} from '../../models/vat-rates';
import {AuthService} from '../../services/auth.service';
import {User} from '../../models/user';

@Component({
  selector: 'app-payment',
  templateUrl: './payment.component.html',
  styleUrls: ['./payment.component.sass'],
})
export class PaymentComponent {
  loading = false; // Indicates if the payment process is loading
  errorMessage: string | null = null; // Stores error messages if any

  constructor(
    private cartService: CartService,
    private salesService: SalesService,
    private router: Router,
    private afAuth: AngularFireAuth,
    private authService: AuthService // Injecting AuthService to get user details
  ) {}

  // Method to simulate the payment process
  simulatePayment(): void {
    this.loading = true;
    this.errorMessage = null;

    this.cartService.syncCartWithFirestore().subscribe({
      next: () => {
        this.cartService.getProductsFromBackend().subscribe({
          next: (products) => {
            if (products.length === 0) {
              this.errorMessage = 'No products found in the cart';
              this.loading = false;
              return;
            }

            this.authService.getCurrentUser().subscribe((user) => {
              if (!user) {
                this.errorMessage = 'Please, login to your account to access this feature!';
                this.loading = false;
                return;
              }

              try {
                // ✅ Build a full array of sales
                const salesPayload: Sale[] = products.map((product) => {
                  const selectedSizeId = product.selectedSize?.id || product.selectedSize.id;
                  const selectedSize = product.sizes.find(
                    (size) => size.id === selectedSizeId
                  );

                  if (!selectedSize || !selectedSize.id) {
                    throw new Error('Cart item must have a valid selected size');
                  }

                  return this.createSaleData(product, user, product.quantity, selectedSize);
                });

                // ✅ Send all sales in one call
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
                  },
                });

              } catch (error) {
                console.error('Error building sale data:', error);
                this.errorMessage = (error as Error).message;
                this.loading = false;
              }
            });
          },
          error: (error) => {
            console.error('Error fetching cart products:', error);
            this.errorMessage = error.message || 'Failed to fetch cart products';
            this.loading = false;
          },
        });
      },
      error: (error) => {
        console.error('Error syncing cart:', error);
        this.errorMessage = error.message || 'Failed to sync cart';
        this.loading = false;
      },
    });
  }


  /**
   * Method to create sale data for the transaction
   * @param product - The product being purchased
   * @param user - The authenticated user making the purchase
   * @param quantity - The quantity of the product being purchased
   * @param selectedSize - The specific size of the product being purchased
   * @returns The constructed Sale object
   */
  createSaleData(
    product: Product,
    user: User,
    quantity: number,
    selectedSize: ProductSize
  ): Sale {
    if (!selectedSize || !selectedSize.id) {
      console.error('Selected size does not have a valid ID:', selectedSize);
      throw new Error('Selected size must be provided and have a valid ID');
    }

    // Determine unit price (sale price if available)
    const priceToUse =
      product.onSale && selectedSize.salePrice !== null && selectedSize.salePrice !== undefined
        ? selectedSize.salePrice
        : selectedSize.price;

    // VAT calculation
    const country = user.country || 'Unknown Country';
    const vatRate = selectedSize.vatRate ?? getVatRateByCountry(country) ?? 0;
    const unitVatAmount = +(priceToUse * vatRate / 100).toFixed(2);
    const vatAmount = +(unitVatAmount * quantity).toFixed(2);

    // Total price (without delivery rate — added later only to first item on backend)
    const totalPrice = +((priceToUse * quantity) + vatAmount).toFixed(2);

    // Return fully constructed Sale object
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
        vatAmount: selectedSize.vatAmount,
        vatRate: selectedSize.vatRate,
        unitType: selectedSize.unitType,
        sizeLabel: selectedSize.sizeLabel,
      },
      status: SaleStatus.OPEN,
      saleDate: new Date(),
      buyerName: user.displayName || 'Current Buyer',
      buyerAddress: user.address || 'Unknown Address',
      buyerPostcode: user.postcode || 'Unknown Postcode',
      buyerCountry: country,
      buyerEmail: user.email || 'buyer@example.com',
      sellerName: product.uploaderId || 'Unknown Seller',
      uploaderId: product.uploaderId || '',
      userId: user.uid,
      vatAmount,
      vatRate,
      totalPrice, // DeliveryRate will be added by backend to first item
    };
  }

}
