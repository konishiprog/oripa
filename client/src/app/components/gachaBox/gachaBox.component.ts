import { Component, Input, ChangeDetectorRef } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { GachaService } from '../../service/gacha.service';
import { UserService } from '../../service/user.service';

export interface GachaBoxData {
  id: number;
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

    this.isDrawing = true;
    this.cdr.markForCheck();

    try {
      const result = await this.gachaService.drawGacha(
        this.gacha.id,
        userId,
        count,
      );
      const names = (result.drawnCards ?? [])
        .map((card: any) => card.name)
        .join('\n');
      this.gacha = {
        ...this.gacha,
        remainingCount: result.remainingCount ?? 0,
      };
      alert(
        this.translateService.instant('gacha-box.draw-success', {
          count: result.actualDrawCount ?? count,
        }) +
          '\n' +
          names,
      );
    } catch (error: any) {
      console.error('Failed to draw gacha:', error);
      const errorMessage =
        error?.error?.error || error?.message || 'unknown error';
      alert(
        this.translateService.instant('gacha-box.draw-error') +
          '\n' +
          errorMessage,
      );
    } finally {
      this.isDrawing = false;
      this.cdr.markForCheck();
    }
  }
}
