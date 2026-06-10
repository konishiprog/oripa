import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { GachaService } from '../../service/gacha.service';
import { CardService } from '../../service/card.service';
import { UserService } from '../../service/user.service';
import { GachaDrawService } from '../../common/gacha-draw.service';

export interface GachaDetail {
  id: string;
  name: string;
  headerImage: string;
  consumptionType: string;
  cost: number;
  oncePerUser: boolean;
  alreadyDrawn: boolean;
  remainingCount: number;
  totalCount: number;
  publishStart: string;
  publishEnd: string | null;
  isPublic: boolean;
  minExchangeCoins: number;
}

export interface JackpotCard {
  id: string;
  name: string;
  imageFront: string;
}

interface CautionState {
  isOpen: boolean;
}

@Component({
  selector: 'app-gacha-detail-page',
  standalone: false,
  templateUrl: './gachaDetailPage.component.html',
  styleUrls: [
    './gachaDetailPage.component.css',
    './gachaDetailPage.responsive.component.css',
  ],
})
export class GachaDetailPageComponent implements OnInit {
  gacha: GachaDetail | null = null;
  jackpotCards: JackpotCard[] = [];
  isLoading: boolean = true;
  isDrawing: boolean = false;
  gachaId: string = '';
  cautionState: CautionState = { isOpen: false };

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private gachaService: GachaService,
    private cardService: CardService,
    private userService: UserService,
    private translateService: TranslateService,
    private cdr: ChangeDetectorRef,
    private gachaDrawService: GachaDrawService,
  ) {}

  ngOnInit(): void {
    this.translateService.setDefaultLang('ja');
    this.translateService.use('ja');
    this.route.params.subscribe((params) => {
      this.gachaId = params['id'];
      this.loadGachaDetail();
      this.loadJackpotCards();
    });
  }

  async loadGachaDetail(): Promise<void> {
    try {
      const data = await this.gachaService.getGachaById(this.gachaId);
      const minExchangeCoins = await this.getMinExchangeCoins();
      this.gacha = {
        id: data.id,
        name: data.name,
        headerImage: data.headerImage,
        consumptionType: data.consumptionType ?? 'COIN',
        cost: data.cost,
        oncePerUser: data.oncePerUser ?? false,
        alreadyDrawn: data.alreadyDrawn ?? false,
        remainingCount: data.remainingCount ?? 0,
        totalCount: data.totalCount ?? 0,
        publishStart: data.publishStart,
        publishEnd: data.publishEnd,
        isPublic: data.isPublic ?? false,
        minExchangeCoins: minExchangeCoins,
      };
    } catch (error) {
      console.error('Failed to load gacha detail:', error);
      this.router.navigate(['/userGachaPage']);
    } finally {
      this.isLoading = false;
      this.cdr.markForCheck();
    }
  }

  private async getMinExchangeCoins(): Promise<number> {
    try {
      const cards = await this.cardService.getCardsByGachaId(this.gachaId);
      if (cards.length === 0) return 0;
      const exchangeCoins = cards
        .map((card: any) => card.exchangeCoins ?? 0)
        .filter((coins: number) => coins > 0);
      return exchangeCoins.length > 0 ? Math.min(...exchangeCoins) : 0;
    } catch (error) {
      console.error('Failed to get minimum exchange coins:', error);
      return 0;
    }
  }

  async loadJackpotCards(): Promise<void> {
    try {
      const cards = await this.cardService.getCardsByGachaId(this.gachaId);
      this.jackpotCards = cards
        .filter((card: any) => card.cardType === 'SSR')
        .map((card: any) => ({
          id: card.id,
          name: card.name,
          imageFront: card.imageFront,
        }));
    } catch (error) {
      console.error('Failed to load jackpot cards:', error);
    } finally {
      this.cdr.markForCheck();
    }
  }

  get isLoggedIn(): boolean {
    return this.userService.isLoggedIn();
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}年${month}月${day}日`;
  }

  async draw(requested: number): Promise<void> {
    if (!this.gacha || this.isDrawing) return;

    this.isDrawing = true;
    this.cdr.markForCheck();

    try {
      const outcome = await this.gachaDrawService.draw(this.gacha, requested);
      if (outcome && this.gacha) {
        this.gacha = {
          ...this.gacha,
          remainingCount: outcome.remainingCount,
          alreadyDrawn: this.gacha.oncePerUser ? true : this.gacha.alreadyDrawn,
        };
        outcome.dialogRef?.afterClosed().subscribe(() => {
          this.router.navigate(['/userGachaPage']);
        });
      }
    } catch (error: any) {
      console.error('Failed to draw gacha:', error);
      alert(this.gachaDrawService.resolveDrawErrorMessage(error));
    } finally {
      this.isDrawing = false;
      this.cdr.markForCheck();
    }
  }

  goBack(): void {
    this.router.navigate(['/userGachaPage']);
  }

  toggleCaution(): void {
    this.cautionState.isOpen = !this.cautionState.isOpen;
    this.cdr.markForCheck();
  }

  navigateToTerms(): void {
    this.router.navigate(['/terms']);
  }
}
