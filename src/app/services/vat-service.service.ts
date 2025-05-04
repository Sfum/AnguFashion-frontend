import { Injectable } from '@angular/core';
import {getVatRateByCountry} from '../models/vat-rates';
import {BehaviorSubject, Observable} from 'rxjs';
import {AuthService} from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class VatService {
  private vatRate: number = 0;
  private vatReady = new BehaviorSubject<boolean>(false);

  constructor(private authService: AuthService) {
    this.loadVatRate();
  }

  private loadVatRate(): void {
    this.authService.getCurrentUser().subscribe(user => {
      if (user?.country) {
        this.vatRate = getVatRateByCountry(user.country) ?? 0;
      }
      this.vatReady.next(true);
    });
  }

  getVatRate(): number {
    return this.vatRate;
  }

  isVatReady(): Observable<boolean> {
    return this.vatReady.asObservable();
  }
}
