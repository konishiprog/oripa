import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { TranslateService, TranslateModule } from '@ngx-translate/core';
import { loadStripe } from '@stripe/stripe-js';
import { firstValueFrom } from 'rxjs';
import { ApiConfigService } from '../../service/api-config.service';
import { UserService } from '../../service/user.service';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-charge-result-page',
  standalone: false,
  templateUrl: './chargeResultPage.component.html',
  styleUrls: ['./chargeResultPage.component.css'],
})
export class ChargeResultPageComponent implements OnInit {
  isLoading: boolean = true;
  status: string = 'pending';
  amount: number = 0;
  coinAmount: number = 0;
  ticketAmount: number = 0;
  errorMessage: string = '';
  icons: { [key: string]: SafeHtml } = {};

  private iconCache: Map<string, SafeHtml> = new Map();
  private readonly CACHE_BUST = new Date().getTime();

  constructor(
    private router: Router,
    private http: HttpClient,
    private sanitizer: DomSanitizer,
    private translateService: TranslateService,
    private apiConfig: ApiConfigService,
    private userService: UserService,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.loadIcons();
    this.checkPaymentStatus();
  }

  private loadIcons(): void {
    const iconMap = {
      'assets/icons/check-circle.svg': 'success',
      'assets/icons/x-circle.svg': 'error',
      'assets/icons/hourglass.svg': 'processing',
    };

    Object.entries(iconMap).forEach(([iconPath, key]) => {
      this.http
        .get(`${iconPath}?v=${this.CACHE_BUST}`, { responseType: 'text' })
        .subscribe({
          next: (svg) => {
            this.iconCache.set(
              iconPath,
              this.sanitizer.bypassSecurityTrustHtml(svg),
            );
            this.icons[key] = this.getIcon(iconPath);
            this.cdr.markForCheck();
          },
          error: (error) => {
            console.error(
              `Failed to load icon ${iconPath}:`,
              error.status,
              error.statusText,
              error.url,
            );
          },
        });
    });
  }

  private getIcon(iconPath: string): SafeHtml {
    return this.iconCache.get(iconPath) || '';
  }

  private async checkPaymentStatus(): Promise<void> {
    const clientSecret = new URLSearchParams(window.location.search).get(
      'payment_intent_client_secret',
    );

    if (!clientSecret) {
      this.status = 'failed';
      this.errorMessage = this.translateService.instant(
        'charge-result.error-no-secret',
      );
      this.isLoading = false;
      return;
    }

    try {
      const stripe = await loadStripe(environment.stripe.publishableKey);
      if (!stripe) {
        throw new Error(
          this.translateService.instant('charge-result.error-stripe-load'),
        );
      }

      const { paymentIntent } =
        await stripe.retrievePaymentIntent(clientSecret);

      if (!paymentIntent) {
        throw new Error(
          this.translateService.instant('charge-result.error-payment-intent'),
        );
      }

      this.status = paymentIntent.status;

      const intent = paymentIntent as any;
      if (intent.metadata && intent.metadata['coin']) {
        this.coinAmount = parseInt(intent.metadata['coin'], 10);
      }

      if (intent.metadata && intent.metadata['ticket']) {
        this.ticketAmount = parseInt(intent.metadata['ticket'], 10);
      }

      if (intent.amount) {
        const DECIMAL_CURRENCIES = new Set(['usd', 'eur', 'gbp', 'cad', 'aud']);
        const currency = intent.currency?.toLowerCase() || 'jpy';
        this.amount = DECIMAL_CURRENCIES.has(currency)
          ? intent.amount / 100
          : intent.amount;
      }

      if (intent.last_payment_error && intent.last_payment_error.message) {
        this.errorMessage = intent.last_payment_error.message;
      }

      if (this.status === 'succeeded' && intent.id) {
        await this.confirmPaymentOnServer(intent.id);
        await this.refreshUserData();
      }
    } catch (error: any) {
      this.status = 'failed';
      this.errorMessage = error.message;
      console.error('Payment status check error:', error);
    } finally {
      this.isLoading = false;
    }
  }

  private async confirmPaymentOnServer(paymentIntentId: string): Promise<void> {
    try {
      const response = await firstValueFrom(
        this.http.post<any>(
          `${this.apiConfig.domain}/api/coin-purchase-history/confirm-payment`,
          { paymentIntentId },
          { headers: this.apiConfig.headers },
        ),
      );

      if (response?.data) {
        this.coinAmount = response.data.coin || 0;
        this.ticketAmount = response.data.ticket || 0;
      }
    } catch (error: any) {
      console.error('Failed to confirm payment on server:', error);
    }
  }

  private async refreshUserData(): Promise<void> {
    try {
      const userId = this.userService.getUserId();
      if (!userId) {
        return;
      }

      const user = await this.userService.getUserById(userId);
      this.userService.saveCoin(user.coin);
      this.userService.saveTicket(user.ticket);
    } catch (error: any) {
      console.error('Failed to refresh user data:', error);
    }
  }

  goToCoinChargePage(): void {
    this.router.navigate(['/coinChargePage']);
  }

  async goToUserGachaPage(): Promise<void> {
    await new Promise((resolve) => setTimeout(resolve, 500));
    this.router.navigate(['/userGachaPage']);
  }
}
