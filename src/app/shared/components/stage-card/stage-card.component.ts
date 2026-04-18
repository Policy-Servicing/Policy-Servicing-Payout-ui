import {
  Component, Input, OnChanges, SimpleChanges,
  ChangeDetectorRef, OnDestroy
} from '@angular/core';
import { StageCount } from '../../../core/models/app.models';

@Component({
  selector: 'app-stage-card',
  template: `
    <div class="stage-card" [style.--card-color]="card.color">
      <div class="card-top">
        <div class="card-icon">
          <mat-icon>{{ card.icon }}</mat-icon>
        </div>
        <div class="card-badge" *ngIf="card.agingCount > 0">
          <mat-icon class="aging-icon">schedule</mat-icon>
          {{ card.agingCount }}&nbsp;&gt;&nbsp;{{ card.agingThresholdDays }}d
        </div>
      </div>

      <div class="card-count">{{ displayCount | number }}</div>
      <div class="card-label">{{ card.label }}</div>

      <div class="card-change" [ngClass]="changeClass">
        <mat-icon>{{ changeIcon }}</mat-icon>
        <span>{{ changePct > 0 ? '+' : '' }}{{ changePct }}% vs yesterday</span>
      </div>
    </div>
  `,
  styleUrls: ['./stage-card.component.scss']
})
export class StageCardComponent implements OnChanges, OnDestroy {
  @Input() card: StageCount;

  displayCount = 0;
  changePct    = 0;
  changeClass  = 'flat';
  changeIcon   = 'trending_flat';

  private timer: any;

  constructor(private cdr: ChangeDetectorRef) {}

  ngOnChanges(changes: SimpleChanges) {
    if (changes.card && this.card) {
      this.animateCount();
    }
  }

  private animateCount() {
    clearInterval(this.timer);

    const target = this.card.count;
    const prev   = this.card.previousCount;

    this.changePct  = prev > 0 ? Math.round(((target - prev) / prev) * 100) : 0;
    this.changeClass = this.changePct > 0 ? 'up' : this.changePct < 0 ? 'down' : 'flat';
    this.changeIcon  = this.changePct > 0 ? 'trending_up' : this.changePct < 0 ? 'trending_down' : 'trending_flat';

    const steps    = 40;
    const duration = 900;
    const stepMs   = duration / steps;
    let   step     = 0;

    this.displayCount = 0;
    this.cdr.detectChanges();

    this.timer = setInterval(() => {
      step++;
      // Ease-out cubic
      const t = step / steps;
      const ease = 1 - Math.pow(1 - t, 3);
      this.displayCount = Math.round(ease * target);
      this.cdr.detectChanges();

      if (step >= steps) {
        this.displayCount = target;
        this.cdr.detectChanges();
        clearInterval(this.timer);
      }
    }, stepMs);
  }

  ngOnDestroy() { clearInterval(this.timer); }
}
