import { Component } from '@angular/core';
import { LoadingService } from '../../core/services/loading.service';

@Component({
  selector: 'app-shell',
  template: `
    <div class="shell-layout">
      <app-sidebar></app-sidebar>
      <div class="shell-main">
        <app-header></app-header>
        <div class="shell-progress" *ngIf="loading$ | async">
          <mat-progress-bar mode="indeterminate" color="accent"></mat-progress-bar>
        </div>
        <main class="shell-content">
          <router-outlet></router-outlet>
        </main>
      </div>
    </div>
  `,
  styles: [`
    .shell-layout {
      display: flex;
      height: 100vh;
      overflow: hidden;
      background: #F8FAFC;
    }
    .shell-main {
      flex: 1;
      display: flex;
      flex-direction: column;
      overflow: hidden;
    }
    .shell-progress {
      height: 3px;
      mat-progress-bar { height: 3px; }
    }
    .shell-content {
      flex: 1;
      overflow-y: auto;
      padding: 24px;
    }
  `]
})
export class ShellComponent {
  loading$ = this.loadingService.loading$;
  constructor(private loadingService: LoadingService) {}
}
