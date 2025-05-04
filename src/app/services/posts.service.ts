import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { Post } from '../models/post';
import { SnackbarService } from './snackbar.service';
import { catchError, tap } from 'rxjs/operators';
import {environment} from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class PostsService {

  private apiUrl = `${environment.apiUrl}/posts`;

  constructor(
    private http: HttpClient,
    private snackbarService: SnackbarService,
  ) {}

  // Retrieves a list of posts from the backend API
  getPosts(): Observable<Post[]> {
    return this.http.get<Post[]>(this.apiUrl).pipe(
      catchError((error) => this.handleError(error))
    );
  }

  // Retrieves a single post by its ID from the backend API
  getPost(id: string): Observable<Post> {
    const url = `${this.apiUrl}/${id}`;
    return this.http.get<Post>(url).pipe(
      catchError((error) => this.handleError(error))
    );
  }

  // Adds a new post via the backend API
  addPost(post: Post): Observable<Post> {
    return this.http.post<Post>(this.apiUrl, post).pipe(
      tap(() => {
        this.snackbarService.showSnackbar('Post Added Successfully!');
      }),
      catchError((error) => this.handleError(error))
    );
  }

  // Updates an existing post via the backend API
  updatePost(postId: string, postData: Partial<Post>): Observable<void> {
    const url = `${this.apiUrl}/${postId}`;
    return this.http.put<void>(url, postData).pipe(
      tap(() => {
        this.snackbarService.showSnackbar('Post Updated Successfully!');
      }),
      catchError((error) => this.handleError(error))
    );
  }

  // Deletes a post via the backend API
  deletePost(id: string): Observable<void> {
    const url = `${this.apiUrl}/${id}`;
    return this.http.delete<void>(url).pipe(
      tap(() => {
        this.snackbarService.showSnackbar('Post deleted successfully.');
      }),
      catchError((error) => this.handleError(error))
    );
  }

  // Error handling method
  private handleError(error: HttpErrorResponse) {
    let errorMessage = 'An unknown error occurred!';
    if (error.error instanceof ErrorEvent) {
      // Client-side/network error
      errorMessage = `An error occurred: ${error.error.message}`;
    } else {
      // Backend error
      errorMessage = `Server returned code: ${error.status}, message: ${error.message}`;
    }
    // Display the error message
    this.snackbarService.showSnackbar(errorMessage);
    return throwError(errorMessage);
  }
}
