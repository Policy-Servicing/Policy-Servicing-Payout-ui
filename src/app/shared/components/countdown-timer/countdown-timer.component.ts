import { Component, Input, OnChanges, OnDestroy, SimpleChanges } from '@angular/core';

@Component({
  selector: 'app-countdown-timer',
  template: `
    <div class="countdown">
      <mat-icon>refresh</mat-icon>
      <span>Auto-refresh in <strong>{{ timeLeft }}s</strong></span>
    </div>
  `,
  styles: [`
    .countdown {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 12px;
      color: #64748B;
      mat-icon { font-size: 14px; width:14px; height:14px; animation: spin 2s linear infinite; }
    }
    @keyframes spin { 100% { transform: rotate(360deg); } }
  `]
})
export class CountdownTimerComponent implements OnChanges, OnDestroy {
  @Input() seconds = 60;

  timeLeft = 60;
  private timer: any;

  ngOnChanges(c: SimpleChanges) {
    if (c.seconds) { this.start(); }
  }

  start() {
    clearInterval(this.timer);
    this.timeLeft = this.seconds;
    this.timer = setInterval(() => {
      this.timeLeft--;
      if (this.timeLeft <= 0) { this.timeLeft = this.seconds; }
    }, 1000);
  }

  ngOnDestroy() { clearInterval(this.timer); }
}
