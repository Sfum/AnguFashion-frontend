import firebase from 'firebase/compat/app';

export interface Ticket {
  id?: string;
  userId: string;
  email: string;
  productId: string;
  subject: string;
  message: string;
  created_at: firebase.firestore.Timestamp;
  updated_at: firebase.firestore.Timestamp;
  status: 'open' | 'pending' | 'completed';
}
