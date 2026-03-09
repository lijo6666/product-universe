import { AsyncPipe, DecimalPipe, NgFor, NgIf } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatChipsModule } from '@angular/material/chips';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { Router } from '@angular/router';
import { BehaviorSubject, combineLatest, interval, map, startWith, tap } from 'rxjs';
import { Product } from '../../../core/models/product.model';
import { AuthService } from '../../../core/services/auth.service';
import { CartService } from '../../../core/services/cart.service';
import { ProductService } from '../../../core/services/product.service';
import { WishlistService } from '../../../core/services/wishlist.service';
import { ProductCardComponent } from '../components/product-card.component';

type SortOption = 'featured' | 'priceLowHigh' | 'priceHighLow' | 'ratingHighLow' | 'discountHighLow' | 'newest';
type ViewMode = 'grid' | 'list';

@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [
    NgFor,
    NgIf,
    AsyncPipe,
    DecimalPipe,
    FormsModule,
    MatButtonModule,
    MatButtonToggleModule,
    MatChipsModule,
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
    { value: 'discountHighLow', label: 'Discount: High to Low' },
    { value: 'newest', label: 'Newest First' }
  ];
  readonly pageSizeOptions = [8, 12, 16, 24];
  readonly flashDealCountdown$ = interval(1000).pipe(
    startWith(0),
    map(() => {
      const end = new Date();
      end.setHours(23, 59, 59, 999);
      const diff = Math.max(end.getTime() - Date.now(), 0);
      const hours = String(Math.floor(diff / (1000 * 60 * 60))).padStart(2, '0');
      const minutes = String(Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))).padStart(2, '0');
      const seconds = String(Math.floor((diff % (1000 * 60)) / 1000)).padStart(2, '0');
      return `${hours}:${minutes}:${seconds}`;
    })
  );

  private readonly searchTermSubject = new BehaviorSubject<string>('');
  private readonly selectedCategorySubject = new BehaviorSubject<string>('All');
  private readonly sortBySubject = new BehaviorSubject<SortOption>('featured');
  private readonly inStockOnlySubject = new BehaviorSubject<boolean>(false);
  private readonly maxPriceSubject = new BehaviorSubject<number>(100000);
  private readonly pageSizeSubject = new BehaviorSubject<number>(12);
  private readonly currentPageSubject = new BehaviorSubject<number>(1);
  private readonly viewModeSubject = new BehaviorSubject<ViewMode>('grid');

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
          case 'discountHighLow':
            return second.discountPercent - first.discountPercent;
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
  readonly catalogMetrics$ = this.filteredProducts$.pipe(
    map((products) => {
      const inStockCount = products.filter((product) => product.stock > 0).length;
      const discountedCount = products.filter((product) => product.discountPercent > 0).length;
      const averageRating = products.length
        ? products.reduce((sum, product) => sum + product.rating, 0) / products.length
        : 0;

      return { inStockCount, discountedCount, averageRating };
    })
  );
  readonly pagination$ = combineLatest([
    this.filteredProducts$,
    this.pageSizeSubject,
    this.currentPageSubject,
    this.wishlistService.ids$
  ]).pipe(
    map(([products, pageSize, currentPage, wishlistIds]) => {
      const totalItems = products.length;
      const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
      const safePage = Math.min(currentPage, totalPages);
      const startIndex = (safePage - 1) * pageSize;
      const endIndex = Math.min(startIndex + pageSize, totalItems);
      const pagedProducts = products.slice(startIndex, endIndex);
      return {
        pagedProducts,
        wishlistedIds: new Set(wishlistIds),
        totalItems,
        totalPages,
        currentPage: safePage,
        startIndex,
        endIndex
      };
    }),
    tap((state) => {
      if (state.currentPage !== this.currentPage) {
        this.currentPage = state.currentPage;
        this.currentPageSubject.next(state.currentPage);
      }
    })
  );
  readonly viewMode$ = this.viewModeSubject.asObservable();

  searchTerm = '';
  selectedCategory = 'All';
  sortBy: SortOption = 'featured';
  inStockOnly = false;
  viewMode: ViewMode = 'grid';
  pageSize = 12;
  currentPage = 1;
  maxPrice = 100000;
  maxPriceLimit = 100000;
  categories: string[] = ['All'];

  constructor(
    private readonly productService: ProductService,
    private readonly cartService: CartService,
    private readonly wishlistService: WishlistService,
    private readonly authService: AuthService,
    private readonly snackBar: MatSnackBar,
    private readonly router: Router
  ) {}

  trackByProductId(_: number, product: Product): number {
    return product.id;
  }

  onSearchTermChange(value: string): void {
    this.searchTermSubject.next(value);
    this.resetPagination();
  }

  onCategoryChange(value: string): void {
    this.selectedCategorySubject.next(value);
    this.resetPagination();
  }

  onSortChange(value: SortOption): void {
    this.sortBySubject.next(value);
    this.resetPagination();
  }

  onStockToggle(value: boolean): void {
    this.inStockOnlySubject.next(value);
    this.resetPagination();
  }

  onMaxPriceChange(value: number): void {
    const normalizedValue = Number.isNaN(Number(value)) ? this.maxPriceLimit : Number(value);
    this.maxPrice = Math.max(0, Math.min(this.maxPriceLimit, normalizedValue));
    this.maxPriceSubject.next(this.maxPrice);
    this.resetPagination();
  }

  onPageSizeChange(value: number): void {
    this.pageSize = value;
    this.pageSizeSubject.next(value);
    this.resetPagination();
  }

  onViewModeChange(value: ViewMode): void {
    this.viewMode = value;
    this.viewModeSubject.next(value);
  }

  goToPreviousPage(): void {
    if (this.currentPage > 1) {
      this.currentPage -= 1;
      this.currentPageSubject.next(this.currentPage);
    }
  }

  goToNextPage(totalPages: number): void {
    if (this.currentPage < totalPages) {
      this.currentPage += 1;
      this.currentPageSubject.next(this.currentPage);
    }
  }

  clearFilters(): void {
    this.searchTerm = '';
    this.selectedCategory = 'All';
    this.sortBy = 'featured';
    this.inStockOnly = false;
    this.pageSize = 12;
    this.currentPage = 1;
    this.maxPrice = this.maxPriceLimit;
    this.viewMode = 'grid';
    this.searchTermSubject.next(this.searchTerm);
    this.selectedCategorySubject.next(this.selectedCategory);
    this.sortBySubject.next(this.sortBy);
    this.inStockOnlySubject.next(this.inStockOnly);
    this.pageSizeSubject.next(this.pageSize);
    this.currentPageSubject.next(this.currentPage);
    this.viewModeSubject.next(this.viewMode);
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

  toggleWishlist(product: Product): void {
    if (!this.authService.currentUser) {
      this.snackBar.open('Please create or login to an account to use wishlist.', 'Account', { duration: 2800 });
      this.router.navigateByUrl('/account');
      return;
    }

    const alreadyWishlisted = this.wishlistService.contains(product.id);
    this.wishlistService.toggle(product.id);
    this.snackBar.open(
      alreadyWishlisted ? `${product.name} removed from wishlist.` : `${product.name} added to wishlist.`,
      'Dismiss',
      { duration: 2200 }
    );
  }

  private resetPagination(): void {
    this.currentPage = 1;
    this.currentPageSubject.next(1);
  }
}
