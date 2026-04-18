import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import {
  MatButtonModule, MatIconModule, MatInputModule,
  MatSelectModule, MatTableModule, MatPaginatorModule,
  MatSortModule, MatDialogModule, MatSnackBarModule,
  MatTooltipModule, MatProgressSpinnerModule, MatCardModule,
  MatBadgeModule, MatMenuModule, MatDividerModule,
  MatSlideToggleModule, MatDatepickerModule, MatNativeDateModule,
  MatChipsModule, MatProgressBarModule
} from '@angular/material';

import { StageCardComponent }          from './components/stage-card/stage-card.component';
import { BadgeComponent }              from './components/badge/badge.component';
import { CountdownTimerComponent }     from './components/countdown-timer/countdown-timer.component';
import { ConfirmationDialogComponent } from './components/confirmation-dialog/confirmation-dialog.component';
import { TrendChartComponent }         from './components/trend-chart/trend-chart.component';
import { RelativeTimePipe }            from './pipes/relative-time.pipe';
import { CronHumanPipe }               from './pipes/cron-human.pipe';

const MATERIAL = [
  MatButtonModule, MatIconModule, MatInputModule,
  MatSelectModule, MatTableModule, MatPaginatorModule,
  MatSortModule, MatDialogModule, MatSnackBarModule,
  MatTooltipModule, MatProgressSpinnerModule, MatCardModule,
  MatBadgeModule, MatMenuModule, MatDividerModule,
  MatSlideToggleModule, MatDatepickerModule, MatNativeDateModule,
  MatChipsModule, MatProgressBarModule
];

const COMPONENTS = [
  StageCardComponent, BadgeComponent, CountdownTimerComponent,
  ConfirmationDialogComponent, TrendChartComponent
];

const PIPES = [RelativeTimePipe, CronHumanPipe];

@NgModule({
  declarations: [...COMPONENTS, ...PIPES],
  imports: [CommonModule, FormsModule, ReactiveFormsModule, ...MATERIAL],
  exports: [CommonModule, FormsModule, ReactiveFormsModule, ...MATERIAL, ...COMPONENTS, ...PIPES],
  entryComponents: [ConfirmationDialogComponent]
})
export class SharedModule {}
