import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { TranslateService } from '@ngx-translate/core';
import { UserService } from '../../service/user.service';
import { UserLoginDialogComponent } from '../userLoginDialog/userLoginDialog.component';

@Component({
  selector: 'app-header',
  standalone: false,
  templateUrl: './appHeader.component.html',
  styleUrls: ['./appHeader.component.css'],
})
export class AppHeaderComponent implements OnInit {
  isLoggedIn: boolean = false;
  isAdminPage: boolean = false;

  constructor(
    private userService: UserService,
    private router: Router,
    private dialog: MatDialog,
    private cdr: ChangeDetectorRef,
    private translateService: TranslateService,
  ) {}

  ngOnInit(): void {
    this.translateService.setDefaultLang('ja');
    this.translateService.use('ja');
    this.isLoggedIn = this.userService.isLoggedIn();
    this.checkAdminPage();
    this.router.events.subscribe(() => {
      this.checkAdminPage();
    });
  }

  private checkAdminPage(): void {
    this.isAdminPage = this.router.url.includes('/adminPanel');
  }

  openLoginDialog(): void {
    const dialogRef = this.dialog.open(UserLoginDialogComponent, {
      width: '420px',
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result?.success) {
        this.isLoggedIn = true;
        if (result.data?.coin !== undefined) {
          this.userService.saveCoin(result.data.coin);
        }
        this.cdr.markForCheck();
      }
    });
  }

  logout(): void {
    this.userService.clearUserId();
    this.userService.clearCoin();
    this.isLoggedIn = false;
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
}
