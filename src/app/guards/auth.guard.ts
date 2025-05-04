import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { map, take } from 'rxjs/operators';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root'  // Provides the guard at the root level of the application.
})
export class AuthGuard implements CanActivate {

  // Constructor to inject the AuthService and Router services.
  constructor(private authService: AuthService, private router: Router) {}

  // Determines if a route can be activated based on the user's authentication status.
  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot,
  ): Observable<boolean> {
    return this.authService.user$.pipe(
      take(1),  // Take only the first emitted value from the observable and then complete.
      map(user => {
        if (user) {
          // If a user is authenticated, allow activation of the route.
          return true;
        } else {
          // If no user is authenticated, redirect to the login page and deny route activation.
          this.router.navigate(['/login']);
          return false;
        }
      }),
    );
  }
}
