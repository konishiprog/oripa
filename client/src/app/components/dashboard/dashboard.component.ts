import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import {
  CreateGachaComponent,
  GachaFormMode,
} from '../createGacha/createGacha.component';
import { CreateCardComponent } from '../createCard/createCard.component';
import {
  CreateGenreComponent,
  GenreFormMode,
} from '../createGenre/createGenre.component';
import {
  CreateEffectComponent,
  EffectFormMode,
} from '../createEffect/createEffect.component';
import { GachaService } from '../../service/gacha.service';
import { CardService } from '../../service/card.service';
import { GenreService, Genre } from '../../service/genre.service';
import { EffectService, Effect } from '../../service/effect.service';
import { Gacha } from '../gachaTable/gachaTable.component';
import { Card } from '../cardTable/cardTable.component';
import { CARD_STATUS } from '../../constants/card';

enum ViewMode {
  Gacha = 'gacha',
  Card = 'card',
  Genre = 'genre',
  Effect = 'effect',
}

@Component({
  selector: 'app-dashboard',
  standalone: false,
  templateUrl: './dashboard.component.html',
  styleUrls: [
    './dashboard.component.css',
    './dashboard.responsive.component.css',
  ],
})
export class DashboardComponent implements OnInit {
  readonly ViewMode = ViewMode;

  gachas: Gacha[] = [];
  cards: Card[] = [];
  genres: Genre[] = [];
  effects: Effect[] = [];
  viewMode: ViewMode = ViewMode.Gacha;

  constructor(
    private dialog: MatDialog,
    private gachaService: GachaService,
    private cardService: CardService,
    private genreService: GenreService,
    private effectService: EffectService,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.loadGachas();
    this.loadGenres();
    this.loadEffects();
  }

  async loadGenres(): Promise<void> {
    try {
      this.genres = await this.genreService.getAllGenres();
      this.cdr.markForCheck();
    } catch (error) {
      console.error('Failed to load genres:', error);
    }
  }

  async loadEffects(): Promise<void> {
    try {
      this.effects = await this.effectService.getAllEffects();
      this.cdr.markForCheck();
    } catch (error) {
      console.error('Failed to load effects:', error);
    }
  }

  async loadGachas(): Promise<void> {
    try {
      const data = await this.gachaService.getGachas();
      this.gachas = data.map((gacha: any) => ({
        id: gacha.id,
        name: gacha.name,
        genreId: gacha.genreId ?? null,
        genreName: gacha.genreName ?? '',
        headerImage: gacha.headerImage,
        consumptionType: gacha.consumptionType ?? 'COIN',
        cost: gacha.cost,
        oncePerUser: gacha.oncePerUser ?? false,
        isPublic: gacha.isPublic ?? false,
        publishStart: gacha.publishStart,
        publishEnd: gacha.publishEnd,
        cards: gacha.cardsCount ?? 0,
      }));
      this.cards = data.flatMap((gacha: any) =>
        (gacha.cards ?? []).map((card: any) => ({
          id: card.id,
          gachaId: gacha.id,
          gachaName: gacha.name,
          name: card.name ?? '',
          cardType: card.cardType ?? '',
          exchangeType: card.exchangeType ?? '',
          exchangeCoins: card.exchangeCoins ?? null,
          effectId: card.effectId ?? null,
          effectName: card.effectName ?? '',
          imageFront: card.imageFront ?? '',
          imageBack: card.imageBack ?? '',
          isDrawn: card.isDrawn ?? CARD_STATUS.NOT_DRAWN,
        })),
      );
      this.cdr.markForCheck();
    } catch (error) {
      console.error('Failed to load gachas:', error);
    }
  }

  setViewMode(view: ViewMode): void {
    this.viewMode = view;
  }

  get primaryActionLabel(): string {
    switch (this.viewMode) {
      case ViewMode.Card:
        return 'dashboard.create-card';
      case ViewMode.Genre:
        return 'dashboard.create-genre';
      case ViewMode.Effect:
        return 'dashboard.create-effect';
      default:
        return 'dashboard.create-box';
    }
  }

  onPrimaryAction(): void {
    switch (this.viewMode) {
      case ViewMode.Card:
        this.createNewCard();
        break;
      case ViewMode.Genre:
        this.createNewGenre();
        break;
      case ViewMode.Effect:
        this.createNewEffect();
        break;
      default:
        this.createNewGacha();
        break;
    }
  }

