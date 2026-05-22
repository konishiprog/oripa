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
  CreateGachaComponent,
  GachaFormMode,
} from '../createGacha/createGacha.component';
import {
  GachaFilterDialogComponent,
  GachaFilterCriteria,
  DEFAULT_GACHA_FILTER_CRITERIA,
  isGachaFilterActive,
} from '../gachaFilterDialog/gachaFilterDialog.component';
import { GachaService } from '../../service/gacha.service';

export interface Gacha {
  id: string;
  name: string;
  headerImage: string;
  consumptionType: string;
  cost: number;
  isPublic: boolean;
  publishStart: string;
  publishEnd: string | null;
  cards: number;
}

interface TableHeader {
  key: string;
  labelKey: string;
}

type CellType = 'text' | 'method' | 'badge' | 'name-with-tooltip' | 'date';

interface TableCell {
  key: string;
  type: CellType;
  dataKey?: string;
  methodName?: string;
  style?: string;
  hasSpecialDisplay?: boolean;
}

const GACHA_TABLE_HEADERS: TableHeader[] = [
  { key: 'name', labelKey: 'dashboard.gacha-table.name' },
  {
    key: 'consumption-type',
    labelKey: 'dashboard.gacha-table.consumption-type',
  },
  { key: 'cost', labelKey: 'dashboard.gacha-table.cost' },
  { key: 'cards', labelKey: 'dashboard.gacha-table.cards' },
  { key: 'is-public', labelKey: 'dashboard.gacha-table.is-public' },
  { key: 'publish-start', labelKey: 'dashboard.gacha-table.publish-start' },
  { key: 'publish-end', labelKey: 'dashboard.gacha-table.publish-end' },
];

const GACHA_TABLE_CELLS: TableCell[] = [
  { key: 'name', type: 'name-with-tooltip' },
  { key: 'consumption-type', type: 'text', dataKey: 'consumptionType' },
  { key: 'cost', type: 'text', dataKey: 'cost' },
  { key: 'cards', type: 'method', methodName: 'getCardUnitLabel' },
  { key: 'is-public', type: 'badge' },
  { key: 'publish-start', type: 'date', dataKey: 'publishStart' },
  {
    key: 'publish-end',
    type: 'date',
    dataKey: 'publishEnd',
    hasSpecialDisplay: true,
  },
];

@Component({
  selector: 'app-gacha-table',
  standalone: false,
  templateUrl: './gachaTable.component.html',
  styleUrls: ['./gachaTable.component.css'],
})
export class GachaTableComponent implements OnInit, OnChanges {
  @Input() gachas: Gacha[] = [];
  @Output() openCardRegistration = new EventEmitter<Gacha>();
  @Output() gachasUpdated = new EventEmitter<void>();

  tableHeaders = GACHA_TABLE_HEADERS;
  tableCells = GACHA_TABLE_CELLS;
  filteredGachas: Gacha[] = [];
  searchQuery: string = '';
  currentPage: number = 1;
  itemsPerPage: number = 20;
  filterCriteria: GachaFilterCriteria = { ...DEFAULT_GACHA_FILTER_CRITERIA };

  constructor(
    private cdr: ChangeDetectorRef,
    private dialog: MatDialog,
    private gachaService: GachaService,
    private translateService: TranslateService,
  ) {}

