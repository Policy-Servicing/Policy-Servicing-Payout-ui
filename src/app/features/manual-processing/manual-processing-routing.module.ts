import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ManualProcessingComponent } from './components/manual-processing.component';

const routes: Routes = [
  { path: '', component: ManualProcessingComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ManualProcessingRoutingModule {}
