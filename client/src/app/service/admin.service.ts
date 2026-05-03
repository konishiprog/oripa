/**
 * 'service/admin': Admin API Service
 */

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { lastValueFrom } from 'rxjs';
import { ApiConfigService } from './api-config.service';

@Injectable({
  providedIn: 'root',
})
export class AdminService {
  constructor(
    private http: HttpClient,
    private apiConfig: ApiConfigService,
  ) {}

  /**
   * Create a new admin user
   * @param {string} email - Admin email address
   * @param {string} password - Admin password
   * @returns {Promise<any>} - Created admin object
   */
  async createAdmin(email: string, password: string) {
    return await lastValueFrom(
      this.http.post<any>(
        `${this.apiConfig.domain}/api/admin`,
        { email, password },
        { headers: this.apiConfig.headers },
      ),
    );
  }

  /**
   * Update an existing admin user
   * @param {string} id - Admin id
   * @param {string} email - Admin email address
   * @param {string} password - Admin password
   * @returns {Promise<any>} - Updated admin object
   */
  async updateAdmin(id: string, email: string, password: string) {
    return await lastValueFrom(
      this.http.put<any>(
        `${this.apiConfig.domain}/api/admin/${id}`,
        { email, password },
        { headers: this.apiConfig.headers },
      ),
    );
  }

  /**
   * Delete an admin user
   * @param {string} id - Admin id
   * @returns {Promise<any>} - Delete response
   */
  async deleteAdmin(id: string) {
    return await lastValueFrom(
      this.http.delete<any>(
        `${this.apiConfig.domain}/api/admin/${id}`,
        { headers: this.apiConfig.headers },
      ),
    );
  }

  /**
   * Get all admin accounts
   * @returns {Promise<any[]>} - Array of admin accounts
   */
  async getAdminAccounts(): Promise<any[]> {
    const response = await lastValueFrom(
      this.http.get<{ message: string; data: any[] }>(
        `${this.apiConfig.domain}/api/admin`,
        { headers: this.apiConfig.headers },
      ),
    );
    return response.data || [];
  }
}
