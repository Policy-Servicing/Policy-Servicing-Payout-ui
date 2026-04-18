import { Component, OnInit } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';

interface NavItem {
  icon: string;
  label: string;
  route: string;
}

@Component({
  selector: 'app-sidebar',
  template: `
    <aside class="sidebar" [class.collapsed]="collapsed">
      <div class="sidebar-logo" (click)="toggleCollapse()">
        <mat-icon class="logo-icon">shield</mat-icon>
        <span class="logo-text" *ngIf="!collapsed">PolicyServe</span>
        <mat-icon class="toggle-icon">{{ collapsed ? 'chevron_right' : 'chevron_left' }}</mat-icon>
      </div>

      <nav class="sidebar-nav">
        <a *ngFor="let item of navItems"
          class="nav-item"
          [routerLink]="item.route"
          [class.active]="isActive(item.route)"
          [matTooltip]="collapsed ? item.label : ''"
          matTooltipPosition="right">
          <mat-icon>{{ item.icon }}</mat-icon>
          <span class="nav-label" *ngIf="!collapsed">{{ item.label }}</span>
          <div class="active-bar" *ngIf="isActive(item.route)"></div>
        </a>
      </nav>

      <div class="sidebar-footer" *ngIf="!collapsed">
        <span>v1.0.0</span>
      </div>
    </aside>
  `,
  styleUrls: ['./sidebar.component.scss']
})
export class SidebarComponent implements OnInit {
  collapsed = false;
  activeRoute = '';

  navItems: NavItem[] = [
    { icon: 'dashboard',  label: 'Dashboard',          route: '/dashboard'          },
    { icon: 'schedule',   label: 'Schedulers',         route: '/schedulers'         },
    { icon: 'assignment', label: 'Manual Processing',  route: '/manual-processing'  }
  ];

  constructor(private router: Router) {}

  ngOnInit() {
    this.activeRoute = this.router.url;
    this.router.events.pipe(
      filter(e => e instanceof NavigationEnd)
    ).subscribe((e: NavigationEnd) => this.activeRoute = e.url);
  }

  isActive(route: string): boolean {
    return this.activeRoute.startsWith(route);
  }

  toggleCollapse() { this.collapsed = !this.collapsed; }
}
