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
  activeTab: 'pending' | 'shipped' = 'pending';

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
    return this.shippingCards.filter((card) => card.status === 'pending')
      .length;
  }

  get filteredCards(): ShippingCardInfo[] {
    return this.shippingCards.filter((card) => card.status === this.activeTab);
  }

  selectTab(tab: 'pending' | 'shipped'): void {
    this.activeTab = tab;
    this.selectedCardIds.clear();
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
    const selectableCards = this.filteredCards;
    if (
      this.selectedCardIds.size === selectableCards.length &&
      selectableCards.length > 0
    ) {
      this.selectedCardIds.clear();
    } else {
      this.selectedCardIds.clear();
      selectableCards.forEach((card) => this.selectedCardIds.add(card.cardId));
    }
  }

  async completeShipping(): Promise<void> {
    if (this.selectedCardIds.size === 0) {
      alert(this.translateService.instant('shipping-info.no-selection'));
      return;
    }

    const selectedCards = this.filteredCards.filter((card) =>
      this.selectedCardIds.has(card.cardId),
    );

    const dialogRef = this.dialog.open(ShippingConfirmDialogComponent, {
      width: '760px',
      maxWidth: '95vw',
      data: {
        cards: selectedCards,
        isFromAdmin: true,
      },
    });

    const shipments = await dialogRef.afterClosed().toPromise();

    if (!shipments) {
      return;
    }

    this.isLoading = true;
    this.cdr.markForCheck();

    try {
      await this.cardService.completeShipping(shipments);

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

  async downloadCSVFile(): Promise<void> {
    this.isLoading = true;
    this.cdr.markForCheck();

    try {
      const response = await this.cardService.getPendingShippingCSV();
      if (response?.csvData) {
        this.saveCSVFile(response.csvData);
      }
    } catch (err) {
      console.error('Failed to download CSV:', err);
      alert(this.translateService.instant('shipping-info.csv-download-error'));
    } finally {
      this.isLoading = false;
      this.cdr.markForCheck();
    }
  }

  private saveCSVFile(csvDataBase64: string): void {
    const binaryString = atob(csvDataBase64);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    const bom = new Uint8Array([0xef, 0xbb, 0xbf]);
    const blob = new Blob([bom, bytes], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);

    const now = new Date();
    const timestamp =
      now.getFullYear() +
      String(now.getMonth() + 1).padStart(2, '0') +
      String(now.getDate()).padStart(2, '0') +
      String(now.getHours()).padStart(2, '0') +
      String(now.getMinutes()).padStart(2, '0') +
      String(now.getSeconds()).padStart(2, '0');

    link.setAttribute('href', url);
    link.setAttribute('download', `trackingNumber_${timestamp}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}
