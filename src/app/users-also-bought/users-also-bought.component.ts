import { Component, OnInit } from '@angular/core';
import { SalesService } from '../services/sales.service';
import { ProductService } from '../services/product.service';
import { combineLatest, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Sale } from '../models/sale';
import { Product } from '../models/product';

@Component({
  selector: 'app-users-also-bought',
  templateUrl: './users-also-bought.component.html',
  styleUrls: ['./users-also-bought.component.sass']
})
export class UsersAlsoBoughtComponent implements OnInit {
  productsToShow$: Observable<Product[]>;

  constructor(
    private salesService: SalesService,
    private productService: ProductService
  ) {}

  ngOnInit(): void {
    this.productsToShow$ = combineLatest([
      this.salesService.getAllSales(),
      this.productService.getProducts()
    ]).pipe(
      map(([sales, products]) => this.getFrequentlyBoughtTogether(sales, products))
    );
  }

  private getFrequentlyBoughtTogether(sales: Sale[], products: Product[]): Product[] {
    // Step 1: Sort sales by quantitySold to find top sales
    const sortedSales = sales.sort((a, b) => b.quantitySold - a.quantitySold);
    const topSales = sortedSales.slice(0, 5);

    if (topSales.length === 0) return [];

    // Step 2: Select a random sale from top sales
    const randomSale = topSales[Math.floor(Math.random() * topSales.length)];

    // Step 3: Find all sales made by this buyer
    const buyerSales = sales.filter(sale => sale.buyerName === randomSale.buyerName);

    // Step 4: Match sales to actual products and remove duplicates
    const matchedProductsMap = new Map<number, Product>();

    buyerSales.forEach(sale => {
      const product = products.find(p => p.id === sale.productId);
      if (product && !matchedProductsMap.has(product.id)) {
        matchedProductsMap.set(product.id, product);
      }
    });

    return Array.from(matchedProductsMap.values());
  }

}
