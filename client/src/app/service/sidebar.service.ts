/**
 * 'service/sidebar': Sidebar API Service
 */

import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { lastValueFrom } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class SidebarService {
  private domain = 'http://localhost:3000';
  private headers = new HttpHeaders({
    'Content-Type': 'application/json',
  });
  private readonly STORAGE_KEY = 'adminId';

  constructor(private http: HttpClient) {}

  /**
   * Save the logged-in admin id to local storage
   * @param {string} id - Admin id
   */
  saveAdminId(id: string): void {
    localStorage.setItem(this.STORAGE_KEY, id);
  }

  /**
   * Get the logged-in admin id from local storage
   * @returns {string | null} - Admin id or null
   */
  getAdminId(): string | null {
    return localStorage.getItem(this.STORAGE_KEY);
  }

  /**
   * Clear the logged-in admin id from local storage
   */
  clearAdminId(): void {
    localStorage.removeItem(this.STORAGE_KEY);
  }

  /**
   * Get the currently logged-in admin info from the API
   * @returns {Promise<any | null>} - Admin object or null if not logged in
   */
  async getCurrentAdmin(): Promise<any | null> {
    const id = this.getAdminId();
    if (!id) {
      return null;
    }
    const response = await lastValueFrom(
      this.http.get<{ message: string; data: any }>(
        `${this.domain}/api/admin/${id}`,
        { headers: this.headers },
      ),
    );
    return response.data || null;
  }
}
