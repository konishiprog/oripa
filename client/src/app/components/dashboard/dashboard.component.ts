import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import {
  CreateGachaComponent,
  GachaFormMode,
} from '../createGacha/createGacha.component';
import { CreateCardComponent } from '../createCard/createCard.component';
import { GachaService } from '../../service/gacha.service';
import { CardService } from '../../service/card.service';
import { Gacha } from '../gachaTable/gachaTable.component';
import { Card } from '../cardTable/cardTable.component';

enum ViewMode {
  Gacha = 'gacha',
  Card = 'card',
}

@Component({
  selector: 'app-dashboard',
  standalone: false,
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css'],
})
export class DashboardComponent implements OnInit {
  readonly ViewMode = ViewMode;

  gachas: Gacha[] = [];
  cards: Card[] = [];
  viewMode: ViewMode = ViewMode.Gacha;

  constructor(
    private dialog: MatDialog,
    private gachaService: GachaService,
    private cardService: CardService,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.loadGachas();
  }

  async loadGachas(): Promise<void> {
    try {
      const data = await this.gachaService.getGachas();
      this.gachas = data.map((gacha: any) => ({
        id: gacha.id,
        name: gacha.name,
        headerImage: gacha.headerImage,
        consumptionType: gacha.consumptionType ?? '',
        cost: gacha.cost,
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
          exchangePoints: card.exchangePoints ?? null,
          imageFront: card.imageFront ?? '',
          imageBack: card.imageBack ?? '',
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
              headerImage: result.data.headerImage,
              consumptionType: result.data.consumptionType ?? '',
              cost: result.data.cost,
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

  openCardRegistration(gacha: Gacha): void {
    const dialogRef = this.dialog.open(CreateCardComponent, {
      width: '500px',
      data: {
        gachaId: gacha.id,
        gachaName: gacha.name,
      },
    });

    dialogRef.afterClosed().subscribe(async (result) => {
      if (result?.mode === 'create' && result?.data) {
        await this.refreshCardsForGacha(gacha.id, gacha.name);
      }
    });
  }

  private async refreshCardsForGacha(
    gachaId: number,
    gachaName: string,
  ): Promise<void> {
    try {
      const cards = await this.cardService.getCardsByGachaId(gachaId);
      this.gachas = this.gachas.map((gacha) =>
        gacha.id === gachaId ? { ...gacha, cards: cards.length } : gacha,
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
          exchangePoints: card.exchangePoints ?? null,
          imageFront: card.imageFront ?? '',
          imageBack: card.imageBack ?? '',
        })),
      ];
      this.cdr.markForCheck();
    } catch (error) {
      console.error('Failed to refresh cards:', error);
    }
  }
}
