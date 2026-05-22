import {
  Component,
  EventEmitter,
  Input,
  Output,
  ChangeDetectorRef,
  OnInit,
} from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-table-controls',
  standalone: false,
  templateUrl: './tableControls.component.html',
  styleUrls: ['./tableControls.component.css'],
})
export class TableControlsComponent implements OnInit {
  @Input() placeholder: string = '';
  @Input() showFilterButton: boolean = false;
  @Input() filterActive: boolean = false;
  @Input() currentPage: number = 1;
  @Input() totalItems: number = 0;
  @Input() itemsPerPage: number = 20;

  @Output() search = new EventEmitter<string>();
  @Output() filterOpen = new EventEmitter<void>();
  @Output() pageChange = new EventEmitter<number>();
  @Output() itemsPerPageChange = new EventEmitter<number>();

  searchQuery: string = '';
  isComposing: boolean = false;
  searchIcon: SafeHtml = '';
  filterIcon: SafeHtml = '';
  chevronLeftIcon: SafeHtml = '';
  chevronRightIcon: SafeHtml = '';
  Math = Math;

  constructor(
    private http: HttpClient,
    private sanitizer: DomSanitizer,
    private cdr: ChangeDetectorRef,
    private translateService: TranslateService,
  ) {}

  ngOnInit(): void {
    this.loadIcons();
  }

  onSearchInput(): void {
    if (!this.isComposing) {
      this.search.emit(this.searchQuery);
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
      this.search.emit(this.searchQuery);
    }
  }

  onFilterClick(): void {
    this.filterOpen.emit();
  }

  getTotalPages(): number {
    return Math.ceil(this.totalItems / this.itemsPerPage);
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

  getPaginationInfo(): string {
    const total = this.totalItems;
    const start = (this.currentPage - 1) * this.itemsPerPage + 1;
    const end = Math.min(this.currentPage * this.itemsPerPage, total);
    return this.translateService.instant('common.pagination.info', {
      total,
      start,
      end,
    });
  }

  previousPage(): void {
    if (this.currentPage > 1) {
      this.pageChange.emit(this.currentPage - 1);
    }
  }

  nextPage(): void {
    if (this.currentPage < this.getTotalPages()) {
      this.pageChange.emit(this.currentPage + 1);
    }
  }

  goToPage(page: number | string): void {
    if (typeof page === 'number' && page >= 1 && page <= this.getTotalPages()) {
      this.pageChange.emit(page);
    }
  }

  onItemsPerPageChange(newValue: number): void {
    this.itemsPerPageChange.emit(newValue);
  }

  private loadIcons(): void {
    this.loadIcon('assets/icons/search.svg', (svg) => (this.searchIcon = svg));
    if (this.showFilterButton) {
      this.loadIcon(
        'assets/icons/filter.svg',
        (svg) => (this.filterIcon = svg),
      );
    }
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
