import { Timestamp } from 'firebase/firestore';
import firebase from 'firebase/compat';
import {FirestoreTimestamp, SerializedTimestamp} from './sale';

export interface ProductComment {
  userId: string;
  userName: string;
  comment: string;
  date_created: Date | firebase.firestore.Timestamp | FirestoreTimestamp | SerializedTimestamp | string;
  rating: number;
}

export interface Product {
  id: number;
  firestoreId?: string;
  product_name: string;
  product_title: string;
  product_description: string;
  uploaderId?: string;
  brandId: number;
  categoryId: number;
  product_image: string[];
  price: number;
  in_bundle: boolean;
  quantity: number;
  quantitySold?: number;
  quantityStock: number;
  in_cart: boolean;
  discountPercentage: number;
  onSale: boolean;
  date_created?: Timestamp | Date;
  comments?: ProductComment[];
  sizes: ProductSize[];
  colors: string[];
  material: string;
  unitType: 'size' | 'waist' | 'length' | 'fit' | 'kidsSize' | 'chest' | 'sleeve';
  selectedSize: ProductSize;
  selectedColor?: string;
  salePrice: number;
}

export interface ProductSize {
  id: string;
  size: number;
  quantity: number;
  price: number;
  salePrice?: number,
  unitType: 'size' | 'waist' | 'length' | 'fit' | 'kidsSize' | 'chest' | 'sleeve';
  sizeLabel?: string;
  vatAmount?: number;
  vatRate?: number;
}

export interface WishlistItem {
  userId: string;
  product: Product;
}

export interface CompareItem {
  userId: string;
  product: Product;
}
