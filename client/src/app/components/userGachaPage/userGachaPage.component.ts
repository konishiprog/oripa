import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { TranslateService } from '@ngx-translate/core';
import { GachaService } from '../../service/gacha.service';
import { UserService } from '../../service/user.service';
import {
  GachaSortDialogComponent,
  GachaSortOrder,
} from '../gachaSortDialog/gachaSortDialog.component';

export interface UserGacha {
  id: string;
  name: string;
  headerImage: string;
  consumptionType: string;
  cost: number;
  oncePerUser: boolean;
  alreadyDrawn: boolean;
  remainingCount: number;
  isPublic: boolean;
  publishStart: string;
  publishEnd: string | null;
}

@Component({
  selector: 'app-user-gacha-page',
  standalone: false,
  templateUrl: './userGachaPage.component.html',
  styleUrls: [
    './userGachaPage.component.css',
    './userGachaPage.responsive.component.css',
  ],
})
export class UserGachaPageComponent implements OnInit {
  gachas: UserGacha[] = [];
  isLoading: boolean = true;
  sortOrder: GachaSortOrder = 'newest';

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
  }

  async loadGachas(): Promise<void> {
    try {
      const userId = this.userService.getUserId() ?? undefined;
      const data = await this.gachaService.getGachas(userId);
      this.gachas = data
        .filter((gacha: any) => gacha.isPublic)
        .map((gacha: any) => ({
          id: gacha.id,
          name: gacha.name,
          headerImage: gacha.headerImage,
          consumptionType: gacha.consumptionType ?? 'COIN',
          cost: gacha.cost,
          oncePerUser: gacha.oncePerUser ?? false,
          alreadyDrawn: gacha.alreadyDrawn ?? false,
          remainingCount: gacha.remainingCount ?? 0,
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

  get sortedGachas(): UserGacha[] {
    return sortGachas(this.gachas, this.sortOrder);
  }

  openSortDialog(): void {
    const dialogRef = this.dialog.open(GachaSortDialogComponent, {
      width: '380px',
      data: { sortOrder: this.sortOrder },
    });
    dialogRef.afterClosed().subscribe((result: GachaSortOrder | undefined) => {
      if (result) {
        this.sortOrder = result;
        this.cdr.markForCheck();
      }
    });
  }
}

function sortGachas(gachas: UserGacha[], order: GachaSortOrder): UserGacha[] {
  const sorted = [...gachas];
  switch (order) {
    case 'newest':
      return sorted.sort(
        (gacha1, gacha2) =>
          new Date(gacha2.publishStart).getTime() -
          new Date(gacha1.publishStart).getTime(),
      );
    case 'cost-high':
      return sorted.sort((gacha1, gacha2) => gacha2.cost - gacha1.cost);
    case 'cost-low':
      return sorted.sort((gacha1, gacha2) => gacha1.cost - gacha2.cost);
    case 'remaining-high':
      return sorted.sort(
        (gacha1, gacha2) => gacha2.remainingCount - gacha1.remainingCount,
      );
    case 'remaining-low':
      return sorted.sort(
        (gacha1, gacha2) => gacha1.remainingCount - gacha2.remainingCount,
      );
  }
}
