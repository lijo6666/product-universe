import { AsyncPipe, NgFor, NgIf } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { BehaviorSubject, combineLatest, map, tap } from 'rxjs';
import { Product } from '../../../core/models/product.model';
import { CartService } from '../../../core/services/cart.service';
import { ProductService } from '../../../core/services/product.service';
import { ProductCardComponent } from '../components/product-card.component';

type SortOption = 'featured' | 'priceLowHigh' | 'priceHighLow' | 'ratingHighLow' | 'newest';

@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [
    NgFor,
    NgIf,
    AsyncPipe,
    FormsModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatSlideToggleModule,
    MatSnackBarModule,
    ProductCardComponent
  ],
  templateUrl: './product-list.component.html',
  styleUrl: './product-list.component.scss'
})
export class ProductListComponent {
  readonly sortOptions: Array<{ value: SortOption; label: string }> = [
    { value: 'featured', label: 'Featured' },
    { value: 'priceLowHigh', label: 'Price: Low to High' },
    { value: 'priceHighLow', label: 'Price: High to Low' },
    { value: 'ratingHighLow', label: 'Rating: High to Low' },
    { value: 'newest', label: 'Newest First' }
  ];

  private readonly searchTermSubject = new BehaviorSubject<string>('');
  private readonly selectedCategorySubject = new BehaviorSubject<string>('All');
  private readonly sortBySubject = new BehaviorSubject<SortOption>('featured');
  private readonly inStockOnlySubject = new BehaviorSubject<boolean>(false);
  private readonly maxPriceSubject = new BehaviorSubject<number>(100000);

  readonly products$ = this.productService.getProducts().pipe(
    tap((products) => {
      const maxProductPrice = products.length ? Math.max(...products.map((product) => product.price)) : 100000;
      this.maxPriceLimit = maxProductPrice;
      if (this.maxPrice > maxProductPrice) {
        this.maxPrice = maxProductPrice;
        this.maxPriceSubject.next(maxProductPrice);
      }
    })
  );

  readonly categories$ = this.productService.getCategories().pipe(
    map((categories) => {
      const categoryNames = categories.map((category) => category.name);
      this.categories = ['All', ...categoryNames];
      return this.categories;
    })
  );
  readonly filteredProducts$ = combineLatest([
    this.products$,
    this.searchTermSubject,
    this.selectedCategorySubject,
    this.sortBySubject,
    this.inStockOnlySubject,
    this.maxPriceSubject
  ]).pipe(
    map(([products, searchTerm, selectedCategory, sortBy, inStockOnly, maxPrice]) => {
      const normalizedSearch = searchTerm.trim().toLowerCase();
      const filtered = products.filter((product) => {
        const matchesSearch =
          !normalizedSearch ||
          product.name.toLowerCase().includes(normalizedSearch) ||
          product.description.toLowerCase().includes(normalizedSearch);
        const matchesCategory = selectedCategory === 'All' || product.category === selectedCategory;
        const matchesStock = !inStockOnly || product.stock > 0;
        const matchesPrice = product.price <= maxPrice;
        return matchesSearch && matchesCategory && matchesStock && matchesPrice;
      });

      return filtered.sort((first, second) => {
        switch (sortBy) {
          case 'priceLowHigh':
            return first.price - second.price;
          case 'priceHighLow':
            return second.price - first.price;
          case 'ratingHighLow':
            return second.rating - first.rating;
          case 'newest':
            return new Date(second.releasedAt).getTime() - new Date(first.releasedAt).getTime();
          case 'featured':
          default:
            return first.id - second.id;
        }
      });
    })
  );
  readonly totalProductsCount$ = this.products$.pipe(map((products) => products.length));
  readonly filteredProductsCount$ = this.filteredProducts$.pipe(map((products) => products.length));

  searchTerm = '';
  selectedCategory = 'All';
  sortBy: SortOption = 'featured';
  inStockOnly = false;
  maxPrice = 100000;
  maxPriceLimit = 100000;
  categories: string[] = ['All'];

  constructor(
    private readonly productService: ProductService,
    private readonly cartService: CartService,
    private readonly snackBar: MatSnackBar
  ) {}

  trackByProductId(_: number, product: Product): number {
    return product.id;
  }

  onSearchTermChange(value: string): void {
    this.searchTermSubject.next(value);
  }

  onCategoryChange(value: string): void {
    this.selectedCategorySubject.next(value);
  }

  onSortChange(value: SortOption): void {
    this.sortBySubject.next(value);
  }

  onStockToggle(value: boolean): void {
    this.inStockOnlySubject.next(value);
  }

  onMaxPriceChange(value: number): void {
    const normalizedValue = Number.isNaN(Number(value)) ? this.maxPriceLimit : Number(value);
    this.maxPrice = Math.max(0, Math.min(this.maxPriceLimit, normalizedValue));
    this.maxPriceSubject.next(this.maxPrice);
  }

  clearFilters(): void {
    this.searchTerm = '';
    this.selectedCategory = 'All';
    this.sortBy = 'featured';
    this.inStockOnly = false;
    this.maxPrice = this.maxPriceLimit;
    this.searchTermSubject.next(this.searchTerm);
    this.selectedCategorySubject.next(this.selectedCategory);
    this.sortBySubject.next(this.sortBy);
    this.inStockOnlySubject.next(this.inStockOnly);
    this.maxPriceSubject.next(this.maxPrice);
  }

  addToCart(product: Product): void {
    if (product.stock === 0) {
      this.snackBar.open('Product is out of stock.', 'Dismiss', { duration: 2500 });
      return;
    }

    this.cartService.addToCart(product, 1);
    this.snackBar.open(`${product.name} added to cart.`, 'Dismiss', { duration: 2500 });
  }
}
