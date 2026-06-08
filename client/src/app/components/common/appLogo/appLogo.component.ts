import { Component, OnInit, Input } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { Router } from '@angular/router';

@Component({
  selector: 'app-logo',
  standalone: false,
  templateUrl: './appLogo.component.html',
  styleUrls: ['./appLogo.component.css']
})
export class AppLogoComponent implements OnInit {
  @Input() class: string = '';
  logoSvg: SafeHtml = '';

  constructor(private http: HttpClient, private sanitizer: DomSanitizer, private router: Router) {}

  ngOnInit() {
    this.http.get('assets/icons/logo.svg', { responseType: 'text' }).subscribe({
      next: (svg) => {
        this.logoSvg = this.sanitizer.bypassSecurityTrustHtml(svg);
      },
      error: (error) => {
        console.error('Failed to load logo SVG', error);
      }
    });
  }

  goToGachaPage(): void {
    this.router.navigate(['/userGachaPage']);
  }
}
