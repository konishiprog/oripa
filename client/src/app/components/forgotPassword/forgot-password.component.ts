import { Component, ChangeDetectorRef, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-forgot-password',
  standalone: false,
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.css'],
})
export class ForgotPasswordComponent implements OnInit {
  email: string = '';
  phone: string = '';
  successMessage: string = '';
  errorMessage: string = '';
  isLoading: boolean = false;

  constructor(
    private httpClient: HttpClient,
    private translateService: TranslateService,
    private cdr: ChangeDetectorRef,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.translateService.setDefaultLang('ja');
    this.translateService.use('ja');
  }

  async onSubmit(): Promise<void> {
    if (!this.email || !this.phone) {
      this.showError('forgot-password.error-required');
      return;
    }

    if (!this.isValidEmail(this.email)) {
      this.showError('forgot-password.error-required');
      return;
    }

    this.isLoading = true;
    this.successMessage = '';
    this.errorMessage = '';

    try {
      const response = await this.httpClient
        .post<any>('http://localhost:3000/api/user/forgot-password', {
          email: this.email,
          phone: this.phone,
        })
        .toPromise();

      this.showSuccess('forgot-password.success');
      setTimeout(() => {
        this.router.navigate(['/userGachaPage']);
      }, 3000);
    } catch (error: any) {
      if (error?.status === 404) {
        this.showError('forgot-password.error-not-found');
      } else {
        this.showError('forgot-password.error');
      }
    } finally {
      this.isLoading = false;
    }
  }

  onBack(): void {
    this.router.navigate(['/userGachaPage']);
  }

  private isValidEmail(email: string): boolean {
    return email.includes('@');
  }

  private showSuccess(key: string): void {
    this.successMessage = this.translateService.instant(key);
    this.cdr.detectChanges();
  }

  private showError(key: string): void {
    this.errorMessage = this.translateService.instant(key);
    this.cdr.detectChanges();
  }
}
