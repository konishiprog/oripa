/**
 * 'app.module': Application Module
 */

import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideHttpClient } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TranslateModule, provideTranslateService } from '@ngx-translate/core';
import { provideTranslateHttpLoader } from '@ngx-translate/http-loader';
import { MatIconModule } from '@angular/material/icon';
import { MatDialogModule } from '@angular/material/dialog';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatMenuModule } from '@angular/material/menu';
import { MatButtonModule } from '@angular/material/button';
import { DragDropModule } from '@angular/cdk/drag-drop';

import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { CreateAdminComponent } from './components/createAdmin/createAdmin.component';
import { AdminAccountListComponent } from './components/adminAccountList/adminAccountList.component';
import { AdminPanelComponent } from './components/adminPanel/adminPanel.component';
import { ActionMenuComponent } from './components/common/actionMenu/actionMenu.component';
import { LoginComponent } from './components/login/login.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { SidebarComponent } from './components/sidebar/sidebar.component';

@NgModule({
  declarations: [
    AppComponent,
    CreateAdminComponent,
    AdminAccountListComponent,
    AdminPanelComponent,
    ActionMenuComponent,
    LoginComponent,
    DashboardComponent,
    SidebarComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    TranslateModule,
    MatIconModule,
    MatDialogModule,
    MatProgressSpinnerModule,
    MatMenuModule,
    MatButtonModule,
    DragDropModule,
  ],
  providers: [
    provideAnimations(),
    provideHttpClient(),
    provideTranslateService(),
    provideTranslateHttpLoader({
      prefix: './i18n/',
      suffix: '.json',
    }),
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
