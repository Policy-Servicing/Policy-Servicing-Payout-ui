import {
  Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef
} from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MatDialog, MatSnackBar } from '@angular/material';

import { ManualProcessingService } from '../services/manual-processing.service';
import { AuditService }            from '../services/audit.service';
import { AuthService }             from '../../../core/auth/auth.service';
import { PolicyDetail }            from '../models/policy-detail.model';
import { AuditPayload }            from '../models/process-request.model';
import {
  ConfirmActionDialogComponent,
  ConfirmDialogData
} from './confirm-action-dialog/confirm-action-dialog.component';

const RECENT_KEY = 'ps_recent_lookups';
const MAX_RECENT = 5;

@Component({
  selector: 'app-manual-processing',
  templateUrl: './manual-processing.component.html',
  styleUrls:  ['./manual-processing.component.scss'],
  changeDetection: ChangeDetectionStrategy.Default
})
export class ManualProcessingComponent implements OnInit {

  // ── Form ──────────────────────────────────────────────────────────────────
  lookupForm = new FormGroup({
    policyNo:  new FormControl('', Validators.required),
    requestId: new FormControl('', Validators.required)
  });

  remarks = new FormControl('');

  // ── State ─────────────────────────────────────────────────────────────────
  policyDetail: PolicyDetail | null = null;
  loading            = false;
  processing         = false;
  lookupError        = '';
  activeTabIndex     = 0;              // 0 = Approve, 1 = Sanction

  // ── Permissions ───────────────────────────────────────────────────────────
  canApprove  = false;
  canSanction = false;
  canView     = true;

  // ── Recent lookups ────────────────────────────────────────────────────────
  recentLookups: Array<{ policyNo: string; requestId: string }> = [];

  constructor(
    private svc:   ManualProcessingService,
    private audit: AuditService,
    private auth:  AuthService,
    private route: ActivatedRoute,
    private router: Router,
    private dialog: MatDialog,
    private snack:  MatSnackBar,
    private cdr:    ChangeDetectorRef
  ) {}

  ngOnInit() {
    // Role-based permissions
    // Existing roles: ADMIN (full access), VIEWER (read + approve only)
    const user = this.auth.currentUser;
    const role = user ? user.role : '';
    this.canApprove  = role === 'ADMIN' || role === 'VIEWER';
    this.canSanction = role === 'ADMIN';

    // Load recent lookups from localStorage
    this.loadRecentLookups();

    // Read URL query params and auto-search if present
    this.route.queryParamMap.subscribe(params => {
      const policyNo  = params.get('policyNo');
      const requestId = params.get('requestId');
      if (policyNo && requestId) {
        this.triggerSearch(policyNo, requestId);
      }
    });
  }

  // ── Search ────────────────────────────────────────────────────────────────
  onSearch() {
    this.lookupForm.get('policyNo').markAsTouched();
    this.lookupForm.get('requestId').markAsTouched();
    if (this.lookupForm.invalid) { return; }
    this.triggerSearch(
      this.lookupForm.get('policyNo').value,
      this.lookupForm.get('requestId').value
    );
  }

  triggerSearch(policyNo: string, requestId: string) {
    this.lookupForm.patchValue({ policyNo, requestId });
    this.policyDetail = null;
    this.lookupError  = '';
    this.loading      = true;

    this.svc.lookupPolicy(policyNo, requestId).subscribe(
      detail => {
        this.policyDetail = detail;
        this.loading      = false;
        this.saveRecentLookup(policyNo, requestId);
        this.router.navigate([], {
          queryParams: { policyNo, requestId },
          queryParamsHandling: 'merge'
        });
        this.cdr.markForCheck();
      },
      err => {
        this.loading = false;
        if (err && err.status === 404) {
          this.lookupError = 'No policy found for the given Policy Number and Request ID.';
        } else {
          this.lookupError = 'Unable to connect. Please check your connection.';
        }
        this.cdr.markForCheck();
      }
    );
  }

  onEnter() { this.onSearch(); }

