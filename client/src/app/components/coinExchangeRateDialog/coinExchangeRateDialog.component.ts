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
  coin: number = 1000;
  price: number = 1000;
  ticket: number = 0;
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
      this.coin = this.data.rate.coin;
      this.price = this.data.rate.price;
      this.ticket = this.data.rate.ticket;
    }
  }

  get isEditMode(): boolean {
    return this.mode === CoinExchangeRateFormMode.Edit;
  }

  async onSubmit(): Promise<void> {
    if (!Number.isInteger(this.coin) || this.coin <= 0) {
      this.showError('coin-exchange-rate.error-coin-invalid');
      return;
    }
    if (!Number.isInteger(this.price) || this.price < 50) {
      this.showError('coin-exchange-rate.error-price-invalid');
      return;
    }
    if (!Number.isInteger(this.ticket) || this.ticket < 0) {
      this.showError('coin-exchange-rate.error-ticket-invalid');
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    try {
      if (this.isEditMode && this.editingId) {
        const updated = await this.rateService.updateRate(this.editingId, {
          coin: this.coin,
          price: this.price,
          ticket: this.ticket,
        });
        this.dialogRef?.close({ mode: 'edit', data: updated });
      } else {
        const created = await this.rateService.createRate({
          coin: this.coin,
          price: this.price,
          ticket: this.ticket,
        });
        this.dialogRef?.close({ mode: 'create', data: created });
      }
    } catch (error: any) {
      const serverMessage: string = error?.error?.error ?? '';
      if (serverMessage.includes('already exists')) {
        this.showError('coin-exchange-rate.error-duplicate-coin');
      } else {
        this.showError(
          this.isEditMode
            ? 'coin-exchange-rate.error-save'
            : 'coin-exchange-rate.error-create',
        );
      }
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
