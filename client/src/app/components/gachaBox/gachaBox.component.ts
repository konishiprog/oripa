import { Component, Input, OnInit, ChangeDetectorRef } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { MatDialog } from '@angular/material/dialog';
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
  totalCount: number;
  publishEnd: string | null;
}

export const FEW_LEFT_RATIO = 0.1;

@Component({
  selector: 'app-gacha-box',
  standalone: false,
  templateUrl: './gachaBox.component.html',
  styleUrls: [
    './gachaBox.component.css',
    './gachaBox.responsive.component.css',
  ],
})
export class GachaBoxComponent implements OnInit {
  @Input() gacha!: GachaBoxData;
  isDrawing: boolean = false;
  priceIcon: SafeHtml = '';

  constructor(
    private http: HttpClient,
    private sanitizer: DomSanitizer,
    private userService: UserService,
    private dialog: MatDialog,
    private cdr: ChangeDetectorRef,
    private router: Router,
    private gachaDrawService: GachaDrawService,
  ) {}

  ngOnInit(): void {
    this.loadPriceIcon();
  }

  private loadPriceIcon(): void {
    const iconPath = this.usesTicket
      ? 'assets/icons/ticket.svg'
      : 'assets/icons/coin-gold.svg';
    this.http.get(iconPath, { responseType: 'text' }).subscribe({
      next: (svg) => {
        this.priceIcon = this.sanitizer.bypassSecurityTrustHtml(svg);
        this.cdr.markForCheck();
      },
      error: (error) => {
        console.error(`Failed to load icon ${iconPath}:`, error.status);
      },
    });
  }

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

  get isSoldOut(): boolean {
    return this.gacha.remainingCount === 0;
  }

  get isFewLeft(): boolean {
    return (
      this.gacha.remainingCount > 0 &&
      this.gacha.remainingCount < this.gacha.totalCount * FEW_LEFT_RATIO
    );
  }

  get remainingPercent(): number {
    if (this.gacha.totalCount === 0) return 0;
    return (this.gacha.remainingCount / this.gacha.totalCount) * 100;
  }

  get isUnavailable(): boolean {
    return this.isExpired || this.isSoldOut;
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
