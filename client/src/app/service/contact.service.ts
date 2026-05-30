/**
 * 'service/contact': Contact Inquiry API Service
 */

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { lastValueFrom } from 'rxjs';
import { ApiConfigService } from './api-config.service';

@Injectable({
  providedIn: 'root',
})
export class ContactService {
  constructor(
    private http: HttpClient,
    private apiConfig: ApiConfigService,
  ) {}

  /**
   * Send a contact inquiry to the administrators
   * @param {string} userId - Logged-in user id
   * @param {string} title - Inquiry title
   * @param {string} content - Inquiry content
   * @returns {Promise<{ message: string }>} - Send response
   */
  async sendInquiry(
    userId: string,
    title: string,
    content: string,
  ): Promise<{ message: string }> {
    const headers = this.apiConfig.headers.set('x-user-id', userId);
    return await lastValueFrom(
      this.http.post<{ message: string }>(
        `${this.apiConfig.domain}/api/contact`,
        { title, content },
        { headers },
      ),
    );
  }
}
