import { Component } from '@angular/core';
import { MatIconRegistry } from '@angular/material/icon';
import { DomSanitizer } from '@angular/platform-browser';

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
export class AppComponent {
  protected title = 'app';

  constructor(
    private iconRegistry: MatIconRegistry,
    private domSanitizer: DomSanitizer,
  ) {
    const pathIcons = 'assets/icons/';

    const icons: [string, string][] = [
      ['visible', pathIcons + 'visible.svg'],
      ['invisible', pathIcons + 'invisible.svg'],
    ];

    for (let i = 0; i < icons.length; i++) {
      iconRegistry.addSvgIcon(
        icons[i][0],
        domSanitizer.bypassSecurityTrustResourceUrl(icons[i][1]),
      );
    }
  }
}
