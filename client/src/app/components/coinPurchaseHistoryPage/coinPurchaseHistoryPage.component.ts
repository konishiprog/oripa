import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import {
  CoinPurchaseHistoryService,
  CoinPurchaseHistoryItem,
} from '../../service/coin-purchase-history.service';

interface TableHeader {
  key: string;
  labelKey: string;
}

type CellType = 'text' | 'method';

interface TableCell {
  key: string;
  type: CellType;
  dataKey?: string;
  methodName?: string;
}

const COIN_PURCHASE_HISTORY_TABLE_HEADERS: TableHeader[] = [
  {
    key: 'user-id',
    labelKey: 'coin-purchase-history.page.table.header.user-id',
  },
  { key: 'price', labelKey: 'coin-purchase-history.page.table.header.price' },
  { key: 'point', labelKey: 'coin-purchase-history.page.table.header.point' },
  {
    key: 'special-point',
    labelKey: 'coin-purchase-history.page.table.header.special-point',
  },
  {
    key: 'status',
    labelKey: 'coin-purchase-history.page.table.header.status',
  },
  { key: 'date', labelKey: 'coin-purchase-history.page.table.header.date' },
];

const COIN_PURCHASE_HISTORY_TABLE_CELLS: TableCell[] = [
  { key: 'user-id', type: 'method', methodName: 'getUserName' },
  { key: 'price', type: 'method', methodName: 'getPrice' },
  { key: 'point', type: 'method', methodName: 'getPoint' },
  { key: 'special-point', type: 'method', methodName: 'getSpecialPoint' },
  { key: 'status', type: 'text', dataKey: 'status' },
  { key: 'date', type: 'method', methodName: 'getDate' },
];

@Component({
  selector: 'app-coin-purchase-history-page',
  standalone: false,
  templateUrl: './coinPurchaseHistoryPage.component.html',
  styleUrls: ['./coinPurchaseHistoryPage.component.css'],
})
export class CoinPurchaseHistoryPageComponent implements OnInit {
  histories: CoinPurchaseHistoryItem[] = [];
  isLoading: boolean = false;

  tableHeaders = COIN_PURCHASE_HISTORY_TABLE_HEADERS;
  tableCells = COIN_PURCHASE_HISTORY_TABLE_CELLS;

  constructor(
    private historyService: CoinPurchaseHistoryService,
    private translateService: TranslateService,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.loadHistories();
  }

  getTextCellValue(cell: TableCell, history: CoinPurchaseHistoryItem): any {
    return cell.dataKey
      ? history[cell.dataKey as keyof CoinPurchaseHistoryItem]
      : '';
  }

  getMethodCellValue(
    cell: TableCell,
    history: CoinPurchaseHistoryItem,
  ): string {
    switch (cell.methodName) {
      case 'getUserName':
        return this.getUserName(history);
      case 'getPrice':
        return this.getPrice(history);
      case 'getPoint':
        return this.getPoint(history);
      case 'getSpecialPoint':
        return this.getSpecialPoint(history);
      case 'getDate':
        return this.getDate(history);
      default:
        return '';
    }
  }

  private getUserName(history: CoinPurchaseHistoryItem): string {
    return (history as any)['User.name'] || history.userId;
  }

  private getPrice(history: CoinPurchaseHistoryItem): string {
    return `¥${new Intl.NumberFormat('ja-JP').format(history.price)}`;
  }

  private getPoint(history: CoinPurchaseHistoryItem): string {
    return `${history.point}${this.translateService.instant('common.unit.point')}`;
  }

  private getSpecialPoint(history: CoinPurchaseHistoryItem): string {
    return `+${history.specialPoint}${this.translateService.instant('common.unit.point')}`;
  }

  private getDate(history: CoinPurchaseHistoryItem): string {
    return new Date(history.createdAt).toLocaleString('ja-JP', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  async loadHistories(): Promise<void> {
    this.isLoading = true;
    try {
      this.histories = await this.historyService.getAllHistories();
      this.cdr.markForCheck();
    } catch (error) {
      console.error('Failed to load purchase histories:', error);
      alert(this.translateService.instant('coin-purchase-history.error-load'));
    } finally {
      this.isLoading = false;
    }
  }
}
