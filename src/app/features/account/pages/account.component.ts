import { AsyncPipe, DatePipe, NgIf } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTabsModule } from '@angular/material/tabs';
import { RouterLink } from '@angular/router';
import { map } from 'rxjs';
import { AuthService } from '../../../core/services/auth.service';
import { OrderService } from '../../../core/services/order.service';
import { WishlistService } from '../../../core/services/wishlist.service';

@Component({
  selector: 'app-account',
  standalone: true,
  imports: [
    NgIf,
    AsyncPipe,
    DatePipe,
    RouterLink,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatTabsModule,
    MatIconModule,
    MatSnackBarModule
  ],
  templateUrl: './account.component.html',
  styleUrl: './account.component.scss'
})
export class AccountComponent {
  readonly currentUser$ = this.authService.currentUser$;
  readonly wishlistCount$ = this.wishlistService.count$;
  readonly orderCount$ = this.orderService.orders$.pipe(map((orders) => orders.length));

  readonly loginForm = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]]
  });

  readonly signupForm = this.fb.nonNullable.group({
    fullName: ['', [Validators.required, Validators.minLength(3)]],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
    phone: ['', [Validators.pattern(/^[6-9]\d{9}$/)]],
    address: ['']
  });

  readonly profileForm = this.fb.nonNullable.group({
    fullName: ['', [Validators.required, Validators.minLength(3)]],
    phone: ['', [Validators.pattern(/^[6-9]\d{9}$/)]],
    address: ['']
  });

  constructor(
    private readonly fb: FormBuilder,
    private readonly authService: AuthService,
    private readonly wishlistService: WishlistService,
    private readonly orderService: OrderService,
    private readonly snackBar: MatSnackBar
  ) {
    this.currentUser$.subscribe((user) => {
      if (!user) {
        return;
      }

      this.profileForm.patchValue(
        {
          fullName: user.fullName,
          phone: user.phone ?? '',
          address: user.address ?? ''
        },
        { emitEvent: false }
      );
    });
  }

  login(): void {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    const { email, password } = this.loginForm.getRawValue();
    const result = this.authService.login(email, password);
    this.snackBar.open(result.message, 'Dismiss', { duration: 3000 });
    if (result.ok) {
      this.loginForm.reset();
    }
  }

  createAccount(): void {
    if (this.signupForm.invalid) {
      this.signupForm.markAllAsTouched();
      return;
    }

    const result = this.authService.register(this.signupForm.getRawValue());
    this.snackBar.open(result.message, 'Dismiss', { duration: 3200 });
    if (result.ok) {
      this.signupForm.reset();
    }
  }

  saveProfile(): void {
    if (this.profileForm.invalid) {
      this.profileForm.markAllAsTouched();
      return;
    }

    this.authService.updateProfile(this.profileForm.getRawValue());
    this.snackBar.open('Profile updated successfully.', 'Dismiss', { duration: 2500 });
  }

  logout(): void {
    this.authService.logout();
    this.snackBar.open('Signed out from your account.', 'Dismiss', { duration: 2400 });
  }
}
