import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-footer-links',
  standalone: false,
  templateUrl: './footerLinks.component.html',
  styleUrls: [
    './footerLinks.component.css',
    './footerLinks.responsive.component.css',
  ],
})
export class FooterLinksComponent {
  @Input() hideOnDesktop: boolean = false;
}
