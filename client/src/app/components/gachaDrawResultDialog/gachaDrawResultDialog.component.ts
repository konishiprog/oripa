import {
  Component,
  ChangeDetectorRef,
  Inject,
  OnInit,
  Optional,
} from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { TranslateService } from '@ngx-translate/core';

export interface DrawnCard {
  id: string;
  name: string;
  imageFront: string;
  imageBack: string;
  cardType?: string;
  effectName?: string;
  effectUrl?: string;
}

export interface GachaDrawResultDialogData {
  drawnCards: DrawnCard[];
}

@Component({
  selector: 'app-gacha-draw-result-dialog',
  standalone: false,
  templateUrl: './gachaDrawResultDialog.component.html',
  styleUrls: [
    './gachaDrawResultDialog.component.css',
    './gachaDrawResultDialog.responsive.component.css',
  ],
})
export class GachaDrawResultDialogComponent implements OnInit {
  drawnCards: DrawnCard[] = [];
  revealed: boolean[] = [];
  currentIndex: number = 0;
  showSummary: boolean = false;
  isPlayingEffect: boolean = false;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: GachaDrawResultDialogData,
    private translateService: TranslateService,
    private cdr: ChangeDetectorRef,
    @Optional() private dialogRef: MatDialogRef<GachaDrawResultDialogComponent>,
  ) {}

  ngOnInit(): void {
    this.translateService.setDefaultLang('ja');
    this.translateService.use('ja');
    this.drawnCards = this.data?.drawnCards ?? [];
    this.revealed = this.drawnCards.map(() => false);
    this.startEffectForCurrent();
  }

  get currentCard(): DrawnCard | null {
    return this.drawnCards[this.currentIndex] ?? null;
  }

  private startEffectForCurrent(): void {
    const card = this.currentCard;
    this.isPlayingEffect = !!card?.effectUrl && !this.isCurrentRevealed;
    this.cdr.markForCheck();
  }

  onEffectEnded(): void {
    if (!this.isPlayingEffect) return;
    this.isPlayingEffect = false;
    this.revealed[this.currentIndex] = true;
    this.cdr.markForCheck();
    if (this.hasEffectUrl) {
      setTimeout(() => this.next(), 300);
    }
  }

  get isCurrentRevealed(): boolean {
    return this.revealed[this.currentIndex] === true;
  }

  get isLast(): boolean {
    return this.currentIndex >= this.drawnCards.length - 1;
  }

  get hasEffectUrl(): boolean {
    return !!this.currentCard?.effectUrl;
  }

  get isShowingEffect(): boolean {
    return (
      !this.showSummary &&
      !!this.currentCard &&
      (this.isPlayingEffect || this.hasEffectUrl)
    );
  }

  reveal(): void {
    if (this.isPlayingEffect || this.isCurrentRevealed) return;
    this.revealed[this.currentIndex] = true;
    this.cdr.markForCheck();
  }

  next(): void {
    if (this.isPlayingEffect) return;
    if (!this.isCurrentRevealed) {
      this.reveal();
      return;
    }
    if (this.isLast) {
      this.enterSummary();
      return;
    }
    this.currentIndex += 1;
    this.startEffectForCurrent();
    this.cdr.markForCheck();
  }

  revealAll(): void {
    this.isPlayingEffect = false;
    this.revealed = this.drawnCards.map(() => true);
    this.enterSummary();
  }

  private enterSummary(): void {
    this.showSummary = true;
    this.dialogRef?.updateSize('520px', '');
    this.cdr.markForCheck();
  }

  skipCurrentEffect(): void {
    if (this.isPlayingEffect) {
      this.onEffectEnded();
    }
  }

  close(): void {
    this.dialogRef?.close();
  }
}
