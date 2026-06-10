import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { TranslateService } from '@ngx-translate/core';
import {
  CoinExchangeRateService,
  CoinExchangeRate,
} from '../../service/coin-exchange-rate.service';
import {
  CoinExchangeRateDialogComponent,
  CoinExchangeRateFormMode,
} from '../coinExchangeRateDialog/coinExchangeRateDialog.component';

@Component({
  selector: 'app-coin-exchange-rate-management',
  standalone: false,
  templateUrl: './coinExchangeRateManagement.component.html',
  styleUrls: [
    './coinExchangeRateManagement.component.css',
    './coinExchangeRateManagement.responsive.component.css',
  ],
})
export class CoinExchangeRateManagementComponent implements OnInit {
  rates: CoinExchangeRate[] = [];
  isLoading: boolean = false;

  constructor(
    private rateService: CoinExchangeRateService,
    private router: Router,
    private translateService: TranslateService,
    private dialog: MatDialog,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.loadRates();
  }

  async loadRates(): Promise<void> {
    this.isLoading = true;
    try {
      this.rates = await this.rateService.getAllRates();
      this.cdr.markForCheck();
    } catch (error) {
      console.error('Failed to load coin exchange rates:', error);
      alert(this.translateService.instant('coin-exchange-rate.error-load'));
    } finally {
      this.isLoading = false;
    }
  }

  openCreateDialog(): void {
    const dialogRef = this.dialog.open(CoinExchangeRateDialogComponent, {
      width: '480px',
      data: { mode: CoinExchangeRateFormMode.Create },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result?.mode === 'create' && result.data) {
        this.rates.push(result.data);
        this.rates.sort((rateA, rateB) => rateA.coin - rateB.coin);
        this.cdr.markForCheck();
      }
    });
  }

  openEditDialog(rate: CoinExchangeRate): void {
    const dialogRef = this.dialog.open(CoinExchangeRateDialogComponent, {
      width: '480px',
      data: { mode: CoinExchangeRateFormMode.Edit, rate },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result?.mode === 'edit' && result.data) {
        const index = this.rates.findIndex(
          (existingRate) => existingRate.id === result.data.id,
        );
        if (index > -1) {
          this.rates[index] = result.data;
          this.rates.sort((rateA, rateB) => rateA.coin - rateB.coin);
        }
        this.cdr.markForCheck();
      }
    });
  }

  async deleteRate(rate: CoinExchangeRate): Promise<void> {
    if (
      !confirm(
        this.translateService.instant('coin-exchange-rate.delete-confirm'),
      )
    ) {
      return;
    }

    try {
      await this.rateService.deleteRate(rate.id);
      this.rates = this.rates.filter(
        (existingRate) => existingRate.id !== rate.id,
      );
      this.cdr.markForCheck();
    } catch (error) {
      console.error('Failed to delete coin exchange rate:', error);
      alert(this.translateService.instant('coin-exchange-rate.error-delete'));
    }
  }

  goBack(): void {
    this.router.navigate(['/adminPanel']);
  }
}
