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
  drillCols   = ['policyNo','holderName','productId','amount','agingDays','status','enteredAt'];

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
      .subscribe(r => { this.drillRecords = r.records; this.drillTotalCount = r.totalCount; });
  }

  onDrillPageChange(e: any) {
    this.drillPage = e.pageIndex;
    this.drillSize = e.pageSize;
    this.loadDrillPage();
  }

  exportExcel() {
    const headers = ['Policy No', 'Holder Name', 'Product ID', 'Amount (₹)', 'Aging (Days)', 'Status', 'Entered At'];
    const rows = this.drillRecords.map(r => [
      r.policyNo, r.holderName, r.productId,
      r.amount, r.agingDays, r.status,
      new Date(r.enteredAt).toLocaleDateString('en-IN')
    ]);
    const ws = XLSX.utils.aoa_to_sheet([headers, ...rows]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, this.drillStageLabel);
    XLSX.writeFile(wb, `${this.drillStageLabel}_${this.selectedModule}_${new Date().toISOString().slice(0, 10)}.xlsx`);
  }

  ngOnDestroy() { this.destroy$.next(); this.destroy$.complete(); }
}
