import { Injectable } from '@angular/core';
import { Observable, of, BehaviorSubject } from 'rxjs';
import { delay, tap } from 'rxjs/operators';
import { Scheduler, RunHistory, SchedulerStatus } from '../../core/models/app.models';
import { MOCK_SCHEDULERS, buildRunHistory } from '../../mock-data/mock-data';

@Injectable({ providedIn: 'root' })
export class SchedulerService {
  private schedulers: Scheduler[] = JSON.parse(JSON.stringify(MOCK_SCHEDULERS));

  getSchedulers(): Observable<Scheduler[]> {
    return of(this.schedulers).pipe(delay(400));
  }

  getScheduler(id: string): Observable<Scheduler> {
    return of(this.schedulers.find(s => s.id === id)!).pipe(delay(200));
  }

  getRunHistory(id: string, limit = 10): Observable<RunHistory[]> {
    return of(buildRunHistory(id).slice(0, limit)).pipe(delay(300));
  }

  triggerNow(id: string): Observable<{ success: boolean; message: string }> {
    return of({ success: true, message: 'Job triggered successfully' }).pipe(
      delay(800),
      tap(() => {
        const s = this.schedulers.find(sch => sch.id === id);
        if (s) {
          s.status = 'RUNNING';
          s.lastRunTime = new Date();
          s.lastRunStatus = 'RUNNING';
        }
      })
    );
  }

  toggle(id: string): Observable<Scheduler> {
    const s = this.schedulers.find(sch => sch.id === id);
    if (s) {
      s.enabled = !s.enabled;
      s.status = s.enabled ? 'IDLE' : 'DISABLED';
    }
    return of(s!).pipe(delay(400));
  }

  updateCron(id: string, cronExpression: string): Observable<Scheduler> {
    const s = this.schedulers.find(sch => sch.id === id);
    if (s) { s.cronExpression = cronExpression; }
    return of(s!).pipe(delay(300));
  }
}
