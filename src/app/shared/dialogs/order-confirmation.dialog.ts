import { CurrencyPipe, DatePipe } from '@angular/common';
import { Component, Inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { Order } from '../../core/models/order.model';

@Component({
  selector: 'app-order-confirmation-dialog',
  standalone: true,
  imports: [MatDialogModule, MatButtonModule, CurrencyPipe, DatePipe],
  template: `
    <h2 mat-dialog-title>Order Confirmed</h2>
    <mat-dialog-content>
      <p><strong>Order ID:</strong> {{ data.id }}</p>
      <p><strong>Placed:</strong> {{ data.orderedAt | date: 'medium' }}</p>
      <p><strong>Total:</strong> {{ data.totalAmount | currency: 'INR' }}</p>
      <p>A confirmation summary has been saved under your Orders page.</p>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-flat-button color="primary" mat-dialog-close>Close</button>
    </mat-dialog-actions>
  `
})
export class OrderConfirmationDialogComponent {
  constructor(@Inject(MAT_DIALOG_DATA) public data: Order) {}
}
