import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, Observable, throwError } from 'rxjs';
import { Brand } from '../models/brand';
import { SnackbarService } from './snackbar.service';
import {environment} from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class BrandService {
  
  private apiUrl = `${environment.apiUrl}/brands`; // Use apiUrl from environment

  constructor(
    private http: HttpClient,
    public snackbarService: SnackbarService,
  ) {}

  // Fetch all brands from the backend
  getBrands(): Observable<Brand[]> {
    return this.http.get<Brand[]>(this.apiUrl).pipe(
      catchError((error) => {
        console.error('Error fetching brands: ', error);
        return throwError('Error fetching brands.');
      }),
    );
  }

  // Fetch a single brand by its ID
  getBrand(id: string): Observable<Brand | undefined> {
    return this.http.get<Brand>(`${this.apiUrl}/${id}`).pipe(
      catchError((error) => {
        console.error('Error fetching brand: ', error);
        return throwError('Error fetching brand.');
      }),
    );
  }

  // Add a new brand by sending it to the backend
  addBrand(brand: Brand): Promise<void> {
    return this.http.post<void>(this.apiUrl, brand).toPromise().then(
      () => {
        this.snackbarService.showSnackbar('Brand added successfully!');
      },
      (error) => {
        console.error('Error adding brand: ', error);
        throw new Error('Error adding brand.');
      },
    );
  }

  // Update an existing brand by sending the updated data to the backend
  updateBrand(brandId: string, brand: Brand): Promise<void> {
    return this.http.put<void>(`${this.apiUrl}/${brandId}`, brand).toPromise().then(
      () => {
        this.snackbarService.showSnackbar('Brand updated successfully!');
      },
      (error) => {
        console.error('Error updating brand: ', error);
        throw new Error('Error updating brand.');
      },
    );
  }

  // Delete a brand by its ID
  deleteBrand(id: string): Promise<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`).toPromise().then(
      () => {
        this.snackbarService.showSnackbar('Brand deleted successfully.');
      },
      (error) => {
        console.error('Error deleting brand: ', error);
        throw new Error('Error deleting brand.');
      },
    );
  }
}
