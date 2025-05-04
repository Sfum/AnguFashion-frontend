import { Component } from '@angular/core';
import { CartService } from '../../services/cart.service';
import { SalesService } from '../../services/sales.service';
import { Router } from '@angular/router';
import { Sale, SaleStatus } from '../../models/sale';
import { Product, ProductSize } from '../../models/product';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import {getVatRateByCountry} from '../../models/vat-rates';
import {AuthService} from '../../services/auth.service';

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
  simulatePayment(uploaderId: string): void {
    this.loading = true; // Start the loading state
    this.errorMessage = null; // Reset error message

    // Sync the cart data with Firestore
    this.cartService.syncCartWithFirestore().subscribe({
      next: () => {
        // Fetch products from the backend
        this.cartService.getProductsFromBackend().subscribe({
          next: (products) => {
            if (products.length === 0) {
              this.errorMessage = 'No products found in the cart';
              this.loading = false;
              return;
            }

            // Process each product in the cart
            products.forEach((product) => {
              // Get the currently authenticated user
              this.authService.getCurrentUser().subscribe((user) => {
                if (user) {
                  try {
                    // Extract the selected size's id from the product
                    const selectedSizeId = product.selectedSize?.id || product.selectedSize.id;

                    // Find the corresponding ProductSize from the product's sizes array
                    const selectedSize: ProductSize | undefined = product.sizes.find(
                      (size) => size.id === selectedSizeId
                    );

                    // Check if a valid size was found
                    if (!selectedSize || !selectedSize.id) {
                      console.error('Product does not have a valid selected size:', product);
                      this.errorMessage = 'Cart item must have a valid selected size';
                      this.loading = false;
                      return;
                    }

                    // Create the sale data for this product
                    const saleData: Sale = this.createSaleData(product, user, product.quantity, selectedSize);
                    console.log('Created sale data:', saleData);

                    // Process the sale using the SalesService
                    this.salesService.handlePurchase(saleData).subscribe({
                      next: () => {
                        console.log('Purchase processed successfully');
                        this.loading = false;
                        this.router.navigate(['/orders']).then(() => localStorage.clear());
                      },
                      error: (error) => {
                        console.error('Error processing purchase:', error);
                        this.errorMessage = error.message || 'Failed to process payment';
                        this.loading = false;
                      },
                    });
                  } catch (error) {
                    console.error('Error creating sale data:', error);
                    this.errorMessage = 'Error creating sale data';
                    this.loading = false;
                  }
                } else {
                  console.error('Please, login to your account to access this feature!');
                  this.errorMessage = 'Please, login to your account to access this feature!';
                  this.loading = false;
                }
              });
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
  createSaleData(product: Product, user: any, quantity: number, selectedSize: ProductSize): Sale {
    if (!selectedSize || !selectedSize.id) {
      console.error('Selected size does not have a valid ID:', selectedSize);
      throw new Error('Selected size must be provided and have a valid ID');
    }

    // ✅ 1. Use salePrice ONLY if it's defined and not null
    const priceToUse =
      product.onSale && selectedSize.salePrice !== null && selectedSize.salePrice !== undefined
        ? selectedSize.salePrice
        : selectedSize.price;

    // ✅ 2. Get user country and VAT rate
    const country = user.country || 'Unknown Country';
    const vatRate = selectedSize.vatRate ?? getVatRateByCountry(country) ?? 0;

    // ✅ 3. Calculate VAT and total price based on actual unit price used
    const unitVatAmount = +(priceToUse * vatRate / 100).toFixed(2);
    const vatAmount = +(unitVatAmount * quantity).toFixed(2);
    const totalPrice = +((priceToUse * quantity) + vatAmount).toFixed(2);

    // ✅ 4. Return properly structured Sale object
    const saleData: Sale = {
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
      sellerName: product.uploaderId ? product.uploaderId : 'Unknown Seller',
      uploaderId: product.uploaderId || '',
      userId: user.uid,
      vatAmount,
      vatRate,
      totalPrice
    };

  console.log('Constructed saleData with calculated VAT:', saleData);
    return saleData;
  }
}
