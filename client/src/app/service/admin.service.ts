/**
 * 'service/admin': Admin API Service
 */

import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { lastValueFrom } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AdminService {
  private domain = 'http://localhost:3000';
  private headers = new HttpHeaders({
    'Content-Type': 'application/json',
  });

  constructor(private http: HttpClient) {}

  /**
   * Create a new admin user
   * @param {string} email - Admin email address
   * @param {string} password - Admin password
   * @returns {Promise<any>} - Created admin object
   */
  async createAdmin(email: string, password: string) {
    try {
      return await lastValueFrom(
        this.http.post<any>(
          `${this.domain}/api/admin`,
          { email, password },
          {
            headers: this.headers,
          },
        ),
      );
    } catch (error: any) {
      console.error('Admin service error:', error);
      throw error;
    }
  }
}
