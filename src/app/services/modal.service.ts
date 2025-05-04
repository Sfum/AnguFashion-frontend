import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { InvoiceComponent } from '../invoice/invoice.component';
import { Sale } from '../models/sale';

@Injectable({
  providedIn: 'root',
})
export class ModalService {

  constructor(private dialog: MatDialog) {}

  // Open the invoice dialog with the sale data
  openInvoiceDialog(sale: Sale): void {
    this.dialog.open(InvoiceComponent, {
      data: { sale },
      width: '99%',
      height: '70%',
    });
  }
}
