import { NgModule } from '@angular/core';
import { SharedModule } from '../shared/shared.module';
import { RouterModule } from '@angular/router';
import { SidebarComponent } from './sidebar/sidebar.component';
import { HeaderComponent }  from './header/header.component';
import { ShellComponent }   from './shell/shell.component';

@NgModule({
  declarations: [SidebarComponent, HeaderComponent, ShellComponent],
  imports: [SharedModule, RouterModule],
  exports: [ShellComponent]
})
export class LayoutModule {}
