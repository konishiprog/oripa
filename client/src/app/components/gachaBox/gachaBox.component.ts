import { Component, Input, ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { TranslateService } from '@ngx-translate/core';
import { GachaService } from '../../service/gacha.service';
import { UserService } from '../../service/user.service';
import { GachaDrawResultDialogComponent } from '../gachaDrawResultDialog/gachaDrawResultDialog.component';
import { GachaWinnersDialogComponent } from '../gachaWinnersDialog/gachaWinnersDialog.component';

export interface GachaBoxData {
  id: string;
  name: string;
  headerImage: string;
  consumptionType: string;
  cost: number;
  oncePerUser: boolean;
  alreadyDrawn: boolean;
  remainingCount: number;
  publishEnd: string | null;
}

@Component({
  selector: 'app-gacha-box',
  standalone: false,
  templateUrl: './gachaBox.component.html',
  styleUrls: [
    './gachaBox.component.css',
    './gachaBox.responsive.component.css',
  ],
})
export class GachaBoxComponent {
  @Input() gacha!: GachaBoxData;
  isDrawing: boolean = false;

  constructor(
    private gachaService: GachaService,
    private userService: UserService,
    private translateService: TranslateService,
    private dialog: MatDialog,
    private cdr: ChangeDetectorRef,
    private router: Router,
  ) {}

  get isLoggedIn(): boolean {
    return this.userService.isLoggedIn();
  }

  get usesSpecialPoint(): boolean {
    return this.gacha.consumptionType === 'SPECIAL_POINT';
  }

  get isExpired(): boolean {
    if (!this.gacha.publishEnd) return false;
    return new Date() > new Date(this.gacha.publishEnd);
  }

  formatPrice(cost: number): string {
    const unitKey = this.usesSpecialPoint
      ? 'common.unit.special-point'
      : 'common.unit.point';
    const unit = this.translateService.instant(unitKey);
    return `${cost.toLocaleString()}${unit}`;
  }

  /**
   * Effective draw count = min(requested, remaining).
   * Once-per-user gachas are always a single draw.
   * Returned 0 means the button should be disabled.
   */
  effectiveDrawCount(requested: number): number {
    if (this.gacha.oncePerUser) {
      return this.gacha.alreadyDrawn
        ? 0
        : Math.min(1, this.gacha.remainingCount);
    }
    return Math.min(requested, this.gacha.remainingCount);
  }

  async draw(requested: number): Promise<void> {
    if (this.isDrawing) return;
    if (!this.isLoggedIn) return;

    const userId = this.userService.getUserId();
    if (!userId) return;

    if (this.gacha.oncePerUser && this.gacha.alreadyDrawn) {
      alert(this.translateService.instant('gacha-box.error-already-drawn'));
      return;
    }

    const count = this.effectiveDrawCount(requested);
    if (count <= 0) return;

    const totalCost = this.gacha.cost * count;
    if (this.usesSpecialPoint) {
      const userSpecialPoint = this.userService.getSpecialPoint();
      if (userSpecialPoint === null || userSpecialPoint < totalCost) {
        alert(
          this.translateService.instant(
            'gacha-box.error-insufficient-special-point',
          ),
        );
        return;
      }
    } else {
      const userCoin = this.userService.getCoin();
      if (userCoin === null || userCoin < totalCost) {
        alert(
          this.translateService.instant('gacha-box.error-insufficient-coin'),
        );
        return;
      }
    }

    this.isDrawing = true;
    this.cdr.markForCheck();

    try {
      const result = await this.gachaService.drawGacha(
        this.gacha.id,
        userId,
        count,
      );
      const drawnCards = result.drawnCards ?? [];
      if (result.userCoin !== undefined) {
        this.userService.saveCoin(result.userCoin);
      }
      if (result.userSpecialPoint !== undefined) {
        this.userService.saveSpecialPoint(result.userSpecialPoint);
      }
      this.gacha = {
        ...this.gacha,
        remainingCount: result.remainingCount ?? 0,
        alreadyDrawn: this.gacha.oncePerUser ? true : this.gacha.alreadyDrawn,
      };

      if (drawnCards.length === 1) {
        const card = drawnCards[0];
        const messageKey =
          card.cardType === 'LAST'
            ? 'gacha-box.draw-success-last'
            : 'gacha-box.draw-success-single';
        alert(
          this.translateService.instant(messageKey, {
            name: card.name,
          }),
        );
      } else {
        this.dialog.open(GachaDrawResultDialogComponent, {
          width: '520px',
          maxWidth: '95vw',
          disableClose: true,
          data: { drawnCards },
        });
      }
    } catch (error: any) {
      console.error('Failed to draw gacha:', error);
      alert(this.resolveDrawErrorMessage(error));
    } finally {
      this.isDrawing = false;
      this.cdr.markForCheck();
    }
  }

  private resolveDrawErrorMessage(error: any): string {
    const serverMessage: string = error?.error?.error || error?.message || '';

    const errorKeyByServerMessage: Record<string, string> = {
      'Insufficient coin balance': 'gacha-box.error-insufficient-coin',
      'Insufficient special point balance':
        'gacha-box.error-insufficient-special-point',
      'This gacha can only be drawn once per user':
        'gacha-box.error-already-drawn',
      'No remaining cards in this gacha': 'gacha-box.error-out-of-stock',
      'Gacha not found': 'gacha-box.error-gacha-not-found',
      'User not found': 'gacha-box.error-user-not-found',
      'Draw count must be a positive integer':
        'gacha-box.error-invalid-draw-count',
    };

    const translateKey = errorKeyByServerMessage[serverMessage];
    if (translateKey) {
      return this.translateService.instant(translateKey);
    }

    const fallback = this.translateService.instant('gacha-box.draw-error');
    return serverMessage ? `${fallback}\n${serverMessage}` : fallback;
  }

  navigateToDetail(): void {
    this.router.navigate(['/gacha', this.gacha.id]);
  }

  openWinnersDialog(): void {
    this.dialog.open(GachaWinnersDialogComponent, {
      width: '520px',
      maxWidth: '95vw',
      data: { gachaId: this.gacha.id, gachaName: this.gacha.name },
    });
  }
}
