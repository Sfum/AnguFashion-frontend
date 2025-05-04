import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import {environment} from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class StorageService {

  // Base URL of your backend API
  private apiUrl = `${environment.apiUrl}/storage`;

  // Inject HttpClient for making HTTP requests to the backend
  constructor(private http: HttpClient) {}

  getImageUrl(filePath: string): Observable<string> {
    // Define the URL and parameters for the backend API call
    const params = new HttpParams().set('filePath', filePath);

    // Make a GET request to the backend and return the response as an Observable
    return this.http.get<string>(`${this.apiUrl}/image-url`, { params });
  }
}
