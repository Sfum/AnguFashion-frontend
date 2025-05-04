import { Component, OnInit, AfterViewInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { MatSort } from '@angular/material/sort';
import { Observable } from 'rxjs';
import { TicketService } from '../../services/ticket.service';
import { AuthService } from '../../services/auth.service';
import {Ticket} from '../../models/ticket';

@Component({
  selector: 'app-product-ticket-panel',
  templateUrl: './product-ticket-panel.component.html',
  styleUrls: ['./product-ticket-panel.component.sass'],
})
export class ProductTicketPanelComponent implements OnInit, AfterViewInit {
  // Data Sources
  ticketDataSource = new MatTableDataSource<any>();
  userDataSource = new MatTableDataSource<any>();

  // Columns
  ticketColumns: string[] = ['productId', 'subject', 'message', 'status', 'actions'];
  userColumns: string[] = ['uid', 'email', 'displayName', 'role'];

  // Search values
  searchTicketValue = '';
  searchUserValue = '';

  // Paginator and Sort
  @ViewChild('ticketPaginator') ticketPaginator!: MatPaginator;
  @ViewChild('userPaginator') userPaginator!: MatPaginator;
  @ViewChild('ticketSort') ticketSort!: MatSort;
  @ViewChild('userSort') userSort!: MatSort;

  constructor(private ticketService: TicketService, private authService: AuthService) {}

  ngOnInit(): void {
    // Fetch tickets and populate ticketDataSource
    this.ticketService.getAllTickets().subscribe((tickets) => {
      this.ticketDataSource.data = tickets;
    });

    // Fetch users and populate userDataSource
    this.authService.getAllUsers().subscribe((users) => {
      this.userDataSource.data = users;
    });
  }

  ngAfterViewInit(): void {
    // Assign paginator and sorting to ticketDataSource
    this.ticketDataSource.paginator = this.ticketPaginator;
    this.ticketDataSource.sort = this.ticketSort;

    // Assign paginator and sorting to userDataSource
    this.userDataSource.paginator = this.userPaginator;
    this.userDataSource.sort = this.userSort;
  }

  // Filter tickets
  applyTicketFilter(): void {
    this.ticketDataSource.filter = this.searchTicketValue.trim().toLowerCase();
    if (this.ticketDataSource.paginator) {
      this.ticketDataSource.paginator.firstPage();
    }
  }

  // Filter users
  applyUserFilter(): void {
    this.userDataSource.filter = this.searchUserValue.trim().toLowerCase();
    if (this.userDataSource.paginator) {
      this.userDataSource.paginator.firstPage();
    }
  }

  // Update ticket status
  updateTicketStatus(ticketId: string, status: 'open' | 'pending' | 'completed', ticket?: Ticket): void {
    if (!ticketId) {
      console.error('Ticket ID is undefined');
      return;
    }

    this.ticketService.updateTicketStatus(ticketId, status).subscribe(
      (response) => {
        const updatedTicket = response.updatedTicket;
        this.updateTicketInTable(updatedTicket); // Use the defined method

        if (status === 'pending' && ticket) {
          this.openGmailCompose(
            ticket.email,
            ticket.productId,
            ticket.id,
            ticket.subject,
            ticket.message
          );
        }
      },
      (error) => console.error('Error updating ticket status:', error)
    );
  }


  openGmailCompose(
    email: string | undefined,
    productId: string | undefined,
    ticketId: string | undefined,
    subject: string | undefined,
    message: string | undefined
  ): void {
    if (!email || !ticketId) {
      console.error('Email or Ticket ID is undefined');
      return;
    }

    const mailToUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(email)}&su=${encodeURIComponent(
      `[Ticket #${ticketId}] ${subject || ''}`
    )}&body=${encodeURIComponent(
      `Hello,\n\nTicket ID: ${ticketId}\nProduct ID: ${productId || 'N/A'}\n\nMessage:\n${message || ''}`
    )}`;
    window.open(mailToUrl, '_blank');
  }

  updateTicketInTable(updatedTicket: Ticket): void {
    // Find the index of the ticket in the current data source
    const index = this.ticketDataSource.data.findIndex((ticket) => ticket.id === updatedTicket.id);

    // If the ticket exists, update it
    if (index !== -1) {
      this.ticketDataSource.data[index] = updatedTicket;
      this.ticketDataSource._updateChangeSubscription(); // Refresh the data source
    } else {
      console.warn(`Ticket with ID ${updatedTicket.id} not found in the table.`);
    }
  }


}
