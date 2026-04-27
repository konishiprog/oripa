/**
 * 'app-routing.module': Application Routing Module
 */

import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CreateAdminComponent } from './components/admin/createAdmin/createAdmin.component';

const routes: Routes = [
  {
    path: 'admin/createAdmin',
    component: CreateAdminComponent,
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
