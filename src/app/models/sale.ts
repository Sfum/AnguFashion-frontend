import firebase from 'firebase/compat/app';
import {ProductSize} from './product';

export interface SerializedTimestamp {
  _seconds: number;
  _nanoseconds: number;
}

export interface FirestoreTimestamp {
  seconds: number;
  nanoseconds: number;
}

export const SaleStatus = {
  OPEN: 'Paid',
  PENDING: 'Pending',
  COMPLETED: 'Shipped',
} as const;

// Type definition for SaleStatus based on the SaleStatus object
export type SaleStatus = typeof SaleStatus[keyof typeof SaleStatus];

// Sale Interface: Represents the structure of a sale
export interface Sale {
  id: string;
  productId: number;
  buyerName: string;
  buyerAddress: string;
  buyerPostcode: string;
  buyerCountry: string;
  buyerEmail: string;
  sellerName: string;
  quantitySold: number;
  status: SaleStatus;
  quantityStock: number;
  selectedSize: ProductSize;
  saleDate: Date | firebase.firestore.Timestamp | FirestoreTimestamp | SerializedTimestamp | string;
  uploaderId: string;
  userId: string;
  product_name: string;
  totalPrice: number;
  vatAmount?: number;
  vatRate?: number;
  deliveryRate?: number;
}
