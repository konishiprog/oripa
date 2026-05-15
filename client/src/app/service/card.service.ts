/**
 * 'service/card': Card API Service
 */

import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { lastValueFrom } from 'rxjs';
import { ApiConfigService } from './api-config.service';

export interface CreateCardPayload {
  gachaId: number;
  name: string;
  cardType: string;
  exchangeType: string;
  exchangePoints: number | null;
  imageFrontFile: File;
  imageBackFile: File;
}

@Injectable({
  providedIn: 'root',
})
export class CardService {
  constructor(
    private http: HttpClient,
    private apiConfig: ApiConfigService,
  ) {}

  /**
   * Create a new card for a gacha
   * @param {CreateCardPayload} payload - Card attributes with image files
   * @returns {Promise<any>} - Created card object
   */
  async createCard(payload: CreateCardPayload) {
    const formData = new FormData();
    formData.append('gachaId', payload.gachaId.toString());
    formData.append('name', payload.name);
    formData.append('cardType', payload.cardType);
    formData.append('exchangeType', payload.exchangeType);
    if (payload.exchangePoints !== null) {
      formData.append('exchangePoints', payload.exchangePoints.toString());
    }
    formData.append('imageFront', payload.imageFrontFile);
    formData.append('imageBack', payload.imageBackFile);

    const headers = new HttpHeaders();
    return await lastValueFrom(
      this.http.post<any>(`${this.apiConfig.domain}/api/card`, formData, {
        headers,
      }),
    );
  }

  /**
   * Get all cards for a specific gacha
   * @param {number} gachaId - Gacha id
   * @returns {Promise<any[]>} - Array of card objects
   */
  async getCardsByGachaId(gachaId: number): Promise<any[]> {
    const response = await lastValueFrom(
      this.http.get<{ message: string; data: any[] }>(
        `${this.apiConfig.domain}/api/card/gacha/${gachaId}`,
        { headers: this.apiConfig.headers },
      ),
    );
    return response.data || [];
  }
}
