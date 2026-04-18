import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'cronHuman' })
export class CronHumanPipe implements PipeTransform {
  transform(cron: string): string {
    if (!cron) { return '—'; }
    const parts = cron.trim().split(/\s+/);
    if (parts.length < 6) { return cron; }
    const [sec, min, hr, dom, mon, dow] = parts;

    if (min === '*/30' && hr === '*')           { return 'Every 30 minutes'; }
    if (min === '0'    && hr === '*')           { return 'Every hour'; }
    if (dom === '*'    && dow === '?')          {
      const h = parseInt(hr, 10);
      return `Daily at ${this.fmt(h, parseInt(min, 10))}`;
    }
    if (dow === 'MON-FRI') {
      const h = parseInt(hr, 10);
      return `Weekdays at ${this.fmt(h, parseInt(min, 10))}`;
    }
    if (dom === '1') {
      return `Monthly on 1st at ${this.fmt(parseInt(hr,10), parseInt(min,10))}`;
    }
    return cron;
  }

  private fmt(h: number, m: number): string {
    const ampm = h >= 12 ? 'PM' : 'AM';
    const hour = h % 12 || 12;
    const mins = m.toString().padStart(2, '0');
    return `${hour}:${mins} ${ampm}`;
  }
}
