import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { from, Observable, throwError } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';
import { Sale, SaleStatus } from '../models/sale';
import { User } from '../models/user';
import {environment} from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class SalesService {

  private apiUrl = `${environment.apiUrl}/sales`;

  constructor(
    private http: HttpClient,
    private afAuth: AngularFireAuth,
  ) {}

  // Private method to retrieve the Firebase authentication token
  private getToken(): Observable<string> {
    return from(this.afAuth.idToken).pipe(
      map((token) => {
        if (!token) throw new Error('No token available'); // Handle missing token
        return token; // Return the token if available
      })
    );
  }

  // Retrieves all sales with token-based authentication
  getAllSales(): Observable<Sale[]> {
    return this.getToken().pipe(
      switchMap((token) => {
        const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`); // Set authorization header
        return this.http.get<Sale[]>(`${this.apiUrl}/all`, { headers }); // Fetch sales data
      }),
      catchError((error) => {
        console.error('Error fetching sales:', error); // Log error details
        return throwError('Error fetching sales'); // Return an observable with an error message
      })
    );
  }

  // Fetches sales for a specific user without token-based authentication
  getDownloadsByUser(userId: string): Observable<Sale[]> {
    return this.http.get<Sale[]>(`${this.apiUrl}/users/${userId}/sales`).pipe(
      catchError((error) => {
        console.error('Error fetching downloads by user:', error); // Log error details
        return throwError('Error fetching downloads by user'); // Return an observable with an error message
      })
    );
  }

  // Fetches sales data for a specific uploader
  getSalesByUploader(uploaderId: string): Observable<Sale[]> {
    const url = `${this.apiUrl}/${uploaderId}/sales`; // Construct the API endpoint URL
    return this.http.get<Sale[]>(url).pipe(
      catchError((error) => {
        console.error('Error fetching sales by uploaderId:', error); // Log error details
        return throwError('Error fetching sales by uploaderId'); // Return an observable with an error message
      })
    );
  }

  // Fetches sale details along with buyer and seller information
  getSaleWithBuyer(userId: string, saleId: string): Observable<{ sale: Sale; buyer: User; seller: User }> {
    return this.http.get<{ sale: Sale; buyer: User; seller: User }>(`${this.apiUrl}/${userId}/${saleId}`).pipe(
      catchError((error) => {
        console.error('Error in getSaleWithBuyer:', error); // Log error details
        return throwError(() => new Error('Error fetching sale, buyer, and seller')); // Return an observable with an error message
      })
    );
  }

  // Updates the status of a specific sale
  updateSaleStatus(userId: string, saleId: string, newStatus: SaleStatus): Observable<Sale> {
    return this.http.get<Sale>(`${this.apiUrl}/update-status/${userId}/${saleId}/${newStatus}`).pipe(
      catchError((error) => {
        console.error('Error updating sale status:', error); // Log error details
        return throwError('Error updating sale status'); // Return an observable with an error message
      })
    );
  }

  // Handles the purchase process, including user authentication and sale submission
  handlePurchase(saleData: Sale): Observable<void> {
    return this.getToken().pipe(
      switchMap((token) => {
        return this.afAuth.authState.pipe(
          map((user) => {
            if (!user) throw new Error('User is not authenticated'); // Check if user is authenticated
            saleData.userId = user.uid; // Attach user ID to sale data
            return { saleData, token }; // Return sale data along with the token
          })
        );
      }),
      switchMap(({ saleData, token }) => {
        console.log(saleData); // Debugging: Log the sale data
        const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`); // Set authorization header
        return this.http.post<void>(`${this.apiUrl}/purchase`, saleData, { headers }); // Submit the sale data
      }),
      catchError((error) => {
        console.error('Error processing purchase:', error); // Log error details
        return throwError('Error processing purchase'); // Return an observable with an error message
      })
    );
  }
}
