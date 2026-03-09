import { Injectable } from '@angular/core';
import { BehaviorSubject, map } from 'rxjs';
import { AuthUser, SignupPayload } from '../models/auth-user.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly usersKey = 'catalog-users';
  private readonly sessionKey = 'catalog-active-user-id';
  private readonly usersSubject = new BehaviorSubject<AuthUser[]>(this.readUsers());
  private readonly currentUserSubject = new BehaviorSubject<AuthUser | null>(this.readSessionUser());

  readonly currentUser$ = this.currentUserSubject.asObservable();
  readonly isAuthenticated$ = this.currentUser$.pipe(map((user) => Boolean(user)));

  get currentUser(): AuthUser | null {
    return this.currentUserSubject.value;
  }

  register(payload: SignupPayload): { ok: boolean; message: string } {
    const normalizedEmail = payload.email.trim().toLowerCase();
    const users = this.usersSubject.value;
    const exists = users.some((user) => user.email.toLowerCase() === normalizedEmail);

    if (exists) {
      return { ok: false, message: 'An account with this email already exists.' };
    }

    const newUser: AuthUser = {
      id: `USR-${Date.now()}`,
      fullName: payload.fullName.trim(),
      email: normalizedEmail,
      password: payload.password,
      phone: payload.phone?.trim() || '',
      address: payload.address?.trim() || '',
      createdAt: new Date().toISOString()
    };

    const updated = [newUser, ...users];
    this.usersSubject.next(updated);
    localStorage.setItem(this.usersKey, JSON.stringify(updated));
    this.setActiveUser(newUser);
    return { ok: true, message: 'Account created successfully. Welcome to Product Universe.' };
  }

  login(email: string, password: string): { ok: boolean; message: string } {
    const normalizedEmail = email.trim().toLowerCase();
    const user = this.usersSubject.value.find(
      (item) => item.email.toLowerCase() === normalizedEmail && item.password === password
    );

    if (!user) {
      return { ok: false, message: 'Invalid email or password.' };
    }

    this.setActiveUser(user);
    return { ok: true, message: `Welcome back, ${user.fullName}.` };
  }

  logout(): void {
    localStorage.removeItem(this.sessionKey);
    this.currentUserSubject.next(null);
  }

  updateProfile(update: Partial<Pick<AuthUser, 'fullName' | 'phone' | 'address'>>): void {
    const current = this.currentUserSubject.value;
    if (!current) {
      return;
    }

    const merged: AuthUser = {
      ...current,
      fullName: update.fullName?.trim() || current.fullName,
      phone: update.phone?.trim() || current.phone,
      address: update.address?.trim() || current.address
    };

    const updatedUsers = this.usersSubject.value.map((user) => (user.id === merged.id ? merged : user));
    this.usersSubject.next(updatedUsers);
    this.currentUserSubject.next(merged);
    localStorage.setItem(this.usersKey, JSON.stringify(updatedUsers));
    localStorage.setItem(this.sessionKey, merged.id);
  }

  private setActiveUser(user: AuthUser): void {
    localStorage.setItem(this.sessionKey, user.id);
    this.currentUserSubject.next(user);
  }

  private readUsers(): AuthUser[] {
    return JSON.parse(localStorage.getItem(this.usersKey) ?? '[]') as AuthUser[];
  }

  private readSessionUser(): AuthUser | null {
    const activeUserId = localStorage.getItem(this.sessionKey);
    if (!activeUserId) {
      return null;
    }

    const users = this.readUsers();
    return users.find((user) => user.id === activeUserId) ?? null;
  }
}
