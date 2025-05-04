import { Injectable } from '@angular/core';
import { Resolve, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { Observable } from 'rxjs';
import { ProductService } from '../services/product.service';  // Import ProductService to fetch product data
import { Product } from '../models/product';  // Import Product model to define the data type

@Injectable({
  providedIn: 'root',
})

export class ProductsResolver implements Resolve<Product[]> {
  constructor(private productService: ProductService) {}  // Inject ProductService to fetch products

  // The resolve method will fetch the products when the route is activated
  resolve(
    route: ActivatedRouteSnapshot,  // Contains route information like parameters and data
    state: RouterStateSnapshot,     // Contains the state of the router at a specific time
  ): Observable<Product[]> {
    // Call the ProductService to get an observable of the list of products
    return this.productService.getProducts();
  }
}
