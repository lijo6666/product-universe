import { Injectable } from '@angular/core';
import { BehaviorSubject, map } from 'rxjs';
import { CartItem } from '../models/cart-item.model';
import { Product } from '../models/product.model';

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private readonly storageKey = 'catalog-cart-items';
  private readonly cartSubject = new BehaviorSubject<CartItem[]>(this.readStorage());

  readonly cart$ = this.cartSubject.asObservable();
  readonly itemCount$ = this.cart$.pipe(map((items) => items.reduce((sum, item) => sum + item.quantity, 0)));
  readonly subtotal$ = this.cart$.pipe(
    map((items) => items.reduce((sum, item) => sum + item.product.price * item.quantity, 0))
  );

  addToCart(product: Product, quantity = 1): void {
    const current = [...this.cartSubject.value];
    const match = current.find((item) => item.product.id === product.id);

    if (match) {
      match.quantity += quantity;
    } else {
      current.push({ product, quantity });
    }

    this.updateState(current);
  }

  updateQuantity(productId: number, quantity: number): void {
    if (quantity < 1) {
      this.removeFromCart(productId);
      return;
    }

    const updated = this.cartSubject.value.map((item) =>
      item.product.id === productId ? { ...item, quantity } : item
    );
    this.updateState(updated);
  }

  removeFromCart(productId: number): void {
    this.updateState(this.cartSubject.value.filter((item) => item.product.id !== productId));
  }

  clearCart(): void {
    this.updateState([]);
  }

  private updateState(items: CartItem[]): void {
    this.cartSubject.next(items);
    localStorage.setItem(this.storageKey, JSON.stringify(items));
  }

  private readStorage(): CartItem[] {
    return JSON.parse(localStorage.getItem(this.storageKey) ?? '[]') as CartItem[];
  }
}
