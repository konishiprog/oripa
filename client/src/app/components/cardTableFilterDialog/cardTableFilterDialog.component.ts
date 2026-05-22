import { Component, Inject, Optional } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { CARD_STATUS } from '../../constants/card';
import { CARD_TYPES, EXCHANGE_TYPES } from '../createCard/createCard.component';

export interface CardFilterCriteria {
  gachaNames: string[];
  cardTypes: string[];
  exchangeTypes: string[];
  isDrawnStatuses: string[];
}

export const DEFAULT_CARD_FILTER_CRITERIA: CardFilterCriteria = {
  gachaNames: [],
  cardTypes: [],
  exchangeTypes: [],
  isDrawnStatuses: [],
};

export function isCardFilterActive(criteria: CardFilterCriteria): boolean {
  return (
    criteria.gachaNames.length > 0 ||
    criteria.cardTypes.length > 0 ||
    criteria.exchangeTypes.length > 0 ||
    criteria.isDrawnStatuses.length > 0
  );
}

interface FilterDialogData {
  criteria?: CardFilterCriteria;
  availableGachaNames?: string[];
}

@Component({
  selector: 'app-card-table-filter-dialog',
  standalone: false,
  templateUrl: './cardTableFilterDialog.component.html',
  styleUrls: ['./cardTableFilterDialog.component.css'],
})
export class CardTableFilterDialogComponent {
  criteria: CardFilterCriteria;
  availableGachaNames: string[] = [];
  cardTypes = CARD_TYPES;
  exchangeTypes = EXCHANGE_TYPES;
  cardStatusList = Object.entries(CARD_STATUS).map(([_, value]) => value);

  constructor(
    @Optional()
    private dialogRef: MatDialogRef<
      CardTableFilterDialogComponent,
      CardFilterCriteria | undefined
    >,
    @Optional() @Inject(MAT_DIALOG_DATA) data: FilterDialogData,
  ) {
    this.criteria = {
      ...DEFAULT_CARD_FILTER_CRITERIA,
      ...(data?.criteria ?? {}),
    };
    this.availableGachaNames = data?.availableGachaNames ?? [];
  }

  toggleSelection(list: string[], value: string): string[] {
    const index = list.indexOf(value);
    if (index > -1) {
      return [...list.slice(0, index), ...list.slice(index + 1)];
    } else {
      return [...list, value];
    }
  }

  toggleGachaName(gachaName: string): void {
    this.criteria.gachaNames = this.toggleSelection(
      this.criteria.gachaNames,
      gachaName,
    );
  }

  toggleCardType(cardType: string): void {
    this.criteria.cardTypes = this.toggleSelection(
      this.criteria.cardTypes,
      cardType,
    );
  }

  toggleExchangeType(exchangeType: string): void {
    this.criteria.exchangeTypes = this.toggleSelection(
      this.criteria.exchangeTypes,
      exchangeType,
    );
  }

  toggleIsDrawnStatus(status: string): void {
    this.criteria.isDrawnStatuses = this.toggleSelection(
      this.criteria.isDrawnStatuses,
      status,
    );
  }

  onReset(): void {
    this.criteria = { ...DEFAULT_CARD_FILTER_CRITERIA };
  }

  onApply(): void {
    this.dialogRef?.close(this.criteria);
  }

  onClose(): void {
    this.dialogRef?.close();
  }
}
