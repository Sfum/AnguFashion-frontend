import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {catchError, Observable, of} from 'rxjs';
import {map, switchMap} from 'rxjs/operators';
import {Product, WishlistItem} from '../models/product';
import {AuthService} from './auth.service'; // AuthService to get user ID
import {SnackbarService} from './snackbar.service';
import {environment} from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class WishlistService {

  private apiUrl = `${environment.apiUrl}/wishlist`;

  constructor(
    private http: HttpClient,
    private authService: AuthService,
    private snackbarService: SnackbarService,
  ) {
  }

  // Load the wishlist
  loadWishlist(): Observable<Product[]> {
    return this.authService.getCurrentUser().pipe(
      switchMap((user) => {
        if (user && user.uid) {
          return this.http.get<WishlistItem[]>(`${this.apiUrl}/${user.uid}`).pipe(
            map((items) => {
              console.log('Fetched Wishlist Items:', items); // Debug log
              return items.map((item) => item.product);
            }),
          );
        } else {
          return of([]); // Return an empty array if user is not authenticated
        }
      }),
      catchError((error) => {
        console.error('Error loading wishlist:', error);
        return of([]); // Return empty array in case of error
      }),
    );
  }

  // Add a product to the wishlist by sending a request to the backend
  addToWishlist(product: Product): Observable<void> {
    return this.authService.getCurrentUser().pipe(
      switchMap((user) => {
        if (user && user.uid) {
          return this.http.post<{ message: string }>(`${this.apiUrl}/add`, {
            userId: user.uid,
            product,
          }).pipe(
            map((response) => {
              if (response.message === 'Item is already in Wishlist') {
                this.snackbarService.showSnackbar('Item is already in Wishlist');
              } else {
                this.snackbarService.showSnackbar(
                  `\`${product.product_name}\` added to your wishlist`,
                );
              }
            }),
          );
        } else {
          throw new Error('Please, login to your account to access this feature!');
        }
      }),
      catchError((error) => {
        console.error('Error adding to wishlist:', error);
        this.snackbarService.showSnackbar('Failed to add item to wishlist');
        return of();
      }),
    );
  }

  // Remove a product from the wishlist by sending a delete request to the backend
  removeProduct(productId: string): Observable<void> {
    return this.authService.getCurrentUser().pipe(
      switchMap((user) => {
        // Check if user is authenticated and productId is not undefined or empty
        if (user && user.uid && productId) {
          return this.http.delete<void>(`${this.apiUrl}/remove/${productId}?userId=${user.uid}`).pipe(
            map(() => {
              this.snackbarService.showSnackbar('Product removed from wishlist');
            }),
          );
        } else if (!productId) {
          throw new Error('Invalid product ID');
        } else {
          throw new Error('Please, login to your account to access this feature!');
        }
      }),
    );
  }

  // Clear the entire wishlist
  clearWishlist(): Observable<void> {
    return this.authService.getCurrentUser().pipe(
      switchMap((user) => {
        if (user && user.uid) {
          return this.http.delete<void>(`${this.apiUrl}/clear?userId=${user.uid}`).pipe(
            map(() => {
              this.snackbarService.showSnackbar('Wishlist cleared');
            }),
          );
        } else {
          throw new Error('Please, login to your account to access this feature!');
        }
      }),
    );
  }
}
