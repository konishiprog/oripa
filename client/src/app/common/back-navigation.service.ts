import { Injectable } from '@angular/core';
import { Location } from '@angular/common';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class BackNavigationService {
  constructor(
    private router: Router,
    private location: Location,
  ) {}

  back(fallbackUrl: string = '/userGachaPage'): void {
    if (this.router.lastSuccessfulNavigation?.previousNavigation) {
      this.location.back();
      return;
    }
    this.router.navigate([fallbackUrl]);
  }
}
