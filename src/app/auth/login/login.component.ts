import {Component} from '@angular/core';
import {Router} from '@angular/router';
import {AuthService} from '../../services/auth.service';
import {SnackbarService} from '../../services/snackbar.service';
import {NgForm} from '@angular/forms';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrl: './login.component.sass',
})
export class LoginComponent {
  email: string = '';
  password: string = '';

  constructor(
    private authService: AuthService,
    public router: Router,
    private snackbarService: SnackbarService,
  ) {}

  onSubmit(loginForm: NgForm) {
    if (loginForm.valid) {
      this.authService.signIn(this.email, this.password)
        .then(() => {
          // Successful login, redirect the user
          console.log('User logged in successfully');
          this.router.navigate(['/']);
        })
        .catch((error) => {
          // Failed login, show error message
          console.error('Error logging in:', error.message);
          this.snackbarService.showSnackbar('Login failed. Please check your credentials and try again.');
        });
    } else {
      // Form is invalid, mark all fields as touched
      console.log('Form is invalid. Please fill in all required fields.');
      loginForm.form.markAllAsTouched();
    }
  }
}
