import { Component, Inject, Optional } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

export type PublicStatusFilter = 'all' | 'public' | 'private';
export type CardCountPreset =
  | 'all'
  | '0'
  | '1-10'
  | '11-50'
  | '51-100'
  | '101+';

export interface GachaFilterCriteria {
  publishStartFrom: string | null;
  publishStartTo: string | null;
  costMin: number | null;
  costMax: number | null;
  publicStatus: PublicStatusFilter;
  cardCountPreset: CardCountPreset;
}

export const DEFAULT_GACHA_FILTER_CRITERIA: GachaFilterCriteria = {
  publishStartFrom: null,
  publishStartTo: null,
  costMin: null,
  costMax: null,
  publicStatus: 'all',
  cardCountPreset: 'all',
};

export const isGachaFilterActive = (criteria: GachaFilterCriteria): boolean =>
  criteria.publishStartFrom !== null ||
  criteria.publishStartTo !== null ||
  criteria.costMin !== null ||
  criteria.costMax !== null ||
  criteria.publicStatus !== 'all' ||
  criteria.cardCountPreset !== 'all';

interface GachaFilterDialogData {
  criteria?: GachaFilterCriteria;
}

@Component({
  selector: 'app-gacha-filter-dialog',
  standalone: false,
  templateUrl: './gachaFilterDialog.component.html',
  styleUrls: [
    './gachaFilterDialog.component.css',
    './gachaFilterDialog.responsive.component.css',
  ],
})
export class GachaFilterDialogComponent {
  criteria: GachaFilterCriteria;

  publicStatusOptions: PublicStatusFilter[] = ['all', 'public', 'private'];
  cardCountOptions: CardCountPreset[] = [
    'all',
    '0',
    '1-10',
    '11-50',
    '51-100',
    '101+',
  ];

  constructor(
    @Optional()
    private dialogRef: MatDialogRef<
      GachaFilterDialogComponent,
      GachaFilterCriteria | undefined
    >,
    @Optional() @Inject(MAT_DIALOG_DATA) data: GachaFilterDialogData,
  ) {
    this.criteria = {
      ...DEFAULT_GACHA_FILTER_CRITERIA,
      ...(data?.criteria ?? {}),
    };
  }

  setPublicStatus(status: PublicStatusFilter): void {
    this.criteria.publicStatus = status;
  }

  setCardCountPreset(preset: CardCountPreset): void {
    this.criteria.cardCountPreset = preset;
  }

  getCardCountTranslationKey(preset: CardCountPreset): string {
    return `filter-dialog.card-count-${preset}`;
  }

  getPublicStatusTranslationKey(status: PublicStatusFilter): string {
    return `filter-dialog.public-status-${status}`;
  }

  onReset(): void {
    this.criteria = { ...DEFAULT_GACHA_FILTER_CRITERIA };
  }

  onApply(): void {
    this.dialogRef?.close(this.normalize());
  }

  onClose(): void {
    this.dialogRef?.close();
  }

  private normalize(): GachaFilterCriteria {
    return {
      publishStartFrom: this.toNullableString(this.criteria.publishStartFrom),
      publishStartTo: this.toNullableString(this.criteria.publishStartTo),
      costMin: this.toNullableNumber(this.criteria.costMin),
      costMax: this.toNullableNumber(this.criteria.costMax),
      publicStatus: this.criteria.publicStatus,
      cardCountPreset: this.criteria.cardCountPreset,
    };
  }

  private toNullableString(value: string | null | undefined): string | null {
    if (value === null || value === undefined) return null;
    const trimmed = String(value).trim();
    return trimmed === '' ? null : trimmed;
  }

  private toNullableNumber(value: number | null | undefined): number | null {
    if (value === null || value === undefined) return null;
    const numeric = Number(value);
    return Number.isFinite(numeric) ? numeric : null;
  }
}
