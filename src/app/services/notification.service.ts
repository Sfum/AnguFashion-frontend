import { Injectable } from '@angular/core';
import { SnackbarService } from './snackbar.service';

@Injectable({
  providedIn: 'root',
})
export class NotificationService {
  constructor(private snackbarService: SnackbarService) {}

  // Send Gmail email notification
  sendEmailNotification(email: string, subject: string, message: string): void {
    if (!email) {
      console.error('Email address is undefined');
      this.snackbarService.showSnackbar('Email address is not available.');
      return;
    }

    const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(
        email
    )}&su=${encodeURIComponent(subject)}&body=${encodeURIComponent(message)}`;

    window.open(gmailUrl, '_blank'); // Open Gmail in a new tab
    this.snackbarService.showSnackbar('Email notification opened in Gmail.');
  }
}
