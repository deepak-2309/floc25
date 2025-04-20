import { Timestamp } from 'firebase/firestore';

export interface Activity {
  id: string;
  title: string;
  datetime: string;
  location?: string;
  description?: string;
  createdBy: string;
  createdAt?: Timestamp;
  userId: string;
  userEmail?: string;
} 