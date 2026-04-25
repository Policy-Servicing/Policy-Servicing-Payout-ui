import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { Observable, throwError, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { PolicyDetail, StageHistory } from '../models/policy-detail.model';
import { ProcessResponse } from '../models/process-request.model';
import { environment } from '../../../../environments/environment';

// ── Mock data for development (useMockData = true) ──────────────────────────
const MOCK_POLICY: PolicyDetail = {
  policyNo: 'PLY-SB-001234',
  requestId: 'REQ-2024-56789',
  moduleName: 'Survival Benefit',
  customerName: 'Ravi Kumar',
  productId: 'SB001',
  currentStage: 'APPROVE',
  payoutAmount: 125000,
  dateOfCommencement: new Date('2019-06-15'),
  maturityDate: new Date('2029-06-15'),
  stageHistory: [
    { stageName: 'EXTRACT', status: 'COMPLETED', completedAt: new Date('2024-04-10T06:30:00'), entryDate: new Date('2024-04-10T06:00:00') },
    { stageName: 'APPROVE', status: 'CURRENT', completedAt: null, entryDate: new Date('2024-04-14T09:00:00') },
    { stageName: 'TECH_BUCKET', status: 'PENDING', completedAt: null, entryDate: null },
    { stageName: 'SANCTION', status: 'PENDING', completedAt: null, entryDate: null },
    { stageName: 'PAID', status: 'PENDING', completedAt: null, entryDate: null }
  ]
};

@Injectable({ providedIn: 'root' })
export class ManualProcessingService {
  private baseUrl = '/api/v1/manual-processing';

  constructor(private http: HttpClient) { }

  lookupPolicy(policyNo: string, requestId: string): Observable<PolicyDetail> {
    if (environment.useMockData) {
      // Simulate a 404 for unrecognised IDs in mock mode
      if (policyNo !== 'PLY-SB-001234') {
        return throwError({ status: 404, message: 'Policy not found' });
      }
      return of(MOCK_POLICY);
    }
    const params = new HttpParams()
      .set('policyNo', policyNo)
      .set('requestId', requestId);
    return this.http.get<PolicyDetail>(this.baseUrl + '/lookup', { params }).pipe(
      catchError((err: HttpErrorResponse) => this.handleError(err))
    );
  }

  processPolicy(
    policyNo: string,
    requestId: string,
    action: string,
    remarks: string
  ): Observable<ProcessResponse> {
    if (environment.useMockData) {
      const resp: ProcessResponse = {
        status: 'SUCCESS',
        message: 'Policy processed successfully.',
        newStage: 'PAID',
        processedAt: new Date()
      };
      return of(resp);
    }
    return this.http.post<ProcessResponse>(
      this.baseUrl + '/process',
      { policyNo, requestId, action, remarks }
    ).pipe(
      catchError((err: HttpErrorResponse) => this.handleError(err))
    );
  }

  private handleError(err: HttpErrorResponse): Observable<never> {
    const msg = (err.error && err.error.message) ? err.error.message : 'An unexpected error occurred.';
    return throwError({ status: err.status, message: msg });
  }
}
