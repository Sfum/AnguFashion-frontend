import { Component, OnInit } from '@angular/core';
import { Format } from '../../models/format';
import { Observable } from 'rxjs';
import { AuthService } from '../../services/auth.service';
import firebase from 'firebase/compat';

@Component({
  selector: 'app-logo-bar',
  templateUrl: './logo-bar.component.html',
  styleUrl: './logo-bar.component.sass',
})
export class LogoBarComponent implements OnInit {
  formats: Format[] = [];

  user$: Observable<firebase.User> | undefined;
  // @ts-ignore
  isModerator: Observable<boolean> = false;
  // @ts-ignore
  isAdmin: Observable<boolean> = false;

  constructor(
    private authService: AuthService) {}

  ngOnInit(): void {
    // @ts-ignore
    this.user$ = this.authService.user$;
    this.isModerator = this.authService.isModerator();
    this.isAdmin = this.authService.isAdmin();

  }
}
