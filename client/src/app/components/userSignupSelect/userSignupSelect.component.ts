import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { AuthMethod } from '../common/authMethodList/authMethodList.component';

const SIGNUP_METHODS: AuthMethod[] = [
  {
    type: 'LINE',
    icon: 'assets/icons/line.svg',
    labelKey: 'user-signup-select.line',
  },
  {
    type: 'X',
    icon: 'assets/icons/x.svg',
    labelKey: 'user-signup-select.x',
  },
  {
    type: 'GOOGLE',
    icon: 'assets/icons/google.svg',
    labelKey: 'user-signup-select.google',
  },
  {
    type: 'EMAIL',
    icon: 'assets/icons/mail.svg',
    labelKey: 'user-signup-select.email',
  },
];

@Component({
  selector: 'app-user-signup-select',
  standalone: false,
  templateUrl: './userSignupSelect.component.html',
  styleUrls: [
    './userSignupSelect.component.css',
    './userSignupSelect.responsive.component.css',
  ],
})
export class UserSignupSelectComponent implements OnInit {
  signupMethods: AuthMethod[] = SIGNUP_METHODS;

  constructor(
    private router: Router,
    private translateService: TranslateService,
  ) {}

  ngOnInit(): void {
    this.translateService.setDefaultLang('ja');
    this.translateService.use('ja');
  }

  selectMethod(signupMethod: AuthMethod): void {
    if (signupMethod.type === 'EMAIL') {
      this.router.navigate(['/userSignup/email']);
      return;
    }
    alert(this.translateService.instant('user-signup-select.coming-soon'));
  }

  goToLogin(): void {
    this.router.navigate(['/userLogin']);
  }

  navigateToTerms(): void {
    this.router.navigate(['/terms']);
  }

  navigateToPrivacy(): void {
    this.router.navigate(['/privacy']);
  }
}
