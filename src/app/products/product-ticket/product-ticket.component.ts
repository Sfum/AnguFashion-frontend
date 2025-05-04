import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { TicketService } from '../../services/ticket.service';
import { AuthService } from '../../services/auth.service';
import { Ticket } from '../../models/ticket';
import { Observable } from 'rxjs';
import { User } from '../../models/user';
import { Timestamp } from 'firebase/firestore';
import { SnackbarService } from '../../services/snackbar.service';

@Component({
  selector: 'app-product-ticket',
  templateUrl: './product-ticket.component.html',
  styleUrls: ['./product-ticket.component.sass'],
})
export class ProductTicketComponent {
  // Input property to receive product ID from parent component
  @Input() productId!: string;

  // Form group for the ticket form
  ticketForm: FormGroup;

  // Observable for current user information
  currentUser$: Observable<User | null>;

  constructor(
    private fb: FormBuilder,              // FormBuilder for creating reactive forms
    private ticketService: TicketService, // Service for managing tickets
    private authService: AuthService,     // Service for authentication
    private snackbarService: SnackbarService, // Service for showing snackbars/toasts
  ) {
    // Initialize the form group with subject and message fields, both required
    this.ticketForm = this.fb.group({
      subject: ['', Validators.required],
      message: ['', Validators.required],
    });

    // Set up observable for current user; ignore TypeScript errors for user$
    // @ts-ignore
    this.currentUser$ = this.authService.user$;
  }
  submitTicket() {
    // Check if the form is valid before proceeding
    if (this.ticketForm.valid && this.productId) { // Ensure productId is defined
      // Subscribe to the currentUser$ observable to get the current user
      this.currentUser$.subscribe((currentUser) => {
        if (currentUser) {
          // Use a fallback for the email if it's null or undefined
          const email = currentUser.email || 'no-email-provided@example.com'; // Default fallback email

          // Create a ticket object with user and form details
          const ticket: Ticket = {
            userId: currentUser.uid,           // User ID from authentication
            email: email.toString(),                    // User email or fallback value
            productId: this.productId,         // Product ID received from parent component
            subject: this.ticketForm.get('subject')?.value, // Subject from form
            message: this.ticketForm.get('message')?.value, // Message from form
            status: 'open',                   // Set the status to 'open' for a new ticket
            created_at: Timestamp.now(),      // Current timestamp for ticket creation
            updated_at: Timestamp.now(),      // Current timestamp for last update
          };

          // Call the ticket service to create the ticket
          this.ticketService.createTicket(ticket).subscribe(
            () => {
              // Reset the form on successful ticket creation
              this.ticketForm.reset();
              // Show a success message
              this.snackbarService.showSnackbar(
                'Ticket created successfully! We will be in touch shortly!',
              );
            },
            (error) => {
              // Log any errors and show an error message
              console.error('Error creating ticket: ', error);
              this.snackbarService.showSnackbar('Error creating ticket!');
            },
          );
        } else {
          // Handle case where no user is logged in (optional)
          console.error('No user is currently logged in');
          // Optionally show an error message to the user
        }
      });
    } else {
      console.error('Form is invalid or productId is missing');
    }
  }


}
