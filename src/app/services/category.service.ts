import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, Observable, throwError } from 'rxjs';
import { Category } from '../models/category';
import { SnackbarService } from './snackbar.service';
import {environment} from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class CategoryService {

  private apiUrl = `${environment.apiUrl}/categories`;

  constructor(
    private http: HttpClient,
    public snackbarService: SnackbarService,
  ) {}

  // Fetch all categories from the backend
  getCategories(): Observable<Category[]> {
    return this.http.get<Category[]>(this.apiUrl).pipe(
      catchError((error) => {
        console.error('Error fetching categories: ', error);
        return throwError('Error fetching categories.');
      }),
    );
  }

  // Fetch a single category by its ID
  getCategory(id: string): Observable<Category | undefined> {
    return this.http.get<Category>(`${this.apiUrl}/${id}`).pipe(
      catchError((error) => {
        console.error('Error fetching category: ', error);
        return throwError('Error fetching category.');
      }),
    );
  }

  // Add a new category by sending it to the backend
  addCategory(category: Category): Promise<void> {
    return this.http.post<void>(this.apiUrl, category).toPromise().then(
      () => {
        this.snackbarService.showSnackbar('Category added successfully!');
      },
      (error) => {
        console.error('Error adding category: ', error);
        throw new Error('Error adding category.');
      },
    );
  }

  // Update an existing category by sending the updated data to the backend
  updateCategory(categoryId: string, category: Category): Promise<void> {
    return this.http.put<void>(`${this.apiUrl}/${categoryId}`, category).toPromise().then(
      () => {
        this.snackbarService.showSnackbar('Category updated successfully!');
      },
      (error) => {
        console.error('Error updating category: ', error);
        throw new Error('Error updating category.');
      },
    );
  }

  // Delete a category by its ID
  deleteCategory(id: string): Promise<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`).toPromise().then(
      () => {
        this.snackbarService.showSnackbar('Category deleted successfully.');
      },
      (error) => {
        console.error('Error deleting category: ', error);
        throw new Error('Error deleting category.');
      },
    );
  }
}
