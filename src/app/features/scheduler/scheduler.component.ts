import { Component, OnInit } from '@angular/core';
import { MatDialog, MatSnackBar } from '@angular/material';
import { SchedulerService }  from './scheduler.service';
import { AuthService }       from '../../core/auth/auth.service';
import {
  Scheduler, RunHistory, SchedulerStatus, SchedulerFilterState
} from '../../core/models/app.models';
import {
  ConfirmationDialogComponent, ConfirmData
} from '../../shared/components/confirmation-dialog/confirmation-dialog.component';

@Component({
  selector: 'app-scheduler',
  templateUrl: './scheduler.component.html',
  styleUrls:   ['./scheduler.component.scss']
})
export class SchedulerComponent implements OnInit {
  allSchedulers: Scheduler[] = [];
  filtered:      Scheduler[] = [];

  filters: SchedulerFilterState = { search: '', status: 'ALL', moduleCode: '' };

  statusOptions = ['ALL', 'RUNNING', 'SUCCESS', 'FAILED', 'IDLE', 'DISABLED'];
  moduleOptions = ['', 'SB', 'MAT', 'ANN', 'SUR', 'DC'];
  moduleNames   = { '': 'All Modules', SB: 'Survival Benefit', MAT: 'Maturity', ANN: 'Annuity', SUR: 'Surrender', DC: 'Death Claim' };

  columns = ['name', 'moduleCode', 'status', 'lastRunTime', 'nextRunTime', 'cronExpression', 'recordsProcessed', 'duration', 'actions'];

  // History drawer
  historyOpen = false;
  selectedScheduler: Scheduler;
  runHistory: RunHistory[] = [];
  historyColumns = ['runTime', 'status', 'recordsProcessed', 'duration', 'triggeredBy', 'errorMessage'];

  // Cron editor
  editingCron   = false;
  cronDraft     = '';
  cronError     = '';

  isAdmin      = false;
  searchFocused = false;

  constructor(
    private svc:    SchedulerService,
    private auth:   AuthService,
    private dialog: MatDialog,
    private snack:  MatSnackBar
  ) {}

  ngOnInit() {
    this.isAdmin = this.auth.isAdmin;
    this.load();
  }

  load() {
    this.svc.getSchedulers().subscribe(list => {
      this.allSchedulers = list;
      this.applyFilters();
    });
  }

  applyFilters() {
    const { search, status, moduleCode } = this.filters;
    this.filtered = this.allSchedulers.filter(s => {
      const matchSearch = !search || s.name.toLowerCase().includes(search.toLowerCase())
        || s.jobClass.toLowerCase().includes(search.toLowerCase());
      const matchStatus = status === 'ALL' || s.status === status;
      const matchModule = !moduleCode || s.moduleCode === moduleCode;
      return matchSearch && matchStatus && matchModule;
    });
  }

  openHistory(s: Scheduler) {
    this.selectedScheduler = s;
    this.cronDraft         = s.cronExpression;
    this.editingCron       = false;
    this.historyOpen       = true;
    this.svc.getRunHistory(s.id).subscribe(h => this.runHistory = h);
  }

  triggerNow(s: Scheduler, e: MouseEvent) {
    e.stopPropagation();
    const data: ConfirmData = {
      title: 'Trigger Job Now',
      message: `Run "${s.name}" immediately?`,
      confirmText: 'Run Now',
      type: 'info'
    };
    this.dialog.open(ConfirmationDialogComponent, { data }).afterClosed().subscribe(ok => {
      if (!ok) { return; }
      this.svc.triggerNow(s.id).subscribe(() => {
        this.snack.open(`${s.name} triggered successfully`, '✓', { duration: 3000, panelClass: ['success-snack'] });
        this.load();
      });
    });
  }

  toggleScheduler(s: Scheduler, e: MouseEvent) {
    e.stopPropagation();
    if (!this.isAdmin) { return; }
    const action = s.enabled ? 'Disable' : 'Enable';
    const data: ConfirmData = {
      title: `${action} Scheduler`,
      message: `${action} "${s.name}"?`,
      confirmText: action,
      type: s.enabled ? 'warn' : 'info'
    };
    this.dialog.open(ConfirmationDialogComponent, { data }).afterClosed().subscribe(ok => {
      if (!ok) { return; }
      this.svc.toggle(s.id).subscribe(() => {
        this.snack.open(`${s.name} ${action.toLowerCase()}d`, '✓', { duration: 3000 });
        this.load();
      });
    });
  }

  saveCron() {
    if (!this.cronDraft.trim()) { this.cronError = 'Cron expression is required'; return; }
    this.cronError = '';
    this.svc.updateCron(this.selectedScheduler.id, this.cronDraft).subscribe(updated => {
      this.selectedScheduler = updated;
      this.editingCron = false;
      this.snack.open('Cron updated', '✓', { duration: 2500 });
      this.load();
    });
  }

  formatDuration(ms: number): string {
    if (!ms) { return '—'; }
    if (ms < 1000)  { return `${ms}ms`; }
    if (ms < 60000) { return `${(ms / 1000).toFixed(1)}s`; }
    return `${(ms / 60000).toFixed(1)}m`;
  }
}
