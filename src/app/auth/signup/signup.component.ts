import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import {HttpClient} from '@angular/common/http';

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.sass'],
})
export class SignupComponent implements OnInit {
  signupForm: FormGroup;
  countries: string[] = [];

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private snackBar: MatSnackBar,
    private http: HttpClient
  ) {
    this.signupForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
      displayName: ['', Validators.required],
      photoURL: [''],
      address: ['', Validators.required],
      postcode: ['', Validators.required],
      country: ['', Validators.required],
      isContentProvider: [false],
      brand_name: [''],
      brand_description: [''],
    });
  }

  ngOnInit(): void {
    // Watch changes to content provider checkbox
    this.http.get<string[]>('/assets/countries.json').subscribe({
      next: (data) => this.countries = data,
      error: (err) => console.error('Failed to load countries:', err),
    });

    this.signupForm.get('isContentProvider')?.valueChanges.subscribe(isContentProvider => {
      if (isContentProvider) {
        this.signupForm.get('brand_name')?.setValidators([Validators.required]);
        this.signupForm.get('brand_description')?.setValidators([Validators.required]);
      } else {
        this.signupForm.get('brand_name')?.clearValidators();
        this.signupForm.get('brand_description')?.clearValidators();
      }
      this.signupForm.get('brand_name')?.updateValueAndValidity();
      this.signupForm.get('brand_description')?.updateValueAndValidity();
    });
  }

  // Submit credentials
  onSubmit() {
    if (this.signupForm.valid) {
      const {
        email,
        password,
        displayName,
        photoURL,
        address,
        postcode,
        country,
        isContentProvider,
        brand_name,
        brand_description,
      } = this.signupForm.value;

      this.authService.signUp(
        email,
        password,
        displayName,
        photoURL,
        address,
        postcode,
        country,
        isContentProvider,
        brand_name,
        brand_description,
      )
        .then(() => {
          console.log('User signed up successfully');
          // Redirect or perform additional actions on successful signup
        })
        .catch((error) => {
          console.error('Error signing up:', error.message);
          this.snackBar.open('Sign-up failed. Please try again.', 'Close', {
            duration: 5000,
            verticalPosition: 'top',
            horizontalPosition: 'center',
            panelClass: ['error-snackbar'],
          });
        });
    } else {
      // Mark all fields as touched to display validation messages
      this.signupForm.markAllAsTouched();
    }
  }
}
