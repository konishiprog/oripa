/**
 * 'service/user': User API Service
 */

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { lastValueFrom } from 'rxjs';
import { ApiConfigService } from './api-config.service';

export interface User {
  id: string;
  email: string;
  password: string;
  name: string;
  address: string;
  phone: string;
  coin: number;
  specialPoint: number;
}

export interface CreateUserPayload {
  email: string;
  password: string;
  name: string;
  address: string;
  phone: string;
}

export interface ChargeResult {
  userId: string;
  previousCoin: number;
  newCoin: number;
  addedPoint: number;
  previousSpecialPoint: number;
  newSpecialPoint: number;
  addedSpecialPoint: number;
}

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private readonly STORAGE_KEY = 'userId';
  private readonly COIN_STORAGE_KEY = 'userCoin';
  private readonly SPECIAL_POINT_STORAGE_KEY = 'userSpecialPoint';

  constructor(
    private http: HttpClient,
    private apiConfig: ApiConfigService,
  ) {}

  /**
   * Create a new user (signup)
   * @param {CreateUserPayload} payload - User signup attributes
   * @returns {Promise<any>} - Created user object
   */
  async createUser(payload: CreateUserPayload): Promise<User> {
    const response = await lastValueFrom(
      this.http.post<{ message: string; data: User }>(
        `${this.apiConfig.domain}/api/user`,
        payload,
        { headers: this.apiConfig.headers },
      ),
    );
    return response.data;
  }

  /**
   * Get all users
   * @returns {Promise<any[]>} - Array of users
   */
  async getAllUsers(): Promise<User[]> {
    const response = await lastValueFrom(
      this.http.get<{ message: string; data: User[] }>(
        `${this.apiConfig.domain}/api/user`,
        { headers: this.apiConfig.headers },
      ),
    );
    return response.data || [];
  }

  /**
   * Get a single user by id
   * @param {string} id - User id (UUID)
   * @returns {Promise<any>} - User object
   */
  async getUserById(id: string): Promise<User> {
    const response = await lastValueFrom(
      this.http.get<{ message: string; data: User }>(
        `${this.apiConfig.domain}/api/user/${id}`,
        { headers: this.apiConfig.headers },
      ),
    );
    return response.data;
  }

  /**
   * Update a user
   * @param {string} id - User id
   * @param {object} payload - User update data (partial)
   * @returns {Promise<any>} - Updated user object
   */
  async updateUser(
    id: string,
    payload: Partial<{
      email: string;
      password: string;
      name: string;
      address: string;
      phone: string;
      coin: number;
    }>,
  ): Promise<User> {
    const response = await lastValueFrom(
      this.http.put<{ message: string; data: User }>(
        `${this.apiConfig.domain}/api/user/${id}`,
        payload,
        { headers: this.apiConfig.headers },
      ),
    );
    return response.data;
  }

  /**
   * Delete a user
   * @param {string} id - User id
   * @returns {Promise<{ message: string }>} - Delete response
   */
  async deleteUser(id: string): Promise<{ message: string }> {
    return await lastValueFrom(
      this.http.delete<{ message: string }>(
        `${this.apiConfig.domain}/api/user/${id}`,
        { headers: this.apiConfig.headers },
      ),
    );
  }

  /**
   * Charge a user's coin balance based on exchange rate
   * @param {string} rateId - Coin exchange rate id
   * @param {string} userId - User id
   * @returns {Promise<ChargeResult>} - Charge result with updated values
   */
  async charge(rateId: string, userId: string): Promise<ChargeResult> {
    const headers = this.apiConfig.headers.set('x-user-id', userId);
    const response = await lastValueFrom(
      this.http.post<{ message: string; data: ChargeResult }>(
        `${this.apiConfig.domain}/api/user/charge`,
        { rateId },
        { headers },
      ),
    );
    return response.data;
  }

  /**
   * Login a user by email or phone
   * @param {string} identifier - Email address or phone number
   * @param {string} password - User password
   * @returns {Promise<{ message: string; data: User }>} - Login response with user data
   */
  async login(
    identifier: string,
    password: string,
  ): Promise<{ message: string; data: User }> {
    return await lastValueFrom(
      this.http.post<{ message: string; data: User }>(
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

  /**
   * Save the user's special point balance to local storage
   * @param {number} specialPoint - User special point balance
   */
  saveSpecialPoint(specialPoint: number): void {
    localStorage.setItem(
      this.SPECIAL_POINT_STORAGE_KEY,
      specialPoint.toString(),
    );
  }

  /**
   * Get the user's special point balance from local storage
   * @returns {number | null} - User special point balance or null
   */
  getSpecialPoint(): number | null {
    const specialPoint = localStorage.getItem(this.SPECIAL_POINT_STORAGE_KEY);
    return specialPoint ? parseInt(specialPoint, 10) : null;
  }

  /**
   * Clear the user's special point balance from local storage
   */
  clearSpecialPoint(): void {
    localStorage.removeItem(this.SPECIAL_POINT_STORAGE_KEY);
  }
}
