import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { HttpClient } from '@angular/common/http';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { MatDialog } from '@angular/material/dialog';
import { CardService } from '../../service/card.service';
import { UserService } from '../../service/user.service';
import { CoinExchangeDialogComponent } from '../coinExchangeDialog/coinExchangeDialog.component';
import { CARD_STATUS, EXCHANGE_TYPE } from '../../constants/card';

export type CardHistoryTab = 'unselected' | 'pending' | 'shipped';

export interface UserCard {
  id: string;
  gachaId: string;
  name: string;
  imageFront: string;
  imageBack: string;
  cardType: string;
  exchangeType: string;
  exchangePoints: number | null;
  isDrawn: string;
  gachaName: string | null;
  status: CardHistoryTab;
}

@Component({
  selector: 'app-user-card-history-page',
  standalone: false,
  templateUrl: './userCardHistoryPage.component.html',
  styleUrls: ['./userCardHistoryPage.component.css'],
})
export class UserCardHistoryPageComponent implements OnInit {
  readonly CARD_STATUS = CARD_STATUS;

  activeTab: CardHistoryTab = 'unselected';
  isLoading: boolean = true;
  cards: UserCard[] = [];
  chevronSvg: SafeHtml = '';

  selectedCardIds = new Set<string>();

  constructor(
    private cardService: CardService,
    private userService: UserService,
    private translateService: TranslateService,
    private router: Router,
    private cdr: ChangeDetectorRef,
    private http: HttpClient,
    private sanitizer: DomSanitizer,
    private dialog: MatDialog,
  ) {}

  async ngOnInit(): Promise<void> {
    this.translateService.setDefaultLang('ja');
    this.translateService.use('ja');

    this.http
      .get('assets/icons/chevron-right.svg', { responseType: 'text' })
      .subscribe({
        next: (svg) => {
          this.chevronSvg = this.sanitizer.bypassSecurityTrustHtml(svg);
          this.cdr.markForCheck();
        },
      });

    const userId = this.userService.getUserId();
    if (!userId) {
      this.router.navigate(['/userGachaPage']);
      return;
    }

    try {
      const data = await this.cardService.getCardsByUserId(userId);
      this.cards = data
        .filter((card: any) => card.isDrawn !== CARD_STATUS.REFUNDED)
        .map((card: any) => ({
          id: card.id,
          gachaId: card.gachaId,
          name: card.name,
          imageFront: card.imageFront,
          imageBack: card.imageBack,
          cardType: card.cardType,
          exchangeType: card.exchangeType,
          exchangePoints: card.exchangePoints,
          isDrawn: card.isDrawn,
          gachaName: card.gachaName,
          status: 'unselected',
        }));
    } catch (error) {
      console.error('Failed to load user cards:', error);
    } finally {
      this.isLoading = false;
      this.cdr.markForCheck();
    }
  }

  goBack(): void {
    this.router.navigate(['/myPage']);
  }

  selectTab(tab: CardHistoryTab): void {
    this.activeTab = tab;
  }

  get filteredCards(): UserCard[] {
    return this.cards.filter((card) => card.status === this.activeTab);
  }

  get emptyMessageKey(): string {
    switch (this.activeTab) {
      case 'pending':
        return 'card-history.empty-pending';
      case 'shipped':
        return 'card-history.empty-shipped';
      default:
        return 'card-history.empty-unselected';
    }
  }

  isExchangeable(card: UserCard): boolean {
    return card.exchangeType === EXCHANGE_TYPE.BOTH;
  }

  toggleSelect(card: UserCard): void {
    if (!this.isExchangeable(card) || card.isDrawn === CARD_STATUS.REFUNDED)
      return;
    if (this.selectedCardIds.has(card.id)) {
      this.selectedCardIds.delete(card.id);
    } else {
      this.selectedCardIds.add(card.id);
    }
  }

  get selectedTotalPoints(): number {
    return this.filteredCards
      .filter((card) => this.selectedCardIds.has(card.id))
      .reduce((sum, card) => sum + (card.exchangePoints ?? 0), 0);
  }

  get hasSelectedCards(): boolean {
    return this.selectedCardIds.size > 0;
  }

  openExchangeDialog(): void {
    const dialogRef = this.dialog.open(CoinExchangeDialogComponent, {
      width: '320px',
      data: { points: this.selectedTotalPoints },
      disableClose: true,
    });
    dialogRef.afterClosed().subscribe(async (result) => {
      if (result === true) {
        await this.executeExchange();
      }
    });
  }

  async executeExchange(): Promise<void> {
    try {
      const userId = this.userService.getUserId();
      if (!userId) {
        console.error('User ID not found. Please log in again.');
        return;
      }

      const selectedCards = this.filteredCards.filter((c) =>
        this.selectedCardIds.has(c.id),
      );
      const totalPoints = this.selectedTotalPoints;
      const currentCoin = this.userService.getCoin() ?? 0;

      for (const card of selectedCards) {
        await this.cardService.exchangeCard(card.id);
        card.isDrawn = CARD_STATUS.REFUNDED;
      }

      await this.userService.updateUser(userId, {
        coin: currentCoin + totalPoints,
      });
      this.userService.saveCoin(currentCoin + totalPoints);

      this.cards = this.cards.filter((c) => !this.selectedCardIds.has(c.id));
      this.selectedCardIds.clear();
      this.cdr.markForCheck();
    } catch (error) {
      console.error('Failed to exchange cards:', error);
    }
  }
}
