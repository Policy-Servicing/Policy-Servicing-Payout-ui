import { NgModule }             from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AuthGuard }            from './core/auth/auth.guard';
import { ShellComponent }       from './layout/shell/shell.component';
import { LoginComponent }       from './features/login/login.component';
import { DashboardComponent }   from './features/dashboard/dashboard.component';
import { SchedulerComponent }   from './features/scheduler/scheduler.component';

const routes: Routes = [
  { path: 'login', component: LoginComponent },
  {
    path: '',
    component: ShellComponent,
    canActivate: [AuthGuard],
    children: [
      { path: '',                  redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard',         component: DashboardComponent },
      { path: 'schedulers',        component: SchedulerComponent },
      {
        path: 'manual-processing',
        // Angular 7 string-based lazy loading syntax (NOT the Arrow function / import() syntax)
        loadChildren: './features/manual-processing/manual-processing.module#ManualProcessingModule',
        canActivate: [AuthGuard]
      }
    ]
  },
  { path: '**', redirectTo: '/dashboard' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}
