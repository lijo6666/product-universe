import { AsyncPipe, CurrencyPipe, NgFor, NgIf } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTableModule } from '@angular/material/table';
import { RouterLink } from '@angular/router';
import { combineLatest, map } from 'rxjs';
import { CartItem } from '../../../core/models/cart-item.model';
import { CartService } from '../../../core/services/cart.service';
import { OrderService } from '../../../core/services/order.service';
import { OrderConfirmationDialogComponent } from '../../../shared/dialogs/order-confirmation.dialog';

@Component({
  selector: 'app-shopping-cart',
  standalone: true,
  imports: [
    NgIf,
    NgFor,
    AsyncPipe,
    CurrencyPipe,
    RouterLink,
    ReactiveFormsModule,
    MatTableModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatSnackBarModule,
    MatDialogModule
  ],
  templateUrl: './shopping-cart.component.html',
  styleUrl: './shopping-cart.component.scss'
})
export class ShoppingCartComponent {
  readonly displayedColumns = ['product', 'price', 'quantity', 'total', 'actions'];
  readonly cart$ = this.cartService.cart$;
  readonly total$ = combineLatest([this.cartService.subtotal$, this.cart$]).pipe(
    map(([subtotal, items]) => subtotal - this.calculateDiscount(items))
  );

  readonly checkoutForm = this.fb.nonNullable.group({
    fullName: ['', [Validators.required, Validators.minLength(3)]],
    email: ['', [Validators.required, Validators.email]],
    phone: ['', [Validators.required, Validators.pattern(/^[6-9]\d{9}$/)]],
    address: ['', [Validators.required, Validators.minLength(10)]],
    city: ['', Validators.required],
    zipCode: ['', [Validators.required, Validators.pattern(/^\d{6}$/)]],
    notes: ['']
  });

  constructor(
    private readonly cartService: CartService,
    private readonly orderService: OrderService,
    private readonly fb: FormBuilder,
    private readonly snackBar: MatSnackBar,
    private readonly dialog: MatDialog
  ) {}

  changeQuantity(item: CartItem, delta: number): void {
    this.cartService.updateQuantity(item.product.id, item.quantity + delta);
  }

  removeItem(productId: number): void {
    this.cartService.removeFromCart(productId);
  }

  checkout(items: CartItem[], total: number): void {
    if (!items.length) {
      this.snackBar.open('Your cart is empty.', 'Dismiss', { duration: 2500 });
      return;
    }

    if (this.checkoutForm.invalid) {
      this.checkoutForm.markAllAsTouched();
      this.snackBar.open('Please complete all required checkout fields correctly.', 'Dismiss', { duration: 3000 });
      return;
    }

    const order = this.orderService.placeOrder(items, this.checkoutForm.getRawValue(), total);
    this.dialog.open(OrderConfirmationDialogComponent, { data: order });
    this.cartService.clearCart();
    this.checkoutForm.reset();
  }

  calculateDiscount(items: CartItem[]): number {
    return items.reduce((sum, item) => sum + (item.product.price * item.product.discountPercent * item.quantity) / 100, 0);
  }
}
