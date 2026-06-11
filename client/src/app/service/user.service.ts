/**
 * 'service/user': User API Service
 */

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { lastValueFrom, BehaviorSubject } from 'rxjs';
import { ApiConfigService } from './api-config.service';

export interface User {
  id: string;
  email: string;
  password: string;
  name: string;
  nickname: string;
  address: string;
  phone: string;
  postalCode: string;
  coin: number;
  ticket: number;
}

export interface CreateUserPayload {
  email: string;
  password: string;
  name: string;
  nickname?: string;
  address: string;
  phone: string;
  postalCode?: string;
}

export interface ChargeResult {
  userId: string;
  previousCoin: number;
  newCoin: number;
  addedCoin: number;
  previousTicket: number;
  newTicket: number;
  addedTicket: number;
}

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private readonly STORAGE_KEY = 'userId';
  private readonly COIN_STORAGE_KEY = 'userCoin';
  private readonly TICKET_STORAGE_KEY = 'userTicket';

  private coin$ = new BehaviorSubject<number | null>(null);
  private ticket$ = new BehaviorSubject<number | null>(null);

  constructor(
    private http: HttpClient,
    private apiConfig: ApiConfigService,
  ) {
    this.coin$.next(this.getCoinFromStorage());
    this.ticket$.next(this.getTicketFromStorage());
  }

  /**
   * Create a new user (signup)
   * @param {CreateUserPayload} payload - User signup attributes
   * @returns {Promise<any>} - Created user object
   */
  async createUser(payload: CreateUserPayload): Promise<any> {
    const response = await lastValueFrom(
      this.http.post<{ message: string }>(
        `${this.apiConfig.domain}/api/user`,
        payload,
        { headers: this.apiConfig.headers },
      ),
    );
    return response;
  }

  /**
   * Verify email and complete user creation
   * @param {string} token - Verification token from email
   * @returns {Promise<User>} - Created user object
   */
  async verifyEmail(token: string): Promise<User> {
    const response = await lastValueFrom(
      this.http.get<{ message: string; data: User }>(
        `${this.apiConfig.domain}/api/user/verify-email?token=${token}`,
        { headers: this.apiConfig.headers },
      ),
    );
    return response.data;
  }

  /**
   * Verify email change token
   * @param {string} token - Email change verification token
   * @returns {Promise<User>} - Updated user object
   */
  async verifyEmailChange(token: string): Promise<User> {
    const response = await lastValueFrom(
      this.http.get<{ message: string; data: User }>(
        `${this.apiConfig.domain}/api/user/verify-email-change?token=${token}`,
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
      nickname: string;
      address: string;
      phone: string;
      postalCode: string;
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

  logout(): void {
    localStorage.removeItem(this.STORAGE_KEY);
    localStorage.removeItem(this.COIN_STORAGE_KEY);
    localStorage.removeItem(this.TICKET_STORAGE_KEY);
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

  async notifyCardExchange(userId: string, cardIds: string[]): Promise<void> {
    const headers = this.apiConfig.headers.set('x-user-id', userId);
    await lastValueFrom(
      this.http.post<{ message: string }>(
        `${this.apiConfig.domain}/api/user/notify-card-exchange`,
        { cardIds },
        { headers },
      ),
    );
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
   * Save the user's coin balance to local storage and update subject
   * @param {number} coin - User coin balance
   */
  saveCoin(coin: number): void {
    localStorage.setItem(this.COIN_STORAGE_KEY, coin.toString());
    this.coin$.next(coin);
  }

  /**
   * Get the user's coin balance (from subject cache)
   * @returns {number | null} - User coin balance or null
   */
  getCoin(): number | null {
    return this.coin$.value;
  }

  /**
   * Get coin as observable for reactive updates
   */
  coin$$ = this.coin$.asObservable();

  private getCoinFromStorage(): number | null {
    const coin = localStorage.getItem(this.COIN_STORAGE_KEY);
    return coin ? parseInt(coin, 10) : null;
  }

  /**
   * Clear the user's coin balance from local storage
   */
  clearCoin(): void {
    localStorage.removeItem(this.COIN_STORAGE_KEY);
    this.coin$.next(null);
  }

  /**
   * Save the user's ticket balance to local storage and update subject
   * @param {number} ticket - User ticket balance
   */
  saveTicket(ticket: number): void {
    localStorage.setItem(
      this.TICKET_STORAGE_KEY,
      ticket.toString(),
    );
    this.ticket$.next(ticket);
  }

  /**
   * Get the user's ticket balance (from subject cache)
   * @returns {number | null} - User ticket balance or null
   */
  getTicket(): number | null {
    return this.ticket$.value;
  }

  /**
   * Get ticket as observable for reactive updates
   */
  ticket$$ = this.ticket$.asObservable();

  private getTicketFromStorage(): number | null {
    const ticket = localStorage.getItem(this.TICKET_STORAGE_KEY);
    return ticket ? parseInt(ticket, 10) : null;
  }

  /**
   * Clear the user's ticket balance from local storage
   */
  clearTicket(): void {
    localStorage.removeItem(this.TICKET_STORAGE_KEY);
    this.ticket$.next(null);
  }

  async getAddressByPostalCode(
    postalCode: string,
  ): Promise<{ address: string; prefcode: string } | null> {
    try {
      const response = await lastValueFrom(
        this.http.get<{
          message: string;
          data: { address: string; prefcode: string };
        }>(`${this.apiConfig.domain}/api/user/postal-code/${postalCode}`, {
          headers: this.apiConfig.headers,
        }),
      );
      return response.data;
    } catch (error) {
      console.error('Failed to fetch address:', error);
      return null;
    }
  }
}
