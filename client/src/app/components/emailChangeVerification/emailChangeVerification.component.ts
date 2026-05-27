import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { UserService } from '../../service/user.service';

@Component({
  selector: 'app-email-change-verification',
  standalone: false,
  templateUrl: './emailChangeVerification.component.html',
  styleUrls: ['./emailChangeVerification.component.css'],
})
export class EmailChangeVerificationComponent implements OnInit {
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
    this.verifyEmailChange();
  }

  private async verifyEmailChange(): Promise<void> {
    try {
      const token = this.route.snapshot.queryParamMap.get('token');

      if (!token) {
        this.showError('email-change-verification.error-invalid');
        return;
      }

      await this.userService.verifyEmailChange(token);
      this.successMessage = this.translateService.instant(
        'email-change-verification.success',
      );
      this.isVerifying = false;
      this.cdr.markForCheck();

      setTimeout(() => {
        this.router.navigate(['/myPage']);
      }, 2000);
    } catch (error: any) {
      this.isVerifying = false;
      this.cdr.markForCheck();

      if (error?.status === 404) {
        this.showError('email-change-verification.error-invalid');
      } else if (error?.status === 410) {
        this.showError('email-change-verification.error-expired');
      } else {
        this.showError('email-change-verification.error-general');
      }
    }
  }

  private showError(messageKey: string): void {
    this.errorMessage = this.translateService.instant(messageKey);
  }

  goToMyPage(): void {
    this.router.navigate(['/myPage']);
  }
}
