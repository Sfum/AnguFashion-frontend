import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {catchError, Observable, of} from 'rxjs';
import {Product, CompareItem} from '../models/product';
import { AuthService } from './auth.service'; // AuthService to get user ID
import { map, switchMap } from 'rxjs/operators';
import { SnackbarService } from './snackbar.service';
import {environment} from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class CompareService {

  private apiUrl = `${environment.apiUrl}/compare`;

  constructor(
    private http: HttpClient,
    private authService: AuthService,
    private snackbarService: SnackbarService,
  ) {}

  // Load compare items from the backend
  loadCompare(): Observable<Product[]> {
    return this.authService.getCurrentUser().pipe(
      switchMap((user) => {
        if (user && user.uid) {
          return this.http.get<CompareItem[]>(`${this.apiUrl}/${user.uid}`).pipe(
            map((items) => {
              console.log('Fetched Compare Items:', items); // Debug log
              return items.map((item) => item.product);
            }),
          );
        } else {
          return of([]); // Return an empty array if user is not authenticated
        }
      }),
      catchError((error) => {
        console.error('Error loading compare:', error);
        return of([]); // Return empty array in case of error
      }),
    );
  }

  // Add a product to the compare by sending a request to the backend
  addToCompare(product: Product): Observable<void> {
    return this.authService.getCurrentUser().pipe(
      switchMap((user) => {
        if (user && user.uid) {
          return this.http.post<{ message: string }>(`${this.apiUrl}/add`, {
            userId: user.uid,
            product,
          }).pipe(
            map((response) => {
              if (response.message === 'Item is already in Compare') {
                this.snackbarService.showSnackbar('Item is already in Compare');
              } else {
                this.snackbarService.showSnackbar(
                  `\`${product.product_name}\` added to your compare`,
                );
              }
            }),
          );
        } else {
          throw new Error('Please, login to your account to access this feature!');
        }
      }),
      catchError((error) => {
        console.error('Error adding to compare:', error);
        this.snackbarService.showSnackbar('Failed to add item to compare');
        return of();
      }),
    );
  }

  // Remove a product from the compare
  removeProduct(productId: string): Observable<void> {
    return this.authService.getCurrentUser().pipe(
      switchMap((user) => {
        if (user && user.uid && productId) {
          return this.http.delete<void>(`${this.apiUrl}/remove/${productId}?userId=${user.uid}`).pipe(
            map(() => {
              this.snackbarService.showSnackbar('Product removed from compare');
            })
          );
        } else if (!productId) {
          throw new Error('Invalid product ID');
        } else {
          throw new Error('Please, login to your account to access this feature!');
        }
      }),
      catchError((error) => {
        console.error('Error removing product from compare:', error);
        this.snackbarService.showSnackbar('Failed to remove item from compare');
        return of();
      })
    );
  }

  // Clear the entire compare
  clearCompare(): Observable<void> {
    return this.authService.getCurrentUser().pipe(
      switchMap((user) => {
        if (user && user.uid) {
          return this.http.delete<void>(`${this.apiUrl}/clear?userId=${user.uid}`).pipe(
            map(() => {
              this.snackbarService.showSnackbar('Compare cleared');
            }),
          );
        } else {
          throw new Error('Please, login to your account to access this feature!');
        }
      }),
    );
  }
}
