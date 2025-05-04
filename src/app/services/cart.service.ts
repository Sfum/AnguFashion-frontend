import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Product, ProductComment, ProductSize} from '../models/product';
import {SnackbarService} from './snackbar.service';
import {AuthService} from './auth.service';
import {forkJoin, Observable, throwError} from 'rxjs';
import {catchError, map, switchMap, tap} from 'rxjs/operators';
import {CartItem} from '../models/cart-item';
import {ProductService} from './product.service';
import {environment} from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class CartService {

  private apiUrl = `${environment.apiUrl}/cart`;

  constructor(
    private http: HttpClient,
    private snackbarService: SnackbarService,
    private authService: AuthService,
    private productsService: ProductService
  ) {
    this.loadCart();
  }
  products: Product[] = [];
  cartItems: CartItem[] = [];

  // Syncs cart with Firestore using authenticated user data
  syncCartWithFirestore(): Observable<void> {
    console.log(this.cartItems)
    return this.authService.getCurrentUser().pipe(
      switchMap((user) => {
        if (user && user.uid) {
          return this.http.post<void>(`${this.apiUrl}/sync`, {
            userId: user.uid,
            userEmail: user.email,
            cart: this.cartItems,
          }).pipe(
            map(() => this.snackbarService.showSnackbar('Cart synchronized with Firestore')),
            catchError((error) => {
              console.error('Error syncing cart with Firestore:', error);
              return throwError(() => new Error('Error syncing cart with Firestore'));
            })
          );
        } else {
          throw new Error('Please, login to your account to access this feature!');
        }
      })
    );
  }

  // Fetch products from backend and enrich each cart item with product details
  getProductsFromBackend(): Observable<Product[]> {
    return this.authService.getCurrentUser().pipe(
      switchMap((user) => {
        if (user && user.uid) {
          return this.http.get<CartItem[]>(`${this.apiUrl}/${user.uid}`).pipe(
            switchMap((cartItems) => {
              const productObservables = cartItems.map((item) =>
                this.productsService.getProduct(item.productId).pipe(
                  map((product) => ({
                    ...product,
                    quantity: item.quantity,
                    selectedSize: item.selectedSize as ProductSize,
                    selectedColor: item.selectedColor,
                    salePrice: item.salePrice,
                    onSale: item.onSale,
                    sizeLabel: item.selectedSize.sizeLabel
                  }))
                )
              );

              return forkJoin(productObservables);
            })
          );
        } else {
          return throwError(() => new Error('Please, login to your account to access this feature!'));
        }
      })
    );
  }


  // Loads cart data from the backend and saves to the local cart state
  loadCart(): void {
    this.authService.getCurrentUser().pipe(
      switchMap((user) => {
        if (user && user.uid) {
          return this.http.get<Product[]>(`${this.apiUrl}/${user.uid}`);
        } else {
          return throwError(() => new Error('Please, login to your account to access this feature!'));
        }
      })
    ).subscribe({
      next: (products) => {
        this.products = products;
      },
      error: (error) => {
        console.error('Error loading cart:', error);
      },
    });
  }

  // Method to add a product to the cart with structured payload to the backend
  addToCart(product: Product, size: ProductSize, color: string | null = 'defaultColor', purchaseQuantity?: number): Observable<void> {
    const finalPurchaseQuantity = purchaseQuantity ?? 1;
    console.log('Purchase quantity in service:', finalPurchaseQuantity);

    return this.authService.getCurrentUser().pipe(
      switchMap((user) => {
        if (user && user.uid) {
          console.log('Cart Items before adding:', JSON.stringify(this.cartItems, null, 2));

          // Check if item is already in the cart
          const existingItem = this.cartItems.find((item) => {
            console.log(`Checking cart item: ${item.productId}, size: ${item.selectedSize?.id}`);
            console.log(`Comparing with product: ${product.id}, size: ${size.id}`);

            if (!item.selectedSize) {
              console.warn(`Item ${item.productId} has no selectedSize property`);
              return false;
            }

            return String(item.productId) === String(product.id) && String(item.selectedSize.id) === String(size.id);
          });

          if (existingItem) {
            console.warn('Item already exists in cart:', existingItem);
            this.snackbarService.showSnackbar('Item already in cart');
            return throwError(() => new Error('Item already in cart'));
          }

          // Ensure size has a valid ID before adding
          if (!size.id) {
            console.error('Error: Selected size does not have a valid ID:', size);
            this.snackbarService.showSnackbar('Error: Selected size does not have a valid ID.');
            return throwError(() => new Error('Selected unit does not have a valid ID'));
          }

          const payload = {
            userId: user.uid,
            product: {
              id: String(product.id),
              product_name: product.product_name,
              price: Number(product.price),
              salePrice: Number(size.price),
              onSale: product.onSale,
              selectedSize: size,
              quantitySold: product.quantitySold,
            },
            size: {
              id: String(size.id),
              size: Number(size.size),
              price: Number(size.price),
              quantity: Number(size.quantity),
              salePrice: Number(size.salePrice),
              unitType: String(size.unitType),
              sizeLabel: String(size.sizeLabel),
            },
            color: color || 'defaultColor',
          };

          console.log('Sending payload to backend:', payload);

          return this.http.post<void>(`${this.apiUrl}/add`, payload).pipe(
            tap(() => {
              const unit = this.getUnit(size.unitType, size.size, size.sizeLabel);
              const message = `${size.size}${unit} of ${product.product_name}, size ${size.sizeLabel}  added to cart!`;
              this.snackbarService.showSnackbar(message);
            }),
            catchError((error) => {
              console.error('Error adding product to cart:', error);
              this.snackbarService.showSnackbar('Error adding product to cart.');
              return throwError(() => new Error('Error adding product to cart'));
            })
          );
        } else {
          this.snackbarService.showSnackbar('Please, login to your account to access this feature!');
          throw new Error('Please, login to your account to access this feature!');
        }
      })
    );
  }


  // Get the relevant unit
  getUnit(unitType: 'size' | 'waist' | 'length' | 'fit' | 'kidsSize' | 'chest' | 'sleeve', size: number | string, sizeLabel: string): string {
    return this.productsService.getUnit(unitType, size, sizeLabel);
  }


  // Remove a product from backend cart based on productId
  removeProductFromBackend(productId: string, sizeId: string): Observable<void> {
    return this.authService.getCurrentUser().pipe(
      switchMap((user) => {
        if (user && user.uid) {
          // Update the backend endpoint to include `sizeId`
          return this.http.delete<void>(`${this.apiUrl}/remove/${productId}/${sizeId}?userId=${user.uid}`);
        } else {
          throw new Error('Please, login to your account to access this feature!');
        }
      })
    );
  }

  // Clears the entire cart for the authenticated user
  clearCart(): Observable<void> {
    return this.authService.getCurrentUser().pipe(
      switchMap((user) => {
        if (user && user.uid) {
          return this.http.delete<void>(`${this.apiUrl}/clear?userId=${user.uid}`).pipe(
            map(() => {
              this.snackbarService.showSnackbar('Cart cleared');
              this.products = [];
            }),
          );
        } else {
          throw new Error('Please, login to your account to access this feature!');
        }
      })
    );
  }

  // Adds a wishlist product to the cart
  addWishlistToCart(product: Product, size: ProductSize, color: string): Observable<void> {
    return this.addToCart(product, size, color);
  }

  // Update the quantity of a product in the cart
  updateCartItem(updatedProduct: Product): Observable<void> {
    return this.authService.getCurrentUser().pipe(
      switchMap((user) => {
        if (!user || !user.uid) {
          this.snackbarService.showSnackbar('Please, login to your account to access this feature!.');
          throw new Error('Please, login to your account to access this feature!');
        }

        const payload = {
          userId: user.uid, // Now user is properly defined
          productId: updatedProduct.id,
          sizeId: updatedProduct.selectedSize?.id,
          quantity: updatedProduct.quantity,
          selectedSize: {
            ...updatedProduct.selectedSize,
            quantity: updatedProduct.selectedSize.quantity - updatedProduct.quantity, // Adjust stock
            sizeLabel: updatedProduct.selectedSize.sizeLabel
          },
        };

        console.log('Payload to update cart:', payload);

        return this.http.patch<void>(`${this.apiUrl}/update`, payload).pipe(
          tap(() => {
            const message = `${updatedProduct.product_name}'s quantity has been updated to ${updatedProduct.quantity}`;
            this.snackbarService.showSnackbar(message);
          }),
          catchError((error) => {
            console.error('Error updating cart item:', error);
            this.snackbarService.showSnackbar('Error updating cart item.');
            return throwError(() => new Error('Error updating cart item'));
          })
        );
      }),
      catchError((error) => {
        console.error('An error occurred:', error);
        this.snackbarService.showSnackbar('An error occurred while updating the cart.');
        return throwError(() => new Error('An error occurred while updating the cart'));
      })
    );
  }
}
