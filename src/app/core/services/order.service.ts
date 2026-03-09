import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { CartItem } from '../models/cart-item.model';
import { CheckoutDetails, Order } from '../models/order.model';

@Injectable({
  providedIn: 'root'
})
export class OrderService {
  private readonly storageKey = 'catalog-orders';
  private readonly ordersSubject = new BehaviorSubject<Order[]>(this.readStorage());

  readonly orders$ = this.ordersSubject.asObservable();

  placeOrder(items: CartItem[], customer: CheckoutDetails, totalAmount: number): Order {
    const newOrder: Order = {
      id: `ORD-${Date.now()}`,
      items,
      customer,
      totalAmount,
      orderedAt: new Date().toISOString()
    };

    const updated = [newOrder, ...this.ordersSubject.value];
    this.ordersSubject.next(updated);
    localStorage.setItem(this.storageKey, JSON.stringify(updated));
    return newOrder;
  }

  private readStorage(): Order[] {
    return JSON.parse(localStorage.getItem(this.storageKey) ?? '[]') as Order[];
  }
}
