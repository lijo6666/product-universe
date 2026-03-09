import { CartItem } from './cart-item.model';

export interface CheckoutDetails {
  fullName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  zipCode: string;
  notes?: string;
}

export interface Order {
  id: string;
  items: CartItem[];
  customer: CheckoutDetails;
  totalAmount: number;
  orderedAt: string;
}
