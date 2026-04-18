import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'relativeTime' })
export class RelativeTimePipe implements PipeTransform {
  transform(value: Date | string | null): string {
    if (!value) { return '—'; }
    const date = value instanceof Date ? value : new Date(value);
    const now  = new Date();
    const diffMs = now.getTime() - date.getTime();
    const secs = Math.floor(diffMs / 1000);
    if (secs < 60)  { return `${secs}s ago`; }
    const mins = Math.floor(secs / 60);
    if (mins < 60)  { return `${mins}m ago`; }
    const hrs  = Math.floor(mins / 60);
    if (hrs  < 24)  { return `${hrs}h ago`; }
    const days = Math.floor(hrs / 24);
    if (days < 7)   { return `${days}d ago`; }
    return date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  }
}
