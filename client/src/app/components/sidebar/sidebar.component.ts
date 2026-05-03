import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { TranslateService } from '@ngx-translate/core';
import { SidebarService } from '../../service/sidebar.service';
import { SIDEBAR_MENU, MenuSection, MenuItem } from '../../config/sidebar-menu.config';

@Component({
  selector: 'app-sidebar',
  standalone: false,
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css'],
})
export class SidebarComponent implements OnInit {
  logoSvg: SafeHtml = '';
  adminEmail: string = '';
  menuSections: MenuSection[] = SIDEBAR_MENU;
  iconCache: Map<string, SafeHtml> = new Map();

  constructor(
    private http: HttpClient,
    private sanitizer: DomSanitizer,
    private translateService: TranslateService,
    private sidebarService: SidebarService,
  ) {}


  ngOnInit(): void {
    this.translateService.setDefaultLang('ja');
    this.translateService.use('ja');
    this.loadLogo();
    this.loadIcons();
    this.loadAdminEmail();
  }

  private async loadAdminEmail(): Promise<void> {
    try {
      const admin = await this.sidebarService.getCurrentAdmin();
      this.adminEmail = admin?.email ?? '';
    } catch (error) {
      console.error('Failed to load admin email:', error);
    }
  }

  private loadLogo(): void {
    this.http.get('assets/icons/logo.svg', { responseType: 'text' }).subscribe({
      next: (svg) => {
        this.logoSvg = this.sanitizer.bypassSecurityTrustHtml(svg);
      },
      error: (error) => {
        console.error('Failed to load logo:', error);
      }
    });
  }

  private loadIcons(): void {
    const iconPaths = new Set<string>();
    this.menuSections.forEach(section => {
      section.items.forEach(item => {
        iconPaths.add(item.icon);
      });
    });

    iconPaths.forEach(iconPath => {
      this.http.get(iconPath, { responseType: 'text' }).subscribe({
        next: (svg) => {
          this.iconCache.set(iconPath, this.sanitizer.bypassSecurityTrustHtml(svg));
        },
        error: (error) => {
          console.error(`Failed to load icon ${iconPath}:`, error);
        }
      });
    });
  }

  getIcon(iconPath: string): SafeHtml {
    return this.iconCache.get(iconPath) || '';
  }
}
