import { Component, Input, ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { TranslateService } from '@ngx-translate/core';
import { UserService } from '../../service/user.service';
import { GachaWinnersDialogComponent } from '../gachaWinnersDialog/gachaWinnersDialog.component';
import { GachaDrawService } from '../../common/gacha-draw.service';

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
    private userService: UserService,
    private translateService: TranslateService,
    private dialog: MatDialog,
    private cdr: ChangeDetectorRef,
    private router: Router,
    private gachaDrawService: GachaDrawService,
  ) {}

  get isLoggedIn(): boolean {
    return this.userService.isLoggedIn();
  }

  get usesTicket(): boolean {
    return this.gacha.consumptionType === 'TICKET';
  }

  get isExpired(): boolean {
    if (!this.gacha.publishEnd) return false;
    return new Date() > new Date(this.gacha.publishEnd);
  }

  formatPrice(cost: number): string {
    const unitKey = this.usesTicket
      ? 'common.unit.ticket'
      : 'common.unit.coin';
    const unit = this.translateService.instant(unitKey);
    return `${cost.toLocaleString()}${unit}`;
  }

  async draw(requested: number): Promise<void> {
    if (this.isDrawing) return;

    this.isDrawing = true;
    this.cdr.markForCheck();

    try {
      const outcome = await this.gachaDrawService.draw(this.gacha, requested);
      if (outcome) {
        this.gacha = {
          ...this.gacha,
          remainingCount: outcome.remainingCount,
          alreadyDrawn: this.gacha.oncePerUser ? true : this.gacha.alreadyDrawn,
        };
      }
    } catch (error: any) {
      console.error('Failed to draw gacha:', error);
      alert(this.gachaDrawService.resolveDrawErrorMessage(error));
    } finally {
      this.isDrawing = false;
      this.cdr.markForCheck();
    }
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
