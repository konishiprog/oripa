import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { TranslateService } from '@ngx-translate/core';
import { GachaService } from '../../service/gacha.service';
import { UserService } from '../../service/user.service';
import { UserLoginDialogComponent } from '../userLoginDialog/userLoginDialog.component';

export interface UserGacha {
  id: number;
  name: string;
  headerImage: string;
  cost: number;
  isPublic: boolean;
  publishStart: string;
  publishEnd: string | null;
}

@Component({
  selector: 'app-user-gacha-page',
  standalone: false,
  templateUrl: './userGachaPage.component.html',
  styleUrls: ['./userGachaPage.component.css'],
})
export class UserGachaPageComponent implements OnInit {
  gachas: UserGacha[] = [];
  isLoading: boolean = true;
  isLoggedIn: boolean = false;

  constructor(
    private gachaService: GachaService,
    private userService: UserService,
    private dialog: MatDialog,
    private cdr: ChangeDetectorRef,
    private translateService: TranslateService,
  ) {}

  ngOnInit(): void {
    this.translateService.setDefaultLang('ja');
    this.translateService.use('ja');
    this.loadGachas();
    this.isLoggedIn = this.userService.isLoggedIn();
  }

  openLoginDialog(): void {
    const dialogRef = this.dialog.open(UserLoginDialogComponent, {
      width: '420px',
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result?.success) {
        this.isLoggedIn = true;
        this.cdr.markForCheck();
      }
    });
  }

  logout(): void {
    this.userService.clearUserId();
    this.isLoggedIn = false;
    this.cdr.markForCheck();
  }

  goToMyPage(): void {
    console.log('My page navigation not yet implemented');
  }

  async loadGachas(): Promise<void> {
    try {
      const data = await this.gachaService.getGachas();
      this.gachas = data
        .filter((gacha: any) => gacha.isPublic)
        .map((gacha: any) => ({
          id: gacha.id,
          name: gacha.name,
          headerImage: gacha.headerImage,
          cost: gacha.cost,
          isPublic: gacha.isPublic ?? false,
          publishStart: gacha.publishStart,
          publishEnd: gacha.publishEnd,
        }));
    } catch (error) {
      console.error('Failed to load gachas:', error);
    } finally {
      this.isLoading = false;
      this.cdr.markForCheck();
    }
  }

  formatPrice(cost: number): string {
    return `¥${cost.toLocaleString()}`;
  }
}
