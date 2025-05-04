import { Component } from '@angular/core';
import {AuthService} from '../../services/auth.service';
import firebase from 'firebase/compat';
import User = firebase.User;

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.sass',
})
export class ProfileComponent {
  user: User | null = null;

  constructor(private authService: AuthService) {
    this.authService.user$.subscribe(user => this.user = user);
  }

  logout() {
    this.authService.signOut();
  }

}
