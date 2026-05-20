import { Component, Input, ChangeDetectorRef } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { TranslateService } from '@ngx-translate/core';
import { GachaService } from '../../service/gacha.service';
import { UserService } from '../../service/user.service';
import { GachaDrawResultDialogComponent } from '../gachaDrawResultDialog/gachaDrawResultDialog.component';

export interface GachaBoxData {
  id: string;
  name: string;
  headerImage: string;
  cost: number;
  remainingCount: number;
}

@Component({
  selector: 'app-gacha-box',
  standalone: false,
  templateUrl: './gachaBox.component.html',
  styleUrls: ['./gachaBox.component.css'],
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
  ) {}

  get isLoggedIn(): boolean {
    return this.userService.isLoggedIn();
  }

  formatPrice(cost: number): string {
    return `¥${cost.toLocaleString()}`;
  }

  /**
   * Effective draw count = min(requested, remaining).
   * Returned 0 means the button should be disabled.
   */
  effectiveDrawCount(requested: number): number {
    return Math.min(requested, this.gacha.remainingCount);
  }

  async draw(requested: number): Promise<void> {
    if (this.isDrawing) return;
    if (!this.isLoggedIn) return;

    const userId = this.userService.getUserId();
    if (!userId) return;

    const count = this.effectiveDrawCount(requested);
    if (count <= 0) return;

    const totalCost = this.gacha.cost * count;
    const userCoin = this.userService.getCoin();
    if (userCoin === null || userCoin < totalCost) {
      alert(this.translateService.instant('gacha-box.error-insufficient-coin'));
      return;
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
      this.gacha = {
        ...this.gacha,
        remainingCount: result.remainingCount ?? 0,
      };

      if (drawnCards.length === 1) {
        const card = drawnCards[0];
        const messageKey = card.cardType === 'LAST'
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
}