  ngOnInit(): void {
    this.applyFilters();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['gachas']) {
      this.applyFilters();
    }
  }

  onSearchInput(query: string): void {
    this.searchQuery = query;
    this.applyFilters();
  }

  applyFilters(): void {
    const query = this.searchQuery.trim().toLowerCase();
    this.filteredGachas = this.gachas.filter((gacha) => {
      if (query && !gacha.name.toLowerCase().includes(query)) {
        return false;
      }
      return this.matchesFilterCriteria(gacha);
    });
    this.currentPage = 1;
  }

  openFilterDialog(): void {
    const dialogRef = this.dialog.open(GachaFilterDialogComponent, {
      width: '420px',
      data: { criteria: this.filterCriteria },
    });

    dialogRef
      .afterClosed()
      .subscribe((result: GachaFilterCriteria | undefined) => {
        if (result) {
          this.filterCriteria = result;
          this.applyFilters();
          this.cdr.markForCheck();
        }
      });
  }

  isFilterActive(): boolean {
    return isGachaFilterActive(this.filterCriteria);
  }

  private matchesFilterCriteria(gacha: Gacha): boolean {
    return (
      this.matchesPublishDateRange(gacha) &&
      this.matchesCostRange(gacha) &&
      this.matchesPublicStatus(gacha) &&
      this.matchesCardCountPreset(
        gacha.cards,
        this.filterCriteria.cardCountPreset,
      )
    );
  }

  private matchesPublishDateRange(gacha: Gacha): boolean {
    const startDate = this.extractDatePart(gacha.publishStart);
    const { publishStartFrom, publishStartTo } = this.filterCriteria;
    return (
      (!publishStartFrom || startDate >= publishStartFrom) &&
      (!publishStartTo || startDate <= publishStartTo)
    );
  }

  private matchesCostRange(gacha: Gacha): boolean {
    const { costMin, costMax } = this.filterCriteria;
    return (
      (costMin === null || gacha.cost >= costMin) &&
      (costMax === null || gacha.cost <= costMax)
    );
  }

  private matchesPublicStatus(gacha: Gacha): boolean {
    const { publicStatus } = this.filterCriteria;
    if (publicStatus === 'all') return true;
    return publicStatus === 'public' ? gacha.isPublic : !gacha.isPublic;
  }

  private matchesCardCountPreset(
    count: number,
    preset: GachaFilterCriteria['cardCountPreset'],
  ): boolean {
    switch (preset) {
      case 'all':
        return true;
      case '0':
        return count === 0;
      case '1-10':
        return count >= 1 && count <= 10;
      case '11-50':
        return count >= 11 && count <= 50;
      case '51-100':
        return count >= 51 && count <= 100;
      case '101+':
        return count >= 101;
    }
  }

  private extractDatePart(value: string | null | undefined): string {
    if (!value) return '';
    return value.includes('T') ? value.split('T')[0] : value;
  }

  getDisplayedGachas(): Gacha[] {
    const start = (this.currentPage - 1) * this.itemsPerPage;
    const end = start + this.itemsPerPage;
    return this.filteredGachas.slice(start, end);
  }

  onPageChange(page: number): void {
    this.currentPage = page;
  }

  onItemsPerPageChange(newValue: number): void {
    this.itemsPerPage = newValue;
    this.currentPage = 1;
  }

  onOpenCardRegistration(gacha: Gacha): void {
    this.openCardRegistration.emit(gacha);
  }

  getBadgeLabel(isPublic: boolean): string {
    return this.translateService.instant(
      isPublic
        ? 'dashboard.gacha.badge-active'
        : 'dashboard.gacha.badge-inactive',
    );
  }

  getCardUnitLabel(count: number): string {
    return this.translateService.instant('dashboard.gacha.unit-cards', {
      count,
    });
  }

  getPublishEndDisplay(publishEnd: string | null): string {
    return (
      publishEnd || this.translateService.instant('dashboard.gacha.no-end-date')
    );
  }

  getTextCellValue(cell: TableCell, gacha: Gacha): any {
    return cell.dataKey ? gacha[cell.dataKey as keyof Gacha] : '';
  }

  editGacha(gacha: Gacha): void {
    const dialogRef = this.dialog.open(CreateGachaComponent, {
      width: '500px',
      data: {
        mode: GachaFormMode.Edit,
        gacha: {
          id: gacha.id,
          name: gacha.name,
          headerImage: gacha.headerImage,
          cost: gacha.cost,
          isPublic: gacha.isPublic,
          publishStart: gacha.publishStart,
          publishEnd: gacha.publishEnd,
        },
      },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result?.mode === 'edit' && result?.data) {
        const index = this.gachas.findIndex(
          (target) => target.id === result.data.id,
        );
        if (index > -1) {
          this.gachas[index] = {
            id: result.data.id,
            name: result.data.name,
            headerImage: result.data.headerImage,
            consumptionType: result.data.consumptionType ?? '',
            cost: result.data.cost,
            isPublic: result.data.isPublic ?? false,
            publishStart: result.data.publishStart,
            publishEnd: result.data.publishEnd,
            cards: result.data.cardsCount ?? 0,
          };
          this.gachas = [...this.gachas];
          this.applyFilters();
          this.gachasUpdated.emit();
          this.cdr.markForCheck();
        }
      }
    });
  }

  async deleteGacha(gacha: Gacha): Promise<void> {
    const message = this.translateService.instant('dashboard.delete-confirm', {
      name: gacha.name,
    });
    if (!confirm(message)) {
      return;
    }

    try {
      await this.gachaService.deleteGacha(gacha.id);
      this.gachas = this.gachas.filter((target) => target.id !== gacha.id);
      this.applyFilters();
      this.gachasUpdated.emit();
      this.cdr.markForCheck();
    } catch (error) {
      console.error('Failed to delete gacha:', error);
      alert(this.translateService.instant('dashboard.delete-error'));
    }
  }
}
