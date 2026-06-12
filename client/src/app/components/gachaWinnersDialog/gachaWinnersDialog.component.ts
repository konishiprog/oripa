import {
  Component,
  OnInit,
  Optional,
  Inject,
  ChangeDetectorRef,
} from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { TranslateService } from '@ngx-translate/core';
import { CardService } from '../../service/card.service';
import { UserService } from '../../service/user.service';

export interface GachaWinnersDialogData {
  gachaId: string;
  gachaName: string;
}

export interface GachaWinner {
  nickname: string;
}

@Component({
  selector: 'app-gacha-winners-dialog',
  standalone: false,
  templateUrl: './gachaWinnersDialog.component.html',
  styleUrls: [
    './gachaWinnersDialog.component.css',
    './gachaWinnersDialog.responsive.component.css',
  ],
})
export class GachaWinnersDialogComponent implements OnInit {
  ssrWinners: GachaWinner[] = [];
  srWinners: GachaWinner[] = [];
  isLoading: boolean = true;
  avatarIcon: SafeHtml = '';

  constructor(
    private cardService: CardService,
    private userService: UserService,
    private translateService: TranslateService,
    private http: HttpClient,
    private sanitizer: DomSanitizer,
    private cdr: ChangeDetectorRef,
    @Optional() private dialogRef: MatDialogRef<GachaWinnersDialogComponent>,
    @Optional()
    @Inject(MAT_DIALOG_DATA)
    private data: GachaWinnersDialogData,
  ) {}

  ngOnInit(): void {
    this.translateService.setDefaultLang('ja');
    this.translateService.use('ja');
    this.loadAvatarIcon();
    this.loadWinners();
  }

  private loadAvatarIcon(): void {
    this.http
      .get('assets/icons/user-profile.svg', { responseType: 'text' })
      .subscribe({
        next: (svg) => {
          this.avatarIcon = this.sanitizer.bypassSecurityTrustHtml(svg);
          this.cdr.markForCheck();
        },
        error: (error) => {
          console.error('Failed to load avatar icon:', error);
        },
      });
  }

  private async loadWinners(): Promise<void> {
    try {
      const cards = await this.cardService.getCardsByGachaId(this.data.gachaId);
      const users = await this.userService.getAllUsers();
      const nicknameByUserId = new Map<string, string>();
      users.forEach((user) => {
        nicknameByUserId.set(
          user.id,
          user.nickname || `${user.firstName} ${user.lastName}`.trim(),
        );
      });

      this.ssrWinners = this.buildWinners(cards, 'SSR', nicknameByUserId);
      this.srWinners = this.buildWinners(cards, 'SR', nicknameByUserId);
    } catch (error) {
      console.error('Failed to load winners:', error);
    } finally {
      this.isLoading = false;
      this.cdr.markForCheck();
    }
  }

  private buildWinners(
    cards: any[],
    cardType: string,
    nicknameByUserId: Map<string, string>,
  ): GachaWinner[] {
    return cards
      .filter((card) => card.cardType === cardType && card.userId)
      .map((card) => ({
        nickname: nicknameByUserId.get(card.userId) ?? '',
      }))
      .filter((winner) => winner.nickname !== '');
  }

  onClose(): void {
    this.dialogRef?.close();
  }
}
