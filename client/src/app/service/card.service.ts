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

export interface UpdateCardPayload {
  name: string;
  cardType: string;
  exchangeType: string;
  exchangePoints: number | null;
  imageFrontFile?: File | null;
  imageBackFile?: File | null;
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
   * Update an existing card (images are optional — kept if not provided)
   * @param {number} id - Card id to update
   * @param {UpdateCardPayload} payload - Card attributes with optional image files
   * @returns {Promise<any>} - Updated card object
   */
  async updateCard(id: number, payload: UpdateCardPayload) {
    const formData = new FormData();
    formData.append('name', payload.name);
    formData.append('cardType', payload.cardType);
    formData.append('exchangeType', payload.exchangeType);
    if (payload.exchangePoints !== null) {
      formData.append('exchangePoints', payload.exchangePoints.toString());
    }
    if (payload.imageFrontFile) {
      formData.append('imageFront', payload.imageFrontFile);
    }
    if (payload.imageBackFile) {
      formData.append('imageBack', payload.imageBackFile);
    }

    const headers = new HttpHeaders();
    return await lastValueFrom(
      this.http.put<any>(`${this.apiConfig.domain}/api/card/${id}`, formData, {
        headers,
      }),
    );
  }

  /**
   * Delete an existing card
   * @param {number} id - Card id to delete
   * @returns {Promise<any>}
   */
  async deleteCard(id: number) {
    return await lastValueFrom(
      this.http.delete<any>(`${this.apiConfig.domain}/api/card/${id}`, {
        headers: this.apiConfig.headers,
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
