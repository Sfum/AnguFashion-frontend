import { Component, OnInit } from '@angular/core';
import { VatRate } from '../models/vat-rates';
import { VatService } from '../services/vat-service.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-vat-rate',
  templateUrl: './vat-rate.component.html',
  styleUrls: ['./vat-rate.component.sass'],
})
export class VatRateComponent implements OnInit {
  vatRates: VatRate[] = [];
  vatForm!: FormGroup;
  editingId: string | null = null;
  countries: string[] = [];  // Array to hold countries

  constructor(
    private service: VatService,
    private fb: FormBuilder,
    private http: HttpClient
  ) {}

  ngOnInit(): void {
    this.vatForm = this.fb.group({
      country: ['', Validators.required],
      rate: [0, [Validators.required, Validators.min(0)]],
    });

    this.loadRates();
    this.loadCountries();  // Load countries for the dropdown
  }

  loadCountries(): void {
    // Load countries from a local JSON file (or API if needed)
    this.http.get<string[]>('/assets/countries.json').subscribe({
      next: (data) => this.countries = data,
      error: (err) => console.error('Failed to load countries:', err),
    });
  }

  loadRates(): void {
    this.service.getAll().subscribe((rates) => {
      this.vatRates = rates;
    });
  }

  submit(): void {
    if (this.vatForm.invalid) return;

    const formValue = this.vatForm.value;

    if (this.editingId) {
      this.service.update(this.editingId, formValue).subscribe(() => {
        this.editingId = null;
        this.vatForm.reset();
        this.loadRates();
      });
    } else {
      this.service.create(formValue).subscribe(() => {
        this.vatForm.reset();
        this.loadRates();
      });
    }
  }

  edit(rate: VatRate): void {
    this.vatForm.setValue({
      country: rate.country,
      rate: rate.rate,
    });
    this.editingId = rate.id!;
  }

  delete(id: string): void {
    this.service.delete(id).subscribe(() => this.loadRates());
  }

  cancelEdit(): void {
    this.editingId = null;
    this.vatForm.reset();
  }
}
