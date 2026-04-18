import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { tap, delay } from 'rxjs/operators';
import { User, LoginRequest, LoginResponse } from './auth.models';

const MOCK_USERS: LoginResponse[] = [
  {
    token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJhZG1pbiIsInJvbGUiOiJBRE1JTiIsImV4cCI6OTk5OTk5OTk5OX0.mock',
    user: { id: 1, username: 'admin', fullName: 'Admin User', role: 'ADMIN', email: 'admin@policyserve.com' },
    expiresIn: 3600
  },
  {
    token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ2aWV3ZXIiLCJyb2xlIjoiVklFV0VSIiwiZXhwIjo5OTk5OTk5OTk5fQ.mock',
    user: { id: 2, username: 'viewer', fullName: 'Viewer User', role: 'VIEWER', email: 'viewer@policyserve.com' },
    expiresIn: 3600
  }
];

@Injectable({ providedIn: 'root' })
export class AuthService {
  private currentUserSubject = new BehaviorSubject<User | null>(this.loadUser());
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(private http: HttpClient, private router: Router) {}

  get currentUser(): User | null {
    return this.currentUserSubject.value;
  }

  get isAdmin(): boolean {
    return !!(this.currentUser && this.currentUser.role === 'ADMIN');
  }

  get isLoggedIn(): boolean {
    return !!this.getToken();
  }

  login(req: LoginRequest): Observable<LoginResponse> {
    const match = MOCK_USERS.find(u => u.user.username === req.username && req.password === 'password');
    if (!match) {
      return new Observable(obs => obs.error({ message: 'Invalid username or password' }));
    }
    return of(match).pipe(
      delay(800),
      tap(res => {
        localStorage.setItem('ps_token', res.token);
        localStorage.setItem('ps_user', JSON.stringify(res.user));
        this.currentUserSubject.next(res.user);
      })
    );
  }

  logout(): void {
    localStorage.removeItem('ps_token');
    localStorage.removeItem('ps_user');
    this.currentUserSubject.next(null);
    this.router.navigate(['/login']);
  }

  getToken(): string | null {
    return localStorage.getItem('ps_token');
  }

  private loadUser(): User | null {
    try {
      const raw = localStorage.getItem('ps_user');
      return raw ? JSON.parse(raw) : null;
    } catch (e) {
      return null;
    }
  }
}
