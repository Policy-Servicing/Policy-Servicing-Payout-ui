import { Component, Input } from '@angular/core';
import { SchedulerStatus } from '../../../core/models/app.models';

@Component({
  selector: 'app-badge',
  template: `
    <span class="badge" [ngClass]="status?.toLowerCase()">
      <span class="dot" *ngIf="status === 'RUNNING'"></span>
      {{ label || status }}
    </span>
  `,
  styles: [`
    .badge {
      display: inline-flex;
      align-items: center;
      gap: 5px;
      padding: 3px 10px;
      border-radius: 20px;
      font-size: 11px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .success  { background: #DCFCE7; color: #166534; }
    .failed   { background: #FEE2E2; color: #991B1B; }
    .running  { background: #DBEAFE; color: #1E40AF; }
    .idle     { background: #F1F5F9; color: #475569; }
    .disabled { background: #F1F5F9; color: #94A3B8; }
    .pending  { background: #FEF3C7; color: #92400E; }
    .processing { background: #EDE9FE; color: #5B21B6; }

    .dot {
      width: 7px; height: 7px;
      border-radius: 50%;
      background: #3B82F6;
      animation: pulse 1.2s infinite;
    }
    @keyframes pulse {
      0%,100% { opacity: 1; transform: scale(1); }
      50%      { opacity: 0.5; transform: scale(1.4); }
    }
  `]
})
export class BadgeComponent {
  @Input() status: string;
  @Input() label?: string;
}
