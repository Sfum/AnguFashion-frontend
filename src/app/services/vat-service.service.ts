import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, map } from 'rxjs';
import { AuthService } from './auth.service';
import { environment } from '../../environments/environment';
import { VatRate } from '../models/vat-rates';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class VatService {
  private baseUrl = `${environment.apiUrl}/vat-rates`;

  private vatRate: number = 0;
  private vatReady = new BehaviorSubject<boolean>(false);

  constructor(
    private authService: AuthService,
    private http: HttpClient
  ) {
    this.loadVatRate(); // Load VAT rate on service initialization
  }

  /**
   * Get all VAT rates from the API
   */
  getAll(): Observable<VatRate[]> {
    return this.http.get<VatRate[]>(this.baseUrl);
  }

  /**
   * Create a new VAT rate entry
   */
  create(rate: VatRate): Observable<{ id: string }> {
    return this.http.post<{ id: string }>(this.baseUrl, rate);
  }

  /**
   * Update an existing VAT rate
   */
  update(id: string, rate: VatRate): Observable<void> {
    return this.http.put<void>(`${this.baseUrl}/${id}`, rate);
  }

  /**
   * Delete a VAT rate entry
   */
  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }

  /**
   * Load VAT rate for current user's country using REST API
   */
  private loadVatRate(): void {
    this.authService.getCurrentUser().subscribe(user => {
      const country = user?.country;
      if (country) {
        this.getAll().subscribe(rates => {
          const found = rates.find(rate => rate.country.toLowerCase() === country.toLowerCase());
          this.vatRate = found?.rate ?? 0;
          this.vatReady.next(true);
        });
      } else {
        this.vatReady.next(true); // Even if user not found, let components load
      }
    });
  }

  /**
   * Get the currently loaded VAT rate
   */
  getVatRate(): number {
    return this.vatRate;
  }

  /**
   * Observable to signal when VAT data is ready
   */
  isVatReady(): Observable<boolean> {
    return this.vatReady.asObservable();
  }
}
