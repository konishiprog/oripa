import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { HttpClient } from '@angular/common/http';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { MatDialog } from '@angular/material/dialog';
import { CardService } from '../../service/card.service';
import { UserService } from '../../service/user.service';
import { CoinExchangeDialogComponent } from '../coinExchangeDialog/coinExchangeDialog.component';
import { ShippingConfirmDialogComponent } from '../shippingConfirmDialog/shippingConfirmDialog.component';
import { CARD_STATUS, EXCHANGE_TYPE } from '../../constants/card';

export type CardHistoryTab = 'unselected' | 'pending' | 'shipped';

const CARD_HISTORY_TABS = {
  UNSELECTED: 'unselected' as const,
  PENDING: 'pending' as const,
  SHIPPED: 'shipped' as const,
};

const STATUS_TO_TAB_MAP: Record<string, CardHistoryTab> = {
  [CARD_STATUS.SHIPPING_PENDING]: CARD_HISTORY_TABS.PENDING,
  [CARD_STATUS.SHIPPED]: CARD_HISTORY_TABS.SHIPPED,
};

export interface UserCard {
  id: string;
  gachaId: string;
  name: string;
  imageFront: string;
  imageBack: string;
  cardType: string;
  exchangeType: string;
  exchangeCoins: number | null;
  isDrawn: string;
  gachaName: string | null;
  trackingNumber: string | null;
  status: CardHistoryTab;
}

@Component({
  selector: 'app-user-card-history-page',
  standalone: false,
  templateUrl: './userCardHistoryPage.component.html',
  styleUrls: [
    './userCardHistoryPage.component.css',
    './userCardHistoryPage.responsive.component.css',
  ],
})
export class UserCardHistoryPageComponent implements OnInit {
  readonly CARD_STATUS = CARD_STATUS;
  readonly CARD_HISTORY_TABS = CARD_HISTORY_TABS;

