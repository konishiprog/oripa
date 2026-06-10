import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { TranslateService } from '@ngx-translate/core';
import { CoinPurchaseHistoryFilterDialogComponent } from '../coinPurchaseHistoryFilterDialog/coinPurchaseHistoryFilterDialog.component';
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
  { key: 'coin', labelKey: 'coin-purchase-history.page.table.header.coin' },
  {
    key: 'ticket',
    labelKey: 'coin-purchase-history.page.table.header.ticket',
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
  { key: 'coin', type: 'method', methodName: 'getCoin' },
  { key: 'ticket', type: 'method', methodName: 'getTicket' },
  { key: 'status', type: 'text', dataKey: 'status' },
  { key: 'date', type: 'method', methodName: 'getDate' },
];

@Component({
  selector: 'app-coin-purchase-history-page',
  standalone: false,
  templateUrl: './coinPurchaseHistoryPage.component.html',
  styleUrls: [
    './coinPurchaseHistoryPage.component.css',
    './coinPurchaseHistoryPage.responsive.component.css',
  ],
})
export class CoinPurchaseHistoryPageComponent implements OnInit {
  histories: CoinPurchaseHistoryItem[] = [];
  filteredHistories: CoinPurchaseHistoryItem[] = [];
  isLoading: boolean = false;

  tableHeaders = COIN_PURCHASE_HISTORY_TABLE_HEADERS;
  tableCells = COIN_PURCHASE_HISTORY_TABLE_CELLS;

  searchQuery: string = '';
  minPrice: number | null = null;
  maxPrice: number | null = null;
  minCoin: number | null = null;
  maxCoin: number | null = null;
  startDate: string = '';
  endDate: string = '';
  yearFilter: string = '';

  currentPage: number = 1;
  itemsPerPage: number = 20;
  Math = Math;

  constructor(
    private historyService: CoinPurchaseHistoryService,
    private translateService: TranslateService,
    private cdr: ChangeDetectorRef,
    private dialog: MatDialog,
  ) {}

  ngOnInit(): void {
    this.loadHistories();
  }

  openFilterDialog(): void {
    const dialogRef = this.dialog.open(
      CoinPurchaseHistoryFilterDialogComponent,
      {
        width: '500px',
        data: {
          criteria: {
            minPrice: this.minPrice,
            maxPrice: this.maxPrice,
            minCoin: this.minCoin,
            maxCoin: this.maxCoin,
            startDate: this.startDate,
            endDate: this.endDate,
            yearFilter: this.yearFilter,
          },
        },
      },
    );

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.minPrice = result.minPrice;
        this.maxPrice = result.maxPrice;
        this.minCoin = result.minCoin;
        this.maxCoin = result.maxCoin;
        this.startDate = result.startDate;
        this.endDate = result.endDate;
        this.yearFilter = result.yearFilter;
        this.applyFilters();
      }
    });
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
      case 'getCoin':
        return this.getCoin(history);
      case 'getTicket':
        return this.getTicket(history);
      case 'getDate':
        return this.getDate(history);
      default:
        return '';
    }
  }

  private getUserName(history: CoinPurchaseHistoryItem): string {
    return (
      (history as any)['User.nickname'] ||
      (history as any)['User.name'] ||
      history.userId
    );
  }

  private getPrice(history: CoinPurchaseHistoryItem): string {
    return `¥${new Intl.NumberFormat('ja-JP').format(history.price)}`;
  }

  private getCoin(history: CoinPurchaseHistoryItem): string {
    return `${history.coin}${this.translateService.instant('common.unit.coin')}`;
  }

  private getTicket(history: CoinPurchaseHistoryItem): string {
    return `+${history.ticket}${this.translateService.instant('common.unit.ticket')}`;
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
      this.applyFilters();
    } catch (error) {
      console.error('Failed to load purchase histories:', error);
      alert(this.translateService.instant('coin-purchase-history.error-load'));
    } finally {
      this.isLoading = false;
    }
  }

  onSearchInput(query: string): void {
    this.searchQuery = query;
    this.applyFilters();
  }

  onPageChange(page: number): void {
    this.currentPage = page;
  }

  onItemsPerPageChange(newValue: number): void {
    this.itemsPerPage = newValue;
    this.currentPage = 1;
  }

  getDisplayedHistories(): CoinPurchaseHistoryItem[] {
    const start = (this.currentPage - 1) * this.itemsPerPage;
    const end = start + this.itemsPerPage;
    return this.filteredHistories.slice(start, end);
  }

  applyFilters(): void {
    let filtered = [...this.histories];

    if (this.searchQuery.trim()) {
      const query = this.searchQuery.toLowerCase();
      filtered = filtered.filter((history) => {
        const userName = (
          (history as any)['User.nickname'] ||
          (history as any)['User.name'] ||
          history.userId
        ).toLowerCase();
        return userName.includes(query);
      });
    }

    if (this.minPrice !== null) {
      filtered = filtered.filter((history) => history.price >= this.minPrice!);
    }

    if (this.maxPrice !== null) {
      filtered = filtered.filter((history) => history.price <= this.maxPrice!);
    }

    if (this.minCoin !== null) {
      filtered = filtered.filter((history) => history.coin >= this.minCoin!);
    }

    if (this.maxCoin !== null) {
      filtered = filtered.filter((history) => history.coin <= this.maxCoin!);
    }

    if (this.startDate) {
      const start = new Date(this.startDate);
      filtered = filtered.filter(
        (history) => new Date(history.createdAt) >= start,
      );
    }

    if (this.endDate) {
      const end = new Date(this.endDate);
      end.setHours(23, 59, 59, 999);
      filtered = filtered.filter(
        (history) => new Date(history.createdAt) <= end,
      );
    }

    if (this.yearFilter) {
      const now = new Date();

      if (this.yearFilter === 'recent-1year') {
        const oneYearAgo = new Date(
          now.getFullYear(),
          now.getMonth(),
          now.getDate() - 365,
        );
        filtered = filtered.filter(
          (history) => new Date(history.createdAt) >= oneYearAgo,
        );
      } else {
        const filterYear = Number(this.yearFilter);
        if (!Number.isNaN(filterYear)) {
          filtered = filtered.filter(
            (history) =>
              new Date(history.createdAt).getFullYear() === filterYear,
          );
        }
      }
    }

    this.filteredHistories = filtered;
    this.currentPage = 1;
    this.cdr.markForCheck();
  }

  isFilterActive(): boolean {
    return (
      this.minPrice !== null ||
      this.maxPrice !== null ||
      this.minCoin !== null ||
      this.maxCoin !== null ||
      this.startDate !== '' ||
      this.endDate !== '' ||
      this.yearFilter !== ''
    );
  }

  clearFilters(): void {
    this.searchQuery = '';
    this.minPrice = null;
    this.maxPrice = null;
    this.minCoin = null;
    this.maxCoin = null;
    this.startDate = '';
    this.endDate = '';
    this.yearFilter = '';
    this.applyFilters();
  }
}
