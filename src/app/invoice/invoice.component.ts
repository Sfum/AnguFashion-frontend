import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Sale } from '../models/sale';
import { User } from '../models/user';
import { SalesService } from '../services/sales.service';
import { DateService } from '../services/date.service';
import { AuthService } from '../services/auth.service';
import { VatService } from '../services/vat-service.service';
import { VatRate } from '../models/vat-rates';

@Component({
  selector: 'app-invoice',
  templateUrl: './invoice.component.html',
  styleUrls: ['./invoice.component.sass'],
})
export class InvoiceComponent implements OnInit {
  sales: Sale[] = [];
  buyer: User | undefined;
  seller: User | undefined;
  admin: User | undefined;
  invoiceDate: Date | undefined;
  vatRate: number = 0;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: { sale: Sale },
    private salesService: SalesService,
    private authService: AuthService,
    public dateService: DateService,
    private vatService: VatService
  ) {}

  ngOnInit(): void {
    this.authService.getAllUsers().subscribe({
      next: (users) => {
        this.admin = users.find(u => u.user_email === 'admin@angufashion.com');
      },
      error: (err) => console.error('Error loading admin user:', err)
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

              // 🔄 Dynamically fetch VAT rate via API
              if (this.buyer?.country) {
                this.fetchVatRate(this.buyer.country);
              }
            },
            error: (error) => {
              console.error('Error fetching buyer/seller:', error);
            }
          });
        },
        error: (error) => {
          console.error('Error fetching sales by user:', error);
        }
      });
    } else {
      console.error('Missing base sale, userId, or saleDate for invoice.');
    }
  }

  /**
   * Fetch the VAT rate dynamically from the backend by country
   */
  fetchVatRate(country: string): void {
    this.vatService.getAll().subscribe({
      next: (rates: VatRate[]) => {
        const match = rates.find(rate => rate.country.toLowerCase() === country.toLowerCase());
        this.vatRate = match?.rate || 0;
      },
      error: (err) => {
        console.error('Failed to fetch VAT rates:', err);
        this.vatRate = 0;
      }
    });
  }

  formatDate(date: any): string {
    return this.dateService.formatDate(date);
  }

  getSubtotal(): number {
    return this.sales.reduce((acc, sale) => acc + (sale.totalPrice || 0), 0);
  }

  getDeliveryFee(): number {
    const deliveryItem = this.sales.find(s => s.deliveryRate && s.deliveryRate > 0);
    return deliveryItem ? deliveryItem.deliveryRate : 0;
  }

  getAdjustedTotal(sale: Sale): number {
    const price = sale.totalPrice || 0;
    const delivery = sale.deliveryRate || 0;
    return +(price - delivery).toFixed(2);
  }

  getSubtotalAdjusted(): number {
    return this.sales.reduce((acc, sale) => acc + this.getAdjustedTotal(sale), 0);
  }

  printInvoice(): void {
    window.print();
  }
}
