import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { TranslateService } from '@ngx-translate/core';
import { HttpClient } from '@angular/common/http';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { UserService, User } from '../../service/user.service';
import {
  ConfirmUpdateDialogComponent,
  ConfirmDialogData,
} from './confirm-update-dialog/confirm-update-dialog.component';
import { DeleteAccountDialogComponent } from './delete-account-dialog/delete-account-dialog.component';
import {
  CoinPurchaseHistoryService,
  CoinPurchaseHistoryItem,
} from '../../service/coin-purchase-history.service';

export type MyPageSection =
  | 'address'
  | 'email'
  | 'password'
  | 'phone'
  | 'coin'
  | 'nickname'
  | null;

@Component({
  selector: 'app-user-my-page',
  standalone: false,
  templateUrl: './userMyPage.component.html',
  styleUrls: [
    './userMyPage.component.css',
    './userMyPage.responsive.component.css',
  ],
})
export class UserMyPageComponent implements OnInit {
  isLoading: boolean = true;
  expandedSection: MyPageSection = null;
  chevronSvg: SafeHtml = '';

  user: User | null = null;
  purchaseHistories: CoinPurchaseHistoryItem[] = [];

  addressInput: string = '';
  emailInput: string = '';
  phoneInput: string = '';
  postalCodeInput: string = '';
  nicknameInput: string = '';
  currentPasswordInput: string = '';
  newPasswordInput: string = '';
  confirmPasswordInput: string = '';
  isLookingUpAddress: boolean = false;

  currentPasswordVisible: boolean = false;
  newPasswordVisible: boolean = false;
  confirmPasswordVisible: boolean = false;

  successMessage: string = '';
  errorMessage: string = '';
  isSaving: boolean = false;

  private readonly MIN_PASSWORD_LENGTH = 5;
  readonly POSTAL_CODE_MAX_LENGTH = 8;

  constructor(
    private userService: UserService,
    private translateService: TranslateService,
    private router: Router,
    private cdr: ChangeDetectorRef,
    private http: HttpClient,
    private sanitizer: DomSanitizer,
    private dialog: MatDialog,
    private coinPurchaseHistoryService: CoinPurchaseHistoryService,
  ) {}

  async ngOnInit(): Promise<void> {
    this.translateService.setDefaultLang('ja');
    this.translateService.use('ja');

    this.http
      .get('assets/icons/chevron-right.svg', { responseType: 'text' })
      .subscribe({
        next: (svg) => {
          this.chevronSvg = this.sanitizer.bypassSecurityTrustHtml(svg);
          this.cdr.markForCheck();
        },
      });

    const userId = this.userService.getUserId();
    if (!userId) {
      this.router.navigate(['/userGachaPage']);
      return;
    }

    try {
      this.user = await this.userService.getUserById(userId);
      this.addressInput = this.user?.address ?? '';
      this.emailInput = this.user?.email ?? '';
      this.phoneInput = this.user?.phone ?? '';
      this.postalCodeInput = this.user?.postalCode ?? '';
      this.nicknameInput = this.user?.nickname ?? '';

      const allHistories =
        await this.coinPurchaseHistoryService.getAllHistories();
      this.purchaseHistories = allHistories
        .filter((history) => history.userId === userId)
        .reverse()
        .slice(0, 10);
    } catch (error) {
      console.error('Failed to load user or purchase histories:', error);
    } finally {
      this.isLoading = false;
      this.cdr.markForCheck();
    }
  }

  goBack(): void {
    this.router.navigate(['/userGachaPage']);
  }

  goToCardHistory(): void {
    this.router.navigate(['/myPage/cardHistory']);
  }

  toggleSection(section: MyPageSection): void {
    this.expandedSection = this.expandedSection === section ? null : section;
    this.clearMessages();
  }

  async saveAddressAndPostalCode(): Promise<void> {
    if (!this.postalCodeInput.trim()) {
      this.showError('my-page.error-postal-code');
      return;
    }
    if (!this.addressInput.trim()) {
      this.showError('my-page.error-required');
      return;
    }

    const confirm = await this.showConfirmDialog('my-page.address');
    if (confirm) {
      await this.updateUser({
        address: this.addressInput,
        postalCode: this.postalCodeInput,
      });
    }
  }

  async saveEmail(): Promise<void> {
    if (!this.emailInput.trim()) {
      this.showError('my-page.error-required');
      return;
    }
    if (!this.emailInput.includes('@')) {
      this.showError('my-page.error-email');
      return;
    }

    const confirm = await this.showConfirmDialog('my-page.email');
    if (confirm) {
      await this.updateUser({ email: this.emailInput });
    }
  }

  async savePassword(): Promise<void> {
    if (
      !this.currentPasswordInput ||
      !this.newPasswordInput ||
      !this.confirmPasswordInput
    ) {
      this.showError('my-page.error-required');
      return;
    }
    if (this.currentPasswordInput !== this.user?.password) {
      this.showError('my-page.error-current-password');
      return;
    }
    if (this.newPasswordInput.length < this.MIN_PASSWORD_LENGTH) {
      this.showError('my-page.error-password');
      return;
    }
    if (this.newPasswordInput !== this.confirmPasswordInput) {
      this.showError('my-page.error-password-mismatch');
      return;
    }
    if (this.newPasswordInput === this.currentPasswordInput) {
      this.showError('my-page.error-password-same');
      return;
    }

    const confirm = await this.showConfirmDialog('my-page.password');
    if (confirm) {
      await this.updateUser({ password: this.newPasswordInput });
      this.currentPasswordInput = '';
      this.newPasswordInput = '';
      this.confirmPasswordInput = '';
    }
  }

