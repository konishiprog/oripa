import { Component, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { BackNavigationService } from '../../common/back-navigation.service';

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
    private backNavigationService: BackNavigationService,
  ) {}

  ngOnInit(): void {
    this.translateService.setDefaultLang('ja');
    this.translateService.use('ja');
  }

  goBack(): void {
    this.backNavigationService.back();
  }
}
