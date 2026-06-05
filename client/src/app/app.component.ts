import { Component, OnInit } from '@angular/core';
import { MatIconRegistry } from '@angular/material/icon';
import { DomSanitizer } from '@angular/platform-browser';
import { TranslateService } from '@ngx-translate/core';

/**
 * App Root Component
 * Main application component
 */
@Component({
  selector: 'app-root',
  standalone: false,
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit {
  protected title = 'app';

  constructor(
    private iconRegistry: MatIconRegistry,
    private domSanitizer: DomSanitizer,
    private translate: TranslateService,
  ) {
    const pathIcons = 'assets/icons/';

    const icons: [string, string][] = [
      ['visible', pathIcons + 'visible.svg'],
      ['invisible', pathIcons + 'invisible.svg'],
      ['more-options', pathIcons + 'more-options.svg'],
    ];

    for (let i = 0; i < icons.length; i++) {
      iconRegistry.addSvgIcon(
        icons[i][0],
        domSanitizer.bypassSecurityTrustResourceUrl(icons[i][1]),
      );
    }
  }

  ngOnInit(): void {
    this.translate.setDefaultLang('ja');
    this.translate.use('ja');
  }
}
