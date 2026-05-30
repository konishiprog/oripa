import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { GachaService } from '../../service/gacha.service';
import { CardService } from '../../service/card.service';
import { UserService } from '../../service/user.service';
import { MatDialog } from '@angular/material/dialog';
import { GachaDrawResultDialogComponent } from '../gachaDrawResultDialog/gachaDrawResultDialog.component';

export interface GachaDetail {
  id: string;
  name: string;
  headerImage: string;
  consumptionType: string;
  cost: number;
  oncePerUser: boolean;
  alreadyDrawn: boolean;
  remainingCount: number;
  totalCount: number;
  publishStart: string;
  publishEnd: string | null;
  isPublic: boolean;
}

export interface JackpotCard {
  id: string;
  name: string;
  imageFront: string;
}

interface CautionState {
  isOpen: boolean;
}

@Component({
  selector: 'app-gacha-detail-page',
  standalone: false,
  templateUrl: './gachaDetailPage.component.html',
  styleUrls: [
    './gachaDetailPage.component.css',
    './gachaDetailPage.responsive.component.css',
  ],
})
export class GachaDetailPageComponent implements OnInit {
  gacha: GachaDetail | null = null;
  jackpotCards: JackpotCard[] = [];
  isLoading: boolean = true;
  isDrawing: boolean = false;
  gachaId: string = '';
  cautionState: CautionState = { isOpen: false };

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private gachaService: GachaService,
    private cardService: CardService,
    private userService: UserService,
    private translateService: TranslateService,
    private dialog: MatDialog,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.translateService.setDefaultLang('ja');
    this.translateService.use('ja');
    this.route.params.subscribe((params) => {
      this.gachaId = params['id'];
      this.loadGachaDetail();
      this.loadJackpotCards();
    });
  }

  async loadGachaDetail(): Promise<void> {
    try {
      const data = await this.gachaService.getGachaById(this.gachaId);
      this.gacha = {
        id: data.id,
        name: data.name,
        headerImage: data.headerImage,
        consumptionType: data.consumptionType ?? 'COIN',
        cost: data.cost,
        oncePerUser: data.oncePerUser ?? false,
        alreadyDrawn: data.alreadyDrawn ?? false,
        remainingCount: data.remainingCount ?? 0,
        totalCount: data.totalCount ?? 0,
        publishStart: data.publishStart,
        publishEnd: data.publishEnd,
        isPublic: data.isPublic ?? false,
      };
    } catch (error) {
      console.error('Failed to load gacha detail:', error);
      this.router.navigate(['/userGachaPage']);
    } finally {
      this.isLoading = false;
      this.cdr.markForCheck();
    }
  }

  async loadJackpotCards(): Promise<void> {
    try {
      const cards = await this.cardService.getCardsByGachaId(this.gachaId);
      this.jackpotCards = cards
        .filter((card: any) => card.cardType === 'SSR')
        .map((card: any) => ({
          id: card.id,
          name: card.name,
          imageFront: card.imageFront,
        }));
    } catch (error) {
      console.error('Failed to load jackpot cards:', error);
    } finally {
      this.cdr.markForCheck();
    }
  }

  get isLoggedIn(): boolean {
    return this.userService.isLoggedIn();
  }

  get usesSpecialPoint(): boolean {
    return this.gacha?.consumptionType === 'SPECIAL_POINT';
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}年${month}月${day}日`;
  }

  effectiveDrawCount(requested: number): number {
    if (!this.gacha) return 0;
    if (this.gacha.oncePerUser) {
      return this.gacha.alreadyDrawn
        ? 0
        : Math.min(1, this.gacha.remainingCount);
    }
    return Math.min(requested, this.gacha.remainingCount);
  }

  async draw(requested: number): Promise<void> {
    if (!this.gacha || this.isDrawing) return;
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
        this.gachaId,
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
      if (this.gacha) {
        this.gacha = {
          ...this.gacha,
          remainingCount: result.remainingCount ?? 0,
          alreadyDrawn: this.gacha.oncePerUser ? true : this.gacha.alreadyDrawn,
        };
      }

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

  goBack(): void {
    this.router.navigate(['/userGachaPage']);
  }

  toggleCaution(): void {
    this.cautionState.isOpen = !this.cautionState.isOpen;
    this.cdr.markForCheck();
  }

  navigateToTerms(): void {
    this.router.navigate(['/terms']);
  }
}
