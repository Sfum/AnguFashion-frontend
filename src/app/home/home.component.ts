import { Component, OnInit } from '@angular/core';
import { Observable, combineLatest } from 'rxjs';
import { take } from 'rxjs/operators';
import { AuthService } from '../services/auth.service';
import firebase from 'firebase/compat/app';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.sass'],
})
export class HomeComponent implements OnInit {
  user$!: Observable<firebase.User | null>; // Observable for user data
  isAdmin: boolean | undefined; // Flag to check if the user is an admin
  isModerator: boolean | undefined; // Flag to check if the user is a moderator
  isLoading = true; // Flag to show the spinner while content is loading

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    this.user$ = this.authService.user$; // Subscribe to user data

    // Use combineLatest to wait for both observables (admin and moderator) before updating flags
    combineLatest([
      this.authService.isAdmin(),
      this.authService.isModerator(),
    ])
      .pipe(take(1)) // Ensures completion after the first emit
      .subscribe(([admin, moderator]) => {
        this.isAdmin = admin; // Set admin status
        this.isModerator = moderator; // Set moderator status
        this.isLoading = false; // Set isLoading to false after data is fetched
      });
  }
}
