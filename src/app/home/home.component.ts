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
  user$!: Observable<firebase.User | null>;
  isAdmin: boolean | undefined;
  isModerator: boolean | undefined;
  isLoading = true;

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    this.user$ = this.authService.user$;

    // Use combineLatest to wait for both observables, then complete after first emit
    combineLatest([
      this.authService.isAdmin(),
      this.authService.isModerator()
    ])
      .pipe(take(1)) // ensures completion like forkJoin
      .subscribe(([admin, moderator]) => {
        this.isAdmin = admin;
        this.isModerator = moderator;
        this.isLoading = false;
      });
  }
}
