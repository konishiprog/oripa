import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute, Router } from '@angular/router';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { TranslateService } from '@ngx-translate/core';
import { GachaService } from '../../service/gacha.service';
import { CardService } from '../../service/card.service';
import { UserService } from '../../service/user.service';
import { GachaDrawService } from '../../common/gacha-draw.service';
import { CARD_TYPES } from '../createCard/createCard.component';
import { FEW_LEFT_RATIO } from '../gachaBox/gachaBox.component';

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

export interface PrizeCard {
  name: string;
  imageFront: string;
  count: number;
}

export interface PrizeGroup {
  cardType: string;
  labelKey: string;
  cards: PrizeCard[];
}

const CAUTION_NOTE_KEYS = [
  'gacha-detail.caution-note-1',
  'gacha-detail.caution-note-2',
  'gacha-detail.caution-note-3',
  'gacha-detail.caution-note-4',
  'gacha-detail.caution-note-5',
  'gacha-detail.caution-note-6',
];

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
  prizeGroups: PrizeGroup[] = [];
  priceIcon: SafeHtml = '';
  warningIcon: SafeHtml = '';
  isLoading: boolean = true;
  isDrawing: boolean = false;
  gachaId: string = '';
  cautionNoteKeys: string[] = CAUTION_NOTE_KEYS;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private gachaService: GachaService,
    private cardService: CardService,
    private userService: UserService,
    private translateService: TranslateService,
    private cdr: ChangeDetectorRef,
    private gachaDrawService: GachaDrawService,
    private http: HttpClient,
    private sanitizer: DomSanitizer,
  ) {}

  ngOnInit(): void {
    this.translateService.setDefaultLang('ja');
    this.translateService.use('ja');
    this.route.params.subscribe((params) => {
      this.gachaId = params['id'];
      this.loadGachaDetail();
    });
  }

  async loadGachaDetail(): Promise<void> {
    try {
      const [data, cards] = await Promise.all([
        this.gachaService.getGachaById(this.gachaId),
        this.loadCards(),
      ]);
      this.prizeGroups = toPrizeGroups(cards);
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
        minExchangeCoins: getMinExchangeCoins(cards),
      };
      this.loadIcon(
        this.usesTicket
          ? 'assets/icons/ticket.svg'
          : 'assets/icons/coin-gold.svg',
        (icon) => (this.priceIcon = icon),
      );
      this.loadIcon(
        'assets/icons/warning.svg',
        (icon) => (this.warningIcon = icon),
      );
    } catch (error) {
      console.error('Failed to load gacha detail:', error);
      this.router.navigate(['/userGachaPage']);
    } finally {
      this.isLoading = false;
      this.cdr.markForCheck();
    }
  }

  private async loadCards(): Promise<any[]> {
    try {
      return await this.cardService.getCardsByGachaId(this.gachaId);
    } catch (error) {
      console.error('Failed to load cards:', error);
      return [];
    }
  }

  private loadIcon(iconPath: string, onLoad: (icon: SafeHtml) => void): void {
    this.http.get(iconPath, { responseType: 'text' }).subscribe({
      next: (svg) => {
        onLoad(this.sanitizer.bypassSecurityTrustHtml(svg));
        this.cdr.markForCheck();
      },
      error: (error) => {
        console.error(`Failed to load icon ${iconPath}:`, error.status);
      },
    });
  }

  get usesTicket(): boolean {
    return this.gacha?.consumptionType === 'TICKET';
  }

  get isFewLeft(): boolean {
    if (!this.gacha) return false;
    return (
      this.gacha.remainingCount > 0 &&
      this.gacha.remainingCount < this.gacha.totalCount * FEW_LEFT_RATIO
    );
  }

  get remainingPercent(): number {
    if (!this.gacha || this.gacha.totalCount === 0) return 0;
    return (this.gacha.remainingCount / this.gacha.totalCount) * 100;
  }

  get isUnavailable(): boolean {
    if (!this.gacha) return false;
    const isExpired =
      !!this.gacha.publishEnd && new Date() > new Date(this.gacha.publishEnd);
    return isExpired || this.gacha.remainingCount === 0;
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

  navigateToTerms(): void {
    this.router.navigate(['/terms']);
  }
}

function getMinExchangeCoins(cards: any[]): number {
  const exchangeCoins = cards
    .map((card: any) => card.exchangeCoins ?? 0)
    .filter((coins: number) => coins > 0);
  return exchangeCoins.length > 0 ? Math.min(...exchangeCoins) : 0;
}

function toPrizeGroups(cards: any[]): PrizeGroup[] {
  return CARD_TYPES.map((cardType) => {
    const prizeCards = new Map<string, PrizeCard>();
    cards
      .filter((card: any) => card.cardType === cardType.value)
      .forEach((card: any) => {
        const prizeCard = prizeCards.get(card.name);
        if (prizeCard) {
          prizeCard.count += 1;
          return;
        }
        prizeCards.set(card.name, {
          name: card.name,
          imageFront: card.imageFront,
          count: 1,
        });
      });
    return {
      cardType: cardType.value,
      labelKey: cardType.labelKey,
      cards: Array.from(prizeCards.values()),
    };
  }).filter((prizeGroup) => prizeGroup.cards.length > 0);
}
