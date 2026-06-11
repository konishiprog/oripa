import {
  Component,
  ChangeDetectorRef,
  Inject,
  OnInit,
  Optional,
} from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { TranslateService } from '@ngx-translate/core';
import { CardService } from '../../service/card.service';
import { UserService } from '../../service/user.service';
import { EXCHANGE_TYPE } from '../../constants/card';

export interface DrawnCard {
  id: string;
  name: string;
  imageFront: string;
  imageBack: string;
  cardType?: string;
  effectName?: string;
  effectUrl?: string;
  exchangeType?: string;
  exchangeCoins?: number | null;
}

export interface GachaDrawResultDialogData {
  drawnCards: DrawnCard[];
}

@Component({
  selector: 'app-gacha-draw-result-dialog',
  standalone: false,
  templateUrl: './gachaDrawResultDialog.component.html',
  styleUrls: [
    './gachaDrawResultDialog.component.css',
    './gachaDrawResultDialog.responsive.component.css',
  ],
})
export class GachaDrawResultDialogComponent implements OnInit {
  readonly EXCHANGE_TYPE = EXCHANGE_TYPE;

  drawnCards: DrawnCard[] = [];
  revealed: boolean[] = [];
  currentIndex: number = 0;
  showSummary: boolean = false;
  isPlayingEffect: boolean = false;
  selectedCardIds = new Set<string>();
  isExchanging: boolean = false;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: GachaDrawResultDialogData,
    private translateService: TranslateService,
    private cdr: ChangeDetectorRef,
    @Optional() private dialogRef: MatDialogRef<GachaDrawResultDialogComponent>,
    private cardService: CardService,
    private userService: UserService,
  ) {}

  ngOnInit(): void {
    this.translateService.setDefaultLang('ja');
    this.translateService.use('ja');
    this.drawnCards = this.data?.drawnCards ?? [];
    this.revealed = this.drawnCards.map(() => false);
    this.startEffectForCurrent();
  }

  get currentCard(): DrawnCard | null {
    return this.drawnCards[this.currentIndex] ?? null;
  }

  private startEffectForCurrent(): void {
    const card = this.currentCard;
    this.isPlayingEffect = !!card?.effectUrl && !this.isCurrentRevealed;
    this.cdr.markForCheck();
  }

  onEffectEnded(): void {
    if (!this.isPlayingEffect) return;
    this.isPlayingEffect = false;
    this.revealed[this.currentIndex] = true;
    this.cdr.markForCheck();
    if (this.hasEffectUrl) {
      setTimeout(() => this.next(), 300);
    }
  }

  get isCurrentRevealed(): boolean {
    return this.revealed[this.currentIndex] === true;
  }

  get isLast(): boolean {
    return this.currentIndex >= this.drawnCards.length - 1;
  }

  get hasEffectUrl(): boolean {
    return !!this.currentCard?.effectUrl;
  }

  get isShowingEffect(): boolean {
    return (
      !this.showSummary &&
      !!this.currentCard &&
      (this.isPlayingEffect || this.hasEffectUrl)
    );
  }

  reveal(): void {
    if (this.isPlayingEffect || this.isCurrentRevealed) return;
    this.revealed[this.currentIndex] = true;
    this.cdr.markForCheck();
  }

  next(): void {
    if (this.isPlayingEffect) return;
    if (!this.isCurrentRevealed) {
      this.reveal();
      return;
    }
    if (this.isLast) {
      this.enterSummary();
      return;
    }
    this.currentIndex += 1;
    this.startEffectForCurrent();
    this.cdr.markForCheck();
  }

  revealAll(): void {
    this.isPlayingEffect = false;
    this.revealed = this.drawnCards.map(() => true);
    this.enterSummary();
  }

  private enterSummary(): void {
    this.showSummary = true;
    this.dialogRef?.updateSize('520px', '');
    this.cdr.markForCheck();
  }

  skipCurrentEffect(): void {
    if (this.isPlayingEffect) {
      this.onEffectEnded();
    }
  }

  close(): void {
    this.dialogRef?.close();
  }

  isExchangeable(card: DrawnCard): boolean {
    return (
      card.exchangeType === EXCHANGE_TYPE.BOTH ||
      card.exchangeType === EXCHANGE_TYPE.COIN_ONLY
    );
  }

  toggleSelect(card: DrawnCard): void {
    if (!this.isExchangeable(card)) return;
    if (this.selectedCardIds.has(card.id)) {
      this.selectedCardIds.delete(card.id);
    } else {
      this.selectedCardIds.add(card.id);
    }
    this.cdr.markForCheck();
  }

  get selectedTotalCoins(): number {
    return this.drawnCards
      .filter((card) => this.selectedCardIds.has(card.id))
      .reduce((sum, card) => sum + (card.exchangeCoins ?? 0), 0);
  }

  get hasSelectedCards(): boolean {
    return this.selectedCardIds.size > 0;
  }

  async executeExchange(): Promise<void> {
    if (this.selectedCardIds.size === 0) return;

    this.isExchanging = true;
    this.cdr.markForCheck();

    try {
      const userId = this.userService.getUserId();
      if (!userId) {
        alert(
          this.translateService.instant('gacha-draw-result.exchange-error'),
        );
        return;
      }

      const selectedCards = this.drawnCards.filter((card) =>
        this.selectedCardIds.has(card.id),
      );
      const totalCoins = this.selectedTotalCoins;
      const currentCoin = this.userService.getCoin() ?? 0;

      for (const card of selectedCards) {
        await this.cardService.exchangeCard(card.id);
      }

      await this.userService.updateUser(userId, {
        coin: currentCoin + totalCoins,
      });
      this.userService.saveCoin(currentCoin + totalCoins);

      this.drawnCards = this.drawnCards.filter(
        (card) => !this.selectedCardIds.has(card.id),
      );
      this.selectedCardIds.clear();

      this.cdr.markForCheck();
    } catch (error) {
      console.error('Failed to exchange cards:', error);
      alert(this.translateService.instant('gacha-draw-result.exchange-error'));
    } finally {
      this.isExchanging = false;
      this.cdr.markForCheck();
    }
  }
}
