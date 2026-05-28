import { Component, OnInit } from '@angular/core';
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
  notificationIcon: SafeHtml = '';
  searchIcon: SafeHtml = '';
  menuIcon: SafeHtml = '';
  isSidebarOpen: boolean = false;

  constructor(
    private router: Router,
    private http: HttpClient,
    private sanitizer: DomSanitizer,
    private translate: TranslateService,
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
    this.http
      .get('assets/icons/notification.svg', { responseType: 'text' })
      .subscribe({
        next: (svg) => {
          this.notificationIcon = this.sanitizer.bypassSecurityTrustHtml(svg);
        },
        error: (error) => {
          console.error('Failed to load notification icon:', error);
        },
      });

    this.http
      .get('assets/icons/search.svg', { responseType: 'text' })
      .subscribe({
        next: (svg) => {
          this.searchIcon = this.sanitizer.bypassSecurityTrustHtml(svg);
        },
        error: (error) => {
          console.error('Failed to load search icon:', error);
        },
      });

    this.http.get('assets/icons/menu.svg', { responseType: 'text' }).subscribe({
      next: (svg) => {
        this.menuIcon = this.sanitizer.bypassSecurityTrustHtml(svg);
      },
      error: (error) => {
        console.error('Failed to load menu icon:', error);
      },
    });
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
