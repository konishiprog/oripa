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
}

export interface GachaDrawResultDialogData {
  drawnCards: DrawnCard[];
}

@Component({
  selector: 'app-gacha-draw-result-dialog',
  standalone: false,
  templateUrl: './gachaDrawResultDialog.component.html',
  styleUrls: ['./gachaDrawResultDialog.component.css'],
})
export class GachaDrawResultDialogComponent implements OnInit {
  drawnCards: DrawnCard[] = [];
  revealed: boolean[] = [];
  currentIndex: number = 0;
  showSummary: boolean = false;

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
  }

  get currentCard(): DrawnCard | null {
    return this.drawnCards[this.currentIndex] ?? null;
  }

  get isCurrentRevealed(): boolean {
    return this.revealed[this.currentIndex] === true;
  }

  get isLast(): boolean {
    return this.currentIndex >= this.drawnCards.length - 1;
  }

  reveal(): void {
    if (this.isCurrentRevealed) return;
    this.revealed[this.currentIndex] = true;
    this.cdr.markForCheck();
  }

  next(): void {
    if (!this.isCurrentRevealed) {
      this.reveal();
      return;
    }
    if (this.isLast) {
      this.showSummary = true;
      this.cdr.markForCheck();
      return;
    }
    this.currentIndex += 1;
    this.cdr.markForCheck();
  }

  revealAll(): void {
    this.revealed = this.drawnCards.map(() => true);
    this.showSummary = true;
    this.cdr.markForCheck();
  }

  close(): void {
    this.dialogRef?.close();
  }
}
