import { Injectable } from '@angular/core';
import { BehaviorSubject, map } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class WishlistService {
  private readonly storageKey = 'catalog-wishlist-product-ids';
  private readonly wishlistSubject = new BehaviorSubject<number[]>(this.readStorage());

  readonly ids$ = this.wishlistSubject.asObservable();
  readonly count$ = this.ids$.pipe(map((ids) => ids.length));

  contains(productId: number): boolean {
    return this.wishlistSubject.value.includes(productId);
  }

  toggle(productId: number): void {
    const current = this.wishlistSubject.value;
    const updated = current.includes(productId) ? current.filter((id) => id !== productId) : [productId, ...current];
    this.persist(updated);
  }

  clear(): void {
    this.persist([]);
  }

  private persist(ids: number[]): void {
    this.wishlistSubject.next(ids);
    localStorage.setItem(this.storageKey, JSON.stringify(ids));
  }

  private readStorage(): number[] {
    return JSON.parse(localStorage.getItem(this.storageKey) ?? '[]') as number[];
  }
}