  async saveNickname(): Promise<void> {
    const confirm = await this.showConfirmDialog('my-page.nickname');
    if (confirm) {
      await this.updateUser({ nickname: this.nicknameInput.trim() });
    }
  }

  async savePhone(): Promise<void> {
    if (!this.phoneInput.trim()) {
      this.showError('my-page.error-required');
      return;
    }
    if (!/^\d+$/.test(this.phoneInput)) {
      this.showError('my-page.error-phone');
      return;
    }

    const confirm = await this.showConfirmDialog('my-page.phone');
    if (confirm) {
      await this.updateUser({ phone: this.phoneInput });
    }
  }

  async lookupAddressFromPostalCode(): Promise<void> {
    if (!this.postalCodeInput) {
      this.showError('my-page.error-postal-code');
      return;
    }

    this.isLookingUpAddress = true;
    this.clearMessages();

    try {
      const result = await this.userService.getAddressByPostalCode(
        this.postalCodeInput,
      );
      if (result) {
        this.addressInput = result.address;
        this.showSuccess('my-page.success-address-lookup');
      } else {
        this.showError('my-page.error-address-not-found');
      }
    } catch (error) {
      this.showError('my-page.error-address-lookup');
    } finally {
      this.isLookingUpAddress = false;
      this.cdr.markForCheck();
    }
  }

  formatPostalCode(event: any): void {
    let value = event.target.value.replace(/\D/g, '');
    if (value.length > 7) {
      value = value.slice(0, 7);
    }
    if (value.length > 3) {
      value = value.slice(0, 3) + '-' + value.slice(3);
    }
    this.postalCodeInput = value;
  }

  private async updateUser(
    changes: Partial<{
      email: string;
      password: string;
      name: string;
      nickname: string;
      address: string;
      phone: string;
      postalCode: string;
    }>,
  ): Promise<void> {
    if (!this.user) return;

    this.isSaving = true;
    this.clearMessages();

    try {
      const emailChanged = changes.email && changes.email !== this.user.email;
      const updated = await this.userService.updateUser(this.user.id, {
        email: changes.email ?? this.user.email,
        password: changes.password ?? this.user.password,
        name: changes.name ?? this.user.name,
        nickname: changes.nickname ?? this.user.nickname,
        address: changes.address ?? this.user.address,
        phone: changes.phone ?? this.user.phone,
        postalCode: changes.postalCode ?? this.user.postalCode,
        coin: this.user.coin,
      });
      this.user = updated;
      this.addressInput = this.user?.address ?? '';
      this.emailInput = this.user?.email ?? '';
      this.phoneInput = this.user?.phone ?? '';
      this.postalCodeInput = this.user?.postalCode ?? '';
      this.nicknameInput = this.user?.nickname ?? '';

      if (emailChanged) {
        this.router.navigate(['/signup-email-sent']);
      } else {
        this.showSuccess('my-page.save-success');
      }
    } catch (error: any) {
      if (error?.status === 409) {
        this.showError('my-page.error-email-exists');
      } else {
        this.showError('my-page.save-error');
      }
    } finally {
      this.isSaving = false;
      this.cdr.markForCheck();
    }
  }

  private showSuccess(key: string): void {
    this.successMessage = this.translateService.instant(key);
    this.errorMessage = '';
    this.cdr.markForCheck();
  }

  private showError(key: string): void {
    this.errorMessage = this.translateService.instant(key);
    this.successMessage = '';
    this.cdr.markForCheck();
  }

  private clearMessages(): void {
    this.successMessage = '';
    this.errorMessage = '';
  }

  toggleCurrentPasswordVisibility(): void {
    this.currentPasswordVisible = !this.currentPasswordVisible;
  }

  toggleNewPasswordVisibility(): void {
    this.newPasswordVisible = !this.newPasswordVisible;
  }

  toggleConfirmPasswordVisibility(): void {
    this.confirmPasswordVisible = !this.confirmPasswordVisible;
  }

  formatDate(date: Date): string {
    const dateObj = new Date(date);
    const year = dateObj.getFullYear();
    const month = String(dateObj.getMonth() + 1).padStart(2, '0');
    const day = String(dateObj.getDate()).padStart(2, '0');
    return `${year}/${month}/${day}`;
  }

  private showConfirmDialog(labelKey: string): Promise<boolean> {
    return new Promise((resolve) => {
      const data: ConfirmDialogData = { labelKey };
      const dialogRef = this.dialog.open(ConfirmUpdateDialogComponent, {
        width: '320px',
        data,
      });

      dialogRef.afterClosed().subscribe((result) => {
        resolve(result === true);
      });
    });
  }

  openDeleteAccountDialog(): void {
    const dialogRef = this.dialog.open(DeleteAccountDialogComponent, {
      width: '400px',
    });

    dialogRef.afterClosed().subscribe((confirmed) => {
      if (confirmed) {
        this.deleteAccount();
      }
    });
  }

  private async deleteAccount(): Promise<void> {
    const userId = this.userService.getUserId();
    if (!userId) {
      return;
    }

    try {
      this.isSaving = true;
      await this.userService.deleteUser(userId);
      this.userService.logout();
      this.router.navigate(['/userGachaPage']);
    } catch (error) {
      console.error('Failed to delete account:', error);
      this.errorMessage = this.translateService.instant('my-page.delete-error');
      this.cdr.markForCheck();
    } finally {
      this.isSaving = false;
    }
  }
}
