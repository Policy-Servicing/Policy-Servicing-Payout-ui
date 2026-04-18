import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay, map } from 'rxjs/operators';
import {
  Module, Product, StageSummary, StageCount, Stage,
  TrendPoint, PolicyRecord, DrillDownResponse, DateRangeOption
} from '../../core/models/app.models';
import {
  MOCK_MODULES, MOCK_PRODUCTS,
  buildStageCounts, buildTrendData, buildPolicyRecords
} from '../../mock-data/mock-data';

@Injectable({ providedIn: 'root' })
export class DashboardService {

  getModules(): Observable<Module[]> {
    return of(MOCK_MODULES).pipe(delay(300));
  }

  getProducts(moduleCode: string): Observable<Product[]> {
    const products = MOCK_PRODUCTS.filter(p => p.moduleCode === moduleCode);
    return of(products).pipe(delay(200));
  }

  getAllProducts(): Observable<Product[]> {
    return of(MOCK_PRODUCTS).pipe(delay(200));
  }

  getStageSummary(module: string, productId?: string): Observable<StageSummary> {
    const stageCounts = buildStageCounts(module);
    const totalPending = stageCounts.filter(s => s.stage !== 'PAID').reduce((sum, s) => sum + s.count, 0);
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

  getTrend(module: string, days = 7): Observable<TrendPoint[]> {
    return of(buildTrendData(module)).pipe(delay(400));
  }

  getDrillDown(stage: Stage, module: string, productId?: string, page = 0, size = 10): Observable<DrillDownResponse> {
    const allRecords = buildPolicyRecords(stage, module, productId)
      .filter(r => r.stage === stage);
    const start = page * size;
    const records = allRecords.slice(start, start + size);
    return of({ stage, records, totalCount: allRecords.length, page, size }).pipe(delay(500));
  }

  getDateRangeOptions(): DateRangeOption[] {
    return [
      { label: 'Today',        value: 'TODAY'     },
      { label: 'Yesterday',    value: 'YESTERDAY'  },
      { label: 'Last 7 days',  value: 'LAST_7'    },
      { label: 'Last 30 days', value: 'LAST_30'   },
      { label: 'This Month',   value: 'THIS_MONTH' }
    ];
  }
}
