import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import {
  CoinExchangeRateService,
  CoinExchangeRate,
} from '../../service/coin-exchange-rate.service';
import { UserService } from '../../service/user.service';

interface ChargeOption {
  id: string;
  label: string;
  price: number;
  point: number;
  specialPoint: number;
}

@Component({
  selector: 'app-coin-charge-page',
  standalone: false,
  templateUrl: './coinChargePage.component.html',
  styleUrls: ['./coinChargePage.component.css'],
})
export class CoinChargePageComponent implements OnInit {
  chargeOptions: ChargeOption[] = [];
  selectedOptionId: string = '';
  isLoading: boolean = false;

  get selectedOption(): ChargeOption | undefined {
    return this.chargeOptions.find(
      (option) => option.id === this.selectedOptionId,
    );
  }

  constructor(
    private rateService: CoinExchangeRateService,
    private userService: UserService,
    private router: Router,
    private translateService: TranslateService,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.loadChargeOptions();
  }

  async loadChargeOptions(): Promise<void> {
    this.isLoading = true;
    try {
      const rates = await this.rateService.getAllRates();
      this.chargeOptions = rates.map((rate) => ({
        id: rate.id,
        label: this.formatChargeLabel(rate),
        price: rate.price,
        point: rate.point,
        specialPoint: rate.specialPoint,
      }));

      if (this.chargeOptions.length > 0) {
        this.selectedOptionId = this.chargeOptions[0].id;
      }
      this.cdr.markForCheck();
    } catch (error) {
      console.error('Failed to load charge options:', error);
      alert(this.translateService.instant('coin-charge.error-load'));
    } finally {
      this.isLoading = false;
    }
  }

  private formatChargeLabel(rate: CoinExchangeRate): string {
    const priceLabel = this.translateService.instant('common.unit.yen');
    const pointLabel = this.translateService.instant('common.unit.point');

    if (rate.specialPoint > 0) {
      const specialLabel = this.translateService.instant(
        'coin-exchange-rate.special-point',
      );
      return `${priceLabel}${rate.price}:${rate.point}${pointLabel}(+${rate.specialPoint}${specialLabel})`;
    }

    return `${priceLabel}${rate.price}:${rate.point}${pointLabel}`;
  }

  async onCharge(): Promise<void> {
    if (!this.selectedOptionId) {
      alert(this.translateService.instant('coin-charge.error-no-option'));
      return;
    }

    const userId = this.userService.getUserId();
    if (!userId) {
      alert(this.translateService.instant('common.error-not-logged-in'));
      this.router.navigate(['/login']);
      return;
    }

    this.isLoading = true;
    try {
      const result = await this.userService.charge(
        this.selectedOptionId,
        userId,
      );

      this.userService.saveCoin(result.newCoin);
      this.userService.saveSpecialPoint(result.newSpecialPoint);

      const message = this.translateService.instant(
        'coin-charge.success-charge',
        {
          addedPoint: result.addedPoint,
          newCoin: result.newCoin,
        },
      );
      alert(message);

      this.router.navigate(['/userGachaPage']);
    } catch (error) {
      console.error('Failed to charge coin:', error);
      alert(this.translateService.instant('coin-charge.error-charge'));
    } finally {
      this.isLoading = false;
      this.cdr.markForCheck();
    }
  }

  goBack(): void {
    this.router.navigate(['/userGachaPage']);
  }
}
