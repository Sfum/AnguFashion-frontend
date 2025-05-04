import { Component } from '@angular/core';
import { Observable } from 'rxjs';
import { AuthService } from '../services/auth.service';
import firebase from 'firebase/compat/app';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.sass'],
})
export class HomeComponent {

  user$ = this.authService.user$;
  isAdmin: boolean | undefined;
  isModerator: boolean | undefined;

  constructor(private authService: AuthService) {}

  ngOnInit() {
    // Subscribe to the user$ observable from AuthService
    this.user$ = this.authService.user$;

    // Subscribe to isAdmin observable from AuthService and set isAdmin flag
    this.authService.isAdmin().subscribe((isAdmin) => {
      this.isAdmin = isAdmin;
    });

    // Subscribe to isModerator observable from AuthService and set isModerator flag
    this.authService.isModerator().subscribe((isModerator) => {
      this.isModerator = isModerator;
    });
  }
}
