import { Component, OnInit, OnDestroy } from '@angular/core';
import { MatDialog } from '@angular/material';
import { Subject, interval } from 'rxjs';
import { takeUntil, startWith } from 'rxjs/operators';
import * as XLSX from 'xlsx';
import { DashboardService } from './dashboard.service';
import {
  Module, Product, StageSummary, StageCount,
  TrendPoint, Stage, PolicyRecord
} from '../../core/models/app.models';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls:  ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit, OnDestroy {
  modules: Module[]   = [];
  products: Product[] = [];
  summary: StageSummary;
  trendData: TrendPoint[] = [];

  selectedModule  = 'SB';
  selectedProduct = '';
  selectedDate    = 'TODAY';
  dateOptions     = [];
  loading         = false;
  refreshSeconds  = environment.autoRefreshSeconds;

  private destroy$ = new Subject<void>();

  // Drill-down
  drillRecords: PolicyRecord[] = [];
  drillStage: Stage;
  drillStageLabel = '';
  drillTotalCount = 0;
  drillPage   = 0;
  drillSize   = 10;
  drillOpen   = false;
  drillCols: string[] = [];   // populated dynamically from API response keys

  constructor(private svc: DashboardService, private dialog: MatDialog) {}

  ngOnInit() {
    this.dateOptions = this.svc.getDateRangeOptions();
    this.svc.getModules().subscribe(m => {
      this.modules = m;
      this.onModuleChange();
    });
    this.startAutoRefresh();
  }

  startAutoRefresh() {
    interval(this.refreshSeconds * 1000).pipe(
      takeUntil(this.destroy$),
      startWith(0)
    ).subscribe(() => this.loadData());
  }

  loadData() {
    this.loading = true;
    this.svc.getStageSummary(this.selectedModule, this.selectedProduct)
      .subscribe(s => { this.summary = s; this.loading = false; });
    this.svc.getTrend(this.selectedModule)
      .subscribe(t => this.trendData = t);
  }

  onModuleChange() {
    this.selectedProduct = '';
    this.svc.getProducts(this.selectedModule).subscribe(p => {
      this.products = p;
      this.loadData();
    });
  }

  onProductChange()  { this.loadData(); }
  onDateChange()     { this.loadData(); }

  openDrillDown(card: StageCount) {
    this.drillStage      = card.stage;
    this.drillStageLabel = card.label;
    this.drillPage       = 0;
    this.drillOpen       = true;
    this.loadDrillPage();
  }

  loadDrillPage() {
    this.svc.getDrillDown(this.drillStage, this.selectedModule, this.selectedProduct, this.drillPage, this.drillSize)
      .subscribe(r => {
        this.drillRecords  = r.records;
        this.drillTotalCount = r.totalCount;
        // ── Derive columns dynamically from the first record returned by the API ──
        if (r.records && r.records.length > 0) {
          this.drillCols = Object.keys(r.records[0]);
        }
      });
  }

  onDrillPageChange(e: any) {
    this.drillPage = e.pageIndex;
    this.drillSize = e.pageSize;
    this.loadDrillPage();
  }

  // ── Helper: convert any key format → readable Title Case header ────────────
  // Examples:
  //   'policy_no'      → 'Policy No'
  //   'holderName'     → 'Holder Name'
  //   'POLICY_NO'      → 'Policy No'
  //   'annuity_amount' → 'Annuity Amount'
  public toHeader(key: string): string {
    return key
      .replace(/_/g, ' ')                          // underscores → spaces
      .replace(/([a-z])([A-Z])/g, '$1 $2')         // camelCase → words
      .toLowerCase()
      .replace(/\b\w/g, c => c.toUpperCase());      // Title Case every word
  }

  // ── Helper: detect dates for dynamic HTML table formatting
  public isDate(val: any): boolean {
    if (val instanceof Date) return true;
    if (typeof val === 'string' && /^\d{4}-\d{2}-\d{2}/.test(val)) return true;
    return false;
  }

  exportExcel() {
    if (!this.drillRecords || this.drillRecords.length === 0) {
      return; // Nothing to export
    }

    // ── Derive column keys from the FIRST record returned by the API ──────────
    // Works for any module/table — no hardcoding needed.
    const keys    = Object.keys(this.drillRecords[0]);
    const headers = keys.map(k => this.toHeader(k));

    // ── Build data rows ───────────────────────────────────────────────────────
    const rows = this.drillRecords.map(record =>
      keys.map(key => {
        const val = (record as any)[key];
        // Auto-detect date strings / Date objects and format them
        if (val instanceof Date) {
          return val.toLocaleDateString('en-IN');
        }
        if (typeof val === 'string' && /^\d{4}-\d{2}-\d{2}/.test(val)) {
          return new Date(val).toLocaleDateString('en-IN');
        }
        return val !== undefined && val !== null ? val : '';
      })
    );

    // ── Build worksheet ───────────────────────────────────────────────────────
    const ws = XLSX.utils.aoa_to_sheet([headers, ...rows]);

    // Auto-fit each column width to the widest cell
    ws['!cols'] = headers.map((h, i) => ({
      wch: Math.max(h.length + 2, ...rows.map(r => String(r[i] || '').length + 2))
    }));

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, this.drillStageLabel || 'Data');
    const fileName = `${this.selectedModule}_${this.drillStageLabel}_${new Date().toISOString().slice(0, 10)}.xlsx`;
    XLSX.writeFile(wb, fileName);
  }

  ngOnDestroy() { this.destroy$.next(); this.destroy$.complete(); }
}
