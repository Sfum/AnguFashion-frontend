import { Component, OnInit } from '@angular/core';
import { DeliveryRate } from '../models/delivery-rates';
import { DeliveryRateService } from '../services/delivery-rate.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { SnackbarService } from '../services/snackbar.service';  // SnackbarService import

@Component({
  selector: 'app-delivery-rate',
  templateUrl: './delivery-rate.component.html',
  styleUrls: ['./delivery-rate.component.sass'],
})
export class DeliveryRateComponent implements OnInit {
  deliveryRates: DeliveryRate[] = [];
  deliveryForm!: FormGroup;
  editingId: string | null = null;
  countries: string[] = []; // Array to hold countries

  constructor(
    private service: DeliveryRateService,
    private fb: FormBuilder,
    private http: HttpClient,
    private snackBarService: SnackbarService  // Inject SnackbarService
  ) {}

  ngOnInit(): void {
    this.deliveryForm = this.fb.group({
      country: ['', Validators.required],
      delivery_mode: ['', Validators.required],
      rate: [0, [Validators.required, Validators.min(0)]],
    });

    this.loadRates();
    this.loadCountries(); // Load countries for the dropdown
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
      this.deliveryRates = rates;
    });
  }

  submit(): void {
    if (this.deliveryForm.invalid) return;

    const formValue = this.deliveryForm.value;

    // Check if the country already exists, but only if we're not editing (i.e., creating a new entry)
    if (!this.editingId) {
      const isDuplicate = this.deliveryRates.some(rate => rate.country.toLowerCase() === formValue.country.toLowerCase());
      if (isDuplicate) {
        this.snackBarService.showSnackbar('This country already exists.');
        return;
      }
    }

    if (this.editingId) {
      // Ask for confirmation before updating
      this.snackBarService.showActionSnackbar('Are you sure you want to update this entry?', 'Yes', 'No')
        .afterDismissed().subscribe(result => {
        if (result.dismissedByAction) {
          this.service.update(this.editingId, formValue).subscribe(() => {
            this.editingId = null;
            this.deliveryForm.reset();
            this.loadRates();
          });
        }
      });
    } else {
      this.service.create(formValue).subscribe(() => {
        this.deliveryForm.reset();
        this.loadRates();
      });
    }
  }

  edit(rate: DeliveryRate): void {
    this.deliveryForm.setValue({
      country: rate.country,
      delivery_mode: rate.delivery_mode,
      rate: rate.rate,
    });
    this.editingId = rate.id!;
  }

  delete(id: string): void {
    // Ask for confirmation before deleting
    this.snackBarService.showActionSnackbar('Are you sure you want to delete this entry?', 'Yes', 'No')
      .afterDismissed().subscribe(result => {
      if (result.dismissedByAction) {
        this.service.delete(id).subscribe(() => {
          this.loadRates();
        });
      }
    });
  }

  cancelEdit(): void {
    this.editingId = null;
    this.deliveryForm.reset();
  }
}
