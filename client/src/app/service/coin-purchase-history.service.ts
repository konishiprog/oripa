import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { lastValueFrom } from 'rxjs';
import { ApiConfigService } from './api-config.service';

export interface CoinPurchaseHistoryItem {
  id: string;
  userId: string;
  'User.name'?: string;
  price: number;
  point: number;
  specialPoint: number;
  status: string;
  createdAt: Date;
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
}
