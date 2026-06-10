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
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { DragDropModule } from '@angular/cdk/drag-drop';

import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { CreateAdminComponent } from './components/createAdmin/createAdmin.component';
import { CreateGachaComponent } from './components/createGacha/createGacha.component';
import { CreateCardComponent } from './components/createCard/createCard.component';
import { AdminAccountListComponent } from './components/adminAccountList/adminAccountList.component';
import { AdminPanelComponent } from './components/adminPanel/adminPanel.component';
import { ActionMenuComponent } from './components/common/actionMenu/actionMenu.component';
import { PaginationFilterComponent } from './components/common/paginationFilter/paginationFilter.component';
import { LoginComponent } from './components/login/login.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { GachaTableComponent } from './components/gachaTable/gachaTable.component';
import { GachaFilterDialogComponent } from './components/gachaFilterDialog/gachaFilterDialog.component';
import { GachaSortDialogComponent } from './components/gachaSortDialog/gachaSortDialog.component';
import { CardTableComponent } from './components/cardTable/cardTable.component';
import { SidebarComponent } from './components/sidebar/sidebar.component';
import { UserDetailDialogComponent } from './components/userDetailDialog/userDetailDialog.component';
import { UserGachaPageComponent } from './components/userGachaPage/userGachaPage.component';
import { UserManagementComponent } from './components/userManagement/userManagement.component';
import { UserSignupComponent } from './components/userSignup/userSignup.component';
import { EmailVerificationComponent } from './components/emailVerification/emailVerification.component';
import { EmailChangeVerificationComponent } from './components/emailChangeVerification/emailChangeVerification.component';
import { SignupEmailSentComponent } from './components/signupEmailSent/signupEmailSent.component';
import { UserMyPageComponent } from './components/userMyPage/userMyPage.component';
import { ConfirmUpdateDialogComponent } from './components/userMyPage/confirm-update-dialog/confirm-update-dialog.component';
import { UserCardHistoryPageComponent } from './components/userCardHistoryPage/userCardHistoryPage.component';
import { UserLoginDialogComponent } from './components/userLoginDialog/userLoginDialog.component';
import { AppLogoComponent } from './components/common/appLogo/appLogo.component';
import { AppHeaderComponent } from './components/common/appHeader.component';
import { TableControlsComponent } from './components/common/tableControls/tableControls.component';
import { LoadingOverlayComponent } from './components/common/loadingOverlay/loadingOverlay.component';
import { GachaBoxComponent } from './components/gachaBox/gachaBox.component';
import { GachaDrawResultDialogComponent } from './components/gachaDrawResultDialog/gachaDrawResultDialog.component';
import { GachaWinnersDialogComponent } from './components/gachaWinnersDialog/gachaWinnersDialog.component';
import { CoinExchangeDialogComponent } from './components/coinExchangeDialog/coinExchangeDialog.component';
import { ShippingInfoPageComponent } from './components/shippingInfoPage/shippingInfoPage.component';
import { ShippingCardDetailDialogComponent } from './components/shippingCardDetailDialog/shippingCardDetailDialog.component';
import { ShippingConfirmDialogComponent } from './components/shippingConfirmDialog/shippingConfirmDialog.component';
import { CoinExchangeRateManagementComponent } from './components/coinExchangeRateManagement/coinExchangeRateManagement.component';
import { CoinExchangeRateDialogComponent } from './components/coinExchangeRateDialog/coinExchangeRateDialog.component';
import { CoinChargePageComponent } from './components/coinChargePage/coinChargePage.component';
import { CoinPurchaseHistoryPageComponent } from './components/coinPurchaseHistoryPage/coinPurchaseHistoryPage.component';
import { CoinPurchaseHistoryFilterDialogComponent } from './components/coinPurchaseHistoryFilterDialog/coinPurchaseHistoryFilterDialog.component';
import { CardTableFilterDialogComponent } from './components/cardTableFilterDialog/cardTableFilterDialog.component';
import { ChargeResultPageComponent } from './components/chargeResultPage/chargeResultPage.component';
import { ForgotPasswordComponent } from './components/forgotPassword/forgot-password.component';
import { TermsOfServiceComponent } from './components/termsOfService/termsOfService.component';
import { PrivacyPolicyComponent } from './components/privacyPolicy/privacyPolicy.component';
import { FooterLinksComponent } from './components/common/footerLinks/footerLinks.component';
import { GenreTableComponent } from './components/genreTable/genreTable.component';
import { CreateGenreComponent } from './components/createGenre/createGenre.component';
import { EffectTableComponent } from './components/effectTable/effectTable.component';
import { CreateEffectComponent } from './components/createEffect/createEffect.component';
import { GachaDetailPageComponent } from './components/gachaDetailPage/gachaDetailPage.component';
import { ContactPageComponent } from './components/contactPage/contactPage.component';
import { GachaDrawButtonsComponent } from './common/gachaDrawButtons/gachaDrawButtons.component';

@NgModule({
  declarations: [
    AppComponent,
    CreateAdminComponent,
    CreateGachaComponent,
    CreateCardComponent,
    AdminAccountListComponent,
    AdminPanelComponent,
    ActionMenuComponent,
    PaginationFilterComponent,
    LoginComponent,
    DashboardComponent,
    GachaTableComponent,
    GachaFilterDialogComponent,
    GachaSortDialogComponent,
    CardTableComponent,
    GenreTableComponent,
    CreateGenreComponent,
    EffectTableComponent,
    CreateEffectComponent,
    SidebarComponent,
    UserDetailDialogComponent,
    UserGachaPageComponent,
    UserManagementComponent,
    UserSignupComponent,
    EmailVerificationComponent,
    EmailChangeVerificationComponent,
    SignupEmailSentComponent,
    UserMyPageComponent,
    ConfirmUpdateDialogComponent,
    UserCardHistoryPageComponent,
    UserLoginDialogComponent,
    AppLogoComponent,
    AppHeaderComponent,
    TableControlsComponent,
    LoadingOverlayComponent,
    GachaBoxComponent,
    GachaDrawResultDialogComponent,
    GachaWinnersDialogComponent,
    CoinExchangeDialogComponent,
    ShippingInfoPageComponent,
    ShippingCardDetailDialogComponent,
    ShippingConfirmDialogComponent,
    CoinExchangeRateManagementComponent,
    CoinExchangeRateDialogComponent,
    CoinChargePageComponent,
    CoinPurchaseHistoryPageComponent,
    CoinPurchaseHistoryFilterDialogComponent,
    CardTableFilterDialogComponent,
    ChargeResultPageComponent,
    ForgotPasswordComponent,
    TermsOfServiceComponent,
    PrivacyPolicyComponent,
    FooterLinksComponent,
    GachaDetailPageComponent,
    ContactPageComponent,
    GachaDrawButtonsComponent,
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
    MatTooltipModule,
    MatSelectModule,
    MatFormFieldModule,
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
