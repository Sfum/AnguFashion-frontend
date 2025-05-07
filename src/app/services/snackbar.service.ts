import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';

@Injectable({
  providedIn: 'root',
})
export class SnackbarService {
  constructor(private snackBar: MatSnackBar) {}

  // Function to launch the Snack Bar
  showSnackbar(message: string): void {
    this.snackBar.open(message, 'Okay!', {
      duration: 3000,
      horizontalPosition: 'end',
      verticalPosition: 'bottom',
      panelClass: ['custom-snackbar'], // Custom class for styling
    });
  }

  // Action snackbar (with Yes/No)
  showActionSnackbar(message: string, actionText: string, cancelText: string): any {
    return this.snackBar.open(message, actionText, {
      duration: 5000, // Keep the snackbar open for 5 seconds for user action
      horizontalPosition: 'center',
      verticalPosition: 'bottom',
    });
  }
}
