import { Component, ChangeDetectorRef, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { UserService } from '../../service/user.service';

@Component({
  selector: 'app-user-signup',
  standalone: false,
  templateUrl: './userSignup.component.html',
  styleUrls: ['./userSignup.component.css'],
})
export class UserSignupComponent implements OnInit {
  email: string = '';
  password: string = '';
  name: string = '';
  address: string = '';
  phone: string = '';
  successMessage: string = '';
  errorMessage: string = '';
  isLoading: boolean = false;
  passwordVisible: boolean = false;
  private readonly MIN_PASSWORD_LENGTH = 5;

  constructor(
    private userService: UserService,
    private translateService: TranslateService,
    private router: Router,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.translateService.setDefaultLang('ja');
    this.translateService.use('ja');
  }

  async onSubmit(): Promise<void> {
    if (
      !this.email ||
      !this.password ||
      !this.name ||
      !this.address ||
      !this.phone
    ) {
      this.showError('user-signup.error-required');
      return;
    }

    if (!this.isValidEmail(this.email)) {
      this.showError('user-signup.error-email');
      return;
    }

    if (!this.isValidPassword(this.password)) {
      this.showError('user-signup.error-password');
      return;
    }

    if (!this.isValidPhone(this.phone)) {
      this.showError('user-signup.error-phone');
      return;
    }

    this.isLoading = true;
    this.successMessage = '';
    this.errorMessage = '';

    try {
      await this.userService.createUser({
        email: this.email,
        password: this.password,
        name: this.name,
        address: this.address,
        phone: this.phone,
      });
      this.router.navigate(['/signup-email-sent']);
    } catch (error: any) {
      if (error?.status === 409) {
        const errorMessage = error?.error?.error || '';
        if (errorMessage.includes('already registered')) {
          this.showError('user-signup.error-phone-exists');
        } else {
          this.showError('user-signup.error-email-exists');
        }
      } else {
        this.showError('user-signup.error');
      }
    } finally {
      this.isLoading = false;
    }
  }

  goBack(): void {
    this.router.navigate(['/userGachaPage']);
  }

  togglePasswordVisibility(): void {
    this.passwordVisible = !this.passwordVisible;
  }

  private isValidEmail(email: string): boolean {
    return email.includes('@');
  }

  private isValidPassword(password: string): boolean {
    return password.length >= this.MIN_PASSWORD_LENGTH;
  }

  private isValidPhone(phone: string): boolean {
    return /^\d+$/.test(phone);
  }

  private showSuccess(key: string): void {
    this.successMessage = this.translateService.instant(key);
  }

  private showError(key: string): void {
    this.errorMessage = this.translateService.instant(key);
    this.cdr.detectChanges();
  }
}
