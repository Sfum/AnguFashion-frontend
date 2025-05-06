import { Component, OnInit } from '@angular/core';
import { DeliveryRate } from '../models/delivery-rates';
import {  DeliveryRateService} from '../services/delivery-rate.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-delivery-rate',
  templateUrl: './delivery-rate.component.html',
  styleUrls: ['./delivery-rate.component.sass'],
})
export class DeliveryRateComponent implements OnInit {
  deliveryRates: DeliveryRate[] = [];
  deliveryForm!: FormGroup;
  editingId: string | null = null;

  constructor(
    private service: DeliveryRateService,
    private fb: FormBuilder
  ) {}

  ngOnInit(): void {
    this.deliveryForm = this.fb.group({
      country: ['', Validators.required],
      delivery_mode: ['', Validators.required],
      rate: [0, [Validators.required, Validators.min(0)]],
    });

    this.loadRates();
  }

  loadRates(): void {
    this.service.getAll().subscribe((rates) => (this.deliveryRates = rates));
  }

  submit(): void {
    if (this.deliveryForm.invalid) return;

    const formValue = this.deliveryForm.value;

    if (this.editingId) {
      this.service.update(this.editingId, formValue).subscribe(() => {
        this.editingId = null;
        this.deliveryForm.reset();
        this.loadRates();
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
    this.service.delete(id).subscribe(() => this.loadRates());
  }

  cancelEdit(): void {
    this.editingId = null;
    this.deliveryForm.reset();
  }
}
