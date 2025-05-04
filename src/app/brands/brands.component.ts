import {Component, OnInit} from '@angular/core';
import {Observable} from 'rxjs';
import {Brand} from '../models/brand';
import {Product} from '../models/product';
import {ProductService} from '../services/product.service';
import {BrandService} from '../services/brand.service';

@Component({
  selector: 'app-brands',
  templateUrl: './brands.component.html',
  styleUrl: './brands.component.sass'
})
export class BrandsComponent implements OnInit{

  brands$!: Observable<Brand[]>
  products$!: Observable<Product[]>

  constructor(private productService: ProductService,
              private brandsService: BrandService) { }

  //Initialize Brands & Products
  ngOnInit(): void {
    this.brands$ = this.brandsService.getBrands();
    this.products$ = this.productService.getProducts();
  }

}