  // ── Active action label ────────────────────────────────────────────────────
  get activeAction(): string {
    return this.activeTabIndex === 0 ? 'APPROVE' : 'SANCTION';
  }

  // ── Confirm Approve / Sanction ────────────────────────────────────────────
  onConfirm() {
    const policyNo  = this.lookupForm.get('policyNo').value;
    const requestId = this.lookupForm.get('requestId').value;
    const data: ConfirmDialogData = { policyNo, action: this.activeAction };

    const ref = this.dialog.open(ConfirmActionDialogComponent, {
      data,
      width: '440px',
      disableClose: true
    });

    ref.afterClosed().subscribe((confirmed: boolean) => {
      if (!confirmed) { return; }
      this.processing = true;

      this.svc.processPolicy(policyNo, requestId, this.activeAction, this.remarks.value || '').subscribe(
        resp => {
          this.processing = false;
          // Update stage in-place — no re-fetch
          if (this.policyDetail) {
            this.policyDetail.currentStage = 'PAID';
          }
          this.snack.open(
            'Policy ' + policyNo + ' processed successfully.',
            'Dismiss', { duration: 3000, panelClass: ['snack-success'] }
          );
          // Audit log
          const user = this.auth.currentUser;
          const payload: AuditPayload = {
            policyNo,
            requestId,
            actionTaken: this.activeAction,
            performedBy: user ? user.username : 'unknown',
            remarks: this.remarks.value || '',
            status: 'SUCCESS'
          };
          this.audit.logAction(payload).subscribe();
          this.cdr.markForCheck();
        },
        err => {
          this.processing = false;
          const msg = (err && err.message) ? err.message : 'Unknown error';
          this.snack.open(
            'Processing failed: ' + msg,
            'Dismiss', { duration: 5000, panelClass: ['snack-error'] }
          );
          this.cdr.markForCheck();
        }
      );
    });
  }

  resetForm() {
    this.lookupForm.reset();
    this.remarks.reset();
    this.policyDetail = null;
    this.lookupError  = '';
    this.router.navigate([], { queryParams: {} });
  }

  // ── Timeline helpers ───────────────────────────────────────────────────────
  daysAgo(entryDate: Date | null): number {
    if (!entryDate) { return 0; }
    return Math.floor((Date.now() - new Date(entryDate).getTime()) / 86400000);
  }

  stageDotClass(status: string): string {
    if (status === 'COMPLETED') { return 'timeline-dot timeline-dot-done'; }
    if (status === 'CURRENT')   { return 'timeline-dot timeline-dot-current'; }
    return 'timeline-dot timeline-dot-pending';
  }

  stageOpacity(status: string): number {
    return status === 'PENDING' ? 0.4 : 1;
  }

  // ── Badge class ───────────────────────────────────────────────────────────
  badgeClass(stage: string): string {
    const map: { [key: string]: string } = {
      EXTRACT:     'badge-extract',
      APPROVE:     'badge-approve',
      TECH_BUCKET: 'badge-techbucket',
      SANCTION:    'badge-sanction',
      PAID:        'badge-paid'
    };
    return map[stage] || 'badge-extract';
  }

  // ── Recent lookups ────────────────────────────────────────────────────────
  private loadRecentLookups() {
    try {
      const raw = localStorage.getItem(RECENT_KEY);
      this.recentLookups = raw ? JSON.parse(raw) : [];
    } catch (e) {
      this.recentLookups = [];
    }
  }

  private saveRecentLookup(policyNo: string, requestId: string) {
    this.recentLookups = this.recentLookups.filter(r => r.policyNo !== policyNo);
    this.recentLookups.unshift({ policyNo, requestId });
    if (this.recentLookups.length > MAX_RECENT) {
      this.recentLookups = this.recentLookups.slice(0, MAX_RECENT);
    }
    localStorage.setItem(RECENT_KEY, JSON.stringify(this.recentLookups));
  }

  onRecentChipClick(entry: { policyNo: string; requestId: string }) {
    this.triggerSearch(entry.policyNo, entry.requestId);
  }
}
