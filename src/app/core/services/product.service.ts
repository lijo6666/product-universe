import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, catchError, combineLatest, map, of, shareReplay, take } from 'rxjs';
import { Category } from '../models/category.model';
import { Product } from '../models/product.model';

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private readonly productsUrl = 'assets/data/products.json';
  private readonly localProductsSubject = new BehaviorSubject<Product[]>(this.readLocalProducts());
  private readonly apiProducts$ = this.http.get<Product[]>(this.productsUrl).pipe(
    map((products) =>
      products.map((product) => ({
        ...product,
        stock: Number(product.stock),
        discountPercent: Number(product.discountPercent),
        price: Number(product.price),
        rating: Number(product.rating)
      }))
    ),
    catchError(() => of([])),
    shareReplay(1)
  );

  constructor(private readonly http: HttpClient) {}

  getProducts(): Observable<Product[]> {
    return combineLatest([this.apiProducts$, this.localProductsSubject.asObservable()]).pipe(
      map(([apiProducts, localProducts]) => [...localProducts, ...apiProducts])
    );
  }

  getProductById(id: number): Observable<Product | undefined> {
    return this.getProducts().pipe(map((products) => products.find((product) => product.id === id)));
  }

  getCategories(): Observable<Category[]> {
    return this.getProducts().pipe(
      map((products) => Array.from(new Set(products.map((product) => product.category))).sort()),
      map((categoryNames) => categoryNames.map((name, index) => ({ id: `${index + 1}`, name })))
    );
  }

  addProduct(product: Product): Observable<Product> {
    return this.getProducts().pipe(
      take(1),
      map((products) => {
        const nextId = products.length ? Math.max(...products.map((item) => item.id)) + 1 : 1;
        return { ...product, id: nextId };
      }),
      map((newProduct) => {
        const updated = [newProduct, ...this.localProductsSubject.value];
        this.localProductsSubject.next(updated);
        localStorage.setItem('catalog-added-products', JSON.stringify(updated));
        return newProduct;
      })
    );
  }

  getLocallyAddedProducts(): Product[] {
    return [...this.localProductsSubject.value];
  }

  private readLocalProducts(): Product[] {
    return JSON.parse(localStorage.getItem('catalog-added-products') ?? '[]') as Product[];
  }
}
