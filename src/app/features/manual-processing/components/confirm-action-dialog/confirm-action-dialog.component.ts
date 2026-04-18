import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';

export interface ConfirmDialogData {
  policyNo: string;
  action: string;
}

@Component({
  selector: 'app-confirm-action-dialog',
  template: `
    <div class="dialog-container">
      <div class="dialog-header">
        <mat-icon class="warn-icon">warning</mat-icon>
        <h2>Confirm {{ data.action | titlecase }}</h2>
      </div>
      <div class="dialog-body">
        <p>
          Are you sure? This will trigger auto-payout for policy
          <strong>{{ data.policyNo }}</strong>.
        </p>
        <p class="sub-text">This action cannot be reversed.</p>
      </div>
      <div class="dialog-actions">
        <button mat-button (click)="cancel()">Cancel</button>
        <button mat-raised-button color="warn" (click)="confirm()">
          Yes, Proceed
        </button>
      </div>
    </div>
  `,
  styles: [`
    .dialog-container { padding: 28px 28px 20px; min-width: 380px; font-family: 'Inter', sans-serif; }
    .dialog-header { display: flex; align-items: center; gap: 12px; margin-bottom: 16px; }
    .dialog-header h2 { margin: 0; font-size: 18px; font-weight: 700; color: #1E293B; }
    .warn-icon { color: #D97706; font-size: 28px; width: 28px; height: 28px; }
    .dialog-body p { font-size: 14px; color: #475569; margin-bottom: 8px; line-height: 1.6; }
    .dialog-body .sub-text { font-size: 12px; color: #94A3B8; margin-bottom: 0; }
    .dialog-actions { display: flex; justify-content: flex-end; gap: 10px; margin-top: 24px; padding-top: 16px; border-top: 1px solid #F1F5F9; }
  `]
})
export class ConfirmActionDialogComponent {
  constructor(
    private dialogRef: MatDialogRef<ConfirmActionDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: ConfirmDialogData
  ) {}

  confirm() { this.dialogRef.close(true); }
  cancel()  { this.dialogRef.close(false); }
}
