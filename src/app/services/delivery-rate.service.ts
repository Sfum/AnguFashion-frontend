
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { DeliveryRate } from '../models/delivery-rates';
import {environment} from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class DeliveryRateService {

  // Base API endpoint for delivery rates
  private baseUrl = `${environment.apiUrl}/delivery-rates`

  constructor(private http: HttpClient) {}

  /**
   * Fetch all delivery rates
   */
  getAll(): Observable<DeliveryRate[]> {
    return this.http.get<DeliveryRate[]>(this.baseUrl);
  }

  /**
   * Fetch a single delivery rate by ID
   * @param id Firestore document ID
   */
  getById(id: string): Observable<DeliveryRate> {
    return this.http.get<DeliveryRate>(`${this.baseUrl}/${id}`);
  }

  /**
   * Create a new delivery rate entry
   * @param rate DeliveryRate object to create
   */
  create(rate: DeliveryRate): Observable<{ id: string }> {
    return this.http.post<{ id: string }>(this.baseUrl, rate);
  }

  /**
   * Update an existing delivery rate
   * @param id Firestore document ID
   * @param rate Updated delivery rate data
   */
  update(id: string, rate: DeliveryRate): Observable<void> {
    return this.http.put<void>(`${this.baseUrl}/${id}`, rate);
  }

  /**
   * Delete a delivery rate by ID
   * @param id Firestore document ID
   */
  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