  activeTab: CardHistoryTab = CARD_HISTORY_TABS.UNSELECTED;
  isLoading: boolean = true;
  cards: UserCard[] = [];
  chevronSvg: SafeHtml = '';
  mode: 'exchange' | 'shipping' = 'exchange';
  hasNewCards: boolean = false;

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
        .map((card: any) => {
          const status: CardHistoryTab =
            (STATUS_TO_TAB_MAP[card.isDrawn] as CardHistoryTab) ||
            CARD_HISTORY_TABS.UNSELECTED;
          return {
            id: card.id,
            gachaId: card.gachaId,
            name: card.name,
            imageFront: card.imageFront,
            imageBack: card.imageBack,
            cardType: card.cardType,
            exchangeType: card.exchangeType,
            exchangeCoins: card.exchangeCoins,
            isDrawn: card.isDrawn,
            gachaName: card.gachaName,
            trackingNumber: card.trackingNumber || null,
            status,
          };
        });
    } catch (error) {
      console.error('Failed to load user cards:', error);
    } finally {
      this.isLoading = false;
      this.checkForNewCards();
      this.cdr.markForCheck();
    }
  }

  private checkForNewCards(): void {
    const unselectedCards = this.cards.filter(
      (card) => card.status === CARD_HISTORY_TABS.UNSELECTED,
    );
    const seenCardIds = this.getSeenCardIds();
    this.hasNewCards = unselectedCards.some(
      (card) => !seenCardIds.includes(card.id),
    );
  }

  private getSeenCardIds(): string[] {
    const stored = localStorage.getItem('seenCardIds');
    return stored ? JSON.parse(stored) : [];
  }

  private markCardsAsSeen(): void {
    const unselectedCards = this.cards.filter(
      (card) => card.status === CARD_HISTORY_TABS.UNSELECTED,
    );
    const cardIds = unselectedCards.map((card) => card.id);
    const seenCardIds = this.getSeenCardIds();
    const allSeenIds = Array.from(new Set([...seenCardIds, ...cardIds]));
    localStorage.setItem('seenCardIds', JSON.stringify(allSeenIds));
  }

  goBack(): void {
    this.router.navigate(['/myPage']);
  }

  selectTab(tab: CardHistoryTab): void {
    this.activeTab = tab;
  }

  get filteredCards(): UserCard[] {
    let filtered = this.cards.filter((card) => card.status === this.activeTab);
    if (this.activeTab === CARD_HISTORY_TABS.UNSELECTED) {
      if (this.mode === 'exchange') {
        filtered = filtered.filter((card) => this.isExchangeable(card));
      } else {
        filtered = filtered.filter((card) => this.isShippable(card));
      }
    }
    return filtered;
  }

  get emptyMessageKey(): string {
    switch (this.activeTab) {
      case CARD_HISTORY_TABS.PENDING:
        return 'card-history.empty-pending';
      case CARD_HISTORY_TABS.SHIPPED:
        return 'card-history.empty-shipped';
      default:
        return 'card-history.empty-unselected';
    }
  }

  isExchangeable(card: UserCard): boolean {
    return (
      card.exchangeType === EXCHANGE_TYPE.BOTH ||
      card.exchangeType === EXCHANGE_TYPE.COIN_ONLY
    );
  }

  isShippable(card: UserCard): boolean {
    return (
      card.exchangeType === EXCHANGE_TYPE.BOTH ||
      card.exchangeType === EXCHANGE_TYPE.SHIPPING_ONLY
    );
  }

  isSelectableForCurrentMode(card: UserCard): boolean {
    if (this.activeTab === CARD_HISTORY_TABS.SHIPPED) {
      return true;
    }
    if (this.mode === 'exchange') {
      return this.isExchangeable(card) && card.isDrawn !== CARD_STATUS.REFUNDED;
    } else {
      return (
        this.isShippable(card) &&
        card.isDrawn !== CARD_STATUS.REFUNDED &&
        card.isDrawn !== CARD_STATUS.SHIPPING_PENDING
      );
    }
  }

  toggleSelect(card: UserCard): void {
    if (!this.isSelectableForCurrentMode(card)) return;
    if (this.selectedCardIds.has(card.id)) {
      this.selectedCardIds.delete(card.id);
    } else {
      this.selectedCardIds.add(card.id);
    }
  }

  isAllSelected(): boolean {
    const selectableCards = this.filteredCards.filter((card) =>
      this.isSelectableForCurrentMode(card),
    );
    if (selectableCards.length === 0) return false;
    return selectableCards.every((card) => this.selectedCardIds.has(card.id));
  }

  toggleSelectAll(): void {
    const selectableCards = this.filteredCards.filter((card) =>
      this.isSelectableForCurrentMode(card),
    );
    if (this.isAllSelected()) {
      selectableCards.forEach((card) => this.selectedCardIds.delete(card.id));
    } else {
      selectableCards.forEach((card) => this.selectedCardIds.add(card.id));
    }
  }

  switchMode(newMode: 'exchange' | 'shipping'): void {
    this.mode = newMode;
    this.selectedCardIds.clear();
    if (newMode === 'shipping') {
      this.markCardsAsSeen();
      this.checkForNewCards();
    }
  }

  get selectedTotalCoins(): number {
    return this.filteredCards
      .filter((card) => this.selectedCardIds.has(card.id))
      .reduce((sum, card) => sum + (card.exchangeCoins ?? 0), 0);
  }

  get hasSelectedCards(): boolean {
    return this.selectedCardIds.size > 0;
  }

  openExchangeDialog(): void {
    const dialogRef = this.dialog.open(CoinExchangeDialogComponent, {
      width: '320px',
      data: { coins: this.selectedTotalCoins },
      disableClose: true,
    });
    dialogRef.afterClosed().subscribe(async (result) => {
      if (result === true) {
        await this.executeExchange();
      }
    });
  }

  async executeExchange(): Promise<void> {
    this.isLoading = true;
    this.cdr.detectChanges();
    try {
      const userId = this.userService.getUserId();
      if (!userId) {
        console.error('User ID not found. Please log in again.');
        return;
      }

      const selectedCards = this.filteredCards.filter((card) =>
        this.selectedCardIds.has(card.id),
      );
      const totalCoins = this.selectedTotalCoins;
      const currentCoin = this.userService.getCoin() ?? 0;
      const exchangedCardIds = selectedCards.map((card) => card.id);

      for (const card of selectedCards) {
        await this.cardService.exchangeCard(card.id);
        card.isDrawn = CARD_STATUS.REFUNDED;
      }

      await this.userService.updateUser(userId, {
        coin: currentCoin + totalCoins,
      });
      this.userService.saveCoin(currentCoin + totalCoins);

      await this.userService.notifyCardExchange(userId, exchangedCardIds);

      this.cards = this.cards.filter(
        (card) => !this.selectedCardIds.has(card.id),
      );
      this.selectedCardIds.clear();
      this.checkForNewCards();
      this.cdr.markForCheck();
    } catch (error) {
      console.error('Failed to exchange cards:', error);
    } finally {
      this.isLoading = false;
      this.cdr.markForCheck();
    }
  }

  async startShipping(): Promise<void> {
    if (this.selectedCardIds.size === 0) {
      return;
    }

    this.isLoading = true;
    this.cdr.detectChanges();
    try {
      const selectedCards = this.cards.filter((card) =>
        this.selectedCardIds.has(card.id),
      );

      for (const card of selectedCards) {
        await this.cardService.updateCardStatus(
          card.id,
          CARD_STATUS.SHIPPING_PENDING,
        );
        card.isDrawn = CARD_STATUS.SHIPPING_PENDING;
        card.status = CARD_HISTORY_TABS.PENDING;
      }

      this.selectedCardIds.clear();
      this.checkForNewCards();
      this.cdr.markForCheck();
    } catch (error) {
      console.error('Failed to start shipping:', error);
    } finally {
      this.isLoading = false;
      this.cdr.markForCheck();
    }
  }

}
