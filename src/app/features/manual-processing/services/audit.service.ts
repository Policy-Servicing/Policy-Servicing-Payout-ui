import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { AuditPayload } from '../models/process-request.model';
import { environment } from '../../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class AuditService {
  private auditUrl = '/api/v1/audit/log';

  constructor(private http: HttpClient) {}

  logAction(payload: AuditPayload): Observable<any> {
    if (environment.useMockData) {
      console.log('[AuditService] Mock audit log:', payload);
      return of({ status: 'OK' });
    }
    return this.http.post(this.auditUrl, payload).pipe(
      catchError(err => {
        console.error('[AuditService] Failed to write audit log:', err);
        return of(null);
      })
    );
  }
}
