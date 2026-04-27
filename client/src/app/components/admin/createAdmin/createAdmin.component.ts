import { Component, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { AdminService } from '../../../service/admin.service';

/**
 * Create Admin Component
 * Manages admin user creation form and submission
 */
@Component({
  selector: 'app-create-admin',
  standalone: false,
  templateUrl: './createAdmin.component.html',
  styleUrls: ['./createAdmin.component.css'],
})
export class CreateAdminComponent implements OnInit {
  email: string = '';
  password: string = '';
  successMessage: string = '';
  errorMessage: string = '';
  isLoading: boolean = false;
  passwordVisible: boolean = false;
  private readonly MIN_PASSWORD_LENGTH = 5;

  constructor(
    private adminService: AdminService,
    private translateService: TranslateService,
  ) {}

  ngOnInit(): void {
    this.translateService.setDefaultLang('ja');
    this.translateService.use('ja');
  }

  async onSubmit(): Promise<void> {
    if (!this.email || !this.password) {
      this.showError('admin-create.error');
      return;
    }

    if (!this.isValidEmail(this.email)) {
      this.showError('admin-create.error-email');
      return;
    }

    if (!this.isValidPassword(this.password)) {
      this.showError('admin-create.error-password');
      return;
    }

    this.isLoading = true;
    this.successMessage = '';
    this.errorMessage = '';

    try {
      await this.adminService.createAdmin(this.email, this.password);
      this.showSuccess('admin-create.success');
      this.email = '';
      this.password = '';
    } catch (error) {
      this.showError('admin-create.error');
    } finally {
      this.isLoading = false;
    }
  }

  private isValidEmail(email: string): boolean {
    return email.includes('@');
  }

  private isValidPassword(password: string): boolean {
    return password.length >= this.MIN_PASSWORD_LENGTH;
  }

  private showSuccess(key: string): void {
    this.successMessage = this.translateService.instant(key);
  }

  private showError(key: string): void {
    this.errorMessage = this.translateService.instant(key);
  }

  togglePasswordVisibility(): void {
    this.passwordVisible = !this.passwordVisible;
  }
}
