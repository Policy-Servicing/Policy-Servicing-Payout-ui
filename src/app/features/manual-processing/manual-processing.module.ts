import { NgModule }           from '@angular/core';
import { CommonModule }       from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { RouterModule }       from '@angular/router';

import {
  MatCardModule,
  MatInputModule,
  MatButtonModule,
  MatTabsModule,
  MatProgressSpinnerModule,
  MatSnackBarModule,
  MatDialogModule,
  MatIconModule,
  MatChipsModule,
  MatTooltipModule
} from '@angular/material';

import { ManualProcessingRoutingModule }    from './manual-processing-routing.module';
import { ManualProcessingComponent }        from './components/manual-processing.component';
import { ConfirmActionDialogComponent }     from './components/confirm-action-dialog/confirm-action-dialog.component';

@NgModule({
  declarations: [
    ManualProcessingComponent,
    ConfirmActionDialogComponent
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    RouterModule,
    ManualProcessingRoutingModule,
    MatCardModule,
    MatInputModule,
    MatButtonModule,
    MatTabsModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatDialogModule,
    MatIconModule,
    MatChipsModule,
    MatTooltipModule
  ],
  // entryComponents is REQUIRED in Angular 7 for MatDialog-opened components
  entryComponents: [ConfirmActionDialogComponent]
})
export class ManualProcessingModule {}
