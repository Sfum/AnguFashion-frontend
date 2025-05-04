import { Component, OnInit } from '@angular/core';
import { AdminVatService } from '../services/admin-vat.service';
import { VatSummary } from '../models/vat-summary';
import { FormControl } from '@angular/forms';
import { debounceTime } from 'rxjs/operators';

@Component({
  selector: 'app-vat-summary',
  templateUrl: './vat-summary.component.html',
  styleUrls: ['./vat-summary.component.sass'],
})
export class VatSummaryComponent implements OnInit {
  vatSummaries: VatSummary[] = [];
  filteredVatSummaries: VatSummary[] = [];
  loading = true;
  error: string | null = null;

  // Columns to display in the table
  displayedColumns: string[] = ['country', 'totalVatAmount', 'totalGrossSales', 'numberOfSales'];

  // Filter form controls
  countryFilterControl = new FormControl('');
  fromDateControl = new FormControl<Date | null>(null);
  toDateControl = new FormControl<Date | null>(null);

  constructor(private vatService: AdminVatService) {}

  ngOnInit(): void {
    // Fetch VAT summary data from backend
    this.vatService.getVatSummary().subscribe({
      next: (data) => {
        this.vatSummaries = data;
        this.filteredVatSummaries = data;
        this.loading = false;
        this.setupFilters();
      },
      error: (err) => {
        this.error = 'Failed to load VAT summary.';
        console.error(err);
        this.loading = false;
      },
    });
  }

  /**
   * Set up filtering logic based on user inputs.
   */
  setupFilters(): void {
    // Recalculate filter on changes to country, from date, or to date
    this.countryFilterControl.valueChanges.pipe(debounceTime(200)).subscribe(() => this.applyFilters());
    this.fromDateControl.valueChanges.subscribe(() => this.applyFilters());
    this.toDateControl.valueChanges.subscribe(() => this.applyFilters());
  }

  /**
   * Apply all filters and update the filteredVatSummaries list.
   */
  applyFilters(): void {
    const countrySearch = (this.countryFilterControl.value || '').toLowerCase().trim();
    const from = this.fromDateControl.value;
    const to = this.toDateControl.value;

    this.filteredVatSummaries = this.vatSummaries.filter(summary => {
      const matchesCountry = summary.country.toLowerCase().includes(countrySearch);

      // Only filter by date if from/to values are set
      const createdDate = new Date(); // Ensure your VatSummary has a createdAt field

      const matchesFrom = from ? createdDate >= new Date(from) : true;
      const matchesTo = to ? createdDate <= new Date(to) : true;

      return matchesCountry && matchesFrom && matchesTo;
    });
  }
}
