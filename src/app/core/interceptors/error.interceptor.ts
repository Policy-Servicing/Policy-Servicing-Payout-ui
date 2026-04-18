import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { MatSnackBar } from '@angular/material';
import { Router } from '@angular/router';

@Injectable()
export class ErrorInterceptor implements HttpInterceptor {
  constructor(private snackBar: MatSnackBar, private router: Router) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return next.handle(req).pipe(
      catchError((err: HttpErrorResponse) => {
        let message = 'An unexpected error occurred';
        if (err.status === 401) {
          message = 'Session expired. Please login again.';
          this.router.navigate(['/login']);
        } else if (err.status === 403) {
          message = 'Access denied. Insufficient permissions.';
        } else if (err.status === 404) {
          message = 'Resource not found.';
        } else if (err.status === 500) {
          message = 'Server error. Please try again later.';
        } else if (err.error && err.error.message) {
          message = err.error.message;
        }
        this.snackBar.open(message, 'Dismiss', {
          duration: 4000,
          panelClass: ['error-snack']
        });
        return throwError(err);
      })
    );
  }
}
