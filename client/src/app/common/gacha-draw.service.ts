import { Injectable } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { TranslateService } from '@ngx-translate/core';
import { GachaService } from '../service/gacha.service';
import { UserService } from '../service/user.service';
import { GachaDrawResultDialogComponent } from '../components/gachaDrawResultDialog/gachaDrawResultDialog.component';
import { ERROR_KEY_MAP } from './constants/error-messages.constant';

export interface DrawableGacha {
  id: string;
  cost: number;
  oncePerUser: boolean;
  alreadyDrawn: boolean;
  remainingCount: number;
  consumptionType: string;
}

export interface DrawOutcome {
  remainingCount: number;
  dialogRef: MatDialogRef<GachaDrawResultDialogComponent> | null;
}

@Injectable({
  providedIn: 'root',
})
export class GachaDrawService {
  constructor(
    private gachaService: GachaService,
    private userService: UserService,
    private translateService: TranslateService,
    private dialog: MatDialog,
  ) {}

  usesTicket(gacha: DrawableGacha): boolean {
    return gacha.consumptionType === 'TICKET';
  }

  effectiveDrawCount(gacha: DrawableGacha, requested: number): number {
    if (gacha.oncePerUser) {
      return gacha.alreadyDrawn ? 0 : Math.min(1, gacha.remainingCount);
    }
    return Math.min(requested, gacha.remainingCount);
  }

  async draw(
    gacha: DrawableGacha,
    requested: number,
  ): Promise<DrawOutcome | null> {
    if (!this.userService.isLoggedIn()) return null;

    const userId = this.userService.getUserId();
    if (!userId) return null;

    if (gacha.oncePerUser && gacha.alreadyDrawn) {
      alert(this.translateService.instant('gacha-box.error-already-drawn'));
      return null;
    }

    const count = this.effectiveDrawCount(gacha, requested);
    if (count <= 0) return null;

    if (!this.hasEnoughBalance(gacha, count)) return null;

    const result = await this.gachaService.drawGacha(gacha.id, userId, count);
    const drawnCards = result.drawnCards ?? [];
    if (result.userCoin !== undefined) {
      this.userService.saveCoin(result.userCoin);
    }
    if (result.userTicket !== undefined) {
      this.userService.saveTicket(result.userTicket);
    }

    let dialogRef: MatDialogRef<GachaDrawResultDialogComponent> | null = null;
    if (drawnCards.length > 0) {
      const cardsForDialog = drawnCards.map((card: any) => ({
        ...card,
        exchangeType: card.exchangeType,
        exchangeCoins: card.exchangeCoins,
      }));
      dialogRef = this.dialog.open(GachaDrawResultDialogComponent, {
        width: '520px',
        maxWidth: '95vw',
        disableClose: true,
        data: { drawnCards: cardsForDialog },
      });
    }

    return { remainingCount: result.remainingCount ?? 0, dialogRef };
  }

  resolveDrawErrorMessage(error: any): string {
    const serverMessage: string = error?.error?.error || error?.message || '';
    const translateKey = ERROR_KEY_MAP[serverMessage];
    if (translateKey) {
      return this.translateService.instant(translateKey);
    }

    const fallback = this.translateService.instant('gacha-box.draw-error');
    return serverMessage ? `${fallback}\n${serverMessage}` : fallback;
  }

  private hasEnoughBalance(gacha: DrawableGacha, count: number): boolean {
    const totalCost = gacha.cost * count;
    if (this.usesTicket(gacha)) {
      const userTicket = this.userService.getTicket();
      if (userTicket === null || userTicket < totalCost) {
        alert(
          this.translateService.instant(
            'gacha-box.error-insufficient-ticket',
          ),
        );
        return false;
      }
    } else {
      const userCoin = this.userService.getCoin();
      if (userCoin === null || userCoin < totalCost) {
        alert(
          this.translateService.instant('gacha-box.error-insufficient-coin'),
        );
        return false;
      }
    }
    return true;
  }
}