  getTotalGachaCount(): number {
    return this.gachas.length;
  }

  getPublicGachaCount(): number {
    return this.gachas.filter((gacha) => gacha.isPublic).length;
  }

  onGachasUpdated(): void {
    this.loadGachas();
  }

  createNewGacha(): void {
    const dialogRef = this.dialog.open(CreateGachaComponent, {
      width: '500px',
      data: { mode: GachaFormMode.Create },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result?.mode === 'create' && result?.data) {
        setTimeout(() => {
          this.gachas = [
            ...this.gachas,
            {
              id: result.data.id,
              name: result.data.name,
              genreId: result.data.genreId ?? null,
              genreName: result.data.genreName ?? '',
              headerImage: result.data.headerImage,
              consumptionType: result.data.consumptionType ?? 'COIN',
              cost: result.data.cost,
              oncePerUser: result.data.oncePerUser ?? false,
              isPublic: result.data.isPublic ?? false,
              publishStart: result.data.publishStart,
              publishEnd: result.data.publishEnd,
              cards: result.data.cardsCount ?? 0,
            },
          ];
          this.cdr.markForCheck();
        });
      }
    });
  }

  onCardsUpdated(): void {
    this.loadGachas();
  }

  createNewCard(): void {
    const dialogRef = this.dialog.open(CreateCardComponent, {
      width: '500px',
      data: {
        gachaId: null,
        gachaName: null,
        gachas: this.gachas,
      },
    });

    dialogRef.afterClosed().subscribe(async (result) => {
      if (result?.mode === 'create' && result?.data) {
        if (result.data.cardCount && result.data.cardCount > 1) {
          await this.loadGachas();
        } else {
          await this.refreshCardsForGacha(
            result.data.gachaId,
            result.data.gachaName,
          );
        }
      }
    });
  }

  createNewGenre(): void {
    const dialogRef = this.dialog.open(CreateGenreComponent, {
      width: '480px',
      data: { mode: GenreFormMode.Create },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result?.mode === 'create' && result?.data) {
        this.loadGenres();
      }
    });
  }

  createNewEffect(): void {
    const dialogRef = this.dialog.open(CreateEffectComponent, {
      width: '480px',
      data: { mode: EffectFormMode.Create },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result?.mode === 'create' && result?.data) {
        this.loadEffects();
      }
    });
  }

  openCardRegistration(gacha: Gacha): void {
    const dialogRef = this.dialog.open(CreateCardComponent, {
      width: '500px',
      data: {
        gachaId: gacha.id,
        gachaName: gacha.name,
        gachas: this.gachas,
      },
    });

    dialogRef.afterClosed().subscribe(async (result) => {
      if (result?.mode === 'create' && result?.data) {
        if (result.data.cardCount && result.data.cardCount > 1) {
          await this.loadGachas();
        } else {
          await this.refreshCardsForGacha(gacha.id, gacha.name);
        }
      }
    });
  }

  private async refreshCardsForGacha(
    gachaId: string,
    gachaName: string,
  ): Promise<void> {
    try {
      const cards = await this.cardService.getCardsByGachaId(gachaId);
      const notDrawnCards = cards.filter(
        (card: any) => card.isDrawn === CARD_STATUS.NOT_DRAWN,
      );
      this.gachas = this.gachas.map((gacha) =>
        gacha.id === gachaId
          ? { ...gacha, cards: notDrawnCards.length }
          : gacha,
      );
      this.cards = [
        ...this.cards.filter((card) => card.gachaId !== gachaId),
        ...cards.map((card: any) => ({
          id: card.id,
          gachaId,
          gachaName,
          name: card.name ?? '',
          cardType: card.cardType ?? '',
          exchangeType: card.exchangeType ?? '',
          exchangeCoins: card.exchangeCoins ?? null,
          effectId: card.effectId ?? null,
          effectName: card.effectName ?? '',
          imageFront: card.imageFront ?? '',
          imageBack: card.imageBack ?? '',
          isDrawn: card.isDrawn ?? CARD_STATUS.NOT_DRAWN,
        })),
      ];
      this.cdr.markForCheck();
    } catch (error) {
      console.error('Failed to refresh cards:', error);
    }
  }
}
