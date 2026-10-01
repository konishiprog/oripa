import { Component, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { BackNavigationService } from '../../common/back-navigation.service';

@Component({
  selector: 'app-privacy-policy',
  standalone: false,
  templateUrl: './privacyPolicy.component.html',
  styleUrls: [
    './privacyPolicy.component.css',
    './privacyPolicy.responsive.component.css',
  ],
})
export class PrivacyPolicyComponent implements OnInit {
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
