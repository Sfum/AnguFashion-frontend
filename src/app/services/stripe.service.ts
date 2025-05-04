import { Injectable } from '@angular/core';
import { loadStripe, Stripe } from '@stripe/stripe-js';

@Injectable({
  providedIn: 'root',
})
export class StripeService {
  private stripe: Stripe | null = null;

  constructor() {
    this.initStripe();
  }

  private async initStripe() {
    this.stripe = await loadStripe('your-publishable-key-here');
  }

  async createPaymentIntent(amount: number, currency: string) {
    // This should be done on the server-side for security reasons
    const response = await fetch('/create-payment-intent', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ amount, currency }),
    });

    return await response.json();
  }

  getStripe() {
    return this.stripe;
  }
}
