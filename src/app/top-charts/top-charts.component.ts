import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { SalesService } from '../services/sales.service';
import { ProductService } from '../services/product.service';
import { combineLatest } from 'rxjs';
import { map } from 'rxjs/operators';
import { Sale } from '../models/sale';
import { Product } from '../models/product';

interface ProductSalesCount {
  productId: string;
  product: Product;
  totalSales: number;
}

@Component({
  selector: 'app-top-charts',
  templateUrl: './top-charts.component.html',
  styleUrls: ['./top-charts.component.sass']
})
export class TopChartsComponent implements OnInit {
  topProducts: ProductSalesCount[] = [];

  constructor(
    private salesService: SalesService,
    private productService: ProductService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    combineLatest([
      this.salesService.getAllSales(),
      this.productService.getProducts()
    ])
      .pipe(
        map(([sales, products]) => this.calculateTopProducts(sales, products))
      )
      .subscribe((topProducts) => {
        this.topProducts = topProducts;
        this.cdr.detectChanges(); // Explicitly trigger change detection
      });
  }

  private calculateTopProducts(sales: Sale[], products: Product[]): ProductSalesCount[] {
    const salesCountMap: Record<string, number> = {};

    sales.forEach(sale => {
      salesCountMap[sale.product_name] = (salesCountMap[sale.product_name] || 0) + 1;
    });

    return Object.entries(salesCountMap)
      .map(([product_name, totalSales]) => ({ product_name, totalSales }))
      .sort((a, b) => b.totalSales - a.totalSales)
      .slice(0, 10)
      .map(saleCount => {
        const product = products.find(prod => prod.product_name === saleCount.product_name);
        return product ? {
          productId: product.firestoreId || product.id,
          product,
          totalSales: saleCount.totalSales
        } : null;
      })
      .filter((item): item is ProductSalesCount => item !== null);
  }
}
