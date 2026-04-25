import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { delay, map } from 'rxjs/operators';
import {
  Module, Product, StageSummary, StageCount, Stage,
  TrendPoint, PolicyRecord, DrillDownResponse, DateRangeOption, AuditLog
} from '../../core/models/app.models';
import {
  MOCK_MODULES, MOCK_PRODUCTS,
  buildStageCounts, buildTrendData, buildPolicyRecords
} from '../../mock-data/mock-data';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class DashboardService {

  private apiUrl = environment.apiUrl;
  private useRealApi = environment.useRealApi;

  constructor(private http: HttpClient) {}

  // ── Modules ──────────────────────────────────────────────────────────────

  getModules(): Observable<Module[]> {
    if (this.useRealApi) {
      return this.http.get<any[]>(`${this.apiUrl}/modules`).pipe(
        map(list => list.map(m => ({ code: m.moduleCode || m.code, name: m.moduleName || m.name })))
      );
    }
    return of(MOCK_MODULES).pipe(delay(300));
  }

  // ── Products ─────────────────────────────────────────────────────────────

  getProducts(moduleCode: string): Observable<Product[]> {
    if (this.useRealApi) {
      const params = new HttpParams().set('module', moduleCode);
      return this.http.get<Product[]>(`${this.apiUrl}/products`, { params });
    }
    const products = MOCK_PRODUCTS.filter(p => p.moduleCode === moduleCode);
    return of(products).pipe(delay(200));
  }

  getAllProducts(): Observable<Product[]> {
    if (this.useRealApi) {
      return this.http.get<Product[]>(`${this.apiUrl}/products`);
    }
    return of(MOCK_PRODUCTS).pipe(delay(200));
  }

  // ── Stage Summary ─────────────────────────────────────────────────────────

  getStageSummary(module: string, productId?: string): Observable<StageSummary> {
    if (this.useRealApi) {
      let params = new HttpParams()
        .set('module', module)
        .set('dateRange', 'TODAY');
      if (productId) { params = params.set('productId', productId); }
      return this.http
        .get<StageSummary>(`${this.apiUrl}/stage-counts`, { params });
    }

    // ── Mock fallback ──────────────────────────────────────────────────────
    const stageCounts = buildStageCounts(module);
    const totalPending = stageCounts
      .filter(s => s.stage !== 'PAID')
      .reduce((sum, s) => sum + s.count, 0);
    const summary: StageSummary = {
      module,
      productId: productId || 'ALL',
      dateRange: 'TODAY',
      stageCounts,
      totalPending,
      totalAmount: Math.round(totalPending * 42500),
      slaBreaches: stageCounts.reduce((sum, s) => sum + s.agingCount, 0),
      lastUpdated: new Date()
    };
    return of(summary).pipe(delay(600));
  }

  // ── Trend ─────────────────────────────────────────────────────────────────

  getTrend(module: string, days = 7): Observable<TrendPoint[]> {
    if (this.useRealApi) {
      const params = new HttpParams()
        .set('module', module)
        .set('days', String(days));
      return this.http.get<TrendPoint[]>(`${this.apiUrl}/trend`, { params });
    }
    return of(buildTrendData(module)).pipe(delay(400));
  }

  // ── Drill-Down ────────────────────────────────────────────────────────────

  getDrillDown(
    stage: Stage,
    module: string,
    productId?: string,
    page = 0,
    size = 10
  ): Observable<DrillDownResponse> {
    if (this.useRealApi) {
      let params = new HttpParams()
        .set('stage',  stage)
        .set('module', module)
        .set('page',   String(page))
        .set('size',   String(size));
      if (productId) { params = params.set('productId', productId); }
      return this.http.get<DrillDownResponse>(`${this.apiUrl}/stage-drill`, { params });
    }

    // ── Mock fallback ──────────────────────────────────────────────────────
    const allRecords = buildPolicyRecords(stage, module, productId)
      .filter(r => r.stage === stage);
    const start   = page * size;
    const records = allRecords.slice(start, start + size);
    return of({ stage, records, totalCount: allRecords.length, page, size }).pipe(delay(500));
  }

  // ── Audit Logs (new — calls real backend only) ────────────────────────────

  /**
   * Returns recent PKG_PS_DASHBOARD call logs from PS_API_CALL_LOG.
   * Only returns data when Spring Boot has app.use-oracle-package=true.
   * Falls back to empty array when useRealApi=false (dev/mock mode).
   */
  getAuditLogs(module?: string, limit = 100): Observable<AuditLog[]> {
    if (!this.useRealApi) {
      return of([]);
    }
    let params = new HttpParams().set('limit', String(limit));
    if (module) { params = params.set('module', module); }
    return this.http.get<AuditLog[]>(`${this.apiUrl}/audit-logs`, { params });
  }

  // ── Utilities ─────────────────────────────────────────────────────────────

  getDateRangeOptions(): DateRangeOption[] {
    return [
      { label: 'Today',        value: 'TODAY'      },
      { label: 'Yesterday',    value: 'YESTERDAY'  },
      { label: 'Last 7 days',  value: 'LAST_7'     },
      { label: 'Last 30 days', value: 'LAST_30'    },
      { label: 'This Month',   value: 'THIS_MONTH' }
    ];
  }
}
