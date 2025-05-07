export interface VatRate {
  id?: string; // Optional ID for Firestore document
  country: string;
  rate: number;
}
