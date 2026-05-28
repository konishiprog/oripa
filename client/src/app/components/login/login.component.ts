import { Component, ChangeDetectorRef, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { LoginService } from '../../service/login.service';
import { SidebarService } from '../../service/sidebar.service';
import { Router } from '@angular/router';

/**
 * Login Component
 * Handles admin user authentication
 */
@Component({
  selector: 'app-login',
  standalone: false,
  templateUrl: './login.component.html',
  styleUrls: [
    './login.component.css',
    './login.responsive.component.css',
  ],
})
export class LoginComponent implements OnInit {
  email: string = '';
  password: string = '';
  successMessage: string = '';
  errorMessage: string = '';
  isLoading: boolean = false;
  passwordVisible: boolean = false;
  private readonly MIN_PASSWORD_LENGTH = 5;

  constructor(
    private loginService: LoginService,
    private sidebarService: SidebarService,
    private translateService: TranslateService,
    private cdr: ChangeDetectorRef,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.translateService.setDefaultLang('ja');
    this.translateService.use('ja');
  }

  async onSubmit(): Promise<void> {
    if (!this.email || !this.password) {
      this.showError('login.error');
      return;
    }

    if (!this.isValidEmail(this.email)) {
      this.showError('login.error-email');
      return;
    }

    if (!this.isValidPassword(this.password)) {
      this.showError('login.error-password');
      return;
    }

    this.isLoading = true;
    this.successMessage = '';
    this.errorMessage = '';

    try {
      const response = await this.loginService.login(this.email, this.password);
      if (response?.data?.id) {
        this.sidebarService.saveAdminId(response.data.id);
      }
      this.showSuccess('login.success');
      setTimeout(() => {
        this.router.navigate(['/adminPanel']);
      }, 1500);
    } catch (error: any) {
      if (error?.status === 401) {
        this.showError('login.error-invalid-credentials');
      } else {
        this.showError('login.error');
      }
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
    this.cdr.detectChanges();
  }

  togglePasswordVisibility(): void {
    this.passwordVisible = !this.passwordVisible;
  }
}
