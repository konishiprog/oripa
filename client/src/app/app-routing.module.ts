/**
 * 'app-routing.module': Application Routing Module
 */

import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CreateAdminComponent } from './components/admin/createAdmin/createAdmin.component';
import { AdminAccountListComponent } from './components/admin/adminAccountList/adminAccountList.component';

const routes: Routes = [
  {
    path: 'admin/createAdmin',
    component: CreateAdminComponent,
  },
  {
    path: 'admin/adminAccountList',
    component: AdminAccountListComponent,
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
