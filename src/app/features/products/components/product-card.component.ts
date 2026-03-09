import { CurrencyPipe, DatePipe, NgIf } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink } from '@angular/router';
import { Product } from '../../../core/models/product.model';
import { ProductStatusDirective } from '../../../shared/directives/product-status.directive';

@Component({
  selector: 'app-product-card',
  standalone: true,
  imports: [RouterLink, NgIf, CurrencyPipe, DatePipe, MatCardModule, MatButtonModule, MatIconModule, ProductStatusDirective],
  templateUrl: './product-card.component.html',
  styleUrl: './product-card.component.scss'
})
export class ProductCardComponent {
  @Input({ required: true }) product!: Product;
  @Input() compact = false;
  @Input() wishlisted = false;
  @Output() readonly add = new EventEmitter<Product>();
  @Output() readonly wishlistToggle = new EventEmitter<Product>();

  get discountedPrice(): number {
    return this.product.price - (this.product.price * this.product.discountPercent) / 100;
  }
}
