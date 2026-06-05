import {
  Component,
  ChangeDetectorRef,
  Inject,
  OnInit,
  Optional,
} from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import {
  CoinExchangeRateService,
  CoinExchangeRate,
} from '../../service/coin-exchange-rate.service';

export enum CoinExchangeRateFormMode {
  Create = 'create',
  Edit = 'edit',
}

export interface CoinExchangeRateDialogData {
  mode: CoinExchangeRateFormMode;
  rate?: CoinExchangeRate;
}

@Component({
  selector: 'app-coin-exchange-rate-dialog',
  standalone: false,
  templateUrl: './coinExchangeRateDialog.component.html',
  styleUrls: [
    './coinExchangeRateDialog.component.css',
    './coinExchangeRateDialog.responsive.component.css',
  ],
})
export class CoinExchangeRateDialogComponent implements OnInit {
  point: number = 1000;
  price: number = 1000;
  specialPoint: number = 0;
  errorMessage: string = '';
  isLoading: boolean = false;
  mode: CoinExchangeRateFormMode = CoinExchangeRateFormMode.Create;
  private editingId: string | null = null;

  constructor(
    private rateService: CoinExchangeRateService,
    private translateService: TranslateService,
    private cdr: ChangeDetectorRef,
    @Optional()
    private dialogRef: MatDialogRef<CoinExchangeRateDialogComponent>,
    @Optional()
    @Inject(MAT_DIALOG_DATA)
    private data: CoinExchangeRateDialogData,
  ) {}

  ngOnInit(): void {
    if (this.data?.mode === CoinExchangeRateFormMode.Edit && this.data.rate) {
      this.mode = CoinExchangeRateFormMode.Edit;
      this.editingId = this.data.rate.id;
      this.point = this.data.rate.point;
      this.price = this.data.rate.price;
      this.specialPoint = this.data.rate.specialPoint;
    }
  }

  get isEditMode(): boolean {
    return this.mode === CoinExchangeRateFormMode.Edit;
  }

  async onSubmit(): Promise<void> {
    if (!Number.isInteger(this.point) || this.point <= 0) {
      this.showError('coin-exchange-rate.error-point-invalid');
      return;
    }
    if (!Number.isInteger(this.price) || this.price < 50) {
      this.showError('coin-exchange-rate.error-price-invalid');
      return;
    }
    if (!Number.isInteger(this.specialPoint) || this.specialPoint < 0) {
      this.showError('coin-exchange-rate.error-special-point-invalid');
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    try {
      if (this.isEditMode && this.editingId) {
        const updated = await this.rateService.updateRate(this.editingId, {
          point: this.point,
          price: this.price,
          specialPoint: this.specialPoint,
        });
        this.dialogRef?.close({ mode: 'edit', data: updated });
      } else {
        const created = await this.rateService.createRate({
          point: this.point,
          price: this.price,
          specialPoint: this.specialPoint,
        });
        this.dialogRef?.close({ mode: 'create', data: created });
      }
    } catch (error: any) {
      this.showError(
        this.isEditMode
          ? 'coin-exchange-rate.error-save'
          : 'coin-exchange-rate.error-create',
      );
    } finally {
      this.isLoading = false;
    }
  }

  private showError(key: string): void {
    this.errorMessage = this.translateService.instant(key);
    this.cdr.detectChanges();
  }

  onClose(): void {
    this.dialogRef?.close();
  }
}
