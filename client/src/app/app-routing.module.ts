/**
 * 'app-routing.module': Application Routing Module
 */

import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CreateAdminComponent } from './components/createAdmin/createAdmin.component';
import { AdminAccountListComponent } from './components/adminAccountList/adminAccountList.component';
import { AdminPanelComponent } from './components/adminPanel/adminPanel.component';
import { LoginComponent } from './components/login/login.component';
import { AdminAuthGuard } from './guards/admin-auth.guard';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { UserGachaPageComponent } from './components/userGachaPage/userGachaPage.component';
import { GachaDetailPageComponent } from './components/gachaDetailPage/gachaDetailPage.component';
import { UserManagementComponent } from './components/userManagement/userManagement.component';
import { UserSignupComponent } from './components/userSignup/userSignup.component';
import { EmailVerificationComponent } from './components/emailVerification/emailVerification.component';
import { EmailChangeVerificationComponent } from './components/emailChangeVerification/emailChangeVerification.component';
import { SignupEmailSentComponent } from './components/signupEmailSent/signupEmailSent.component';
import { UserMyPageComponent } from './components/userMyPage/userMyPage.component';
import { UserCardHistoryPageComponent } from './components/userCardHistoryPage/userCardHistoryPage.component';
import { ShippingInfoPageComponent } from './components/shippingInfoPage/shippingInfoPage.component';
import { CoinExchangeRateManagementComponent } from './components/coinExchangeRateManagement/coinExchangeRateManagement.component';
import { CoinChargePageComponent } from './components/coinChargePage/coinChargePage.component';
import { CoinPurchaseHistoryPageComponent } from './components/coinPurchaseHistoryPage/coinPurchaseHistoryPage.component';
import { ForgotPasswordComponent } from './components/forgotPassword/forgot-password.component';
import { TermsOfServiceComponent } from './components/termsOfService/termsOfService.component';
import { PrivacyPolicyComponent } from './components/privacyPolicy/privacyPolicy.component';
import { ContactPageComponent } from './components/contactPage/contactPage.component';
import { ChargeResultPageComponent } from './components/chargeResultPage/chargeResultPage.component';

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
    path: 'gacha/:id',
    component: GachaDetailPageComponent,
  },
  {
    path: 'userSignup',
    component: UserSignupComponent,
  },
  {
    path: 'verify-email',
    component: EmailVerificationComponent,
  },
  {
    path: 'verify-email-change',
    component: EmailChangeVerificationComponent,
  },
  {
    path: 'signup-email-sent',
    component: SignupEmailSentComponent,
  },
  {
    path: 'forgot-password',
    component: ForgotPasswordComponent,
  },
  {
    path: 'terms',
    component: TermsOfServiceComponent,
  },
  {
    path: 'privacy',
    component: PrivacyPolicyComponent,
  },
  {
    path: 'contact',
    component: ContactPageComponent,
  },
  {
    path: 'myPage',
    component: UserMyPageComponent,
  },
  {
    path: 'myPage/cardHistory',
    component: UserCardHistoryPageComponent,
  },
  {
    path: 'coinCharge',
    component: CoinChargePageComponent,
  },
  {
    path: 'charge-result',
    component: ChargeResultPageComponent,
  },
  {
    path: 'adminPanel',
    component: AdminPanelComponent,
    canActivate: [AdminAuthGuard],
    canActivateChild: [AdminAuthGuard],
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
        path: 'shippingInfo',
        component: ShippingInfoPageComponent,
      },
      {
        path: 'coinExchangeRate',
        component: CoinExchangeRateManagementComponent,
      },
      {
        path: 'coinPurchaseHistory',
        component: CoinPurchaseHistoryPageComponent,
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
