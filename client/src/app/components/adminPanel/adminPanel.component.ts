import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router, NavigationEnd } from '@angular/router';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { TranslateService } from '@ngx-translate/core';
import { filter } from 'rxjs/operators';
import { BREADCRUMB_MAP } from '../../config/breadcrumb.config';

@Component({
  selector: 'app-admin-panel',
  standalone: false,
  templateUrl: './adminPanel.component.html',
  styleUrls: [
    './adminPanel.component.css',
    './adminPanel.responsive.component.css',
  ],
})
export class AdminPanelComponent implements OnInit {
  breadcrumbTitle: string = '';
  isSidebarOpen: boolean = false;
  private iconCache: Map<string, SafeHtml> = new Map();
  private readonly CACHE_BUST = new Date().getTime();

  constructor(
    private router: Router,
    private http: HttpClient,
    private sanitizer: DomSanitizer,
    private translate: TranslateService,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.translate.use('ja');
    this.updateBreadcrumb();
    this.loadIcons();
    this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe(() => {
        this.updateBreadcrumb();
        this.isSidebarOpen = false;
      });

    this.translate.onLangChange.subscribe(() => {
      this.updateBreadcrumb();
    });
  }

  toggleSidebar(): void {
    this.isSidebarOpen = !this.isSidebarOpen;
  }

  closeSidebar(): void {
    this.isSidebarOpen = false;
  }

  private loadIcons(): void {
    const iconPaths = [
      'assets/icons/notification.svg',
      'assets/icons/search.svg',
      'assets/icons/menu.svg',
    ];

    iconPaths.forEach((iconPath) => {
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
    });
  }

  getIcon(iconPath: string): SafeHtml {
    return this.iconCache.get(iconPath) || '';
  }

  private updateBreadcrumb(): void {
    const url = this.router.url;
    const breadcrumb = BREADCRUMB_MAP.find((item) => item.route === url);
    if (breadcrumb) {
      this.translate.get(breadcrumb.i18nKey).subscribe((translated: string) => {
        this.breadcrumbTitle = translated;
      });
    } else {
      this.breadcrumbTitle = '';
    }
  }
}
