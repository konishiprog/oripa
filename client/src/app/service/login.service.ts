/**
 * 'service/login': Login API Service
 */

import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { lastValueFrom } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class LoginService {
  private domain = 'http://localhost:3000';
  private headers = new HttpHeaders({
    'Content-Type': 'application/json',
  });

  constructor(private http: HttpClient) {}

  /**
   * Login with email and password
   * @param {string} email - Admin email address
   * @param {string} password - Admin password
   * @returns {Promise<any>} - Login response with admin data
   */
  async login(email: string, password: string) {
    return await lastValueFrom(
      this.http.post<any>(
        `${this.domain}/api/admin/login`,
        { email, password },
        { headers: this.headers },
      ),
    );
  }
}
