import { NgModule }       from '@angular/core';
import { BrowserModule }  from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';

import { AppRoutingModule }  from './app-routing.module';
import { AppComponent }      from './app.component';
import { SharedModule }      from './shared/shared.module';
import { LayoutModule }      from './layout/layout.module';

import { AuthInterceptor }    from './core/auth/auth.interceptor';
import { ErrorInterceptor }   from './core/interceptors/error.interceptor';
import { LoadingInterceptor } from './core/interceptors/loading.interceptor';

import { LoginComponent }     from './features/login/login.component';
import { DashboardComponent } from './features/dashboard/dashboard.component';
import { SchedulerComponent } from './features/scheduler/scheduler.component';

import {
  MatSnackBarModule, MatProgressSpinnerModule, MatButtonModule, MatInputModule,
  MatFormFieldModule, MatSelectModule, MatIconModule, MatDividerModule
} from '@angular/material';

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    DashboardComponent,
    SchedulerComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    HttpClientModule,
    FormsModule,
    ReactiveFormsModule,
    AppRoutingModule,
    SharedModule,
    LayoutModule,
    MatSnackBarModule,
    MatProgressSpinnerModule,
    MatButtonModule,
    MatInputModule,
    MatFormFieldModule,
    MatSelectModule,
    MatIconModule,
    MatDividerModule
  ],
  providers: [
    { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor,    multi: true },
    { provide: HTTP_INTERCEPTORS, useClass: LoadingInterceptor, multi: true },
    { provide: HTTP_INTERCEPTORS, useClass: ErrorInterceptor,   multi: true }
  ],
  bootstrap: [AppComponent]
})
export class AppModule {}
