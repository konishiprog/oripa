/**
 * 'service/effect': Effect API Service
 */

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { lastValueFrom } from 'rxjs';
import { ApiConfigService } from './api-config.service';

export interface Effect {
  id: string;
  name: string;
  url: string;
}

@Injectable({
  providedIn: 'root',
})
export class EffectService {
  constructor(
    private http: HttpClient,
    private apiConfig: ApiConfigService,
  ) {}

  async getAllEffects(): Promise<Effect[]> {
    const response = await lastValueFrom(
      this.http.get<{ message: string; data: Effect[] }>(
        `${this.apiConfig.domain}/api/effect`,
        { headers: this.apiConfig.headers },
      ),
    );
    return response.data || [];
  }

  async createEffect(payload: Omit<Effect, 'id'>): Promise<Effect> {
    const response = await lastValueFrom(
      this.http.post<{ message: string; data: Effect }>(
        `${this.apiConfig.domain}/api/effect`,
        payload,
        { headers: this.apiConfig.headers },
      ),
    );
    return response.data;
  }

  async updateEffect(id: string, payload: Omit<Effect, 'id'>): Promise<Effect> {
    const response = await lastValueFrom(
      this.http.put<{ message: string; data: Effect }>(
        `${this.apiConfig.domain}/api/effect/${id}`,
        payload,
        { headers: this.apiConfig.headers },
      ),
    );
    return response.data;
  }

  async deleteEffect(id: string): Promise<{ message: string }> {
    return await lastValueFrom(
      this.http.delete<{ message: string }>(
        `${this.apiConfig.domain}/api/effect/${id}`,
        { headers: this.apiConfig.headers },
      ),
    );
  }
}
