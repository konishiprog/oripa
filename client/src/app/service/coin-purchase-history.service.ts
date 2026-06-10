import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { lastValueFrom } from 'rxjs';
import { ApiConfigService } from './api-config.service';

export interface CoinPurchaseHistoryItem {
  id: string;
  userId: string;
  'User.name'?: string;
  price: number;
  coin: number;
  ticket: number;
  status: string;
  paymentMethod?: string;
  stripePaymentIntentId?: string;
  failureReason?: string;
  createdAt: Date;
}

export interface PaymentIntentResponse {
  clientSecret: string;
  chargeHistoryId: string;
}

@Injectable({
  providedIn: 'root',
})
export class CoinPurchaseHistoryService {
  constructor(
    private http: HttpClient,
    private apiConfig: ApiConfigService,
  ) {}

  async getAllHistories(): Promise<CoinPurchaseHistoryItem[]> {
    const response = await lastValueFrom(
      this.http.get<{ message: string; data: CoinPurchaseHistoryItem[] }>(
        `${this.apiConfig.domain}/api/coin-purchase-history`,
        { headers: this.apiConfig.headers },
      ),
    );
    return response.data || [];
  }

  async getUserHistories(userId: string): Promise<CoinPurchaseHistoryItem[]> {
    const response = await lastValueFrom(
      this.http.get<{ message: string; data: CoinPurchaseHistoryItem[] }>(
        `${this.apiConfig.domain}/api/coin-purchase-history/user/${userId}`,
        { headers: this.apiConfig.headers },
      ),
    );
    return response.data || [];
  }

  async createPaymentIntent(
    userId: string,
    amount: number,
    coin: number,
    ticket: number = 0,
  ): Promise<PaymentIntentResponse> {
    const response = await lastValueFrom(
      this.http.post<{ message: string; data: PaymentIntentResponse }>(
        `${this.apiConfig.domain}/api/coin-purchase-history/charge/create-payment-intent`,
        { userId, amount, coin, ticket },
        { headers: this.apiConfig.headers },
      ),
    );
    return response.data;
  }

  async getChargeHistory(userId: string): Promise<CoinPurchaseHistoryItem[]> {
    const response = await lastValueFrom(
      this.http.get<{ message: string; data: CoinPurchaseHistoryItem[] }>(
        `${this.apiConfig.domain}/api/coin-purchase-history/charge/history/${userId}`,
        { headers: this.apiConfig.headers },
      ),
    );
    return response.data || [];
  }
}
