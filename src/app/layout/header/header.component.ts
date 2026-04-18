import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../core/auth/auth.service';
import { User } from '../../core/auth/auth.models';

@Component({
  selector: 'app-header',
  template: `
    <header class="header">
      <div class="header-left">
        <div class="page-title">{{ getPageTitle() }}</div>
        <div class="breadcrumb">PolicyServe &rsaquo; {{ getPageTitle() }}</div>
      </div>
      <div class="header-right">
        <div class="header-time">{{ currentTime | date:'EEE, dd MMM yyyy HH:mm' }}</div>
        <button mat-icon-button matTooltip="Notifications">
          <mat-icon>notifications_none</mat-icon>
        </button>
        <div class="user-chip" [matMenuTriggerFor]="userMenu">
          <div class="user-avatar">{{ getInitials(user) }}</div>
          <div class="user-info">
            <span class="user-name">{{ user?.fullName }}</span>
            <span class="user-role" [class.admin]="user?.role === 'ADMIN'">{{ user?.role }}</span>
          </div>
          <mat-icon class="chevron">expand_more</mat-icon>
        </div>
        <mat-menu #userMenu="matMenu" xPosition="before">
          <div class="menu-header">
            <span>{{ user?.email }}</span>
          </div>
          <mat-divider></mat-divider>
          <button mat-menu-item (click)="logout()">
            <mat-icon>logout</mat-icon> Sign Out
          </button>
        </mat-menu>
      </div>
    </header>
  `,
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {
  user: User | null;
  currentTime = new Date();

  constructor(private auth: AuthService, private router: Router) {}

  ngOnInit() {
    this.auth.currentUser$.subscribe(u => this.user = u);
    setInterval(() => this.currentTime = new Date(), 60000);
  }

  getPageTitle(): string {
    const url = this.router.url;
    if (url.includes('dashboard'))  { return 'Dashboard'; }
    if (url.includes('scheduler'))  { return 'Scheduler Management'; }
    return 'PolicyServe';
  }

  getInitials(user: User | null): string {
    if (!user) { return 'U'; }
    return user.fullName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  }

  logout() { this.auth.logout(); }
}
