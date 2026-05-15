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
import { HttpClient } from '@angular/common/http';
import { MatDialog } from '@angular/material/dialog';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { TranslateService } from '@ngx-translate/core';
import {
  CreateGachaComponent,
  GachaFormMode,
} from '../createGacha/createGacha.component';
import { GachaService } from '../../service/gacha.service';

export interface Gacha {
  id: number;
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
  { key: 'publish-end', type: 'date', dataKey: 'publishEnd', hasSpecialDisplay: true },
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
  Math = Math;
  searchIcon: SafeHtml = '';
  chevronLeftIcon: SafeHtml = '';
  chevronRightIcon: SafeHtml = '';
  isComposing: boolean = false;

  constructor(
    private http: HttpClient,
    private sanitizer: DomSanitizer,
    private cdr: ChangeDetectorRef,
    private dialog: MatDialog,
    private gachaService: GachaService,
    private translateService: TranslateService,
  ) {}

  ngOnInit(): void {
    this.loadIcons();
    this.applyFilters();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['gachas']) {
      this.applyFilters();
    }
  }

  onSearchInput(): void {
    if (!this.isComposing) {
      this.applyFilters();
    }
  }

  onCompositionStart(): void {
    this.isComposing = true;
  }

  onCompositionEnd(): void {
    this.isComposing = false;
  }

  onSearchKeydown(event: KeyboardEvent): void {
    if (event.key === 'Enter') {
      this.applyFilters();
    }
  }

  applyFilters(): void {
    const query = this.searchQuery.trim().toLowerCase();
    this.filteredGachas = query
      ? this.gachas.filter((gacha) => gacha.name.toLowerCase().includes(query))
      : [...this.gachas];
    this.currentPage = 1;
  }

  getDisplayedGachas(): Gacha[] {
    const start = (this.currentPage - 1) * this.itemsPerPage;
    const end = start + this.itemsPerPage;
    return this.filteredGachas.slice(start, end);
  }

  getTotalPages(): number {
    return Math.ceil(this.filteredGachas.length / this.itemsPerPage);
  }

  getPageNumbers(): (number | string)[] {
    const total = this.getTotalPages();
    const current = this.currentPage;
    const pages: (number | string)[] = [];

    if (total <= 5) {
      for (let i = 1; i <= total; i++) {
        pages.push(i);
      }
    } else {
      pages.push(1);
      if (current > 3) pages.push('...');
      for (
        let i = Math.max(2, current - 1);
        i <= Math.min(total - 1, current + 1);
        i++
      ) {
        if (!pages.includes(i)) pages.push(i);
      }
      if (current < total - 2) pages.push('...');
      pages.push(total);
    }
    return pages;
  }

  goToPage(page: number | string): void {
    if (typeof page === 'number' && page >= 1 && page <= this.getTotalPages()) {
      this.currentPage = page;
    }
  }

  previousPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
    }
  }

  nextPage(): void {
    if (this.currentPage < this.getTotalPages()) {
      this.currentPage++;
    }
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
      isPublic ? 'dashboard.gacha.badge-active' : 'dashboard.gacha.badge-inactive',
    );
  }

  getCardUnitLabel(count: number): string {
    return this.translateService.instant('dashboard.gacha.unit-cards', { count });
  }

  getPublishEndDisplay(publishEnd: string | null): string {
    return publishEnd || this.translateService.instant('dashboard.gacha.no-end-date');
  }

  getTextCellValue(cell: TableCell, gacha: Gacha): any {
    return cell.dataKey ? gacha[cell.dataKey as keyof Gacha] : '';
  }

  getPaginationInfo(): string {
    const total = this.filteredGachas.length;
    const start = (this.currentPage - 1) * this.itemsPerPage + 1;
    const end = Math.min(this.currentPage * this.itemsPerPage, total);
    return this.translateService.instant('dashboard.pagination.info', {
      total,
      start,
      end,
    });
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

  private loadIcons(): void {
    this.loadIcon('assets/icons/search.svg', (svg) => (this.searchIcon = svg));
    this.loadIcon(
      'assets/icons/chevron-left.svg',
      (svg) => (this.chevronLeftIcon = svg),
    );
    this.loadIcon(
      'assets/icons/chevron-right.svg',
      (svg) => (this.chevronRightIcon = svg),
    );
  }

  private loadIcon(path: string, assign: (svg: SafeHtml) => void): void {
    this.http.get(path, { responseType: 'text' }).subscribe({
      next: (svg) => {
        assign(this.sanitizer.bypassSecurityTrustHtml(svg));
        this.cdr.markForCheck();
      },
      error: (error) => {
        console.error(`Failed to load icon ${path}:`, error);
      },
    });
  }
}
