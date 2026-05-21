import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { GachaService } from '../../service/gacha.service';

export interface UserGacha {
  id: string;
  name: string;
  headerImage: string;
  cost: number;
  remainingCount: number;
  isPublic: boolean;
  publishStart: string;
  publishEnd: string | null;
}

export type GachaTab = 'new' | 'popular';

@Component({
  selector: 'app-user-gacha-page',
  standalone: false,
  templateUrl: './userGachaPage.component.html',
  styleUrls: ['./userGachaPage.component.css'],
})
export class UserGachaPageComponent implements OnInit {
  gachas: UserGacha[] = [];
  isLoading: boolean = true;
  activeTab: GachaTab = 'new';

  constructor(
    private gachaService: GachaService,
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
      const data = await this.gachaService.getGachas();
      this.gachas = data
        .filter((gacha: any) => gacha.isPublic)
        .map((gacha: any) => ({
          id: gacha.id,
          name: gacha.name,
          headerImage: gacha.headerImage,
          cost: gacha.cost,
          remainingCount: gacha.remainingCount ?? 0,
          isPublic: gacha.isPublic ?? false,
          publishStart: gacha.publishStart,
          publishEnd: gacha.publishEnd,
        }))
        .sort((gachaA, gachaB) => gachaB.id - gachaA.id);
    } catch (error) {
      console.error('Failed to load gachas:', error);
    } finally {
      this.isLoading = false;
      this.cdr.markForCheck();
    }
  }

  selectTab(tab: GachaTab): void {
    this.activeTab = tab;
  }
}
