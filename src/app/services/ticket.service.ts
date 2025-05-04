import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http'; // Import HttpClient for making HTTP requests
import {Observable} from 'rxjs';
import {Ticket} from '../models/ticket';
import {catchError, map} from 'rxjs/operators';
import {environment} from '../../environments/environment'; // Import the Ticket model

@Injectable({
  providedIn: 'root',
})
export class TicketService {

  private apiUrl = `${environment.apiUrl}/tickets`;

  constructor(private http: HttpClient) {
  }

  // Method to create a new ticket by sending a POST request to the backend
  createTicket(ticket: Ticket): Observable<void> {
    return this.http.post<void>(this.apiUrl, ticket);
  }

  // Method to fetch all tickets by sending a GET request to the backend
  getAllTickets(): Observable<Ticket[]> {
    return this.http.get<Ticket[]>(this.apiUrl);
  }

  // Update the status of a ticket and return the ping message
  updateTicketStatus(ticketId: string, status: 'open' | 'pending' | 'completed'): Observable<{
    message: string;
    updatedTicket: Ticket
  }> {
    const url = `${this.apiUrl}/${ticketId}`;
    return this.http.patch<{ message: string; updatedTicket: Ticket }>(url, {status}).pipe(
      map(response => response),
      catchError((error) => {
        console.error('Error updating ticket status:', error);
        throw error;
      }),
    );
  }
}
