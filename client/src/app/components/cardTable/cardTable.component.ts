import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnInit,
  Output,
  SimpleChanges,
  ChangeDetectorRef,
} from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { TranslateService } from '@ngx-translate/core';
import {
  CARD_STATUS,
  EXCHANGE_TYPE,
  ExchangeTypeType,
} from '../../constants/card';
import {
  CreateCardComponent,
  CardFormMode,
  CARD_TYPES,
  EXCHANGE_TYPES,
} from '../createCard/createCard.component';
import { CardService } from '../../service/card.service';
import {
  CardTableFilterDialogComponent,
  CardFilterCriteria,
  DEFAULT_CARD_FILTER_CRITERIA,
  isCardFilterActive,
} from '../cardTableFilterDialog/cardTableFilterDialog.component';

export interface Card {
  id: string;
  gachaId: string;
  gachaName: string;
  name: string;
  cardType: string;
  exchangeType: string;
  exchangePoints: number | null;
  imageFront: string;
  imageBack: string;
  isDrawn: string;
}

interface TableHeader {
  key: string;
  labelKey: string;
}

const CARD_TABLE_HEADERS: TableHeader[] = [
  { key: 'gacha-name', labelKey: 'dashboard.card-table.gacha-name' },
  { key: 'card-name', labelKey: 'dashboard.card-table.card-name' },
  { key: 'card-type', labelKey: 'dashboard.card-table.card-type' },
  { key: 'exchange-type', labelKey: 'dashboard.card-table.exchange-type' },
  { key: 'exchange-points', labelKey: 'dashboard.card-table.exchange-points' },
  { key: 'is-drawn', labelKey: 'dashboard.card-table.is-drawn' },
];

type CellType = 'text' | 'method';

interface TableCell {
  key: string;
  type: CellType;
  dataKey?: string;
  methodName?: string;
}

const CARD_TABLE_CELLS: TableCell[] = [
  { key: 'gacha-name', type: 'text', dataKey: 'gachaName' },
  { key: 'card-name', type: 'text', dataKey: 'name' },
  {
    key: 'card-type',
    type: 'method',
    methodName: 'getCardTypeLabel',
    dataKey: 'cardType',
  },
  {
    key: 'exchange-type',
    type: 'method',
    methodName: 'getExchangeTypeLabel',
    dataKey: 'exchangeType',
  },
  {
    key: 'exchange-points',
    type: 'method',
    methodName: 'getExchangePointsDisplay',
  },
  { key: 'is-drawn', type: 'method', methodName: 'getIsDrawnLabel' },
];

@Component({
  selector: 'app-card-table',
  standalone: false,
  templateUrl: './cardTable.component.html',
  styleUrls: ['./cardTable.component.css'],
})
export class CardTableComponent implements OnInit, OnChanges {
  @Input() cards: Card[] = [];
  @Output() cardsUpdated = new EventEmitter<void>();

  tableHeaders = CARD_TABLE_HEADERS;
  tableCells = CARD_TABLE_CELLS;
  filteredCards: Card[] = [];
  searchQuery: string = '';
  currentPage: number = 1;
  itemsPerPage: number = 20;
  filterCriteria: CardFilterCriteria = { ...DEFAULT_CARD_FILTER_CRITERIA };

  private readonly cardTypeLabelMap = new Map(
    CARD_TYPES.map((cardType) => [cardType.value, cardType.labelKey]),
  );
  private readonly exchangeTypeLabelMap = new Map(
    EXCHANGE_TYPES.map((exchangeType) => [
      exchangeType.value,
      exchangeType.labelKey,
    ]),
  );

  constructor(
    private translateService: TranslateService,
    private cdr: ChangeDetectorRef,
    private dialog: MatDialog,
    private cardService: CardService,
  ) {}

