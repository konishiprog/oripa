/**
 * 'app-routing.module': Application Routing Module
 */

import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CreateAdminComponent } from './components/createAdmin/createAdmin.component';
import { AdminAccountListComponent } from './components/adminAccountList/adminAccountList.component';
import { AdminPanelComponent } from './components/adminPanel/adminPanel.component';
import { LoginComponent } from './components/login/login.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { UserGachaPageComponent } from './components/userGachaPage/userGachaPage.component';
import { UserManagementComponent } from './components/userManagement/userManagement.component';
import { UserSignupComponent } from './components/userSignup/userSignup.component';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'userGachaPage',
    pathMatch: 'full',
  },
  {
    path: 'login',
    component: LoginComponent,
  },
  {
    path: 'userGachaPage',
    component: UserGachaPageComponent,
  },
  {
    path: 'userSignup',
    component: UserSignupComponent,
  },
  {
    path: 'adminPanel',
    component: AdminPanelComponent,
    children: [
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full',
      },
      {
        path: 'dashboard',
        component: DashboardComponent,
      },
      {
        path: 'adminAccountList',
        component: AdminAccountListComponent,
      },
      {
        path: 'userManagement',
        component: UserManagementComponent,
      },
      {
        path: 'createAdmin',
        component: CreateAdminComponent,
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
