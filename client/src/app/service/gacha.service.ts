/**
 * 'service/gacha': Gacha API Service
 */

import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { lastValueFrom } from 'rxjs';
import { ApiConfigService } from './api-config.service';

export interface CreateGachaPayload {
  name: string;
  consumptionType: string;
  cost: number;
  oncePerUser: boolean;
  publishStart: string;
  publishEnd: string;
  isPublic: boolean;
  headerImageFile: File;
}

export interface UpdateGachaPayload {
  name: string;
  consumptionType: string;
  cost: number;
  oncePerUser: boolean;
  publishStart: string;
  publishEnd: string;
  isPublic: boolean;
  headerImageFile?: File | null;
}

@Injectable({
  providedIn: 'root',
})
export class GachaService {
  constructor(
    private http: HttpClient,
    private apiConfig: ApiConfigService,
  ) {}

  /**
   * Create a new gacha with image upload
   * @param {CreateGachaPayload} payload - Gacha attributes with image file
   * @returns {Promise<any>} - Created gacha object
   */
  async createGacha(payload: CreateGachaPayload) {
    const formData = new FormData();
    formData.append('name', payload.name);
    formData.append('consumptionType', payload.consumptionType);
    formData.append('cost', payload.cost.toString());
    formData.append('oncePerUser', payload.oncePerUser.toString());
    formData.append('publishStart', payload.publishStart);
    formData.append('publishEnd', payload.publishEnd);
    formData.append('isPublic', payload.isPublic.toString());
    formData.append('headerImage', payload.headerImageFile);

    const headers = new HttpHeaders();
    return await lastValueFrom(
      this.http.post<any>(`${this.apiConfig.domain}/api/gacha`, formData, {
        headers,
      }),
    );
  }

  /**
   * Update an existing gacha (image is optional — kept if not provided)
   * @param {string} id - Gacha id (UUID) to update
   * @param {UpdateGachaPayload} payload - Gacha attributes with optional image file
   * @returns {Promise<any>} - Updated gacha object
   */
  async updateGacha(id: string, payload: UpdateGachaPayload) {
    const formData = new FormData();
    formData.append('name', payload.name);
    formData.append('consumptionType', payload.consumptionType);
    formData.append('cost', payload.cost.toString());
    formData.append('oncePerUser', payload.oncePerUser.toString());
    formData.append('publishStart', payload.publishStart);
    formData.append('publishEnd', payload.publishEnd);
    formData.append('isPublic', payload.isPublic.toString());
    if (payload.headerImageFile) {
      formData.append('headerImage', payload.headerImageFile);
    }

    const headers = new HttpHeaders();
    return await lastValueFrom(
      this.http.put<any>(`${this.apiConfig.domain}/api/gacha/${id}`, formData, {
        headers,
      }),
    );
  }

  /**
   * Delete an existing gacha
   * @param {string} id - Gacha id (UUID) to delete
   * @returns {Promise<any>}
   */
  async deleteGacha(id: string) {
    return await lastValueFrom(
      this.http.delete<any>(`${this.apiConfig.domain}/api/gacha/${id}`, {
        headers: this.apiConfig.headers,
      }),
    );
  }

  /**
   * Get all gachas
   * @returns {Promise<any[]>} - Array of gacha objects
   */
  async getGachas(userId?: string): Promise<any[]> {
    const query = userId ? `?userId=${encodeURIComponent(userId)}` : '';
    const response = await lastValueFrom(
      this.http.get<{ message: string; data: any[] }>(
        `${this.apiConfig.domain}/api/gacha${query}`,
        { headers: this.apiConfig.headers },
      ),
    );
    return response.data || [];
  }

  /**
   * Get a single gacha by id (with remaining count)
   * @param {string} id - Gacha id (UUID)
   * @returns {Promise<any>} - Gacha object
   */
  async getGachaById(id: string): Promise<any> {
    const response = await lastValueFrom(
      this.http.get<{ message: string; data: any }>(
        `${this.apiConfig.domain}/api/gacha/${id}`,
        { headers: this.apiConfig.headers },
      ),
    );
    return response.data;
  }

  /**
   * Draw cards from a gacha for the given user
   * @param {string} gachaId - Gacha id (UUID)
   * @param {string} userId - User id (UUID) performing the draw
   * @param {number} drawCount - Requested draw count (may be capped to remaining)
   * @returns {Promise<any>} - Draw result with drawn cards, remaining count and updated user coin
   */
  async drawGacha(
    gachaId: string,
    userId: string,
    drawCount: number,
  ): Promise<any> {
    const response = await lastValueFrom(
      this.http.post<{ message: string; data: any }>(
        `${this.apiConfig.domain}/api/gacha/${gachaId}/draw`,
        { userId, drawCount },
        { headers: this.apiConfig.headers },
      ),
    );
    return response.data;
  }
}
