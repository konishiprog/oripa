/**
 * 'service/user': User API Service
 */

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { lastValueFrom } from 'rxjs';
import { ApiConfigService } from './api-config.service';

export interface CreateUserPayload {
  email: string;
  password: string;
  name: string;
  address: string;
  phone: string;
}

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private readonly STORAGE_KEY = 'userId';
  private readonly COIN_STORAGE_KEY = 'userCoin';

  constructor(
    private http: HttpClient,
    private apiConfig: ApiConfigService,
  ) {}

  /**
   * Create a new user (signup)
   * @param {CreateUserPayload} payload - User signup attributes
   * @returns {Promise<any>} - Created user object
   */
  async createUser(payload: CreateUserPayload) {
    return await lastValueFrom(
      this.http.post<any>(`${this.apiConfig.domain}/api/user`, payload, {
        headers: this.apiConfig.headers,
      }),
    );
  }

  /**
   * Login a user by email or phone
   * @param {string} identifier - Email address or phone number
   * @param {string} password - User password
   * @returns {Promise<any>} - Login response with user data
   */
  async login(identifier: string, password: string) {
    return await lastValueFrom(
      this.http.post<any>(
        `${this.apiConfig.domain}/api/user/login`,
        { identifier, password },
        { headers: this.apiConfig.headers },
      ),
    );
  }

  /**
   * Save the logged-in user id to local storage
   * @param {string} id - User id (UUID)
   */
  saveUserId(id: string): void {
    localStorage.setItem(this.STORAGE_KEY, id);
  }

  /**
   * Get the logged-in user id from local storage
   * @returns {string | null} - User id (UUID) or null
   */
  getUserId(): string | null {
    return localStorage.getItem(this.STORAGE_KEY);
  }

  /**
   * Clear the logged-in user id from local storage
   */
  clearUserId(): void {
    localStorage.removeItem(this.STORAGE_KEY);
  }

  /**
   * Check whether a user is currently logged in
   * @returns {boolean}
   */
  isLoggedIn(): boolean {
    return this.getUserId() !== null;
  }

  /**
   * Save the user's coin balance to local storage
   * @param {number} coin - User coin balance
   */
  saveCoin(coin: number): void {
    localStorage.setItem(this.COIN_STORAGE_KEY, coin.toString());
  }

  /**
   * Get the user's coin balance from local storage
   * @returns {number | null} - User coin balance or null
   */
  getCoin(): number | null {
    const coin = localStorage.getItem(this.COIN_STORAGE_KEY);
    return coin ? parseInt(coin, 10) : null;
  }

  /**
   * Clear the user's coin balance from local storage
   */
  clearCoin(): void {
    localStorage.removeItem(this.COIN_STORAGE_KEY);
  }
}
