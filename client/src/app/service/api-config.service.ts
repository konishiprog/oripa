import { Injectable } from '@angular/core';
import { HttpHeaders } from '@angular/common/http';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class ApiConfigService {
  readonly domain = environment.apiDomain;
  readonly headers = new HttpHeaders({
    'Content-Type': 'application/json',
  });
}
