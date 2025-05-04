// src/app/services/admin-vat.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Observable } from 'rxjs';
import { VatSummary } from '../models/vat-summary';

@Injectable({
  providedIn: 'root',
})
export class AdminVatService {
  private apiUrl = `${environment.apiUrl}/sales/vat-summary`;

  constructor(private http: HttpClient) {}

  getVatSummary(): Observable<VatSummary[]> {
    return this.http.get<VatSummary[]>(this.apiUrl);
  }
}
