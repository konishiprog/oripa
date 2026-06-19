import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { MatDialog } from '@angular/material/dialog';
import { TranslateService } from '@ngx-translate/core';
import { UserService } from '../../service/user.service';
import { UserLoginDialogComponent } from '../userLoginDialog/userLoginDialog.component';

@Component({
  selector: 'app-header',
  standalone: false,
  templateUrl: './appHeader.component.html',
  styleUrls: [
    './appHeader.component.css',
    './appHeader.responsive.component.css',
  ],
})
export class AppHeaderComponent implements OnInit {
  isLoggedIn: boolean = false;
  isAdminPage: boolean = false;
  userCoin: number | null = null;
  userTicket: number | null = null;
  isMobileMenuOpen: boolean = false;
  private iconCache: Map<string, SafeHtml> = new Map();
  private readonly CACHE_BUST = new Date().getTime();

  constructor(
    private userService: UserService,
    private router: Router,
    private dialog: MatDialog,
    private cdr: ChangeDetectorRef,
    private translateService: TranslateService,
    private http: HttpClient,
    private sanitizer: DomSanitizer,
  ) {}

  ngOnInit(): void {
    this.translateService.setDefaultLang('ja');
    this.translateService.use('ja');
    this.isLoggedIn = this.userService.isLoggedIn();
    this.userCoin = this.userService.getCoin();
    this.userTicket = this.userService.getTicket();
    this.loadIcons();
    this.checkAdminPage();

    this.userService.coin$$.subscribe((coin) => {
      this.userCoin = coin;
      this.cdr.markForCheck();
    });

    this.userService.ticket$$.subscribe((ticket) => {
      this.userTicket = ticket;
      this.cdr.markForCheck();
    });

    this.router.events.subscribe(() => {
      this.checkAdminPage();
      this.isMobileMenuOpen = false;
    });
  }

  private loadIcons(): void {
    const iconPaths = [
      'assets/icons/menu.svg',
      'assets/icons/close.svg',
      'assets/icons/user-profile.svg',
      'assets/icons/coin-gold.svg',
      'assets/icons/ticket.svg',
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

  toggleMobileMenu(): void {
    this.isMobileMenuOpen = !this.isMobileMenuOpen;
  }

  closeMobileMenu(): void {
    this.isMobileMenuOpen = false;
  }

  private checkAdminPage(): void {
    this.isAdminPage = this.router.url.includes('/adminPanel');
  }

  openLoginDialog(): void {
    this.closeMobileMenu();
    const dialogRef = this.dialog.open(UserLoginDialogComponent, {
      width: '420px',
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result?.success) {
        this.isLoggedIn = true;
        if (result.data?.coin !== undefined) {
          this.userService.saveCoin(result.data.coin);
          this.userCoin = result.data.coin;
        }
        if (result.data?.ticket !== undefined) {
          this.userService.saveTicket(result.data.ticket);
          this.userTicket = result.data.ticket;
        }
        this.cdr.markForCheck();
      }
    });
  }

  logout(): void {
    this.userService.clearUserId();
    this.userService.clearCoin();
    this.userService.clearTicket();
    this.isLoggedIn = false;
    this.userCoin = null;
    this.userTicket = null;
    this.router.navigate(['/userGachaPage']);
    this.cdr.markForCheck();
  }

  goToMyPage(): void {
    this.router.navigate(['/myPage']);
  }

  goToSignup(): void {
    this.router.navigate(['/userSignup']);
  }

  goToAdminPage(): void {
    this.router.navigate(['/login']);
  }

  goToGachaPage(): void {
    this.router.navigate(['/userGachaPage']);
  }

  goToCharge(): void {
    this.router.navigate(['/coinCharge']);
  }

  goToContact(): void {
    this.closeMobileMenu();
    this.router.navigate(['/contact']);
  }
}
