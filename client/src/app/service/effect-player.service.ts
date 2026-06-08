import { Injectable } from '@angular/core';
import { ApiConfigService } from './api-config.service';

@Injectable({
  providedIn: 'root',
})
export class EffectPlayerService {
  constructor(private apiConfig: ApiConfigService) {}

  playEffects(effectUrls: string[]): void {
    if (effectUrls.length === 0) return;
    const urlParam = encodeURIComponent(JSON.stringify(effectUrls));
    const playerUrl = `${this.apiConfig.domain}/public/effect-player.html?urls=${urlParam}`;
    window.open(playerUrl, '_blank');
  }
}
