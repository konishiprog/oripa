import { Component, ChangeDetectorRef, OnInit, Optional } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { TranslateService } from '@ngx-translate/core';
import { UserService } from '../../service/user.service';

@Component({
  selector: 'app-user-login-dialog',
  standalone: false,
  templateUrl: './userLoginDialog.component.html',
  styleUrls: ['./userLoginDialog.component.css'],
})
export class UserLoginDialogComponent implements OnInit {
  identifier: string = '';
  password: string = '';
  successMessage: string = '';
  errorMessage: string = '';
  isLoading: boolean = false;
  passwordVisible: boolean = false;

  constructor(
    private userService: UserService,
    private translateService: TranslateService,
    private cdr: ChangeDetectorRef,
    @Optional() private dialogRef: MatDialogRef<UserLoginDialogComponent>,
  ) {}

  ngOnInit(): void {
    this.translateService.setDefaultLang('ja');
    this.translateService.use('ja');
  }

  async onSubmit(): Promise<void> {
    if (!this.identifier || !this.password) {
      this.showError('user-login.error-required');
      return;
    }

    this.isLoading = true;
    this.successMessage = '';
    this.errorMessage = '';

    try {
      const response = await this.userService.login(
        this.identifier,
        this.password,
      );
      if (response?.data?.id) {
        this.userService.saveUserId(response.data.id);
      }
      this.showSuccess('user-login.success');
      setTimeout(() => {
        this.dialogRef?.close({ success: true, data: response?.data });
      }, 1000);
    } catch (error: any) {
      if (error?.status === 401) {
        this.showError('user-login.error-invalid-credentials');
      } else {
        this.showError('user-login.error');
      }
    } finally {
      this.isLoading = false;
    }
  }

  onClose(): void {
    this.dialogRef?.close();
  }

  togglePasswordVisibility(): void {
    this.passwordVisible = !this.passwordVisible;
  }

  private showSuccess(key: string): void {
    this.successMessage = this.translateService.instant(key);
  }

  private showError(key: string): void {
    this.errorMessage = this.translateService.instant(key);
    this.cdr.detectChanges();
  }
}
