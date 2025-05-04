import { Component, Input } from '@angular/core';
import { Brand } from '../../models/brand';
import { Product } from '../../models/product';

@Component({
  selector: 'app-brand-detail',
  templateUrl: './brand-detail.component.html',
  styleUrls: ['./brand-detail.component.sass'],
})
export class BrandDetailComponent {
  @Input() brand!: Brand;
  @Input() products!: Product[] | null;

  // Method to filter products that belong to the current brand
  getBrandProducts(): Product[] {
    return (
      this.products?.filter((product) => product.brandId === this.brand.id) ||  // Filter products by matching brandId
      []  // Return an empty array if no products or no matching products are found
    );
  }
}
