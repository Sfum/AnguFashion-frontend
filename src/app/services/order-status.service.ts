import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { SalesService } from './sales.service';
import { SnackbarService } from './snackbar.service';
import { NotificationService } from './notification.service';
import { Sale, SaleStatus } from '../models/sale';

@Injectable({
  providedIn: 'root',
})
export class OrderStatusService {
  private loading = false;

  constructor(
      private salesService: SalesService,
      private snackbarService: SnackbarService,
      private notificationService: NotificationService
  ) {}

  //Updates the status of a buyer's order.
  updateOrderStatus(
      sales: Sale[],
      userId: string,
      saleId: string,
      newStatus: SaleStatus
  ): Observable<void> {
    return new Observable((observer) => {
      if (this.loading) {
        this.snackbarService.showSnackbar('Please wait, status is being updated.');
        observer.complete();
        return;
      }

      const sale = sales.find((s) => s.id === saleId);

      if (!sale) {
        this.snackbarService.showSnackbar('Sale not found!');
        observer.complete();
        return;
      }

      if (sale.status === newStatus) {
        this.snackbarService.showSnackbar('Status already set!');
        observer.complete();
        return;
      }

      this.loading = true;

      this.salesService.updateSaleStatus(userId, saleId, newStatus).subscribe(
          () => {
            sale.status = newStatus; // Update status locally
            this.snackbarService.showSnackbar('Order status updated successfully!');
            observer.next();
          },
          (error) => {
            console.error('Failed to update order status:', error);
            this.snackbarService.showSnackbar('Failed to update order status.');
            observer.error(error);
          },
          () => {
            this.loading = false;
            observer.complete();
          }
      );
    });
  }

  //Handles order completion by notifying the buyer.
  handleOrderCompletion(sale: Sale): void {
    if (sale.status === SaleStatus.COMPLETED) {
      const subject = `Order Update: ${sale.product_name}`;
      const message = `
        Hello ${sale.buyerName || 'Valued Customer'},

        Thank you for your purchase of ${sale.product_name}. We’re reaching out to update you on your order status.

        Order Status: ${sale.status || 'Unknown'}

        Please feel free to reach out if you have any questions or need further assistance.

        Kind regards,
        Support Team
      `;

      // Delegate to NotificationService to send the email
      this.notificationService.sendEmailNotification(sale.buyerEmail, subject, message);
    } else {
      this.snackbarService.showSnackbar('Order is not dispatched yet!');
    }
  }
}
