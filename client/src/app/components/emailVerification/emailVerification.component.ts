import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { UserService } from '../../service/user.service';

@Component({
  selector: 'app-email-verification',
  standalone: false,
  templateUrl: './emailVerification.component.html',
  styleUrls: [
    './emailVerification.component.css',
    './emailVerification.responsive.component.css',
  ],
})
export class EmailVerificationComponent implements OnInit {
  isVerifying: boolean = true;
  successMessage: string = '';
  errorMessage: string = '';

  constructor(
    private userService: UserService,
    private route: ActivatedRoute,
    private router: Router,
    private translateService: TranslateService,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.translateService.setDefaultLang('ja');
    this.translateService.use('ja');
    this.verifyEmail();
  }

  private async verifyEmail(): Promise<void> {
    try {
      const token = this.route.snapshot.queryParamMap.get('token');

      if (!token) {
        this.showError('email-verification.error-invalid');
        return;
      }

      await this.userService.verifyEmail(token);
      this.successMessage = this.translateService.instant(
        'email-verification.success',
      );
      this.isVerifying = false;
      this.cdr.markForCheck();

      setTimeout(() => {
        this.router.navigate(['/userGachaPage']);
      }, 2000);
    } catch (error: any) {
      this.isVerifying = false;
      this.cdr.markForCheck();

      if (error?.status === 404) {
        this.showError('email-verification.error-invalid');
      } else if (error?.status === 410) {
        this.showError('email-verification.error-expired');
      } else {
        this.showError('email-verification.error-general');
      }
    }
  }

  private showError(messageKey: string): void {
    this.errorMessage = this.translateService.instant(messageKey);
  }

  goToSignup(): void {
    this.router.navigate(['/userSignup']);
  }
}
