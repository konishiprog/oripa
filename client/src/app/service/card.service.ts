/**
 * 'service/card': Card API Service
 */

import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { lastValueFrom } from 'rxjs';
import { ApiConfigService } from './api-config.service';

export interface CreateCardPayload {
  gachaId: string;
  name: string;
  cardType: string;
  exchangeType: string;
  exchangeCoins: number | null;
  effectId: string | null;
  imageFrontFile: File;
  imageBackFile: File;
}

export interface ShipmentPayload {
  cardId: string;
  trackingNumber: string;
}

export interface UpdateCardPayload {
  name: string;
  cardType: string;
  exchangeType: string;
  exchangeCoins: number | null;
  effectId: string | null;
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
    if (payload.exchangeCoins !== null) {
      formData.append('exchangeCoins', payload.exchangeCoins.toString());
    }
    if (payload.effectId !== null) {
      formData.append('effectId', payload.effectId);
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
   * @param {string} id - Card id (UUID) to update
   * @param {UpdateCardPayload} payload - Card attributes with optional image files
   * @returns {Promise<any>} - Updated card object
   */
  async updateCard(id: string, payload: UpdateCardPayload) {
    const formData = new FormData();
    formData.append('name', payload.name);
    formData.append('cardType', payload.cardType);
    formData.append('exchangeType', payload.exchangeType);
    if (payload.exchangeCoins !== null) {
      formData.append('exchangeCoins', payload.exchangeCoins.toString());
    }
    if (payload.effectId !== null) {
      formData.append('effectId', payload.effectId);
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
   * @param {string} id - Card id (UUID) to delete
   * @returns {Promise<any>}
   */
  async deleteCard(id: string) {
    return await lastValueFrom(
      this.http.delete<any>(`${this.apiConfig.domain}/api/card/${id}`, {
        headers: this.apiConfig.headers,
      }),
    );
  }

  /**
   * Get all cards
   * @returns {Promise<any[]>} - Array of all card objects
   */
  async getAllCards(): Promise<any[]> {
    const response = await lastValueFrom(
      this.http.get<{ message: string; data: any[] }>(
        `${this.apiConfig.domain}/api/card`,
        { headers: this.apiConfig.headers },
      ),
    );
    return response.data || [];
  }

  /**
   * Get all cards for a specific gacha (filtered from all cards)
   * @param {string} gachaId - Gacha id (UUID)
   * @returns {Promise<any[]>} - Array of card objects
   */
  async getCardsByGachaId(gachaId: string): Promise<any[]> {
    const allCards = await this.getAllCards();
    return allCards.filter((card: any) => card.gachaId === gachaId);
  }

  /**
   * Get all cards drawn by a specific user (card acquisition history)
   * @param {string} userId - User id (UUID)
   * @returns {Promise<any[]>} - Array of card objects, each with gachaName
   */
  async getCardsByUserId(userId: string): Promise<any[]> {
    const allCards = await this.getAllCards();
    return allCards.filter(
      (card: any) => card.userId === userId && card.isDrawn,
    );
  }

  /**
   * Exchange a card for coins (return to gacha)
   * @param {string} id - Card id (UUID) to exchange
   * @returns {Promise<any>}
   */
  async exchangeCard(id: string) {
    return await lastValueFrom(
      this.http.patch<any>(
        `${this.apiConfig.domain}/api/card/${id}/exchange`,
        {},
        { headers: this.apiConfig.headers },
      ),
    );
  }

  /**
   * Update card status
   * @param {string} id - Card id (UUID)
   * @param {string} status - New status (isDrawn value)
   * @returns {Promise<any>}
   */
  async updateCardStatus(id: string, status: string) {
    return await lastValueFrom(
      this.http.patch<any>(
        `${this.apiConfig.domain}/api/card/${id}/status`,
        { isDrawn: status },
        { headers: this.apiConfig.headers },
      ),
    );
  }

  /**
   * Complete shipping for multiple cards with tracking numbers
   * @param {ShipmentPayload[]} shipments
   * @returns {Promise<any>}
   */
  async completeShipping(shipments: ShipmentPayload[]) {
    return await lastValueFrom(
      this.http.patch<any>(
        `${this.apiConfig.domain}/api/card/ship-complete`,
        { shipments },
        { headers: this.apiConfig.headers },
      ),
    );
  }
}
