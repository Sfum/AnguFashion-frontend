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
export class AdminGuard implements CanActivate {
  // Constructor to inject services required for authentication checks, routing, and notifications.
  constructor(
    private authService: AuthService,               // Service to handle authentication and authorization.
    private router: Router,                         // Router for navigation upon unauthorized access.
    private snackbarService: SnackbarService,       // Service for displaying notifications.
  ) {}

  // Method to determine if a route can be activated based on admin privileges.
  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot,
  ): Observable<boolean> | Promise<boolean> | boolean {
    // Check if the user is an admin using the AuthService.
    return this.authService.isAdmin().pipe(
      map((isAdmin) => isAdmin),  // Map the result to a boolean indicating admin status.
      tap((isAdmin) => {
        if (!isAdmin) {
          // If not an admin, show a snackbar message and redirect to the home page.
          this.snackbarService.showSnackbar(
            'No privileges to access this route',
          );
          this.router.navigate(['/']);
        }
      }),
    );
  }
}
