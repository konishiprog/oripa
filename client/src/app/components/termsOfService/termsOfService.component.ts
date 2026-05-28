import { Component, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-terms-of-service',
  standalone: false,
  templateUrl: './termsOfService.component.html',
  styleUrls: [
    './termsOfService.component.css',
    './termsOfService.responsive.component.css',
  ],
})
export class TermsOfServiceComponent implements OnInit {
  constructor(
    private translateService: TranslateService,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.translateService.setDefaultLang('ja');
    this.translateService.use('ja');
  }

  goBack(): void {
    this.router.navigate(['/userGachaPage']);
  }
}
