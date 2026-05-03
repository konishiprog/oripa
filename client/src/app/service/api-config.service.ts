/**
 * 'service/api-config': API Configuration Service
 */

import { Injectable } from '@angular/core';
import { HttpHeaders } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class ApiConfigService {
  readonly domain = 'http://localhost:3000';
  readonly headers = new HttpHeaders({
    'Content-Type': 'application/json',
  });
}
