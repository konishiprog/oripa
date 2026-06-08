import {
  Component,
  OnInit,
  OnDestroy,
  ChangeDetectorRef,
  NgZone,
} from '@angular/core';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { take } from 'rxjs/operators';
import {
  CoinExchangeRateService,
  CoinExchangeRate,
} from '../../service/coin-exchange-rate.service';
import { UserService } from '../../service/user.service';
import { CoinPurchaseHistoryService } from '../../service/coin-purchase-history.service';
import { loadStripe, Stripe } from '@stripe/stripe-js';
import { environment } from '../../../environments/environment';

interface ChargeOption {
  id: string;
  price: number;
  point: number;
  specialPoint: number;
}

@Component({
  selector: 'app-coin-charge-page',
  standalone: false,
  templateUrl: './coinChargePage.component.html',
  styleUrls: [
    './coinChargePage.component.css',
    './coinChargePage.responsive.component.css',
  ],
})
export class CoinChargePageComponent implements OnInit, OnDestroy {
  chargeOptions: ChargeOption[] = [];
  selectedOptionId: string = '';
  isLoading: boolean = false;
  showPaymentForm: boolean = false;
  paymentMessage: string = '';
  isProcessing: boolean = false;
  messageType: 'error' | 'info' = 'info';

  private stripe: Stripe | null = null;
  private elements: any = null;
  private paymentElement: any = null;

  get selectedOption(): ChargeOption | undefined {
    return this.chargeOptions.find(
      (option) => option.id === this.selectedOptionId,
    );
  }

  getMessageClass(): string {
    if (!this.paymentMessage) {
      return '';
    }
    return `message-${this.messageType}`;
  }

  constructor(
    private rateService: CoinExchangeRateService,
    private userService: UserService,
    private chargeService: CoinPurchaseHistoryService,
    private router: Router,
    private translateService: TranslateService,
    private cdr: ChangeDetectorRef,
    private ngZone: NgZone,
  ) {}

  ngOnInit(): void {
    this.loadChargeOptions();
    this.initializeStripe();
  }

  ngOnDestroy(): void {
    if (this.paymentElement) {
      this.paymentElement.unmount();
    }
  }

  private async initializeStripe(): Promise<void> {
    this.stripe = await loadStripe(environment.stripe.publishableKey);
    if (!this.stripe) {
      console.error('Failed to load Stripe');
      this.paymentMessage = this.translateService.instant(
        'coin-charge.error-charge',
      );
      this.messageType = 'error';
    }
  }

  async loadChargeOptions(): Promise<void> {
    this.isLoading = true;
    try {
      const rates = await this.rateService.getAllRates();
      this.chargeOptions = rates.map((rate) => ({
        id: rate.id,
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

  async onCharge(): Promise<void> {
    if (!this.selectedOptionId) {
      this.paymentMessage = this.translateService.instant(
        'coin-charge.error-no-option',
      );
      return;
    }

    const userId = this.userService.getUserId();
    if (!userId) {
      this.paymentMessage = this.translateService.instant(
        'common.error-not-logged-in',
      );
      this.router.navigate(['/login']);
      return;
    }

    if (!this.stripe) {
      this.paymentMessage = this.translateService.instant(
        'coin-charge.error-charge',
      );
      this.messageType = 'error';
      return;
    }

    const option = this.selectedOption;
    if (!option) return;

    this.isLoading = true;
    this.paymentMessage = '';
    this.messageType = 'info';

    try {
      const paymentData = await this.chargeService.createPaymentIntent(
        userId,
        option.price,
        option.point,
        option.specialPoint,
      );

      const elementsResult = await (this.stripe as any).elements({
        clientSecret: paymentData.clientSecret,
      });

      this.elements = elementsResult;
      this.showPaymentForm = true;
      this.cdr.detectChanges();

      this.ngZone.onStable.pipe(take(1)).subscribe(() => {
        this.paymentElement = this.elements.create('payment');
        this.paymentElement.mount('#payment-element');
      });
    } catch (error: any) {
      console.error('Failed to create payment intent:', error);
      this.paymentMessage = this.translateService.instant(
        'coin-charge.error-charge',
      );
      this.messageType = 'error';
      this.cdr.markForCheck();
    } finally {
      this.isLoading = false;
    }
  }

  async onSubmitPayment(): Promise<void> {
    if (!this.stripe) {
      this.paymentMessage = this.translateService.instant(
        'coin-charge.error-charge',
      );
      this.messageType = 'error';
      return;
    }

    const userId = this.userService.getUserId();
    if (!userId) {
      this.paymentMessage = this.translateService.instant(
        'common.error-not-logged-in',
      );
      this.messageType = 'error';
      return;
    }

    this.isProcessing = true;
    this.paymentMessage = '';
    this.messageType = 'info';

    try {
      const { error } = await this.stripe.confirmPayment({
        elements: this.elements,
        confirmParams: {
          return_url: `${window.location.origin}/charge-result`,
        },
      });

      if (error) {
        this.paymentMessage = this.translateService.instant(
          'coin-charge.error-charge',
        );
        this.messageType = 'error';
      }
    } catch (error: any) {
      console.error('Payment error:', error);
      this.paymentMessage = this.translateService.instant(
        'coin-charge.error-charge',
      );
      this.messageType = 'error';
    } finally {
      this.isProcessing = false;
      this.cdr.markForCheck();
    }
  }

  onCancelPayment(): void {
    this.showPaymentForm = false;
    this.paymentMessage = '';
    this.messageType = 'info';
    if (this.paymentElement) {
      this.paymentElement.unmount();
      this.paymentElement = null;
    }
    this.elements = null;
    this.cdr.markForCheck();
  }

  goBack(): void {
    this.router.navigate(['/userGachaPage']);
  }
}
