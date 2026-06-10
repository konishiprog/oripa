import { Component, Inject, Optional } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

export interface CoinPurchaseHistoryFilterCriteria {
  minPrice: number | null;
  maxPrice: number | null;
  minCoin: number | null;
  maxCoin: number | null;
  startDate: string;
  endDate: string;
  yearFilter: string;
}

export const DEFAULT_FILTER_CRITERIA: CoinPurchaseHistoryFilterCriteria = {
  minPrice: null,
  maxPrice: null,
  minCoin: null,
  maxCoin: null,
  startDate: '',
  endDate: '',
  yearFilter: '',
};

interface FilterDialogData {
  criteria?: CoinPurchaseHistoryFilterCriteria;
}

@Component({
  selector: 'app-coin-purchase-history-filter-dialog',
  standalone: false,
  templateUrl: './coinPurchaseHistoryFilterDialog.component.html',
  styleUrls: ['./coinPurchaseHistoryFilterDialog.component.css'],
})
export class CoinPurchaseHistoryFilterDialogComponent {
  criteria: CoinPurchaseHistoryFilterCriteria;
  yearFilterOptions: number[];

  constructor(
    @Optional()
    private dialogRef: MatDialogRef<
      CoinPurchaseHistoryFilterDialogComponent,
      CoinPurchaseHistoryFilterCriteria | undefined
    >,
    @Optional() @Inject(MAT_DIALOG_DATA) data: FilterDialogData,
  ) {
    this.criteria = {
      ...DEFAULT_FILTER_CRITERIA,
      ...(data?.criteria ?? {}),
    };
    this.yearFilterOptions = this.generateYearFilterOptions();
  }

  private generateYearFilterOptions(): number[] {
    const currentYear = new Date().getFullYear();
    const years: number[] = [];
    for (let i = 2; i >= 0; i--) {
      years.push(currentYear - i);
    }
    return years;
  }

  onReset(): void {
    this.criteria = { ...DEFAULT_FILTER_CRITERIA };
  }

  onApply(): void {
    this.dialogRef?.close(this.normalize());
  }

  onClose(): void {
    this.dialogRef?.close();
  }

  private normalize(): CoinPurchaseHistoryFilterCriteria {
    return {
      minPrice: this.toNullableNumber(this.criteria.minPrice),
      maxPrice: this.toNullableNumber(this.criteria.maxPrice),
      minCoin: this.toNullableNumber(this.criteria.minCoin),
      maxCoin: this.toNullableNumber(this.criteria.maxCoin),
      startDate: this.toNullableString(this.criteria.startDate),
      endDate: this.toNullableString(this.criteria.endDate),
      yearFilter: this.toNullableString(this.criteria.yearFilter),
    };
  }

  private toNullableString(value: string | null | undefined): string {
    if (value === null || value === undefined) return '';
    const trimmed = String(value).trim();
    return trimmed === '' ? '' : trimmed;
  }

  private toNullableNumber(value: number | null | undefined): number | null {
    if (value === null || value === undefined) return null;
    const numeric = Number(value);
    return Number.isFinite(numeric) ? numeric : null;
  }
}
