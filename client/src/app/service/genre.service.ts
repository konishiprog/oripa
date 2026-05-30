/**
 * 'service/genre': Genre API Service
 */

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { lastValueFrom } from 'rxjs';
import { ApiConfigService } from './api-config.service';

export interface Genre {
  id: string;
  name: string;
}

@Injectable({
  providedIn: 'root',
})
export class GenreService {
  constructor(
    private http: HttpClient,
    private apiConfig: ApiConfigService,
  ) {}

  async getAllGenres(): Promise<Genre[]> {
    const response = await lastValueFrom(
      this.http.get<{ message: string; data: Genre[] }>(
        `${this.apiConfig.domain}/api/genre`,
        { headers: this.apiConfig.headers },
      ),
    );
    return response.data || [];
  }

  async createGenre(payload: Omit<Genre, 'id'>): Promise<Genre> {
    const response = await lastValueFrom(
      this.http.post<{ message: string; data: Genre }>(
        `${this.apiConfig.domain}/api/genre`,
        payload,
        { headers: this.apiConfig.headers },
      ),
    );
    return response.data;
  }

  async updateGenre(id: string, payload: Omit<Genre, 'id'>): Promise<Genre> {
    const response = await lastValueFrom(
      this.http.put<{ message: string; data: Genre }>(
        `${this.apiConfig.domain}/api/genre/${id}`,
        payload,
        { headers: this.apiConfig.headers },
      ),
    );
    return response.data;
  }

  async deleteGenre(id: string): Promise<{ message: string }> {
    return await lastValueFrom(
      this.http.delete<{ message: string }>(
        `${this.apiConfig.domain}/api/genre/${id}`,
        { headers: this.apiConfig.headers },
      ),
    );
  }
}
