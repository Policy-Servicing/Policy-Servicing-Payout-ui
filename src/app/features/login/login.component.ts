import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../../core/auth/auth.service';

@Component({
  selector: 'app-login',
  template: `
    <div class="login-page">
      <!-- Left Branding Panel -->
      <div class="login-left">
        <div class="brand">
          <div class="brand-icon-wrap">
            <mat-icon>shield</mat-icon>
          </div>
          <h1>PolicyServe</h1>
          <p>Operations Dashboard</p>
        </div>
        <div class="features">
          <div class="feature-item">
            <div class="feat-icon"><mat-icon>dashboard</mat-icon></div>
            <div class="feat-text">
              <strong>Real-time Dashboard</strong>
              <span>Monitor payout stages at a glance</span>
            </div>
          </div>
          <div class="feature-item">
            <div class="feat-icon"><mat-icon>schedule</mat-icon></div>
            <div class="feat-text">
              <strong>Scheduler Control</strong>
              <span>Manage and trigger batch jobs</span>
            </div>
          </div>
          <div class="feature-item">
            <div class="feat-icon"><mat-icon>insights</mat-icon></div>
            <div class="feat-text">
              <strong>Trend Analytics</strong>
              <span>7-day stage-wise trend charts</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Right Form Panel -->
      <div class="login-right">
        <div class="login-card">
          <h2>Welcome back</h2>
          <p class="subtitle">Sign in to your PolicyServe account</p>

          <div class="demo-hint">
            <mat-icon>info_outline</mat-icon>
            <span>Demo — username: <strong>admin</strong> or <strong>viewer</strong> &nbsp;·&nbsp; password: <strong>password</strong></span>
          </div>

          <form [formGroup]="form" (ngSubmit)="onSubmit()" novalidate>

            <!-- Username Field -->
            <div class="field-group">
              <label for="username">Username</label>
              <div class="input-wrap" [class.focused]="userFocused" [class.has-error]="submitted && form.get('username').invalid">
                <mat-icon class="input-icon">person_outline</mat-icon>
                <input
                  id="username"
                  type="text"
                  formControlName="username"
                  placeholder="Enter your username"
                  autocomplete="username"
                  (focus)="userFocused=true"
                  (blur)="userFocused=false"
                />
              </div>
              <span class="field-error" *ngIf="submitted && form.get('username').hasError('required')">
                Username is required
              </span>
            </div>

            <!-- Password Field -->
            <div class="field-group">
              <label for="password">Password</label>
              <div class="input-wrap" [class.focused]="pwdFocused" [class.has-error]="submitted && form.get('password').invalid">
                <mat-icon class="input-icon">lock_outline</mat-icon>
                <input
                  id="password"
                  [type]="showPwd ? 'text' : 'password'"
                  formControlName="password"
                  placeholder="Enter your password"
                  autocomplete="current-password"
                  (focus)="pwdFocused=true"
                  (blur)="pwdFocused=false"
                />
                <button type="button" class="pwd-toggle" (click)="showPwd=!showPwd" tabindex="-1">
                  <mat-icon>{{ showPwd ? 'visibility_off' : 'visibility' }}</mat-icon>
                </button>
              </div>
              <span class="field-error" *ngIf="submitted && form.get('password').hasError('required')">
                Password is required
              </span>
            </div>

            <!-- API Error -->
            <div class="error-banner" *ngIf="errorMsg">
              <mat-icon>error_outline</mat-icon>
              <span>{{ errorMsg }}</span>
            </div>

            <!-- Submit -->
            <button class="login-btn" type="submit" [disabled]="loading">
              <mat-spinner *ngIf="loading" diameter="18" class="btn-spinner"></mat-spinner>
              <span *ngIf="!loading">Sign In</span>
            </button>

          </form>
        </div>
      </div>
    </div>
  `,
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
  form: FormGroup;
  loading   = false;
  showPwd   = false;
  errorMsg  = '';
  submitted = false;
  userFocused = false;
  pwdFocused  = false;
  returnUrl = '/dashboard';

  constructor(
    private fb: FormBuilder,
    private auth: AuthService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    if (this.auth.isLoggedIn) { this.router.navigate(['/dashboard']); }
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/dashboard';
    this.form = this.fb.group({
      username: ['', Validators.required],
      password: ['', Validators.required]
    });
  }

  onSubmit() {
    this.submitted = true;
    if (this.form.invalid) { return; }
    this.loading  = true;
    this.errorMsg = '';
    this.auth.login(this.form.value).subscribe(
      () => this.router.navigate([this.returnUrl]),
      err => { this.loading = false; this.errorMsg = err.message || 'Invalid credentials. Please try again.'; }
    );
  }
}
