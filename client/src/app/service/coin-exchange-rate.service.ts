import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { lastValueFrom } from 'rxjs';
import { ApiConfigService } from './api-config.service';

export interface CoinExchangeRate {
  id: string;
  point: number;
  price: number;
  specialPoint: number;
}

@Injectable({
  providedIn: 'root',
})
export class CoinExchangeRateService {
  constructor(
    private http: HttpClient,
    private apiConfig: ApiConfigService,
  ) {}

  async getAllRates(): Promise<CoinExchangeRate[]> {
    const response = await lastValueFrom(
      this.http.get<{ message: string; data: CoinExchangeRate[] }>(
        `${this.apiConfig.domain}/api/coin-exchange-rate`,
        { headers: this.apiConfig.headers },
      ),
    );
    return response.data || [];
  }

  async createRate(
    payload: Omit<CoinExchangeRate, 'id'>,
  ): Promise<CoinExchangeRate> {
    const response = await lastValueFrom(
      this.http.post<{ message: string; data: CoinExchangeRate }>(
        `${this.apiConfig.domain}/api/coin-exchange-rate`,
        payload,
        { headers: this.apiConfig.headers },
      ),
    );
    return response.data;
  }

  async updateRate(
    id: string,
    payload: Omit<CoinExchangeRate, 'id'>,
  ): Promise<CoinExchangeRate> {
    const response = await lastValueFrom(
      this.http.put<{ message: string; data: CoinExchangeRate }>(
        `${this.apiConfig.domain}/api/coin-exchange-rate/${id}`,
        payload,
        { headers: this.apiConfig.headers },
      ),
    );
    return response.data;
  }

  async deleteRate(id: string): Promise<{ message: string }> {
    return await lastValueFrom(
      this.http.delete<{ message: string }>(
        `${this.apiConfig.domain}/api/coin-exchange-rate/${id}`,
        { headers: this.apiConfig.headers },
      ),
    );
  }
}
