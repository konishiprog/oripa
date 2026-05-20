import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { HttpClient } from '@angular/common/http';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { CardService } from '../../service/card.service';
import { UserService } from '../../service/user.service';

export type CardHistoryTab = 'unselected' | 'pending' | 'shipped';

export interface UserCard {
  id: string;
  gachaId: string;
  name: string;
  imageFront: string;
  imageBack: string;
  cardType: string;
  exchangeType: string;
  exchangePoints: number | null;
  isDrawn: boolean;
  gachaName: string | null;
  status: CardHistoryTab;
}

@Component({
  selector: 'app-user-card-history-page',
  standalone: false,
  templateUrl: './userCardHistoryPage.component.html',
  styleUrls: ['./userCardHistoryPage.component.css'],
})
export class UserCardHistoryPageComponent implements OnInit {
  activeTab: CardHistoryTab = 'unselected';
  isLoading: boolean = true;
  cards: UserCard[] = [];
  chevronSvg: SafeHtml = '';

  constructor(
    private cardService: CardService,
    private userService: UserService,
    private translateService: TranslateService,
    private router: Router,
    private cdr: ChangeDetectorRef,
    private http: HttpClient,
    private sanitizer: DomSanitizer,
  ) {}

  async ngOnInit(): Promise<void> {
    this.translateService.setDefaultLang('ja');
    this.translateService.use('ja');

    this.http
      .get('assets/icons/chevron-right.svg', { responseType: 'text' })
      .subscribe({
        next: (svg) => {
          this.chevronSvg = this.sanitizer.bypassSecurityTrustHtml(svg);
          this.cdr.markForCheck();
        },
      });

    const userId = this.userService.getUserId();
    if (!userId) {
      this.router.navigate(['/userGachaPage']);
      return;
    }

    try {
      const data = await this.cardService.getCardsByUserId(userId);
      this.cards = data.map((card: any) => ({
        id: card.id,
        gachaId: card.gachaId,
        name: card.name,
        imageFront: card.imageFront,
        imageBack: card.imageBack,
        cardType: card.cardType,
        exchangeType: card.exchangeType,
        exchangePoints: card.exchangePoints,
        isDrawn: card.isDrawn,
        gachaName: card.gachaName,
        status: 'unselected',
      }));
    } catch (error) {
      console.error('Failed to load user cards:', error);
    } finally {
      this.isLoading = false;
      this.cdr.markForCheck();
    }
  }

  goBack(): void {
    this.router.navigate(['/myPage']);
  }

  selectTab(tab: CardHistoryTab): void {
    this.activeTab = tab;
  }

  get filteredCards(): UserCard[] {
    return this.cards.filter((card) => card.status === this.activeTab);
  }

  get emptyMessageKey(): string {
    switch (this.activeTab) {
      case 'pending':
        return 'card-history.empty-pending';
      case 'shipped':
        return 'card-history.empty-shipped';
      default:
        return 'card-history.empty-unselected';
    }
  }
}
