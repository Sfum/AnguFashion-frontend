import {Product, ProductSize} from './product';

export interface CartItem {
  productId: string;       // The ID of the product
  productName: string;     // The name of the product
  quantity: number;        // Quantity of the product in the cart
  price: number;           // Original price of the product
  salePrice?: number;      // Sale price based on the selected size's price
  onSale: boolean;         // Whether the product is on sale
  selectedSize: ProductSize;   // Selected size of the product
  selectedColor?: string;  // Selected color of the product (optional)
  unitType: 'size' | 'waist' | 'length' | 'fit' | 'kidsSize' | 'chest' | 'sleeve';
  sizeLabel: string;
}

export interface CartEvent {
  product: Product;
  size: ProductSize;
  color: string | null;
  quantity: number;
  unitType: 'size' | 'waist' | 'length' | 'fit' | 'kidsSize' | 'chest' | 'sleeve';
  sizeLabel: string;
}
