import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Sale } from '../models/sale';
import { User } from '../models/user';
import { SalesService } from '../services/sales.service';
import { DateService } from '../services/date.service';
import { vatRatesByContinent, VatRate } from '../models/vat-rates';
import {AuthService} from '../services/auth.service';

@Component({
  selector: 'app-invoice',
  templateUrl: './invoice.component.html',
  styleUrls: ['./invoice.component.sass'],
})
export class InvoiceComponent implements OnInit {
  sales: Sale[] = [];
  buyer: User | undefined;
  seller: User | undefined;
  invoiceDate: Date | undefined;
  vatRate: number = 0;
  admin: User | undefined;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: { sale: Sale },
    private salesService: SalesService,
    public dateService: DateService,
    private authService: AuthService,
  ) {}

  ngOnInit(): void {

    this.authService.getAllUsers().subscribe({
      next: (users) => {
        this.admin = users.find(u => u.user_email === 'admin@angufashion.com');
      },
      error: (err) => {
        console.error('Error loading admin user:', err);
      }
    });
    const baseSale = this.data?.sale;

    if (baseSale && baseSale.userId && baseSale.saleDate) {
      this.invoiceDate = this.dateService.convertToDate(baseSale.saleDate);
      const baseTimestamp = this.invoiceDate.getTime();

      this.salesService.getDownloadsByUser(baseSale.userId).subscribe({
        next: (allSales) => {
          const matchingSales = allSales.filter((sale) => {
            const saleTimestamp = this.dateService.convertToDate(sale.saleDate).getTime();
            return saleTimestamp === baseTimestamp;
          });

          this.sales = matchingSales;

          this.salesService.getSaleWithBuyer(baseSale.userId, baseSale.id).subscribe({
            next: ({ buyer, seller }) => {
              this.buyer = buyer;
              this.seller = seller;

              // Determine VAT rate based on buyer country
              if (this.buyer && this.buyer.country) {
                this.vatRate = this.getVatRateByCountry(this.buyer.country);
              }
            },
            error: (error) => {
              console.error('Error fetching buyer/seller:', error);
            },
          });
        },
        error: (error) => {
          console.error('Error fetching sales by user:', error);
        },
      });
    } else {
      console.error('Missing base sale, userId, or saleDate for invoice.');
    }
  }

  // Returns formatted date
  formatDate(date: any): string {
    return this.dateService.formatDate(date);
  }

  // Calculates subtotal of sales
  getSubtotal(): number {
    return this.sales.reduce((acc, sale) => acc + (sale.totalPrice || 0), 0);
  }

  // Finds VAT rate for the buyer's country
  getVatRateByCountry(country: string): number {
    for (const region in vatRatesByContinent) {
      const vatList: VatRate[] = vatRatesByContinent[region];
      const found = vatList.find(rate => rate.country.toLowerCase() === country.toLowerCase());
      if (found) return found.rate;
    }
    return 0;
  }

  getAdjustedTotal(sale: Sale): number {
    const price = sale.totalPrice || 0;
    const delivery = sale.deliveryRate || 0;
    return +(price - delivery).toFixed(2);
  }

  getDeliveryFee(): number {
    const deliveryItem = this.sales.find(s => s.deliveryRate && s.deliveryRate > 0);
    return deliveryItem ? deliveryItem.deliveryRate : 0;
  }

  getSubtotalAdjusted(): number {
    return this.sales.reduce((acc, sale) => acc + this.getAdjustedTotal(sale), 0);
  }


  // Triggers invoice print
  printInvoice(): void {
    window.print();
  }
}
