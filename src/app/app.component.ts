import { Component, OnInit } from '@angular/core';
import { combineLatest, Observable } from 'rxjs';
import firebase from 'firebase/compat';
import { AuthService } from './services/auth.service';
import { take } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.sass'],
})
export class AppComponent implements OnInit {
  title = 'AnguFashion';

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
        this.isLoading = false; // Set loading to false once data is ready
      });
  }
}
