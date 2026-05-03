/**
 * 'service/login': Login API Service
 */

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { lastValueFrom } from 'rxjs';
import { ApiConfigService } from './api-config.service';

@Injectable({
  providedIn: 'root',
})
export class LoginService {
  constructor(
    private http: HttpClient,
    private apiConfig: ApiConfigService,
  ) {}

  /**
   * Login with email and password
   * @param {string} email - Admin email address
   * @param {string} password - Admin password
   * @returns {Promise<any>} - Login response with admin data
   */
  async login(email: string, password: string) {
    return await lastValueFrom(
      this.http.post<any>(
        `${this.apiConfig.domain}/api/admin/login`,
        { email, password },
        { headers: this.apiConfig.headers },
      ),
    );
  }
}
