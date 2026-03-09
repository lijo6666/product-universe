import { Routes } from '@angular/router';
import { ProductDetailComponent } from './pages/product-detail.component';
import { ProductListComponent } from './pages/product-list.component';

export const PRODUCT_ROUTES: Routes = [
  {
    path: '',
    component: ProductListComponent
  },
  {
    path: ':id',
    component: ProductDetailComponent
  }
];
