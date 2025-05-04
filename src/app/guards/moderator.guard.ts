import { Injectable } from '@angular/core';
import {
  CanActivate,
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
  Router,
} from '@angular/router';
import { Observable } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { AuthService } from '../services/auth.service';
import { SnackbarService } from '../services/snackbar.service';

@Injectable({
  providedIn: 'root',
})
export class ModeratorGuard implements CanActivate {
  // Constructor to inject necessary services for authorization checks, routing, and notifications.
  constructor(
    private authService: AuthService,          // Service to check if the user has moderator privileges.
    private router: Router,                    // Router to navigate to other routes if access is denied.
    private snackbarService: SnackbarService,  // Service for displaying notifications.
  ) {}

  // Determines if a route can be activated based on whether the user has moderator privileges.
  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot,
  ): Observable<boolean> | Promise<boolean> | boolean {
    // Check if the user is a moderator using the AuthService.
    return this.authService.isModerator().pipe(
      map((isModerator) => isModerator),  // Map the result to a boolean indicating moderator status.
      tap((isModerator) => {
        if (!isModerator) {
          // If the user is not a moderator, show an error message and redirect to a different page.
          this.snackbarService.showSnackbar(
            'No privileges to access this route',
          );
          this.router.navigate(['/manage-products']);  // Redirect to the manage products page.
        }
      }),
    );
  }
}
