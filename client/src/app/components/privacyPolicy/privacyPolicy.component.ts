import { Component, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { Router } from '@angular/router';

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
