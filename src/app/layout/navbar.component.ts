import { AsyncPipe, NgIf } from '@angular/common';
import { Component } from '@angular/core';
import { MatBadgeModule } from '@angular/material/badge';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatToolbarModule } from '@angular/material/toolbar';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../core/services/auth.service';
import { CartService } from '../core/services/cart.service';
import { WishlistService } from '../core/services/wishlist.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [
    AsyncPipe,
    NgIf,
    RouterLink,
    RouterLinkActive,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatBadgeModule
  ],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.scss'
})
export class NavbarComponent {
  readonly itemCount$ = this.cartService.itemCount$;
  readonly currentUser$ = this.authService.currentUser$;
  readonly wishlistCount$ = this.wishlistService.count$;

  constructor(
    private readonly cartService: CartService,
    private readonly authService: AuthService,
    private readonly wishlistService: WishlistService
  ) {}

  logout(): void {
    this.authService.logout();
  }
}
