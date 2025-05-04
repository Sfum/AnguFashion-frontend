import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { IPayPalConfig } from 'ngx-paypal';
import { Product } from '../../models/product';
import { CartService } from '../../services/cart.service';

@Component({
  selector: 'app-shopping-cart-payment',
  templateUrl: './shopping-cart-payment.component.html',
  styleUrls: ['./shopping-cart-payment.component.sass'],
})
export class ShoppingCartPaymentComponent implements OnInit {
  cartTotal: number = 0;     // Final total including VAT
  cartSubtotal: number = 0;  // Total excluding VAT
  vatTotal: number = 0;      // Total VAT sum

  cartItems: Product[] = [];

  constructor(private router: Router, private cartService: CartService) {}

  ngOnInit() {
    this.cartService.getProductsFromBackend().subscribe((items: Product[]) => {
      this.cartItems = items;

      // Calculate subtotal and VAT
      this.cartSubtotal = 0;
      this.vatTotal = 0;

      for (const product of this.cartItems) {
        const quantity = product.quantity || 1;
        const price = product.onSale && product.selectedSize?.salePrice
          ? product.selectedSize.salePrice
          : product.selectedSize?.price || 0;

        const vat = product.selectedSize?.vatAmount || 0;

        this.cartSubtotal += price * quantity;
        this.vatTotal += vat * quantity;
      }

      this.cartTotal = this.cartSubtotal + this.vatTotal;
    });
  }
}
