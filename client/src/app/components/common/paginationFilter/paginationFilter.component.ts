import { Component, EventEmitter, Input, Output } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-pagination-filter',
  standalone: false,
  templateUrl: './paginationFilter.component.html',
  styleUrls: ['./paginationFilter.component.css'],
})
export class PaginationFilterComponent {
  @Input() itemsPerPage: number = 20;
  @Input() options: number[] = [20, 50, 100];
  @Output() itemsPerPageChange = new EventEmitter<number>();

  constructor(private translateService: TranslateService) {}

  onItemsPerPageChange(event: Event): void {
    const target = event.target as HTMLSelectElement;
    const newValue = Number(target.value);
    if (newValue !== this.itemsPerPage) {
      this.itemsPerPageChange.emit(newValue);
    }
  }

  getOptionLabel(pageCount: number): string {
    return this.translateService.instant('dashboard.filter.pagination-option', {
      page_count: pageCount,
    });
  }
}
