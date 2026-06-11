import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { TranslateService } from '@ngx-translate/core';
import {
  ShippingInfoService,
  ShippingCardInfo,
} from '../../service/shipping-info.service';
import { CardService } from '../../service/card.service';
import { ShippingCardDetailDialogComponent } from '../shippingCardDetailDialog/shippingCardDetailDialog.component';
import { ShippingConfirmDialogComponent } from '../shippingConfirmDialog/shippingConfirmDialog.component';
import { CARD_STATUS } from '../../constants/card';

interface TableHeader {
  key: string;
  labelKey: string;
}

const SHIPPING_TABLE_HEADERS: TableHeader[] = [
  { key: 'user-name', labelKey: 'shipping-info.table.user-name' },
  { key: 'address', labelKey: 'shipping-info.table.address' },
  { key: 'phone', labelKey: 'shipping-info.table.phone' },
  { key: 'card-info', labelKey: 'shipping-info.table.card-info' },
];

@Component({
  selector: 'app-shipping-info-page',
  standalone: false,
  templateUrl: './shippingInfoPage.component.html',
  styleUrls: [
    './shippingInfoPage.component.css',
    './shippingInfoPage.responsive.component.css',
  ],
})
export class ShippingInfoPageComponent implements OnInit {
  shippingCards: ShippingCardInfo[] = [];
  tableHeaders = SHIPPING_TABLE_HEADERS;
  isLoading: boolean = true;
  error: string | null = null;
  selectedCardIds = new Set<string>();

  constructor(
    private translateService: TranslateService,
    private cdr: ChangeDetectorRef,
    private dialog: MatDialog,
    private shippingInfoService: ShippingInfoService,
    private cardService: CardService,
  ) {}

  ngOnInit(): void {
    this.loadShippingCards();
  }

  private async loadShippingCards(): Promise<void> {
    try {
      this.isLoading = true;
      this.shippingCards = await this.shippingInfoService.getShippingCards();
      this.error = null;
    } catch (err) {
      console.error('Failed to load shipping cards:', err);
      this.error = this.translateService.instant('shipping-info.error');
      this.shippingCards = [];
    } finally {
      this.isLoading = false;
      this.cdr.markForCheck();
    }
  }

  getCellValue(card: ShippingCardInfo, key: string): string {
    switch (key) {
      case 'user-name':
        return card.userName;
      case 'address':
        return card.address;
      case 'phone':
        return card.phone;
      case 'card-info':
        return `${card.cardName}(${card.gachaName})`;
      default:
        return '';
    }
  }

  getTotalCards(): number {
    return this.shippingCards.length;
  }

  viewCardDetail(card: ShippingCardInfo): void {
    this.dialog.open(ShippingCardDetailDialogComponent, {
      width: '500px',
      data: {
        card: card,
      },
    });
  }

  toggleCardSelection(cardId: string): void {
    if (this.selectedCardIds.has(cardId)) {
      this.selectedCardIds.delete(cardId);
    } else {
      this.selectedCardIds.add(cardId);
    }
  }

  isCardSelected(cardId: string): boolean {
    return this.selectedCardIds.has(cardId);
  }

  toggleAllCards(): void {
    if (this.selectedCardIds.size === this.shippingCards.length) {
      this.selectedCardIds.clear();
    } else {
      this.selectedCardIds.clear();
      this.shippingCards.forEach((card) =>
        this.selectedCardIds.add(card.cardId),
      );
    }
  }

  async completeShipping(): Promise<void> {
    if (this.selectedCardIds.size === 0) {
      alert(this.translateService.instant('shipping-info.no-selection'));
      return;
    }

    const dialogRef = this.dialog.open(ShippingConfirmDialogComponent, {
      width: '500px',
      data: {
        cardCount: this.selectedCardIds.size,
      },
    });

    const confirmed = await dialogRef.afterClosed().toPromise();

    if (!confirmed) {
      return;
    }

    this.isLoading = true;
    try {
      for (const cardId of this.selectedCardIds) {
        await this.cardService.updateCardStatus(cardId, CARD_STATUS.SHIPPED);
      }

      this.selectedCardIds.clear();
      await this.loadShippingCards();
      alert(this.translateService.instant('shipping-info.complete-success'));
    } catch (err) {
      console.error('Failed to complete shipping:', err);
      alert(this.translateService.instant('shipping-info.complete-error'));
    } finally {
      this.isLoading = false;
      this.cdr.markForCheck();
    }
  }
}
