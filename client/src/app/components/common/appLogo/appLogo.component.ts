import { Component, OnInit, Input, ChangeDetectorRef } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { Router } from '@angular/router';

@Component({
  selector: 'app-logo',
  standalone: false,
  templateUrl: './appLogo.component.html',
  styleUrls: ['./appLogo.component.css'],
})
export class AppLogoComponent implements OnInit {
  @Input() class: string = '';
  private iconCache: Map<string, SafeHtml> = new Map();
  private readonly CACHE_BUST = new Date().getTime();

  constructor(
    private http: HttpClient,
    private sanitizer: DomSanitizer,
    private router: Router,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.loadIcon();
  }

  private loadIcon(): void {
    const iconPath = 'assets/icons/logo.svg';
    this.http
      .get(`${iconPath}?v=${this.CACHE_BUST}`, { responseType: 'text' })
      .subscribe({
        next: (svg) => {
          this.iconCache.set(
            iconPath,
            this.sanitizer.bypassSecurityTrustHtml(svg),
          );
          this.cdr.markForCheck();
        },
        error: (error) => {
          console.error(
            `Failed to load icon ${iconPath}:`,
            error.status,
            error.statusText,
            error.url,
          );
        },
      });
  }

  getIcon(iconPath: string): SafeHtml {
    return this.iconCache.get(iconPath) || '';
  }

  goToGachaPage(): void {
    this.router.navigate(['/userGachaPage']);
  }
}