  ngOnInit(): void {
    this.applyFilters();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['cards']) {
      this.applyFilters();
    }
  }

  onSearchInput(query: string): void {
    this.searchQuery = query;
    this.applyFilters();
  }

  applyFilters(): void {
    let filtered = [...this.cards];

    if (this.searchQuery.trim()) {
      const query = this.searchQuery.trim().toLowerCase();
      filtered = filtered.filter(
        (card) =>
          card.name.toLowerCase().includes(query) ||
          card.gachaName.toLowerCase().includes(query),
      );
    }

    if (this.filterCriteria.gachaNames.length > 0) {
      filtered = filtered.filter((card) =>
        this.filterCriteria.gachaNames.includes(card.gachaName),
      );
    }

    if (this.filterCriteria.cardTypes.length > 0) {
      filtered = filtered.filter((card) =>
        this.filterCriteria.cardTypes.includes(card.cardType),
      );
    }

    if (this.filterCriteria.exchangeTypes.length > 0) {
      filtered = filtered.filter((card) =>
        this.filterCriteria.exchangeTypes.includes(card.exchangeType),
      );
    }

    if (this.filterCriteria.isDrawnStatuses.length > 0) {
      filtered = filtered.filter((card) =>
        this.filterCriteria.isDrawnStatuses.includes(card.isDrawn),
      );
    }

    this.filteredCards = filtered;
    this.currentPage = 1;
  }

  getDisplayedCards(): Card[] {
    const start = (this.currentPage - 1) * this.itemsPerPage;
    const end = start + this.itemsPerPage;
    return this.filteredCards.slice(start, end);
  }

  onPageChange(page: number): void {
    this.currentPage = page;
  }

  onItemsPerPageChange(newValue: number): void {
    this.itemsPerPage = newValue;
    this.currentPage = 1;
  }

  getCardTypeLabel(value: string): string {
    const key = this.cardTypeLabelMap.get(value);
    return key ? this.translateService.instant(key) : value;
  }

  getExchangeTypeLabel(value: string): string {
    const key = this.exchangeTypeLabelMap.get(value as ExchangeTypeType);
    return key ? this.translateService.instant(key) : value;
  }

  getExchangePointsDisplay(card: Card): string {
    return card.exchangeType === EXCHANGE_TYPE.BOTH &&
      card.exchangePoints !== null
      ? card.exchangePoints.toString()
      : this.translateService.instant('dashboard.card.no-exchange-points');
  }

  getIsDrawnLabel(card: Card): string {
    switch (card.isDrawn) {
      case CARD_STATUS.NOT_DRAWN:
        return this.translateService.instant('dashboard.card.not-drawn');
      case CARD_STATUS.DRAWN:
        return this.translateService.instant('dashboard.card.drawn');
      case CARD_STATUS.REFUNDED:
        return this.translateService.instant('dashboard.card.refunded');
      case CARD_STATUS.SHIPPING_PENDING:
        return this.translateService.instant('dashboard.card.shipping-pending');
      case CARD_STATUS.SHIPPED:
        return this.translateService.instant('dashboard.card.shipped');
      default:
        return card.isDrawn;
    }
  }

  getTextCellValue(cell: TableCell, card: Card): any {
    return cell.dataKey ? card[cell.dataKey as keyof Card] : '';
  }

  getMethodCellValue(cell: TableCell, card: Card): string {
    switch (cell.methodName) {
      case 'getCardTypeLabel':
        return this.getCardTypeLabel(
          card[cell.dataKey as keyof Card] as string,
        );
      case 'getExchangeTypeLabel':
        return this.getExchangeTypeLabel(
          card[cell.dataKey as keyof Card] as string,
        );
      case 'getExchangePointsDisplay':
        return this.getExchangePointsDisplay(card);
      case 'getIsDrawnLabel':
        return this.getIsDrawnLabel(card);
      default:
        return '';
    }
  }

  editCard(card: Card): void {
    const dialogRef = this.dialog.open(CreateCardComponent, {
      width: '500px',
      data: {
        gachaId: card.gachaId,
        gachaName: card.gachaName,
        mode: CardFormMode.Edit,
        card: {
          id: card.id,
          name: card.name,
          cardType: card.cardType,
          exchangeType: card.exchangeType,
          exchangePoints: card.exchangePoints,
          imageFront: card.imageFront,
          imageBack: card.imageBack,
        },
      },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result?.mode === 'edit' && result?.data) {
        const index = this.cards.findIndex(
          (target) => target.id === result.data.id,
        );
        if (index > -1) {
          this.cards[index] = {
            ...this.cards[index],
            name: result.data.name ?? '',
            cardType: result.data.cardType ?? '',
            exchangeType: result.data.exchangeType ?? '',
            exchangePoints: result.data.exchangePoints ?? null,
            imageFront: result.data.imageFront ?? '',
            imageBack: result.data.imageBack ?? '',
            isDrawn: result.data.isDrawn ?? CARD_STATUS.NOT_DRAWN,
          };
          this.cards = [...this.cards];
          this.applyFilters();
          this.cardsUpdated.emit();
          this.cdr.markForCheck();
        }
      }
    });
  }

  async deleteCard(card: Card): Promise<void> {
    const message = this.translateService.instant(
      'dashboard.delete-confirm-card',
      { name: card.name },
    );
    if (!confirm(message)) {
      return;
    }

    try {
      await this.cardService.deleteCard(card.id);
      this.cards = this.cards.filter((target) => target.id !== card.id);
      this.applyFilters();
      this.cardsUpdated.emit();
      this.cdr.markForCheck();
    } catch (error) {
      console.error('Failed to delete card:', error);
      alert(this.translateService.instant('dashboard.delete-error'));
    }
  }

  openFilterDialog(): void {
    const availableGachaNames = [
      ...new Set(this.cards.map((card) => card.gachaName)),
    ].sort();

    const dialogRef = this.dialog.open(CardTableFilterDialogComponent, {
      width: '500px',
      data: {
        criteria: { ...this.filterCriteria },
        availableGachaNames,
      },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result !== undefined) {
        this.filterCriteria = result;
        this.applyFilters();
      }
    });
  }

  isFilterActive(): boolean {
    return isCardFilterActive(this.filterCriteria);
  }
}
