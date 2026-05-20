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

export type MyPageSection = 'address' | 'email' | 'password' | 'coin' | null;

@Component({
  selector: 'app-user-my-page',
  standalone: false,
  templateUrl: './userMyPage.component.html',
  styleUrls: ['./userMyPage.component.css'],
})
export class UserMyPageComponent implements OnInit {
  isLoading: boolean = true;
  expandedSection: MyPageSection = null;
  chevronSvg: SafeHtml = '';

  user: User | null = null;

  addressInput: string = '';
  emailInput: string = '';
  currentPasswordInput: string = '';
  newPasswordInput: string = '';
  confirmPasswordInput: string = '';

  currentPasswordVisible: boolean = false;
  newPasswordVisible: boolean = false;
  confirmPasswordVisible: boolean = false;

  successMessage: string = '';
  errorMessage: string = '';
  isSaving: boolean = false;

  private readonly MIN_PASSWORD_LENGTH = 5;

  constructor(
    private userService: UserService,
    private translateService: TranslateService,
    private router: Router,
    private cdr: ChangeDetectorRef,
    private http: HttpClient,
    private sanitizer: DomSanitizer,
    private dialog: MatDialog,
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
    } catch (error) {
      console.error('Failed to load user:', error);
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

  async saveAddress(): Promise<void> {
    if (!this.addressInput.trim()) {
      this.showError('my-page.error-required');
      return;
    }

    const confirm = await this.showConfirmDialog('my-page.address');
    if (confirm) {
      await this.updateUser({ address: this.addressInput });
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

  private async updateUser(
    changes: Partial<{
      email: string;
      password: string;
      name: string;
      address: string;
      phone: string;
    }>,
  ): Promise<void> {
    if (!this.user) return;

    this.isSaving = true;
    this.clearMessages();

    try {
      const updated = await this.userService.updateUser(this.user.id, {
        email: changes.email ?? this.user.email,
        password: changes.password ?? this.user.password,
        name: changes.name ?? this.user.name,
        address: changes.address ?? this.user.address,
        phone: changes.phone ?? this.user.phone,
        coin: this.user.coin,
      });
      this.user = updated;
      this.addressInput = this.user?.address ?? '';
      this.emailInput = this.user?.email ?? '';
      this.showSuccess('my-page.save-success');
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
}
